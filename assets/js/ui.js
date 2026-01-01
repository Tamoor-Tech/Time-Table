/* 
 * UI Rendering Module
 * Manages all DOM rendering, dashboards, and dynamic HTML generation
 */

const UI = {
    // --- Cache DOM Elements ---
    elements: {
        loginSection: null,
        dashboardSection: null,
        userDisplay: null,
        roleBadge: null,
        contentArea: null
    },

    init() {
        this.elements.loginSection = document.getElementById('login-section');
        this.elements.dashboardSection = document.getElementById('dashboard-section');
        this.elements.userDisplay = document.getElementById('user-display');
        this.elements.roleBadge = document.getElementById('role-badge');
        this.elements.contentArea = document.getElementById('main-content');
    },

    // --- Navigation ---
    showLogin() {
        this.elements.loginSection.classList.remove('d-none');
        this.elements.dashboardSection.classList.add('d-none');
    },

    showDashboard(user) {
        this.elements.loginSection.classList.add('d-none');
        this.elements.dashboardSection.classList.remove('d-none');

        // Update Header
        this.elements.userDisplay.textContent = user.name;
        this.elements.roleBadge.textContent = this.formatRole(user.role);

        // Render Role Specific Views
        this.renderRoleView(user);
    },

    formatRole(role) {
        return role.charAt(0).toUpperCase() + role.slice(1);
    },

    // --- Router ---
    renderRoleView(user) {
        this.elements.contentArea.innerHTML = ''; // Clear previous

        switch (user.role) {
            case 'admin':
                this.renderAdminDashboard();
                break;
            case 'teacher':
                this.renderTeacherDashboard(user);
                break;
            case 'student':
                this.renderStudentDashboard();
                break;
            case 'cr':
                this.renderCRDashboard();
                break;
            default:
                this.elements.contentArea.innerHTML = '<div class="alert alert-danger">Unknown Role</div>';
        }
    },

    // --- 1. Admin Dashboard ---
    renderAdminDashboard() {
        // Layout: Left (Timetable), Right (Teacher List)
        const container = document.createElement('div');
        container.className = 'row fade-in';

        // --- Stats Row ---
        const totalT = State.teachers.length;
        const presentT = State.teachers.filter(t => t.isPresent).length;

        // --- Teacher Management Panel ---
        const rightPanel = `
            <div class="col-lg-4 order-lg-2">
                <div class="stat-card">
                    <div class="card-body">
                         <div class="stat-details">
                            <h3>${presentT} / ${totalT}</h3>
                            <p>Teachers Present</p>
                        </div>
                        <div class="stat-icon bg-info">
                            <i class="bi bi-person-check"></i>
                        </div>
                    </div>
                </div>

                <div class="table-container">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h5 class="fw-bold m-0"><i class="bi bi-people-fill text-primary"></i> Faculty List</h5>
                        <button class="btn btn-sm btn-primary rounded-pill" onclick="UI.promptAddTeacher()">+ Add</button>
                    </div>
                    <ul class="list-group list-group-flush" id="teacher-list">
                        ${State.teachers.map(t => `
                            <li class="list-group-item d-flex justify-content-between align-items-center">
                                <div>
                                    <div class="fw-bold">${t.name}</div>
                                    <small class="text-muted">${t.subject}</small>
                                </div>
                                <div class="form-check form-switch">
                                    <input class="form-check-input" type="checkbox" 
                                           id="t-switch-${t.id}"
                                           ${t.isPresent ? 'checked' : ''}
                                           onchange="Logic.setTeacherStatus(${t.id}, this.checked); UI.refresh()">
                                </div>
                            </li>
                        `).join('')}
                    </ul>
                </div>
                
                 <div class="card border-0 shadow-sm p-3">
                    <small class="text-muted">System Actions</small>
                    <button class="btn btn-outline-danger btn-sm mt-2" onclick="State.resetSystem()">⚠ Reset All Data</button>
                </div>
            </div>
        `;

        // --- Timetable Panel ---
        const leftPanel = `
            <div class="col-lg-8 order-lg-1">
                 <div class="table-container">
                    <h4 class="fw-bold mb-4">Department Master Timetable</h4>
                    ${this.generateTimetableHTML(State.timetable, 'admin', null)}
                </div>
            </div>
        `;

        container.innerHTML = leftPanel + rightPanel;
        this.elements.contentArea.appendChild(container);
    },

    // --- 2. Teacher Dashboard ---
    renderTeacherDashboard(user) {
        // Show notifications
        const myNotes = State.notifications.filter(n => n.targetId == user.teacherId);

        let notesHTML = '';
        if (myNotes.length > 0) {
            notesHTML = `
                <div class="alert alert-warning fade-in shadow-sm border-0 mb-4">
                    <h5 class="alert-heading"><i class="bi bi-bell-fill"></i> New Notifications</h5>
                    <ul class="mb-0">
                        ${myNotes.map(n => `<li>${n.message}</li>`).join('')}
                    </ul>
                </div>
            `;
        }

        const container = document.createElement('div');
        container.className = 'fade-in';
        container.innerHTML = `
            ${notesHTML}
            <div class="table-container">
                <h4 class="fw-bold mb-3">My Schedule</h4>
                <p class="text-muted">Highlighting your assigned lectures.</p>
                ${this.generateTimetableHTML(State.timetable, 'teacher', user.teacherId)}
            </div>
        `;
        this.elements.contentArea.appendChild(container);
    },

    // --- 3. Student Dashboard ---
    renderStudentDashboard() {
        const container = document.createElement('div');
        container.className = 'fade-in';
        container.innerHTML = `
            <div class="row mb-4">
                 <div class="col-md-4">
                    <div class="card p-3 border-0 shadow-sm d-flex flex-row align-items-center gap-3">
                        <div class="rounded-circle bg-success p-2"></div>
                        <span>Lecture Completed</span>
                    </div>
                 </div>
                 <div class="col-md-4">
                    <div class="card p-3 border-0 shadow-sm d-flex flex-row align-items-center gap-3">
                        <div class="rounded-circle bg-primary p-2"></div>
                        <span>Ongoing Now</span>
                    </div>
                 </div>
                 <div class="col-md-4">
                    <div class="card p-3 border-0 shadow-sm d-flex flex-row align-items-center gap-3">
                        <div class="rounded-circle bg-secondary p-2"></div>
                        <span>Upcoming</span>
                    </div>
                 </div>
            </div>
            <div class="table-container">
                <h4 class="fw-bold">Class Timetable</h4>
                ${this.generateTimetableHTML(State.timetable, 'student', null)}
            </div>
        `;
        this.elements.contentArea.appendChild(container);
    },

    // --- 4. CR Dashboard ---
    renderCRDashboard() {
        const container = document.createElement('div');
        container.className = 'fade-in';
        container.innerHTML = `
            <div class="alert alert-info border-0 shadow-sm mb-4">
                <i class="bi bi-info-circle-fill"></i> <strong>CR Capabilities:</strong> Use the Check (✅) and Cross (❌) buttons to mark if a lecture was actually held or not.
            </div>
             <div class="table-container">
                <h4 class="fw-bold">Class Attendance Management</h4>
                ${this.generateTimetableHTML(State.timetable, 'cr', null)}
            </div>
        `;
        this.elements.contentArea.appendChild(container);
    },


    // --- Shared Timetable HTML Generator ---
    generateTimetableHTML(timetable, viewRole, filterId) {
        if (!timetable || timetable.length === 0) return '<p>No data available.</p>';

        let html = `<table class="custom-table"><thead><tr><th width="10%">Day</th>`;
        State.timeSlots.forEach(slot => {
            // Shorten format: "09:00 AM - 10:00 AM" -> "09:00"
            const shortTime = slot.split(' - ')[0];
            html += `<th>${shortTime}</th>`;
        });
        html += `</tr></thead><tbody>`;

        timetable.forEach(day => {
            html += `<tr><td class="fw-bold text-primary">${day.day.substring(0, 3).toUpperCase()}</td>`;

            day.slots.forEach(slot => {
                const isBreak = slot.type === 'Break';
                let classes = `timetable-slot ${slot.status}`;
                if (slot.note) classes += ' substituted';

                // Teacher View: Fade out others
                if (viewRole === 'teacher' && !isBreak && slot.teacherId != filterId) {
                    classes += ' opacity-25';
                }

                let content = '';

                if (isBreak) {
                    content = `<div class="d-flex align-items-center justify-content-center h-100"><span class="badge bg-secondary">LUNCH</span></div>`;
                } else {
                    content = `
                        <div>
                            <div class="fw-bold">${slot.subject}</div>
                            <div class="small text-muted">${slot.teacherName}</div>
                            ${slot.note ? `<div class="badge bg-warning text-dark mt-1" style="font-size:0.6rem">Shuffle</div>` : ''}
                        </div>
                    `;

                    // CR Actions
                    if (viewRole === 'cr' && slot.status !== 'cancelled') {
                        if (slot.attendance) {
                            content += `<div class="mt-2 text-center badge ${slot.attendance === 'held' ? 'bg-success' : 'bg-danger'}">${slot.attendance.toUpperCase()}</div>`;
                        } else {
                            content += `
                                <div class="mt-2 d-flex justify-content-center gap-2">
                                    <button class="btn btn-sm btn-success p-0 px-2 rounded-circle" onclick="Logic.confirmLectureAttendance('${day.day}', '${slot.id}', 'held'); UI.refresh()">✔</button>
                                    <button class="btn btn-sm btn-danger p-0 px-2 rounded-circle" onclick="Logic.confirmLectureAttendance('${day.day}', '${slot.id}', 'not_held'); UI.refresh()">✖</button>
                                </div>
                            `;
                        }
                    }
                }

                html += `<td><div class="${classes}">${content}</div></td>`;
            });
            html += `</tr>`;
        });

        html += `</tbody></table>`;
        return html;
    },

    // --- Helpers ---
    promptAddTeacher() {
        const name = prompt("Enter Teacher Name:");
        if (!name) return;
        const sub = prompt("Enter Subject:");
        if (sub) {
            Logic.addTeacher(name, sub);
            this.refresh();
        }
    },

    refresh() {
        // Re-render current view
        if (State.currentUser) {
            this.renderRoleView(State.currentUser);
        }
    }
};
