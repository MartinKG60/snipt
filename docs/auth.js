// Supabase Configuration
const SUPABASE_URL = 'YOUR_SUPABASE_URL'; // Replace with your Supabase URL
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // Replace with your Supabase anon key
const DASHBOARD_URL = 'http://localhost:3000'; // Change to https://dashboard.usesnipt.com in production

const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let isSignupMode = false;

// DOM Elements
const authModal = document.getElementById('authModal');
const loginBtn = document.getElementById('loginBtn');
const dashboardLink = document.getElementById('dashboardLink');
const closeBtn = document.querySelector('.close');
const authTitle = document.getElementById('authTitle');
const authEmail = document.getElementById('authEmail');
const authPassword = document.getElementById('authPassword');
const authSubmit = document.getElementById('authSubmit');
const authError = document.getElementById('authError');
const toggleAuth = document.getElementById('toggleAuth');
const toggleText = document.getElementById('toggleText');

// Check if user is already logged in
async function checkAuth() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) {
        // User is logged in
        loginBtn.textContent = 'Logout';
        loginBtn.onclick = handleLogout;
        dashboardLink.style.display = 'inline-block';
        dashboardLink.href = DASHBOARD_URL;
    }
}

// Open modal
loginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (loginBtn.textContent === 'Logout') {
        handleLogout();
    } else {
        authModal.style.display = 'block';
    }
});

// Close modal
closeBtn.addEventListener('click', () => {
    authModal.style.display = 'none';
    authError.textContent = '';
});

window.addEventListener('click', (e) => {
    if (e.target === authModal) {
        authModal.style.display = 'none';
        authError.textContent = '';
    }
});

// Toggle between login and signup
toggleAuth.addEventListener('click', (e) => {
    e.preventDefault();
    isSignupMode = !isSignupMode;
    
    if (isSignupMode) {
        authTitle.textContent = 'Create Account';
        authSubmit.textContent = 'Sign Up';
        toggleText.textContent = 'Already have an account?';
        toggleAuth.textContent = 'Login';
    } else {
        authTitle.textContent = 'Login to Snipt';
        authSubmit.textContent = 'Login';
        toggleText.textContent = "Don't have an account?";
        toggleAuth.textContent = 'Sign up';
    }
    authError.textContent = '';
});

// Handle auth submit
authSubmit.addEventListener('click', async () => {
    const email = authEmail.value.trim();
    const password = authPassword.value;
    
    if (!email || !password) {
        authError.textContent = 'Please fill in all fields';
        return;
    }
    
    authSubmit.disabled = true;
    authSubmit.textContent = isSignupMode ? 'Creating account...' : 'Logging in...';
    authError.textContent = '';
    
    try {
        if (isSignupMode) {
            const { data, error } = await supabaseClient.auth.signUp({
                email,
                password
            });
            
            if (error) throw error;
            
            authError.style.color = '#4ade80';
            authError.textContent = 'Account created! Check your email to verify.';
            
            setTimeout(() => {
                authModal.style.display = 'none';
                authEmail.value = '';
                authPassword.value = '';
                authError.textContent = '';
                authError.style.color = '#ff4444';
            }, 3000);
        } else {
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email,
                password
            });
            
            if (error) throw error;
            
            // Redirect to dashboard
            window.location.href = DASHBOARD_URL;
        }
    } catch (error) {
        authError.textContent = error.message || 'Authentication failed';
    } finally {
        authSubmit.disabled = false;
        authSubmit.textContent = isSignupMode ? 'Sign Up' : 'Login';
    }
});

// Handle logout
async function handleLogout() {
    await supabaseClient.auth.signOut();
    loginBtn.textContent = 'Login';
    loginBtn.onclick = null;
    dashboardLink.style.display = 'none';
    location.reload();
}

// Enter key support
authPassword.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        authSubmit.click();
    }
});

// Initialize
checkAuth();
