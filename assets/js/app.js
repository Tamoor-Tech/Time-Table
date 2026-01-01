/**
 * app.js
 * Main UI Controller
 */

const App = {
    init() {
        // Prevent Auth check on index.html
        if (!window.location.pathname.endsWith('index.html') && !window.location.pathname.endsWith('/')) {
            const user = Auth.checkSession();
            if (user) {
                this.renderNavbar(user);
                this.startLiveUpdates();
            }
        }
    },

    renderNavbar(user) {
        const navContainer = document.getElementById('navbar-container');
        if (!navContainer) return;

        navContainer.innerHTML = `
            <nav class="navbar navbar-expand-lg navbar-dark bg-primary mb-4">
                <div class="container-fluid">
                    <a class="navbar-brand" href="#">TimeTable App</a>
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="navbarNav">
                        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                            <li class="nav-item">
                                <span class="nav-link active">Welcome, ${user.name} (${user.role.toUpperCase()})</span>
                            </li>
                        </ul>
                        <button class="btn btn-danger btn-sm" onclick="Auth.logout()">Logout</button>
                    </div>
                </div>
            </nav>
        `;
    },

    // Helpers for Timetable Rendering
    getCurrentDay() {
        // For Demo: fix to Monday or use real day
        // const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        // return days[new Date().getDay()];
        return "Monday"; // Forcing Monday for demo visibility
    },

    getCurrentTimeSlotIndex() {
        // Complex time comparison usually, simplifying for demo
        // active index 0 to 5
        const hour = new Date().getHours();
        // 9-10 (0), 10-11(1)...
        if (hour === 9) return 0;
        if (hour === 10) return 1;
        if (hour === 11) return 2;
        if (hour === 12) return 3;
        if (hour === 13) return 4;
        if (hour === 14) return 5;
        return -1;
    },

    // Determine cell class based on current time
    getStatusClass(day, slotIndex) {
        const currentDay = this.getCurrentDay();
        const CURRENT_DAY_INDEX = 1; // Monday

        // If it's not today in the demo logic, just show upcoming or completed based on day index
        if (day !== currentDay) return 'status-upcoming';

        const currentSlotIndex = this.getCurrentTimeSlotIndex();

        if (slotIndex < currentSlotIndex) return 'status-completed';
        if (slotIndex === currentSlotIndex) return 'status-running';
        return 'status-upcoming';
    },

    startLiveUpdates() {
        // Refresh UI every minute for status colors
        setInterval(() => {
            window.dispatchEvent(new Event('dataUpdated'));
        }, 60000);
    },

    // Common Table Renderer
    renderTimetableGrid(containerId, timetable, readOnly = true) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const data = DataManager.getData();
        const days = data.days;
        const slots = data.timeSlots;

        let html = `
            <div class="table-responsive">
                <table class="table table-bordered timetable-table">
                    <thead class="table-light">
                        <tr>
                            <th>Day / Time</th>
                            ${slots.map(s => `<th>${s}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
        `;

        days.forEach(day => {
            html += `<tr><td class="fw-bold table-light">${day}</td>`;

            slots.forEach((slot, index) => {
                const cell = timetable[day] && timetable[day][slot];
                if (!cell) {
                    html += `<td>-</td>`;
                    return;
                }

                const statusClass = this.getStatusClass(day, index);
                const isCancelled = cell.status === 'cancelled';

                html += `
                    <td class="${isCancelled ? 'status-cancelled' : statusClass} position-relative">
                        <div class="fw-bold">${cell.subject}</div>
                        <div class="small">${cell.teacherName}</div>
                        ${cell.isProxy ? '<span class="badge bg-danger">Substituted</span>' : ''}
                        ${!readOnly && !isCancelled ? `
                            <br>
                            <small class="text-muted">ID: ${cell.id}</small>
                        ` : ''}
                    </td>
                `;
            });

            html += `</tr>`;
        });

        html += `</tbody></table></div>`;
        container.innerHTML = html;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
