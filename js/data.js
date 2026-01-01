/**
 * DATA LAYER
 * Handles all data persistence and mock data generation.
 * Simulates a backend database using localStorage.
 */

const DB_KEY = 'smart_timetable_db_v1';

const INITIAL_DATA = {
    users: [
        { id: 'admin', name: 'Admin User', role: 'admin', password: '123' },
        { id: 't1', name: 'Dr. Smith', role: 'teacher', password: '123', subject: 'Web Dev' },
        { id: 't2', name: 'Prof. Johnson', role: 'teacher', password: '123', subject: 'Data Science' },
        { id: 't3', name: 'Ms. Davis', role: 'teacher', password: '123', subject: 'AI & ML' },
        { id: 't4', name: 'Mr. Wilson', role: 'teacher', password: '123', subject: 'Networking' },
        { id: 't5', name: 'Mrs. Brown', role: 'teacher', password: '123', subject: 'Database' },
        { id: 's1', name: 'John Doe', role: 'student', password: '123', classId: 'BSCS-4A' },
        { id: 'cr1', name: 'Alice CR', role: 'cr', password: '123', classId: 'BSCS-4A' }
    ],
    classes: ['BSCS-4A', 'BSCS-4B', 'BSIT-4A'],
    subjects: ['Web Dev', 'Data Science', 'AI & ML', 'Networking', 'Database', 'Math'],
    timeSlots: [
        '08:30 - 09:30',
        '09:30 - 10:30',
        '10:30 - 11:30',
        '11:30 - 12:30',
        '01:00 - 02:00', // Break before this? Just assuming straight for simplicity
        '02:00 - 03:00'
    ],
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    // The Master Timetable: Array of lecture objects
    timetable: [], 
    // Attendance Records
    attendance: [],
    // Notifications
    notifications: []
};

const DataManager = {
    init() {
        if (!localStorage.getItem(DB_KEY)) {
            console.log('Initializing DB with dummy data...');
            // Generate some initial random timetable data
            INITIAL_DATA.timetable = this.generateRandomTimetable();
            localStorage.setItem(DB_KEY, JSON.stringify(INITIAL_DATA));
        }
    },

    getDB() {
        return JSON.parse(localStorage.getItem(DB_KEY));
    },

    saveDB(data) {
        localStorage.setItem(DB_KEY, JSON.stringify(data));
    },

    // Helper: Reset DB (for debug)
    resetDB() {
        localStorage.removeItem(DB_KEY);
        this.init();
        location.reload();
    },

    // --- ALGORITHMS ---

    generateRandomTimetable() {
        const timetable = [];
        const teachers = INITIAL_DATA.users.filter(u => u.role === 'teacher');
        const classes = INITIAL_DATA.classes;
        const days = INITIAL_DATA.days;
        const slots = INITIAL_DATA.timeSlots;

        // Simple algorithm to fill slots without conflict (Basic Logic)
        // In a real generic alg, we'd use backtracking, but here we just fill randomly and check basic availability
        
        let idCounter = 1;

        days.forEach(day => {
            slots.forEach(slot => {
                classes.forEach(cls => {
                    // 70% chance a class has a lecture in this slot
                    if (Math.random() > 0.3) { 
                        // Pick a random teacher
                        const teacher = teachers[Math.floor(Math.random() * teachers.length)];
                        
                        // Check if teacher is already booked in this slot for another class
                        const isBooked = timetable.find(t => 
                            t.day === day && 
                            t.slot === slot && 
                            t.teacherId === teacher.id
                        );

                        if (!isBooked) {
                            timetable.push({
                                id: idCounter++,
                                day,
                                slot,
                                classId: cls,
                                subject: teacher.subject,
                                teacherId: teacher.id,
                                teacherName: teacher.name,
                                status: 'Scheduled', // Scheduled, Completed, Cancelled, Shuffled
                                isProxy: false
                            });
                        }
                    }
                });
            });
        });

        return timetable;
    },

    // CORE LOGIC: Shuffle / Proxy
    findProxyTeacher(day, slot, originalTeacherId) {
        const db = this.getDB();
        const teachers = db.users.filter(u => u.role === 'teacher' && u.id !== originalTeacherId);
        
        // Find a teacher who is FREE in this slot
        const availableTeacher = teachers.find(t => {
            const isBusy = db.timetable.find(l => 
                l.day === day && 
                l.slot === slot && 
                l.teacherId === t.id
            );
            return !isBusy;
        });

        return availableTeacher || null; // Returns user object or null
    }
};

// Auto-init on load
DataManager.init();
