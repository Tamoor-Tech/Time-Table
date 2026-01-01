/* 
 * State Management & Dummy Data 
 * Stores the application state: Users, Teachers, Timetable, Notifications
 */

const State = {
    currentUser: null,

    // --- Mock Users ---
    users: [
        { id: 1, name: "Admin Officer", username: "admin", password: "123", role: "admin" },
        { id: 2, name: "Prof. John Doe", username: "teacher", password: "123", role: "teacher", teacherId: 101 },
        { id: 3, name: "Student Demo", username: "student", password: "123", role: "student" },
        { id: 4, name: "Class Rep (CR)", username: "cr", password: "123", role: "cr" }
    ],

    // --- Teachers Database ---
    teachers: [
        { id: 101, name: "Prof. John Doe", subject: "Advanced Math", isPresent: true },
        { id: 102, name: "Dr. Sarah Smith", subject: "Physics", isPresent: true },
        { id: 103, name: "Mr. Robert Brown", subject: "Computer Science", isPresent: true },
        { id: 104, name: "Ms. Emily Davis", subject: "English Lit", isPresent: true },
        { id: 105, name: "Dr. Alan Turing", subject: "Artificial Intel", isPresent: true },
        { id: 106, name: "Mrs. Linda White", subject: "Chemistry", isPresent: true }
    ],

    // --- Time Slots ---
    timeSlots: [
        "09:00 AM - 10:00 AM",
        "10:00 AM - 11:00 AM",
        "11:00 AM - 12:00 PM",
        "12:00 PM - 01:00 PM", // Lunch
        "01:00 PM - 02:00 PM",
        "02:00 PM - 03:00 PM"
    ],

    // --- Timetable ---
    // Structure: Array of Days. Each Day has Array of Slots.
    timetable: [],

    // --- Notifications ---
    notifications: [],

    // --- Initialization ---
    init() {
        // Try to load from LocalStorage to persist changes during refresh
        const savedData = localStorage.getItem('timetable_app_state');
        if (savedData) {
            const data = JSON.parse(savedData);
            this.teachers = data.teachers || this.teachers;
            this.timetable = data.timetable || [];
            this.notifications = data.notifications || [];

            if (this.timetable.length === 0) this.generateInitialTimetable();
        } else {
            this.generateInitialTimetable();
        }
    },

    // --- Save State ---
    save() {
        const data = {
            teachers: this.teachers,
            timetable: this.timetable,
            notifications: this.notifications
        };
        localStorage.setItem('timetable_app_state', JSON.stringify(data));
    },

    // --- Generator Logic ---
    generateInitialTimetable() {
        console.log("Generating fresh timetable...");
        const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

        this.timetable = days.map(day => {
            return {
                day: day,
                slots: this.timeSlots.map(slotTime => {
                    // Check for Lunch
                    if (slotTime.includes("12:00 PM")) {
                        return {
                            id: Math.random().toString(36).substr(2, 9),
                            time: slotTime,
                            type: 'Break',
                            subject: 'Lunch Break',
                            teacherId: null,
                            status: 'completed',
                            attendance: null
                        };
                    }

                    // Assign a random teacher
                    const randomTeacher = this.teachers[Math.floor(Math.random() * this.teachers.length)];

                    return {
                        id: Math.random().toString(36).substr(2, 9),
                        time: slotTime,
                        type: 'Lecture',
                        subject: randomTeacher.subject,
                        teacherId: randomTeacher.id,
                        teacherName: randomTeacher.name, // Snapshot name
                        status: 'upcoming', // 'completed', 'ongoing', 'upcoming', 'cancelled'
                        attendance: null, // 'held', 'not_held', null
                        note: '' // For shuffle messages
                    };
                })
            };
        });

        this.save();
    },

    // --- Reset ---
    resetSystem() {
        localStorage.clear();
        window.location.reload();
    }
};
