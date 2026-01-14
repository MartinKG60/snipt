// Shared header and footer components for Snipt
// Automatically injected on page load

function getBasePath() {
    const path = window.location.pathname;
    const depth = (path.match(/\//g) || []).length - 2; // -2 for domain and trailing
    return depth > 0 ? '../'.repeat(depth) : '';
}

function renderHeader() {
    const base = getBasePath();
    return `
    <nav class="navbar">
        <div class="container">
            <div class="nav-content">
                <a href="${base}index.html" class="logo">
                    <img src="${base}images/logo-blue-200.png" alt="Snipt Logo" class="logo-img">
                    <span>Snipt</span>
                </a>
                <div class="nav-links">
                    <a href="${base}index.html#features">Features</a>
                    <a href="${base}use-cases/">Use Cases</a>
                    <a href="${base}about.html">About</a>
                    <a href="https://dashboard.usesnipt.com" target="_blank" rel="noopener noreferrer" class="btn-secondary">Login</a>
                    <a href="${base}index.html#download" class="btn-primary">Download</a>
                </div>
            </div>
        </div>
    </nav>`;
}

function renderFooter() {
    const base = getBasePath();
    return `
    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-brand">
                    <p>&copy; 2026 Snipt. All rights reserved.</p>
                </div>
                <div class="footer-grid">
                    <div class="footer-column">
                        <h4>Company</h4>
                        <a href="${base}about.html">About</a>
                        <a href="${base}privacy-policy.html">Privacy Policy</a>
                        <a href="${base}terms-of-service.html">Terms of Service</a>
                    </div>
                    <div class="footer-column">
                        <h4>Resources</h4>
                        <a href="${base}comparisons/best-screenshot-tools.html">Comparisons</a>
                        <a href="${base}help/">Help & FAQ</a>
                        <a href="${base}use-cases/">Use Cases</a>
                    </div>
                    <div class="footer-column">
                        <h4>Screenshot Tools</h4>
                        <a href="${base}screenshot-tools/">All Platforms</a>
                        <a href="${base}screenshot-tools-for-mac/">Mac</a>
                        <a href="${base}screenshot-tools-for-windows/">Windows</a>
                        <a href="${base}screenshot-tools-for-linux/">Linux</a>
                    </div>
                </div>
            </div>
        </div>
    </footer>`;
}

// Auto-inject on page load
document.addEventListener('DOMContentLoaded', function() {
    const headerContainer = document.getElementById('header-placeholder');
    const footerContainer = document.getElementById('footer-placeholder');
    
    if (headerContainer) {
        headerContainer.innerHTML = renderHeader();
    }
    
    if (footerContainer) {
        footerContainer.innerHTML = renderFooter();
    }
});
