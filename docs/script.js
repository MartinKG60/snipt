// Smooth scroll navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Navbar background on scroll
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(15, 15, 35, 0.95)';
        navbar.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
    } else {
        navbar.style.background = 'rgba(15, 15, 35, 0.8)';
        navbar.style.borderBottom = '1px solid rgba(255, 255, 255, 0.05)';
    }
});

// Add animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp 0.6s ease-out forwards';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.feature-card, .screenshot-item').forEach(el => {
    el.style.opacity = '0';
    observer.observe(el);
});

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    #download-counter-dev {
        display: none;
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: rgba(11, 147, 255, 0.2);
        border: 1px solid rgba(11, 147, 255, 0.5);
        padding: 12px 16px;
        border-radius: 8px;
        font-size: 12px;
        color: rgba(255, 255, 255, 0.8);
        font-family: 'Courier New', monospace;
        z-index: 500;
        backdrop-filter: blur(10px);
    }
`;
document.head.appendChild(style);

// Download Counter - GitHub API
async function updateDownloadCounter() {
    const counterDiv = document.getElementById('download-counter-dev');

    try {
        const res = await fetch('https://api.github.com/repos/MartinKG60/snipt/releases/latest');

        if (!res.ok) {
            throw new Error(`GitHub API responded ${res.status}`);
        }

        const data = await res.json();

        if (data.assets && data.assets.length > 0) {
            const totalDownloads = data.assets.reduce((sum, asset) => sum + asset.download_count, 0);
            const assets = data.assets.map(a => `${a.name}: ${a.download_count}`).join(' | ');

            counterDiv.innerHTML = `📊 Downloads: ${totalDownloads}<br><small>${assets}</small>`;
        } else {
            counterDiv.innerHTML = '📊 Downloads: 0 (no assets found)';
        }
    } catch (error) {
        console.log('Download counter error:', error);
        counterDiv.innerHTML = '⚠️ Downloads: not available';
    }
}

// Call on page load and refresh every 5 minutes
updateDownloadCounter();
setInterval(updateDownloadCounter, 300000);