(function() {
    'use strict';
    function initializeData() {
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
        }
        if (!localStorage.getItem('classes')) {
            const defaultClasses = ['Class 1A', 'Class 1B', 'Class 2A', 'Class 2B', 'Class 3A', 'Class 3B'];
            localStorage.setItem('classes', JSON.stringify(defaultClasses));
        }
        if (!localStorage.getItem('homework')) {
            localStorage.setItem('homework', JSON.stringify([]));
        }
        if (!localStorage.getItem('library')) {
            localStorage.setItem('library', JSON.stringify([]));
        }
        if (!localStorage.getItem('news')) {
            localStorage.setItem('news', JSON.stringify([]));
        }
        if (!localStorage.getItem('schedule')) {
            localStorage.setItem('schedule', JSON.stringify([]));
        }
        if (!localStorage.getItem('attendance')) {
            localStorage.setItem('attendance', JSON.stringify({}));
        }
        if (!localStorage.getItem('grades')) {
            localStorage.setItem('grades', JSON.stringify({}));
        }
        if (!localStorage.getItem('chatGroups')) {
            localStorage.setItem('chatGroups', JSON.stringify([]));
        }
        if (!localStorage.getItem('chatMessages')) {
            localStorage.setItem('chatMessages', JSON.stringify({}));
        }
        if (!localStorage.getItem('submissions')) {
            localStorage.setItem('submissions', JSON.stringify({}));
        }
    }
    const navItems = document.querySelectorAll('.nav-item');
    const panels = document.querySelectorAll('.page-panel');
    const userNameEl = document.getElementById('userName');
    const userRoleDisplay = document.getElementById('userRoleDisplay');
    const roleBadge = document.getElementById('roleBadge');
    const userAvatarEl = document.getElementById('userAvatar');
    const dateDisplay = document.getElementById('currentDate');
    const logoutBtn = document.getElementById('logoutBtn');
    const adminNav = document.getElementById('adminNav');
    let currentUser = null;
    let currentChatGroup = null;
    function getUser() {
        try {
            const data = sessionStorage.getItem('currentUser');
            if (data) {
                return JSON.parse(data);
            }
        } catch (e) {
            console.error('Error parsing user data:', e);
        }
        return null;
    }
    function checkAuth() {
        const user = getUser();
        if (!user) {
            window.location.href = 'page1.html';
            return false;
        }
        return user;
    }
    function updateUserUI(user) {
        if (!user) return;
        currentUser = user;
        userNameEl.textContent = user.login || 'User';
        roleBadge.textContent = user.role || 'Student';
        if (user.role === 'Student' && user.class) {
            userRoleDisplay.textContent = `Class: ${user.class}`;
        } else if (user.role === 'Teacher') {
            userRoleDisplay.textContent = 'Teacher Dashboard';
        } else if (user.role === 'Redactor') {
            userRoleDisplay.textContent = 'Administrator Dashboard';
        } else {
            userRoleDisplay.textContent = '';
        }
        const nameParts = user.login.split(' ');
        let initials = '';
        if (nameParts.length >= 2) {
            initials = nameParts[0].charAt(0) + nameParts[1].charAt(0);
        } else if (nameParts.length === 1) {
            initials = nameParts[0].charAt(0);
        }
        userAvatarEl.textContent = initials.toUpperCase() || 'U';
        if (user.role === 'Redactor') {
            adminNav.classList.remove('hidden');
        } else {
            adminNav.classList.add('hidden');
        }
        const canAdd = user.role === 'Teacher' || user.role === 'Redactor';
        document.getElementById('addHomeworkSection').style.display = canAdd ? 'block' : 'none';
        document.getElementById('addLibrarySection').style.display = canAdd ? 'block' : 'none';
        document.getElementById('addNewsSection').style.display = user.role === 'Redactor' ? 'block' : 'none';
        document.getElementById('addLessonSection').style.display = user.role === 'Redactor' ? 'block' : 'none';
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('attendanceDate').value = today;
    }
    function updateDate() {
        const now = new Date();
        const options = { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' };
        dateDisplay.textContent = now.toLocaleDateString('en-US', options);
    }
    function navigateTo(pageId) {
        navItems.forEach(item => {
            const isActive = item.dataset.page === pageId;
            item.classList.toggle('active', isActive);
        });
        panels.forEach(panel => {
            const isActive = panel.id === 'page-' + pageId;
            panel.classList.toggle('active', isActive);
        });
        document.getElementById('mainContent').scrollTop = 0;
        if (pageId === 'dashboard') loadDashboard();
        if (pageId === 'homework-library') loadHomeworkAndLibrary();
        if (pageId === 'schedule') loadSchedule();
        if (pageId === 'attendance-grades') loadAttendanceAndGrades();
        if (pageId === 'chats') loadChatGroups();
        if (pageId === 'news') loadNews();
        if (pageId === 'admin' && currentUser && currentUser.role === 'Redactor') loadAdminData();
    }
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const page = this.dataset.page;
            if (page) {
                navigateTo(page);
            }
        });
    });
    logoutBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to log out?')) {
            sessionStorage.removeItem('currentUser');
            window.location.href = 'page1.html';
        }
    });
    function loadDashboard() {
        const news = JSON.parse(localStorage.getItem('news')) || [];
        const newsFeed = document.getElementById('newsFeed');
        newsFeed.innerHTML = '';
        news.slice(0, 3).forEach(item => {
            newsFeed.innerHTML += `
                <div class="news-item">
                    <div class="title">${item.title}</div>
                    <div class="meta"><span><i class="far fa-calendar-alt"></i> ${new Date(item.createdAt).toLocaleDateString()}</span> <span><i class="far fa-user"></i> ${item.author}</span></div>
                </div>
            `;
        });
        if (news.length === 0) {
            newsFeed.innerHTML = '<div style="color:#64748b;text-align:center;padding:1rem;">No news available</div>';
        }
        const schedule = JSON.parse(localStorage.getItem('schedule')) || [];
        const eventsFeed = document.getElementById('eventsFeed');
        eventsFeed.innerHTML = '';
        const userClasses = getUserClasses();
        const filteredEvents = schedule.filter(e => userClasses.includes(e.class));
        filteredEvents.slice(0, 3).forEach(event => {
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const colors = ['blue', 'green', 'orange', 'purple'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            eventsFeed.innerHTML += `
                <div class="event-item">
                    <span class="dot ${color}"></span>
                    <div class="info">
                        <div class="name">${event.subject}</div>
                        <div class="time">${days[event.day]} ${event.time} · ${event.class}</div>
                    </div>
                </div>
            `;
        });
        if (filteredEvents.length === 0) {
            eventsFeed.innerHTML = '<div style="color:#64748b;text-align:center;padding:1rem;">No events this week</div>';
        }
        const homework = JSON.parse(localStorage.getItem('homework')) || [];
        const hwFeed = document.getElementById('hwFeed');
        hwFeed.innerHTML = '';
        const userHomework = homework.filter(h => userClasses.includes(h.class));
        userHomework.slice(0, 3).forEach(hw => {
            const submissions = JSON.parse(localStorage.getItem('submissions')) || {};
            const isSubmitted = submissions[hw.id] && submissions[hw.id][currentUser.login];
            hwFeed.innerHTML += `
                <div class="hw-item">
                    <div class="info">
                        <div class="name">${hw.title}</div>
                        <div class="deadline">Due: ${new Date(hw.createdAt).toLocaleDateString()}</div>
                    </div>
                    <span class="status ${isSubmitted ? 'submitted' : 'pending'}">${isSubmitted ? 'Submitted' : 'Pending'}</span>
                </div>
            `;
        });
        if (userHomework.length === 0) {
            hwFeed.innerHTML = '<div style="color:#64748b;text-align:center;padding:1rem;">No homework assigned</div>';
        }
        const chatGroups = JSON.parse(localStorage.getItem('chatGroups')) || [];
        const chatFeed = document.getElementById('chatFeed');
        chatFeed.innerHTML = '';
        const userChatGroups = chatGroups.filter(g => userClasses.includes(g.class));
        userChatGroups.slice(0, 3).forEach(group => {
            const messages = JSON.parse(localStorage.getItem('chatMessages')) || {};
            const groupMessages = messages[group.id] || [];
            const lastMsg = groupMessages[groupMessages.length - 1];
            const initials = group.name.split(' ').map(w => w[0]).join('').toUpperCase();
            chatFeed.innerHTML += `
                <div class="chat-item" onclick="openChat('${group.id}')">
                    <div class="chat-avatar">${initials}</div>
                    <div class="chat-info">
                        <div class="name">${group.name}</div>
                        <div class="preview">${lastMsg ? lastMsg.sender + ': ' + lastMsg.content : 'No messages yet'}</div>
                    </div>
                    <div class="chat-time">${lastMsg ? new Date(lastMsg.timestamp).toLocaleTimeString() : ''}</div>
                </div>
            `;
        });
        if (userChatGroups.length === 0) {
            chatFeed.innerHTML = '<div style="color:#64748b;text-align:center;padding:1rem;">No chats available</div>';
        }
        document.getElementById('hwBadge').textContent = userHomework.length || '0';
        document.getElementById('chatBadge').textContent = userChatGroups.length || '0';
    }
    function getUserClasses() {
        if (!currentUser) return [];
        if (currentUser.role === 'Student') {
            return currentUser.class ? [currentUser.class] : [];
        } else if (currentUser.role === 'Teacher') {
            const classes = JSON.parse(localStorage.getItem('classes')) || [];
            return classes;
        } else if (currentUser.role === 'Redactor') {
            const classes = JSON.parse(localStorage.getItem('classes')) || [];
            return classes;
        }
        return [];
    }
    function loadHomeworkAndLibrary() {
        const classes = JSON.parse(localStorage.getItem('classes')) || [];
        const hwClassSelect = document.getElementById('hwClass');
        hwClassSelect.innerHTML = '<option value="">Select Class</option>';
        classes.forEach(cls => {
            hwClassSelect.innerHTML += `<option value="${cls}">${cls}</option>`;
        });
        const homework = JSON.parse(localStorage.getItem('homework')) || [];
        const userClasses = getUserClasses();
        const userHomework = homework.filter(h => userClasses.includes(h.class));
        const grid = document.getElementById('homeworkGrid');
        grid.innerHTML = '';
        if (userHomework.length === 0) {
            grid.innerHTML = '<div style="color:#64748b;text-align:center;padding:2rem;">No homework assigned to your classes</div>';
            return;
        }
        userHomework.forEach(hw => {
            const submissions = JSON.parse(localStorage.getItem('submissions')) || {};
            const userSubmission = submissions[hw.id] && submissions[hw.id][currentUser.login];
            const canSubmit = currentUser.role === 'Student';
            let actionsHtml = '';
            if (canSubmit) {
                actionsHtml += `
                    <div class="hw-actions">
                        <button class="btn-submit" onclick="submitHomework('${hw.id}')">
                            <i class="fas fa-upload"></i> Submit Work
                        </button>
                    </div>
                `;
            }
            if (userSubmission) {
                actionsHtml += `
                    <div class="hw-files">
                        <strong>Submitted:</strong> ${userSubmission.fileName || 'File attached'}
                        <span style="color:#22c55e;margin-left:8px;">✓</span>
                    </div>
                `;
            }
            grid.innerHTML += `
                <div class="hw-card">
                    <div class="hw-title">${hw.title}</div>
                    <div class="hw-desc">${hw.description || 'No description'}</div>
                    <div class="hw-meta">
                        <span>By: ${hw.teacher}</span>
                        <span class="class-tag">${hw.class}</span>
                    </div>
                    ${actionsHtml}
                </div>
            `;
        });
        const library = JSON.parse(localStorage.getItem('library')) || [];
        const libGrid = document.getElementById('libraryGrid');
        libGrid.innerHTML = '';
        const userLibrary = library.filter(l => userClasses.includes(l.class) || !l.class);
        if (userLibrary.length === 0) {
            libGrid.innerHTML = '<div style="color:#64748b;text-align:center;padding:2rem;">No library materials available</div>';
            return;
        }
        userLibrary.forEach(item => {
            libGrid.innerHTML += `
                <div class="lib-item">
                    <div class="lib-title">${item.title}</div>
                    <div class="lib-desc">${item.description || 'No description'}</div>
                    <div class="lib-meta">
                        <span>By: ${item.teacher}</span>
                        <span>${item.class ? 'Class: ' + item.class : 'General'}</span>
                    </div>
                </div>
            `;
        });
    }
    window.addHomework = function() {
        const title = document.getElementById('hwTitle').value.trim();
        const description = document.getElementById('hwDesc').value.trim();
        const classValue = document.getElementById('hwClass').value;
        if (!title || !classValue) {
            document.getElementById('hwMessage').textContent = 'Please fill in title and class';
            document.getElementById('hwMessage').className = 'message error';
            return;
        }
        const homework = JSON.parse(localStorage.getItem('homework')) || [];
        homework.push({
            id: Date.now().toString(),
            title: title,
            description: description,
            class: classValue,
            teacher: currentUser.login,
            createdAt: new Date().toISOString()
        });
        localStorage.setItem('homework', JSON.stringify(homework));
        document.getElementById('hwMessage').textContent = '✅ Homework added successfully!';
        document.getElementById('hwMessage').className = 'message success';
        document.getElementById('hwTitle').value = '';
        document.getElementById('hwDesc').value = '';
        document.getElementById('hwClass').value = '';
        loadHomeworkAndLibrary();
        setTimeout(() => {
            document.getElementById('hwMessage').textContent = '';
        }, 3000);
    };
    window.submitHomework = function(hwId) {
        const fileName = prompt('Enter the filename of your submitted work:', 'assignment.pdf');
        if (!fileName) return;
        const submissions = JSON.parse(localStorage.getItem('submissions')) || {};
        if (!submissions[hwId]) submissions[hwId] = {};
        submissions[hwId][currentUser.login] = {
            fileName: fileName,
            submittedAt: new Date().toISOString()
        };
        localStorage.setItem('submissions', JSON.stringify(submissions));
        loadHomeworkAndLibrary();
        alert('✅ Homework submitted successfully!');
    };
    window.addLibraryMaterial = function() {
        const title = document.getElementById('libTitle').value.trim();
        const description = document.getElementById('libDesc').value.trim();
        if (!title) {
            document.getElementById('libMessage').textContent = 'Please enter a title';
            document.getElementById('libMessage').className = 'message error';
            return;
        }
        const library = JSON.parse(localStorage.getItem('library')) || [];
        const userClasses = getUserClasses();
        library.push({
            id: Date.now().toString(),
            title: title,
            description: description,
            class: userClasses[0] || '',
            teacher: currentUser.login,
            createdAt: new Date().toISOString()
        });
        localStorage.setItem('library', JSON.stringify(library));
        document.getElementById('libMessage').textContent = '✅ Library material added successfully!';
        document.getElementById('libMessage').className = 'message success';
        document.getElementById('libTitle').value = '';
        document.getElementById('libDesc').value = '';
        loadHomeworkAndLibrary();
        setTimeout(() => {
            document.getElementById('libMessage').textContent = '';
        }, 3000);
    };
    window.switchTab = function(tab) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
            btn.style.color = btn.dataset.tab === tab ? '#e2e8f0' : '#64748b';
        });
        document.getElementById('homeworkTab').style.display = tab === 'homework' ? 'block' : 'none';
        document.getElementById('libraryTab').style.display = tab === 'library' ? 'block' : 'none';
    };
    function loadSchedule() {
        const schedule = JSON.parse(localStorage.getItem('schedule')) || [];
        const userClasses = getUserClasses();
        const userSchedule = schedule.filter(s => userClasses.includes(s.class));
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const today = new Date();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        document.getElementById('scheduleWeek').textContent =
            `Week of ${weekStart.toLocaleDateString()}`;
        const grid = document.getElementById('scheduleGrid');
        grid.innerHTML = '';
        grid.innerHTML += `<div class="header-cell">Time</div>`;
        for (let i = 0; i < 7; i++) {
            const date = new Date(weekStart);
            date.setDate(weekStart.getDate() + i);
            const isToday = date.toDateString() === today.toDateString();
            grid.innerHTML += `<div class="header-cell ${isToday ? 'today' : ''}">${days[i]}<br>${date.getDate()}</div>`;
        }
        for (let hour = 9; hour <= 17; hour++) {
            const timeStr = `${hour.toString().padStart(2, '0')}:00`;
            grid.innerHTML += `<div class="time-cell">${timeStr}</div>`;

            for (let day = 0; day < 7; day++) {
                const slotEvents = userSchedule.filter(e => e.day === day && e.time === timeStr);
                let eventsHtml = '';
                slotEvents.forEach(e => {
                    eventsHtml += `<div class="sched-event ${e.class ? 'class-event' : ''}">${e.subject}</div>`;
                });
                grid.innerHTML += `<div class="slot-cell">${eventsHtml}</div>`;
            }
        }
    }
    window.addLesson = function() {
        const subject = document.getElementById('lessonSubject').value.trim();
        const classValue = document.getElementById('lessonClass').value;
        const day = parseInt(document.getElementById('lessonDay').value);
        const time = document.getElementById('lessonTime').value;
        if (!subject || !classValue) {
            document.getElementById('lessonMessage').textContent = 'Please fill in all fields';
            document.getElementById('lessonMessage').className = 'message error';
            return;
        }
        const schedule = JSON.parse(localStorage.getItem('schedule')) || [];
        schedule.push({
            id: Date.now().toString(),
            subject: subject,
            class: classValue,
            day: day,
            time: time,
            teacher: currentUser.login
        });
        localStorage.setItem('schedule', JSON.stringify(schedule));
        document.getElementById('lessonMessage').textContent = '✅ Lesson added successfully!';
        document.getElementById('lessonMessage').className = 'message success';
        document.getElementById('lessonSubject').value = '';
        document.getElementById('lessonClass').value = '';
        loadSchedule();
        setTimeout(() => {
            document.getElementById('lessonMessage').textContent = '';
        }, 3000);
    };
    function loadAttendanceAndGrades() {
        const classes = JSON.parse(localStorage.getItem('classes')) || [];
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const attendance = JSON.parse(localStorage.getItem('attendance')) || {};
        const grades = JSON.parse(localStorage.getItem('grades')) || {};
        const date = document.getElementById('attendanceDate').value;
        let userClasses = getUserClasses();
        if (currentUser.role === 'Student') {
            const grid = document.getElementById('attendanceGrid');
            grid.innerHTML = `
                <div class="student-card" style="grid-column:1/-1;max-width:300px;margin:0 auto;">
                    <div class="s-avatar">${userAvatarEl.textContent}</div>
                    <div class="s-name">${currentUser.login}</div>
                    <div class="s-status ${attendance[date] && attendance[date][currentUser.login] === 'present' ? 'present' : attendance[date] && attendance[date][currentUser.login] === 'online' ? 'online' : 'absent'}">
                        ${attendance[date] && attendance[date][currentUser.login] ? 
                            attendance[date][currentUser.login].charAt(0).toUpperCase() + attendance[date][currentUser.login].slice(1) : 
                            'Not marked'}
                    </div>
                    <div class="s-grades">
                        <strong>Grades:</strong> 
                        ${Object.entries(grades[currentUser.login] || {}).map(([key, val]) => 
                            `${key}: ${val}%`
                        ).join(' | ') || 'No grades yet'}
                    </div>
                </div>
            `;
            return;
        }
        const allStudents = users.filter(u => u.role === 'Student' && userClasses.includes(u.class));
        document.getElementById('attendanceClassDisplay').textContent = 
            allStudents.length > 0 ? `${allStudents[0].class} (${allStudents.length} students)` : 'No students';
        const grid = document.getElementById('attendanceGrid');
        grid.innerHTML = '';
        if (allStudents.length === 0) {
            grid.innerHTML = '<div style="color:#64748b;text-align:center;padding:2rem;grid-column:1/-1;">No students in your classes</div>';
            return;
        }
        allStudents.forEach(student => {
            const studentGrades = grades[student.login] || {};
            const avg = Object.values(studentGrades).filter(v => !isNaN(v)).length > 0 ?
                (Object.values(studentGrades).filter(v => !isNaN(v)).reduce((a, b) => a + b, 0) / 
                 Object.values(studentGrades).filter(v => !isNaN(v)).length).toFixed(1) : 'N/A';
            const status = attendance[date] && attendance[date][student.login] || '';
            grid.innerHTML += `
                <div class="student-card">
                    <div class="s-avatar">${student.login.split(' ').map(w => w[0]).join('').toUpperCase()}</div>
                    <div class="s-name">${student.login}</div>
                    <div class="s-status ${status === 'present' ? 'present' : status === 'online' ? 'online' : 'absent'}">
                        ${status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Not marked'}
                    </div>
                    <div class="attendance-buttons">
                        <button class="btn-present" onclick="markAttendance('${student.login}','present')">Present</button>
                        <button class="btn-online" onclick="markAttendance('${student.login}','online')">Online</button>
                        <button class="btn-absent" onclick="markAttendance('${student.login}','absent')">Absent</button>
                    </div>
                    <div class="s-grades">
                        <strong>Grades:</strong>
                        <input type="text" class="grade-input" placeholder="Subject" 
                               value="${Object.keys(studentGrades).join(', ')}" 
                               style="width:80px;margin:0 4px;">
                        <input type="number" class="grade-input" placeholder="Score" 
                               value="${Object.values(studentGrades).filter(v => !isNaN(v))[0] || ''}" 
                               style="width:50px;margin:0 4px;"
                               onchange="updateGrade('${student.login}', this)">
                        <button onclick="addGrade('${student.login}')" style="background:#38bdf8;border:none;border-radius:4px;color:#0b1120;cursor:pointer;padding:2px 8px;font-size:0.6rem;font-weight:600;">+</button>
                    </div>
                    <div class="s-grades" style="font-size:0.65rem;">Avg: ${avg}%</div>
                </div>
            `;
        });
    }
    window.markAttendance = function(studentLogin, status) {
        const date = document.getElementById('attendanceDate').value;
        const attendance = JSON.parse(localStorage.getItem('attendance')) || {};
        if (!attendance[date]) attendance[date] = {};
        attendance[date][studentLogin] = status;
        localStorage.setItem('attendance', JSON.stringify(attendance));
        loadAttendanceAndGrades();
    };
    window.updateGrade = function(studentLogin, input) {
        const grades = JSON.parse(localStorage.getItem('grades')) || {};
        if (!grades[studentLogin]) grades[studentLogin] = {};
        const subjectInput = input.parentElement.querySelector('.grade-input:first-child');
        const scoreInput = input;
        const subject = subjectInput.value.trim() || 'Test';
        const score = parseInt(scoreInput.value);
        if (!isNaN(score) && score >= 0 && score <= 100) {
            grades[studentLogin][subject] = score;
            localStorage.setItem('grades', JSON.stringify(grades));
            loadAttendanceAndGrades();
        }
    };
    window.addGrade = function(studentLogin) {
        const grades = JSON.parse(localStorage.getItem('grades')) || {};
        if (!grades[studentLogin]) grades[studentLogin] = {};
        const subject = prompt('Enter subject name:');
        if (!subject) return;
        const score = prompt('Enter score (0-100):');
        if (score === null) return;
        const numScore = parseInt(score);
        if (isNaN(numScore) || numScore < 0 || numScore > 100) {
            alert('Please enter a valid score between 0 and 100');
            return;
        }
        grades[studentLogin][subject] = numScore;
        localStorage.setItem('grades', JSON.stringify(grades));
        loadAttendanceAndGrades();
    };
    function loadChatGroups() {
        const chatGroups = JSON.parse(localStorage.getItem('chatGroups')) || [];
        const userClasses = getUserClasses();
        const userGroups = chatGroups.filter(g => userClasses.includes(g.class));
        const list = document.getElementById('chatGroupsList');
        list.innerHTML = '';
        if (userGroups.length === 0) {
            list.innerHTML = '<div style="color:#64748b;text-align:center;padding:2rem;">No chat groups available for your classes</div>';
            return;
        }
        userGroups.forEach(group => {
            const messages = JSON.parse(localStorage.getItem('chatMessages')) || {};
            const groupMessages = messages[group.id] || [];
            const lastMsg = groupMessages[groupMessages.length - 1];
            const initials = group.name.split(' ').map(w => w[0]).join('').toUpperCase();
            list.innerHTML += `
                <div class="chat-item" onclick="openChat('${group.id}')" style="padding:1rem;background:rgba(255,255,255,0.03);border-radius:14px;margin-bottom:8px;">
                    <div class="chat-avatar">${initials}</div>
                    <div class="chat-info">
                        <div class="name">${group.name}</div>
                        <div class="preview">${lastMsg ? lastMsg.sender + ': ' + lastMsg.content : 'No messages yet'}</div>
                    </div>
                    <div class="chat-time">${lastMsg ? new Date(lastMsg.timestamp).toLocaleTimeString() : ''}</div>
                </div>
            `;
        });
        document.getElementById('chatClassDisplay').textContent = 
            userGroups.length > 0 ? `${userGroups.length} chats available` : 'No chats available';
    }
    window.openChat = function(groupId) {
        const chatGroups = JSON.parse(localStorage.getItem('chatGroups')) || [];
        const group = chatGroups.find(g => g.id === groupId);
        if (!group) return;
        currentChatGroup = group;
        document.getElementById('chatModalTitle').textContent = group.name;
        const messages = JSON.parse(localStorage.getItem('chatMessages')) || {};
        const groupMessages = messages[groupId] || [];
        const container = document.getElementById('chatMessages');
        container.innerHTML = '';
        groupMessages.forEach(msg => {
            const isOwn = msg.sender === currentUser.login;
            container.innerHTML += `
                <div class="chat-message ${isOwn ? 'own' : 'other'}">
                    <div class="msg-sender">${msg.sender}</div>
                    ${msg.content}
                    <div class="msg-time">${new Date(msg.timestamp).toLocaleTimeString()}</div>
                </div>
            `;
        });
        document.getElementById('chatModal').classList.add('active');
        document.getElementById('chatInput').value = '';
        container.scrollTop = container.scrollHeight;
        setTimeout(() => document.getElementById('chatInput').focus(), 100);
    };
    window.closeChatModal = function() {
        document.getElementById('chatModal').classList.remove('active');
        currentChatGroup = null;
    };
    window.sendChatMessage = function() {
        const input = document.getElementById('chatInput');
        const content = input.value.trim();
        if (!content || !currentChatGroup) return;
        const messages = JSON.parse(localStorage.getItem('chatMessages')) || {};
        if (!messages[currentChatGroup.id]) messages[currentChatGroup.id] = [];
        messages[currentChatGroup.id].push({
            sender: currentUser.login,
            content: content,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('chatMessages', JSON.stringify(messages));
        input.value = '';
        openChat(currentChatGroup.id);
    };
    function loadNews() {
        const news = JSON.parse(localStorage.getItem('news')) || [];
        const list = document.getElementById('newsList');
        list.innerHTML = '';
        if (news.length === 0) {
            list.innerHTML = '<div style="color:#64748b;text-align:center;padding:2rem;">No news available</div>';
            return;
        }
        news.slice().reverse().forEach(item => {
            list.innerHTML += `
                <div class="news-item" style="padding:1.2rem;background:rgba(255,255,255,0.03);border-radius:14px;border-bottom:none;margin-bottom:1rem;">
                    <div class="title" style="font-size:1.1rem;">${item.title}</div>
                    <div class="meta" style="margin-top:6px;">
                        <span><i class="far fa-calendar-alt"></i> ${new Date(item.createdAt).toLocaleDateString()}</span>
                        <span><i class="far fa-user"></i> ${item.author}</span>
                    </div>
                    <p style="color:#94a3b8;font-size:0.9rem;margin-top:8px;">${item.content}</p>
                </div>
            `;
        });
    }
    window.addNews = function() {
        const title = document.getElementById('newsTitle').value.trim();
        const content = document.getElementById('newsContent').value.trim();
        if (!title || !content) {
            document.getElementById('newsMessage').textContent = 'Please fill in title and content';
            document.getElementById('newsMessage').className = 'message error';
            return;
        }
        const news = JSON.parse(localStorage.getItem('news')) || [];
        news.push({
            id: Date.now().toString(),
            title: title,
            content: content,
            author: currentUser.login,
            createdAt: new Date().toISOString()
        });
        localStorage.setItem('news', JSON.stringify(news));
        document.getElementById('newsMessage').textContent = '✅ News added successfully!';
        document.getElementById('newsMessage').className = 'message success';
        document.getElementById('newsTitle').value = '';
        document.getElementById('newsContent').value = '';
        loadNews();
        setTimeout(() => {
            document.getElementById('newsMessage').textContent = '';
        }, 3000);
    };
    function loadAdminData() {
        loadUsers();
        loadClassesList();
        loadClassesDropdown();
        const form = document.getElementById('addUserForm');
        form.onsubmit = function(e) {
            e.preventDefault();
            const username = document.getElementById('newUsername').value.trim();
            const password = document.getElementById('newPassword').value.trim();
            const role = document.getElementById('newRole').value;
            const classVal = document.getElementById('newClass').value;
            if (!username || !password) {
                document.getElementById('addUserMessage').textContent = 'Please fill in all fields';
                document.getElementById('addUserMessage').className = 'message error';
                return;
            }
            const users = JSON.parse(localStorage.getItem('users')) || [];
            if (users.some(u => u.login.toLowerCase() === username.toLowerCase())) {
                document.getElementById('addUserMessage').textContent = 'Username already exists';
                document.getElementById('addUserMessage').className = 'message error';
                return;
            }
            users.push({
                login: username,
                password: password,
                role: role,
                class: role === 'Student' ? classVal || 'Unassigned' : undefined
            });
            localStorage.setItem('users', JSON.stringify(users));
            document.getElementById('addUserMessage').textContent = '✅ User added successfully!';
            document.getElementById('addUserMessage').className = 'message success';
            document.getElementById('newUsername').value = '';
            document.getElementById('newPassword').value = 'demo123';
            loadUsers();
            setTimeout(() => {
                document.getElementById('addUserMessage').textContent = '';
            }, 3000);
        };
    }
    function loadUsers() {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const tbody = document.getElementById('userTableBody');
        tbody.innerHTML = '';
        users.forEach((user, index) => {
            tbody.innerHTML += `
                <tr>
                    <td>${user.login}</td>
                    <td style="color:#94a3b8;">${user.role}</td>
                    <td style="color:#94a3b8;">${user.class || '—'}</td>
                    <td style="text-align:right;">
                        <button onclick="deleteUser(${index})" class="btn-danger">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </td>
                </tr>
            `;
        });
    }
    window.deleteUser = function(index) {
        if (!confirm('Delete this user?')) return;
        const users = JSON.parse(localStorage.getItem('users')) || [];
        users.splice(index, 1);
        localStorage.setItem('users', JSON.stringify(users));
        loadUsers();
    };
    function loadClassesList() {
        const classes = JSON.parse(localStorage.getItem('classes')) || [];
        const container = document.getElementById('classList');
        container.innerHTML = '';
        classes.forEach((cls, index) => {
            container.innerHTML += `
                <span style="background:rgba(56,189,248,0.1);color:#38bdf8;padding:0.3rem 0.8rem;border-radius:20px;font-size:0.75rem;display:flex;align-items:center;gap:6px;border:1px solid rgba(56,189,248,0.15);">
                    ${cls}
                    <button onclick="deleteClass(${index})" style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:0.7rem;">
                        <i class="fas fa-times"></i>
                    </button>
                </span>
            `;
        });
    }
    window.addClass = function() {
        const input = document.getElementById('newClassName');
        const name = input.value.trim();
        if (!name) {
            document.getElementById('classMessage').textContent = 'Please enter a class name';
            document.getElementById('classMessage').className = 'message error';
            return;
        }
        const classes = JSON.parse(localStorage.getItem('classes')) || [];
        if (classes.includes(name)) {
            document.getElementById('classMessage').textContent = 'Class already exists';
            document.getElementById('classMessage').className = 'message error';
            return;
        }
        classes.push(name);
        localStorage.setItem('classes', JSON.stringify(classes));
        input.value = '';
        loadClassesList();
        loadClassesDropdown();
        document.getElementById('classMessage').textContent = '✅ Class added successfully!';
        document.getElementById('classMessage').className = 'message success';
        setTimeout(() => {
            document.getElementById('classMessage').textContent = '';
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
    function loadClassesDropdown() {
        const classes = JSON.parse(localStorage.getItem('classes')) || [];
        const select = document.getElementById('newClass');
        select.innerHTML = '<option value="">N/A</option>';
        classes.forEach(cls => {
            select.innerHTML += `<option value="${cls}">${cls}</option>`;
        });
        document.querySelectorAll('#hwClass, #lessonClass').forEach(sel => {
            if (sel.id !== 'newClass') {
                sel.innerHTML = '<option value="">Select Class</option>';
                classes.forEach(cls => {
                    sel.innerHTML += `<option value="${cls}">${cls}</option>`;
                });
            }
        });
    }
    window.navigateTo = navigateTo;
    function init() {
        initializeData();
        const user = checkAuth();
        if (!user) return;
        updateUserUI(user);
        updateDate();
        loadDashboard();
        if (user.role === 'Redactor') {
            loadAdminData();
        }
        if (user.role === 'Teacher' || user.role === 'Redactor') {
            loadAttendanceAndGrades();
        }
        document.getElementById('attendanceDate').addEventListener('change', function() {
            if (user.role === 'Teacher' || user.role === 'Redactor') {
                loadAttendanceAndGrades();
            }
        });
        console.log('✅ School Portal initialized — User:', user.login, 'Role:', user.role);
    }
    init();
})();