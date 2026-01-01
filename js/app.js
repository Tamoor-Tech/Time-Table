/**
 * APP CONTROLLER
 * Handles Routing, Authentication, and View Rendering.
 */

const App = {
    currentUser: null,

    init() {
        this.checkAuth();
        this.bindEvents();
    },

    checkAuth() {
        const user = localStorage.getItem('currentUser');
        if (user) {
            this.currentUser = JSON.parse(user);
            this.renderDashboard();
        } else {
            this.renderLogin();
        }
    },

    login(id, password, role) {
        const db = DataManager.getDB();
        const user = db.users.find(u => u.id === id && u.password === password && u.role === role);

        if (user) {
            this.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.renderDashboard();
            this.showToast(`Welcome back, ${user.name}!`, 'success');
        } else {
            this.showToast('Invalid credentials or role!', 'danger');
        }
    },

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.renderLogin();
        this.showToast('Logged out successfully.', 'info');
    },

    bindEvents() {
        // Global event listeners (delegation)
        document.addEventListener('click', (e) => {
            if (e.target.matches('#btnLogout')) {
                this.logout();
            }
        });
    },

    // --- VIEWS ---

    renderLogin() {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="login-container">
                <div class="card login-card glass-card fade-in">
                    <div class="text-center mb-4">
                        <i class="fas fa-university fa-3x text-primary mb-3"></i>
                        <h2 class="fw-bold">Smart Timetable</h2>
                        <p class="text-muted">Department Management System</p>
                    </div>
                    <form id="loginForm">
                        <div class="mb-3">
                            <label class="form-label">User Role</label>
                            <select class="form-select" id="roleSelect" required>
                                <option value="admin">Admin</option>
                                <option value="teacher">Teacher</option>
                                <option value="student">Student</option>
                                <option value="cr">CR (Class Rep)</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">User ID / Username</label>
                            <input type="text" class="form-control" id="userId" placeholder="Enter ID" required>
                            <div class="form-text">Try: 'admin', 't1', 's1', 'cr1'</div>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Password</label>
                            <input type="password" class="form-control" id="userPass" placeholder="Enter Password" value="123" required>
                        </div>
                        <button type="submit" class="btn btn-primary w-100 py-2 fw-bold">Login</button>
                    </form>
                </div>
            </div>
        `;

        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const role = document.getElementById('roleSelect').value;
            const id = document.getElementById('userId').value;
            const pass = document.getElementById('userPass').value;
            this.login(id, pass, role);
        });
    },

    renderDashboard() {
        const app = document.getElementById('app');
        // Common Layout Shell
        app.innerHTML = `
            <div class="wrapper fade-in">
                <!-- Sidebar -->
                <nav id="sidebar">
                    <div class="sidebar-header text-center">
                        <i class="fas fa-graduation-cap fa-2x mb-2"></i>
                        <h4>Timetable Sys</h4>
                        <small class="text-white-50">${this.currentUser.name} (${this.currentUser.role.toUpperCase()})</small>
                    </div>

                    <ul class="list-unstyled components">
                        <li class="active">
                            <a href="#" onclick="App.navigate('home')"><i class="fas fa-home me-2"></i> Dashboard</a>
                        </li>
                        ${this.getSidebarLinks()}
                        <li>
                            <a href="#" id="btnLogout"><i class="fas fa-sign-out-alt me-2"></i> Logout</a>
                        </li>
                    </ul>
                </nav>

                <!-- Page Content -->
                <div id="content">
                    <nav class="navbar navbar-expand-lg navbar-light bg-light py-3 px-4 shadow-sm">
                        <div class="container-fluid">
                            <button type="button" id="sidebarCollapse" class="btn btn-primary" onclick="App.toggleSidebar()">
                                <i class="fas fa-bars"></i>
                            </button>
                            <span class="ms-auto fw-bold text-primary">Department of Computer Science</span>
                        </div>
                    </nav>

                    <div class="container-fluid p-4" id="mainContent">
                        <!-- Dynamic View Content Loads Here -->
                    </div>
                </div>
            </div>
        `;

        // Load Role Specific Content
        this.navigate('home');
    },

    toggleSidebar() {
        document.getElementById('sidebar').classList.toggle('active');
    },

    getSidebarLinks() {
        if (this.currentUser.role === 'admin') {
            return `
                <li><a href="#" onclick="App.navigate('teachers')"><i class="fas fa-chalkboard-teacher me-2"></i> Teachers</a></li>
                <li><a href="#" onclick="App.navigate('timetable')"><i class="fas fa-calendar-alt me-2"></i> Timetable Manager</a></li>
                <li><a href="#" onclick="App.navigate('attendance')"><i class="fas fa-clipboard-list me-2"></i> Attendance Report</a></li>
            `;
        } else if (this.currentUser.role === 'teacher') {
            return `
                <li><a href="#" onclick="App.navigate('my-timetable')"><i class="fas fa-calendar-day me-2"></i> My Schedule</a></li>
            `;
        } else if (this.currentUser.role === 'cr') {
            return `
                <li><a href="#" onclick="App.navigate('class-timetable')"><i class="fas fa-calendar-alt me-2"></i> Class Timetable</a></li>
                <li><a href="#" onclick="App.navigate('verify')"><i class="fas fa-check-double me-2"></i> Verify Lectures</a></li>
            `;
        } else {
            return `
                <li><a href="#" onclick="App.navigate('class-timetable')"><i class="fas fa-calendar-alt me-2"></i> Class Timetable</a></li>
            `;
        }
    },

    navigate(view) {
        const container = document.getElementById('mainContent');
        container.innerHTML = '<div class="text-center mt-5"><div class="spinner-border text-primary"></div></div>';

        setTimeout(() => {
            // Routing Logic
            if (view === 'home') this.loadHome();
            else if (view === 'teachers' && this.currentUser.role === 'admin') Admin.renderTeachers(container);
            else if (view === 'timetable' && this.currentUser.role === 'admin') Admin.renderTimetable(container);
            else if (view === 'attendance' && this.currentUser.role === 'admin') Admin.renderAttendance(container);

            else if (view === 'my-timetable') Dashboards.renderTeacherTimetable(container, this.currentUser);
            else if (view === 'class-timetable') Dashboards.renderStudentTimetable(container, this.currentUser);
            else if (view === 'verify' && this.currentUser.role === 'cr') Dashboards.renderCRVerification(container, this.currentUser);

            else container.innerHTML = '<h3>404 - View Not Found</h3>';
        }, 300); // Fake load delay for UX
    },

    loadHome() {
        const container = document.getElementById('mainContent');
        if (this.currentUser.role === 'admin') Admin.renderDashboard(container);
        else Dashboards.renderOverview(container, this.currentUser);
    },

    // --- UTILS ---

    showToast(message, type = 'primary') {
        const toastContainer = document.getElementById('toastContainer');
        const id = 'toast-' + Date.now();
        const html = `
            <div id="${id}" class="toast align-items-center text-white bg-${type} border-0" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="d-flex">
                    <div class="toast-body">
                        ${message}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>
        `;
        toastContainer.insertAdjacentHTML('beforeend', html);
        const toastEl = document.getElementById(id);
        const toast = new bootstrap.Toast(toastEl);
        toast.show();

        // Cleanup DOM after hide
        toastEl.addEventListener('hidden.bs.toast', () => {
            toastEl.remove();
        });
    }
};

// Start App
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
