/**
 * ADMIN CONTROLLER
 * Logic for Admin Dashboard, Teacher Management, and Timetable Operations.
 */

const Admin = {
    renderDashboard(container) {
        const db = DataManager.getDB();
        const teacherCount = db.users.filter(u => u.role === 'teacher').length;
        const lecturesToday = db.timetable.filter(t => t.day === this.getCurrentDay()).length;

        container.innerHTML = `
            <h2 class="mb-4">Admin Dashboard</h2>
            <div class="row g-4 mb-4">
                <div class="col-md-4">
                    <div class="card glass-card border-left-primary h-100 py-2">
                        <div class="card-body">
                            <div class="row no-gutters align-items-center">
                                <div class="col mr-2">
                                    <div class="text-xs fw-bold text-primary text-uppercase mb-1">Total Teachers</div>
                                    <div class="h5 mb-0 fw-bold text-gray-800">${teacherCount}</div>
                                </div>
                                <div class="col-auto">
                                    <i class="fas fa-chalkboard-teacher fa-2x text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-md-4">
                    <div class="card glass-card border-left-success h-100 py-2">
                        <div class="card-body">
                            <div class="row no-gutters align-items-center">
                                <div class="col mr-2">
                                    <div class="text-xs fw-bold text-success text-uppercase mb-1">Lectures Today</div>
                                    <div class="h5 mb-0 fw-bold text-gray-800">${lecturesToday}</div>
                                </div>
                                <div class="col-auto">
                                    <i class="fas fa-calendar-day fa-2x text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-md-4">
                    <div class="card glass-card border-left-warning h-100 py-2">
                        <div class="card-body">
                            <div class="row no-gutters align-items-center">
                                <div class="col mr-2">
                                    <div class="text-xs fw-bold text-warning text-uppercase mb-1">System Status</div>
                                    <div class="h5 mb-0 fw-bold text-gray-800">Active</div>
                                </div>
                                <div class="col-auto">
                                    <i class="fas fa-check-circle fa-2x text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="card shadow mb-4">
                <div class="card-header py-3">
                    <h6 class="m-0 fw-bold text-primary">Quick Actions</h6>
                </div>
                <div class="card-body">
                    <button class="btn btn-danger me-2" onclick="Admin.resetSystem()"><i class="fas fa-trash-alt me-2"></i> Reset System Data</button>
                    <button class="btn btn-success" onclick="App.navigate('timetable')"><i class="fas fa-random me-2"></i> Manage Timetable</button>
                </div>
            </div>
        `;
    },

    renderTeachers(container) {
        const db = DataManager.getDB();
        const teachers = db.users.filter(u => u.role === 'teacher');

        let html = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2>Teacher Management</h2>
                <button class="btn btn-primary" onclick="alert('Feature to add teacher would open a modal here.')"><i class="fas fa-plus"></i> Add Teacher</button>
            </div>
            <div class="card shadow mb-4">
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-bordered">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Subject</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
        `;

        teachers.forEach(t => {
            html += `
                <tr>
                    <td>${t.id}</td>
                    <td>${t.name}</td>
                    <td>${t.subject}</td>
                    <td><span class="badge bg-success">Active</span></td>
                    <td>
                        <button class="btn btn-sm btn-warning" onclick="Admin.markAbsent('${t.id}')">Mark Absent</button>
                    </td>
                </tr>
            `;
        });

        html += `</tbody></table></div></div></div>`;
        container.innerHTML = html;
    },

    renderTimetable(container) {
        const db = DataManager.getDB();
        // Just show Monday for demo, or filter by Day
        const days = db.days;

        let html = `
            <h2 class="mb-4">Master Timetable</h2>
            <div class="alert alert-info">
                This is the master view. Changes here affect all users immediately.
            </div>
        `;

        days.forEach(day => {
            const daysLectures = db.timetable.filter(t => t.day === day);
            if (daysLectures.length === 0) return;

            html += `<h4 class="mt-4 text-primary border-bottom pb-2">${day}</h4>`;
            html += `
                <div class="table-responsive">
                    <table class="table table-bordered table-striped">
                        <thead class="table-dark">
                            <tr>
                                <th>Time Slot</th>
                                <th>Class</th>
                                <th>Subject</th>
                                <th>Teacher</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            // Sort by time slot (simple string sort works for this format approx, better to map)
            // Ideally we map slots to index, but for demo:
            const sorted = daysLectures.sort((a, b) => a.slot.localeCompare(b.slot));

            sorted.forEach(l => {
                let statusBadge = '';
                if (l.status === 'Scheduled') statusBadge = '<span class="badge bg-primary">Scheduled</span>';
                else if (l.status === 'Completed') statusBadge = '<span class="badge bg-success">Completed</span>';
                else if (l.status === 'Shuffled') statusBadge = '<span class="badge bg-warning text-dark">Substituted</span>';
                else statusBadge = `<span class="badge bg-secondary">${l.status}</span>`;

                if (l.isProxy) {
                    statusBadge += ' <span class="badge bg-danger">PROXY</span>';
                }

                html += `
                    <tr>
                        <td class="fw-bold">${l.slot}</td>
                        <td>${l.classId}</td>
                        <td>${l.subject}</td>
                        <td>${l.teacherName}</td>
                        <td>${statusBadge}</td>
                    </tr>
                `;
            });

            html += `</tbody></table></div>`;
        });

        container.innerHTML = html;
    },

    markAbsent(teacherId) {
        if (!confirm('Marking this teacher absent will automatically shuffle their lectures. Proceed?')) return;

        const db = DataManager.getDB();
        // Find all future lectures for this teacher today (or all week for demo simplicity)
        // For simplicity, we affect the WHOLE timetable in this demo.
        let shuffleCount = 0;

        db.timetable.forEach(lecture => {
            if (lecture.teacherId === teacherId && lecture.status === 'Scheduled') {
                // Determine Day and Slot
                const proxy = DataManager.findProxyTeacher(lecture.day, lecture.slot, teacherId);

                if (proxy) {
                    lecture.teacherId = proxy.id;
                    lecture.teacherName = proxy.name + ` (Sub for ${lecture.teacherName})`;
                    lecture.status = 'Shuffled';
                    lecture.isProxy = true;
                    shuffleCount++;
                } else {
                    lecture.status = 'Cancelled (No Teacher)';
                }
            }
        });

        DataManager.saveDB(db);
        App.showToast(`Teacher marked absent. ${shuffleCount} lectures shuffled!`, 'warning');
        App.navigate('timetable'); // Refresh view
    },

    renderAttendance(container) {
        container.innerHTML = `
            <h2>Attendance Reports</h2>
            <div class="card p-4 text-center">
                <i class="fas fa-chart-bar fa-4x text-gray-300 mb-3"></i>
                <p>Attendance reporting module connects here. (Mockup)</p>
            </div>
        `;
    },

    getCurrentDay() {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const d = new Date().getDay();
        return days[d] || 'Monday'; // Default to Monday if Sunday
    },

    resetSystem() {
        if (confirm('Reset all data to defaults?')) {
            DataManager.resetDB();
        }
    }
};