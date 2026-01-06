import React, { useState, useEffect } from 'react';
import AnnotationCanvas from './components/AnnotationCanvas';
import EmailPrompt from './components/EmailPrompt';
import { generateFilename, saveScreenshotLocally, uploadScreenshotToCloud } from './utils/upload';

function CaptureApp() {
  const [sources, setSources] = useState([]);
  const [selectedSource, setSelectedSource] = useState(null);
  const [isAnnotating, setIsAnnotating] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [pendingBlob, setPendingBlob] = useState(null);
  const [showEmailPrompt, setShowEmailPrompt] = useState(false);

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.onSourcesReady((sourcesData) => {
        setSources(sourcesData);
      });
    }
  }, []);

  useEffect(() => {
    const screenSources = sources.filter(s => s.id.startsWith('screen'));
    if (screenSources.length === 1 && !selectedSource) {
      handleSourceSelect(screenSources[0]);
    }
  }, [sources]);

  const handleSourceSelect = (source) => {
    setSelectedSource(source);
    const dataUrl = source.thumbnail.toDataURL();
    setCapturedImage(dataUrl);
    setIsAnnotating(true);
  };

  const handleCancel = () => {
    if (window.electronAPI) {
      window.electronAPI.closeCaptureWindow();
    }
  };

  const handleSave = async (annotatedBlob) => {
    const action = await showActionMenu();

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const dataUrl = reader.result;

        switch (action) {
          case 'copy':
            await window.electronAPI.copyToClipboard(dataUrl);
            window.electronAPI.showNotification('Screenshot copied to clipboard!', 'success');
            break;

          case 'save':
            const filename = generateFilename();
            const path = await window.electronAPI.saveScreenshot(dataUrl, filename);
            if (path) {
              window.electronAPI.showNotification(`Saved to ${path}`, 'success');
            }
            break;

          case 'upload':
            // Show email prompt for cloud upload
            setPendingBlob(annotatedBlob);
            setShowEmailPrompt(true);
            return; // Don't close window yet

          default:
            break;
        }

        setTimeout(() => {
          if (window.electronAPI) {
            window.electronAPI.closeCaptureWindow();
          }
        }, 500);
      };
      reader.readAsDataURL(annotatedBlob);
    } catch (error) {
      console.error('Save failed:', error);
      window.electronAPI.showNotification('Operation failed', 'error');
    }
  };

  const handleUploadSuccess = async () => {
    try {
      if (pendingBlob) {
        const result = await uploadScreenshotToCloud(pendingBlob);
        await window.electronAPI.copyTextToClipboard(result.shareableLink);
        window.electronAPI.showNotification('✓ Uploaded! Link copied to clipboard', 'success');
      }
      
      setShowEmailPrompt(false);
      setPendingBlob(null);

      setTimeout(() => {
        if (window.electronAPI) {
          window.electronAPI.closeCaptureWindow();
        }
      }, 500);
    } catch (error) {
      console.error('Upload failed:', error);
      window.electronAPI.showNotification(error.message || 'Upload failed', 'error');
    }
  };

  const handleUploadCancel = () => {
    setShowEmailPrompt(false);
    setPendingBlob(null);
  };

  const showActionMenu = () => {
    return new Promise((resolve) => {
      const menu = document.createElement('div');
      menu.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]';
      menu.innerHTML = `
        <div class="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full mx-4">
          <h3 class="text-lg font-semibold mb-4 text-gray-800">What would you like to do?</h3>
          <div class="space-y-2">
            <button id="copy-btn" class="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-left">
              📋 Copy to Clipboard
            </button>
            <button id="save-btn" class="w-full px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-left">
              💾 Save to Computer
            </button>
            <button id="upload-btn" class="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-left">
              ☁️ Upload & Share
            </button>
            <button id="cancel-btn" class="w-full px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-left">
              Cancel
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(menu);

      const cleanup = () => {
        document.body.removeChild(menu);
      };

      menu.querySelector('#copy-btn').onclick = () => {
        cleanup();
        resolve('copy');
      };

      menu.querySelector('#save-btn').onclick = () => {
        cleanup();
        resolve('save');
      };

      menu.querySelector('#upload-btn').onclick = () => {
        cleanup();
        resolve('upload');
      };

      menu.querySelector('#cancel-btn').onclick = () => {
        cleanup();
        resolve(null);
      };
    });
  };

  if (!isAnnotating && sources.length > 1) {
    const screens = sources.filter(s => s.id.startsWith('screen'));
    const windows = sources.filter(s => s.id.startsWith('window'));

    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Select what to capture</h2>
            <button onClick={handleCancel} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
              Cancel
            </button>
          </div>

          {screens.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-700">Screens</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {screens.map((source) => (
                  <button
                    key={source.id}
                    onClick={() => handleSourceSelect(source)}
                    className="group relative bg-gray-100 rounded-lg p-3 hover:bg-gray-200 transition-colors text-left"
                  >
                    <img src={source.thumbnail.toDataURL()} alt={source.name} className="w-full h-32 object-contain rounded mb-2" />
                    <p className="text-sm text-gray-700 truncate">{source.name}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {windows.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-700">Windows</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {windows.slice(0, 12).map((source) => (
                  <button
                    key={source.id}
                    onClick={() => handleSourceSelect(source)}
                    className="group relative bg-gray-100 rounded-lg p-3 hover:bg-gray-200 transition-colors text-left"
                  >
                    <img src={source.thumbnail.toDataURL()} alt={source.name} className="w-full h-32 object-contain rounded mb-2" />
                    <p className="text-sm text-gray-700 truncate">{source.name}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (isAnnotating && capturedImage) {
    return (
      <>
        <AnnotationCanvas
          imageData={capturedImage}
          onSave={handleSave}
          onCancel={handleCancel}
        />
        {showEmailPrompt && (
          <EmailPrompt
            onSuccess={handleUploadSuccess}
            onCancel={handleUploadCancel}
          />
        )}
      </>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center">
      <div className="text-white text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p>Preparing capture...</p>
      </div>
    </div>
  );
}

export default CaptureApp;
