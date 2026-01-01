/**
 * DASHBOARDS CONTROLLER
 * Handles views for Teacher, Student, and Class Representative.
 */

const Dashboards = {
    renderOverview(container, user) {
        container.innerHTML = `
            <div class="text-center mt-5 fade-in">
                <h1 class="display-4 text-primary">Welcome, ${user.name}</h1>
                <p class="lead">Use the sidebar to view your scheduled classes.</p>
                <img src="https://via.placeholder.com/600x300/4e73df/ffffff?text=University+Campus" class="img-fluid rounded shadow-lg mt-4" alt="Campus">
            </div>
        `;
    },

    renderTeacherTimetable(container, user) {
        const db = DataManager.getDB();
        // Filter by this teacher
        const myLectures = db.timetable.filter(t => t.teacherId === user.id);

        this.renderGenericTimetable(container, myLectures, 'My Teaching Schedule');
    },

    renderStudentTimetable(container, user) {
        const db = DataManager.getDB();
        // Filter by student's class
        const classLectures = db.timetable.filter(t => t.classId === user.classId);

        this.renderGenericTimetable(container, classLectures, `Timetable for ${user.classId}`);
    },

    renderCRVerification(container, user) {
        const db = DataManager.getDB();
        const classLectures = db.timetable.filter(t => t.classId === user.classId); // CR is also a student of a class

        let html = `
            <h2 class="mb-4">Verify Lectures <small class="text-muted fs-6">CR Control Panel</small></h2>
            <div class="card shadow">
                <div class="card-body">
                    <div class="table-responsive">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>Day</th>
                                <th>Slot</th>
                                <th>Subject</th>
                                <th>Teacher</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
        `;

        classLectures.forEach(l => {
            const rowClass = l.status === 'Completed' ? 'table-success' : '';
            html += `
                <tr class="${rowClass}">
                    <td>${l.day}</td>
                    <td>${l.slot}</td>
                    <td>${l.subject}</td>
                    <td>${l.teacherName}</td>
                    <td>
                        ${l.status === 'Completed'
                    ? '<span class="badge bg-success"><i class="fas fa-check"></i> Verified</span>'
                    : `<button class="btn btn-sm btn-outline-success" onclick="Dashboards.verifyLecture(${l.id})">
                                <i class="fas fa-check-circle"></i> Mark Done
                               </button>`
                }
                    </td>
                </tr>
            `;
        });

        html += `</tbody></table></div></div></div>`;
        container.innerHTML = html;
    },

    verifyLecture(lectureId) {
        const db = DataManager.getDB();
        const lecture = db.timetable.find(l => l.id === lectureId);
        if (lecture) {
            lecture.status = 'Completed';
            DataManager.saveDB(db);
            App.showToast('Lecture verified successfully!', 'success');
            // Refresh view
            const container = document.getElementById('mainContent');
            this.renderCRVerification(container, App.currentUser);
        }
    },

    // SHARED HELPER
    renderGenericTimetable(container, lectures, title) {
        const db = DataManager.getDB();
        const days = db.days;

        let html = `<h2 class="mb-4">${title}</h2>`;

        // Mobile Card View (Visible on XS, hidden on MD+)
        html += `<div class="d-md-none">`;
        lectures.forEach(l => {
            html += `
                <div class="card mb-3 shadow-sm border-left-${this.getStatusColor(l.status)}">
                    <div class="card-body">
                        <h5 class="card-title fw-bold">${l.subject}</h5>
                        <h6 class="card-subtitle mb-2 text-muted">${l.day} | ${l.slot}</h6>
                        <p class="card-text">
                            <i class="fas fa-user me-2"></i> ${l.teacherName} <br>
                            <i class="fas fa-info-circle me-2"></i> ${l.status}
                        </p>
                    </div>
                </div>
             `;
        });
        html += `</div>`;

        // Desktop Table View
        html += `<div class="d-none d-md-block delay-1 fade-in">`;

        days.forEach(day => {
            const dayLectures = lectures.filter(l => l.day === day);
            if (dayLectures.length === 0) return;

            html += `<h5 class="mt-4 text-primary">${day}</h5>`;
            html += `
                <div class="table-responsive">
                    <table class="table table-bordered">
                        <thead>
                             <tr class="table-light">
                                <th width="150">Time</th>
                                <th>Subject</th>
                                <th>Teacher</th>
                                <th>Room</th>
                                <th>Status</th>
                             </tr>
                        </thead>
                        <tbody>
            `;

            // Sort by slot
            dayLectures.sort((a, b) => a.slot.localeCompare(b.slot)).forEach(l => {
                let statusClass = '';
                if (l.status === 'Completed') statusClass = 'status-completed';
                else if (l.status === 'Running') statusClass = 'status-running';
                else if (l.status === 'Scheduled') statusClass = 'status-upcoming';

                // Real-time status check (Mock logic based on "Running" string or similar)
                // For demo, we just use what's in DB.

                html += `
                    <tr>
                        <td class="fw-bold text-dark">${l.slot}</td>
                        <td class="${statusClass} fw-bold">${l.subject}</td>
                        <td>${l.teacherName} ${l.isProxy ? '<span class="badge bg-warning text-dark">Sub</span>' : ''}</td>
                        <td>Room 101</td>
                        <td>${l.status}</td>
                    </tr>
                `;
            });
            html += `</tbody></table></div>`;
        });

        html += `</div>`;
        container.innerHTML = html;
    },

    getStatusColor(status) {
        if (status === 'Completed') return 'success';
        if (status === 'Shuffled') return 'warning';
        return 'primary';
    }
};
