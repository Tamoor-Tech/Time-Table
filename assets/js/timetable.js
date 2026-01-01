/**
 * timetable.js
 * Handles Timetable Generation and Shuffling Logic
 */

const TimetableManager = {
    // Generate a fresh random timetable
    generateTimetable() {
        const data = DataManager.getData();
        const teachers = data.teachers;
        const subjects = data.subjects;
        const slots = data.timeSlots;
        const days = data.days;

        const newTimetable = {};

        days.forEach(day => {
            newTimetable[day] = {};
            slots.forEach((slot, index) => {
                // Simple random assignment for simulator purposes
                // Ideally, we'd use a more complex constraint-satisfaction algorithm

                // Pick a random teacher
                const teacher = teachers[Math.floor(Math.random() * teachers.length)];

                newTimetable[day][slot] = {
                    id: `LEC-${day.substring(0, 3)}-${index}`,
                    subject: teacher.subject,
                    teacherId: teacher.id,
                    teacherName: teacher.name,
                    status: 'scheduled', // scheduled, completed, running, cancelled
                    isProxy: false
                };
            });
        });

        DataManager.saveTimetable(newTimetable);
        return newTimetable;
    },

    // Check availability and shuffle if teacher is absent
    checkAndShuffle() {
        const data = DataManager.getData();
        const teachers = data.teachers;
        const timetable = data.timetable;
        const days = data.days;
        const slots = data.timeSlots;

        // Current simulated day/time could be used, but we'll specific shuffle for ALL absent teachers across the whole week for demo
        // In a real app, this would run daily or on status change

        const absentTeachers = teachers.filter(t => !t.isPresent);
        const presentTeachers = teachers.filter(t => t.isPresent);

        if (absentTeachers.length === 0) return; // No shuffling needed

        const shuffleLogs = [];

        days.forEach(day => {
            slots.forEach(slot => {
                const lecture = timetable[day] && timetable[day][slot];
                if (!lecture) return;

                const originalTeacherIsAbsent = absentTeachers.find(t => t.id === lecture.teacherId);

                if (originalTeacherIsAbsent) {
                    // Lecture needs shuffling
                    // Find a present teacher who is free in this slot
                    const freeTeacher = presentTeachers.find(t => {
                        // Check if this teacher is teaching another class in this slot?
                        // Since we only have ONE class for this demo ("Department"), we just pick any available teacher
                        // In a multi-class system, we'd check their schedule.
                        return t.id !== lecture.teacherId;
                    });

                    if (freeTeacher) {
                        const originalName = lecture.teacherName;

                        // Apply Substitution
                        lecture.teacherId = freeTeacher.id;
                        lecture.teacherName = freeTeacher.name;
                        lecture.subject = `${lecture.subject} (Sub)`;
                        lecture.isProxy = true;

                        shuffleLogs.push({
                            id: Date.now() + Math.random(),
                            day: day,
                            slot: slot,
                            originalTeacher: originalName,
                            newTeacher: freeTeacher.name,
                            timestamp: new Date().toLocaleString()
                        });
                    } else {
                        // No teacher found, cancel lecture?
                        lecture.status = 'cancelled';
                        lecture.teacherName = 'CANCELLED';
                    }
                }
            });
        });

        // Save changes
        DataManager.saveTimetable(timetable);
        shuffleLogs.forEach(log => DataManager.addShuffleLog(log));
    }
};
