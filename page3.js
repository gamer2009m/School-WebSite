(function() {
    'use strict';
    function checkAuth() {
        try {
            const data = sessionStorage.getItem('currentUser');
            if (!data) {
                window.location.href = 'page1.html';
                return null;
            }
            const user = JSON.parse(data);
            if (user.role !== 'Redactor') {
                window.location.href = 'page2.html';
                return null;
            }
            return user;
        } catch (e) {
            window.location.href = 'page1.html';
            return null;
        }
    }
    function loadUsers() {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const tbody = document.getElementById('userTableBody');
        tbody.innerHTML = '';
        users.forEach((user, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${user.login}</td>
                <td style="color:#94a3b8;">${user.role}</td>
                <td style="color:#94a3b8;">${user.class || '—'}</td>
                <td style="text-align:right;">
                    <button onclick="deleteUser(${index})" class="btn-danger">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        const students = users.filter(u => u.role === 'Student');
        const teachers = users.filter(u => u.role === 'Teacher');
        document.getElementById('totalUsers').textContent = users.length;
        document.getElementById('totalStudents').textContent = students.length;
        document.getElementById('totalTeachers').textContent = teachers.length;
    }
    function loadClassesDropdown() {
        const classes = JSON.parse(localStorage.getItem('classes')) || [];
        const select = document.getElementById('newClass');
        select.innerHTML = '<option value="">N/A</option>';
        classes.forEach(cls => {
            const opt = document.createElement('option');
            opt.value = cls;
            opt.textContent = cls;
            select.appendChild(opt);
        });
    }
    function loadClassesList() {
        const classes = JSON.parse(localStorage.getItem('classes')) || [];
        const container = document.getElementById('classList');
        container.innerHTML = '';
        classes.forEach((cls, index) => {
            const tag = document.createElement('span');
            tag.className = 'class-tag';
            tag.innerHTML = `
                ${cls}
                <button onclick="deleteClass(${index})">
                    <i class="fas fa-times"></i>
                </button>
            `;
            container.appendChild(tag);
        });
    }
    function setupAddUserForm() {
        const form = document.getElementById('addUserForm');
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('newUsername').value.trim();
            const password = document.getElementById('newPassword').value.trim();
            const role = document.getElementById('newRole').value;
            const classVal = document.getElementById('newClass').value;
            if (!username || !password) {
                showMessage('addUserMessage', 'Please fill in all fields.', 'error');
                return;
            }
            const users = JSON.parse(localStorage.getItem('users')) || [];
            if (users.some(u => u.login.toLowerCase() === username.toLowerCase())) {
                showMessage('addUserMessage', 'Username already exists.', 'error');
                return;
            }
            const newUser = {
                login: username,
                password: password,
                role: role,
                class: role === 'Student' ? classVal || 'Unassigned' : undefined
            };
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            showMessage('addUserMessage', '✅ User added successfully!', 'success');
            document.getElementById('newUsername').value = '';
            document.getElementById('newPassword').value = 'demo123';
            loadUsers();
            setTimeout(() => {
                document.getElementById('addUserMessage').innerHTML = '';
            }, 3000);
        });
    }
    window.addClass = function() {
        const input = document.getElementById('newClassName');
        const name = input.value.trim();
        if (!name) {
            showMessage('classMessage', 'Please enter a class name.', 'error');
            return;
        }
        const classes = JSON.parse(localStorage.getItem('classes')) || [];
        if (classes.includes(name)) {
            showMessage('classMessage', 'Class already exists.', 'error');
            return;
        }
        classes.push(name);
        localStorage.setItem('classes', JSON.stringify(classes));
        input.value = '';
        loadClassesList();
        loadClassesDropdown();
        showMessage('classMessage', '✅ Class added successfully!', 'success');
        setTimeout(() => {
            document.getElementById('classMessage').innerHTML = '';
        }, 3000);
    };
    window.deleteClass = function(index) {
        if (!confirm('Delete this class?')) return;
        const classes = JSON.parse(localStorage.getItem('classes')) || [];
        classes.splice(index, 1);
        localStorage.setItem('classes', JSON.stringify(classes));
        loadClassesList();
        loadClassesDropdown();
    };
    window.deleteUser = function(index) {
        if (!confirm('Delete this user?')) return;
        const users = JSON.parse(localStorage.getItem('users')) || [];
        users.splice(index, 1);
        localStorage.setItem('users', JSON.stringify(users));
        loadUsers();
    };
    function showMessage(elementId, text, type) {
        const el = document.getElementById(elementId);
        el.textContent = text;
        el.className = 'message ' + type;
    }
    function init() {
        const user = checkAuth();
        if (!user) return;
        loadUsers();
        loadClassesDropdown();
        loadClassesList();
        setupAddUserForm();
        console.log('✅ Admin panel initialized — Redactor:', user.login);
    }
    init();
})();