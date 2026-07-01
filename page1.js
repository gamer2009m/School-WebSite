(function() {
    'use strict';
    const form = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const roleSelect = document.getElementById('role');
    const errorMsg = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    const loginBtn = document.getElementById('loginBtn');
    const togglePwdBtn = document.getElementById('togglePwd');
    const themeChips = document.querySelectorAll('.theme-chip');
    const contactAdminLink = document.getElementById('contactAdmin');
    let selectedTheme = 'basic';
    function initializeUsers() {
        if (!localStorage.getItem('users')) {
            const defaultUsers = [
                { login: 'student1', password: 'demo123', role: 'Student', class: 'Class 1A' },
                { login: 'student2', password: 'demo123', role: 'Student', class: 'Class 1B' },
                { login: 'student3', password: 'demo123', role: 'Student', class: 'Class 2A' },
                { login: 'teacher1', password: 'demo123', role: 'Teacher' },
                { login: 'teacher2', password: 'demo123', role: 'Teacher' },
                { login: 'admin', password: 'demo123', role: 'Redactor' }
            ];
            localStorage.setItem('users', JSON.stringify(defaultUsers));
            console.log('✅ Default users created');
        }
        if (!localStorage.getItem('classes')) {
            const defaultClasses = ['Class 1A', 'Class 1B', 'Class 2A', 'Class 2B', 'Class 3A', 'Class 3B'];
            localStorage.setItem('classes', JSON.stringify(defaultClasses));
            console.log('✅ Default classes created');
        }
    }
    function selectTheme(theme, initial) {
        selectedTheme = theme;
        themeChips.forEach(chip => {
            chip.classList.toggle('active', chip.dataset.theme === theme);
        });
        if (!initial) {
            localStorage.setItem('selectedTheme', theme);
        }
    }
    function loadSavedTheme() {
        const saved = localStorage.getItem('selectedTheme') || 'basic';
        const exists = Array.from(themeChips).some(chip => chip.dataset.theme === saved);
        selectTheme(exists ? saved : 'basic', true);
    }
    themeChips.forEach(chip => {
        chip.addEventListener('click', function() {
            selectTheme(this.dataset.theme, false);
        });
    });
    togglePwdBtn.addEventListener('click', function() {
        const icon = this.querySelector('i');
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icon.classList.replace('fa-eye', 'fa-eye-slash');
        } else {
            passwordInput.type = 'password';
            icon.classList.replace('fa-eye-slash', 'fa-eye');
        }
    });
    function handleLogin(e) {
        e.preventDefault();
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        const role = roleSelect.value;
        console.log('🔑 Login attempt:', { username, password, role });
        if (!username || !password) {
            showError('Please enter both username and password.');
            return;
        }
        loginBtn.classList.add('loading');
        loginBtn.disabled = true;
        setTimeout(() => {
            try {
                initializeUsers();
                const users = JSON.parse(localStorage.getItem('users')) || [];
                console.log('📋 All users:', users);
                const user = users.find(u => 
                    u.login.toLowerCase() === username.toLowerCase() && 
                    u.password === password && 
                    u.role === role
                );
                console.log('🔍 Found user:', user);
                if (user) {
                    const sessionData = {
                        login: user.login,
                        role: user.role,
                        class: user.class || null
                    };
                    sessionStorage.setItem('currentUser', JSON.stringify(sessionData));
                    localStorage.setItem('selectedTheme', selectedTheme);
                    console.log('✅ Login successful! Redirecting to dashboard...');
                    window.location.href = 'page2.html';
                } else {
                    const userExists = users.find(u => 
                        u.login.toLowerCase() === username.toLowerCase() && 
                        u.password === password
                    );                   
                    if (userExists) {
                        showError(`Invalid role. This user is a "${userExists.role}". Please select the correct role.`);
                    } else {
                        showError('Invalid username or password. Please try again.');
                    }
                    loginBtn.classList.remove('loading');
                    loginBtn.disabled = false;
                }
            } catch (err) {
                console.error('❌ Login error:', err);
                showError('An error occurred. Please try again.');
                loginBtn.classList.remove('loading');
                loginBtn.disabled = false;
            }
        }, 400);
    }
    function showError(msg) {
        errorText.textContent = msg;
        errorMsg.classList.add('show');
        clearTimeout(window._errorTimer);
        window._errorTimer = setTimeout(() => {
            errorMsg.classList.remove('show');
        }, 5000);
    }
    form.addEventListener('submit', handleLogin);
    document.querySelectorAll('input, select').forEach(el => {
        el.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                form.dispatchEvent(new Event('submit'));
            }
        });
    });
    contactAdminLink.addEventListener('click', function(e) {
        e.preventDefault();
        alert('📧 Please contact your school administrator to create a new account.\n\n(admin@schoolportal.com)');
    });
    initializeUsers();
    loadSavedTheme();
    usernameInput.focus();
    const debugUsers = JSON.parse(localStorage.getItem('users') || '[]');
    console.log('📚 Available users:', debugUsers);
    console.log('✅ Login page initialized');
})();