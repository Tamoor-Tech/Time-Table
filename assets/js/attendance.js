/**
 * attendance.js
 * Handles Attendance Marking and Reporting
 */

const AttendanceManager = {
    markLecture(lectureId, date, status, markedByRole) {
        // Record attendance
        const record = {
            lectureId,
            date,
            status, // 'held', 'not-held'
            markedBy: markedByRole,
            timestamp: new Date().toISOString()
        };

        DataManager.markAttendance(record);

        // If CR marks "Held", we could optionally auto-verify
        // For this demo, CR input is final
        return true;
    },

    getReport() {
        const attendance = DataManager.getAttendance();
        const timetable = DataManager.getTimetable();

        // Correlate with timetable to get details
        return attendance.map(record => {
            // Find lecture details from timetable (simplified lookup)
            // In a real DB we'd join tables. Here we scan.
            let details = {};

            // Search grid
            Object.keys(timetable).forEach(day => {
                Object.keys(timetable[day]).forEach(slot => {
                    if (timetable[day][slot].id === record.lectureId) {
                        details = timetable[day][slot];
                        details.slot = slot;
                        details.day = day;
                    }
                });
            });

            return {
                ...record,
                subject: details.subject || 'Unknown',
                teacherName: details.teacherName || 'Unknown',
                slot: details.slot || 'Unknown'
            };
        });
    }
};
