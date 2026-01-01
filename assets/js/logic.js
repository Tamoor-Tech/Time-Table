/* 
 * Core Business Logic
 * Handles Teacher Management, Timetable Shuffling, and Attendance
 */

const Logic = {

    // --- Teacher Management ---
    addTeacher(name, subject) {
        const newTeacher = {
            id: Date.now(), // Generate unique ID
            name: name,
            subject: subject,
            isPresent: true
        };
        State.teachers.push(newTeacher);
        State.save();
        return newTeacher;
    },

    setTeacherStatus(teacherId, isPresent) {
        const teacher = State.teachers.find(t => t.id == teacherId);
        if (teacher) {
            const wasPresent = teacher.isPresent;
            teacher.isPresent = isPresent;
            State.save();

            // If teacher marked Absent, trigger Shuffle
            if (wasPresent && !isPresent) {
                this.handleAbsentTeacher(teacherId);
            }
        }
    },

    // --- Shuffling Algorithm ---
    handleAbsentTeacher(absentTeacherId) {
        let shuffleCount = 0;

        // Loop through the entire timetable
        State.timetable.forEach(day => {
            day.slots.forEach(slot => {
                // If it's a lecture by the absent teacher AND it is not yet completed
                if (slot.teacherId == absentTeacherId && slot.type === 'Lecture' && slot.status !== 'completed') {

                    // Attempt to find substitute
                    const substitute = this.findSubstitute(day.day, slot.time, absentTeacherId);

                    if (substitute) {
                        // Apply Substitution
                        slot.teacherId = substitute.id;
                        slot.teacherName = substitute.name;
                        slot.note = `Substituted: ${substitute.name}`;
                        slot.status = 'upcoming'; // Reset status if needed

                        // Notify the new teacher
                        State.notifications.push({
                            toRole: 'teacher',
                            targetId: substitute.id,
                            message: `Alert: You have been assigned a substitution on ${day.day} at ${slot.time} for class ${slot.subject}.`
                        });
                    } else {
                        // No substitute found -> Cancel Lecture
                        slot.status = 'cancelled';
                        slot.note = "Lecture Cancelled (No Faculty Available)";
                    }
                    shuffleCount++;
                }
            });
        });

        State.save();
        return shuffleCount;
    },

    findSubstitute(dayName, timeSlot, excludeId) {
        // Find a teacher who is PRESENT and FREE at this time

        // 1. Get all present teachers excluding the absent one
        const availableTeachers = State.teachers.filter(t => t.isPresent && t.id != excludeId);

        if (availableTeachers.length === 0) return null;

        // 2. Ideally, check if they are busy in another class. 
        // In this Single-Class demo, we assume the list of teachers represents the whole department availability.
        // We will pick one random teacher from the available pool.

        const randomIndex = Math.floor(Math.random() * availableTeachers.length);
        return availableTeachers[randomIndex];
    },

    // --- Attendance / CR Actions ---
    confirmLectureAttendance(dayName, slotId, status) {
        const day = State.timetable.find(d => d.day === dayName);
        if (day) {
            const slot = day.slots.find(s => s.id === slotId);
            if (slot) {
                slot.attendance = status; // 'held' or 'not_held'

                // Visual update logic
                if (status === 'held') {
                    slot.status = 'completed';
                } else {
                    slot.status = 'cancelled';
                }

                State.save();
                return true;
            }
        }
        return false;
    }
};
