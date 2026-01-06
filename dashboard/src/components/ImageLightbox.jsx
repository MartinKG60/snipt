export default function ImageLightbox({ image, onClose }) {
  if (!image) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-black rounded-lg overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '95vw', maxHeight: '95vh' }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white text-gray-900 rounded-full w-10 h-10 flex items-center justify-center text-2xl font-bold shadow-lg transition"
          aria-label="Close"
        >
          ×
        </button>

        <img
          src={image.url}
          alt={image.filename}
          className="w-full h-full object-contain"
          style={{ maxHeight: 'calc(95vh - 80px)' }}
        />

        <div className="bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
          <p className="font-medium truncate">{image.filename}</p>
          <p className="text-sm text-gray-300">
            {new Date(image.created_at).toLocaleDateString()} at{' '}
            {new Date(image.created_at).toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
}
