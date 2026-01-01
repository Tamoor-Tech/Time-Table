/**
 * data.js
 * Centralized State Management using localStorage
 * Handles Users, Teachers, Subjects, Timetable data
 */

const STORAGE_KEY = 'sf_timetable_data';

// Default Data Initialization
const defaultData = {
    users: [
        { username: 'admin', password: '123', role: 'admin', name: 'Admin User' },
        { username: 'teacher', password: '123', role: 'teacher', name: 'John Doe', teacherId: 'T1' },
        { username: 'student', password: '123', role: 'student', name: 'Jane Smith', classId: 'BCA-1' },
        { username: 'cr', password: '123', role: 'cr', name: 'CR User', classId: 'BCA-1' }
    ],
    teachers: [
        { id: 'T1', name: 'John Doe', subject: 'Mathematics', isPresent: true },
        { id: 'T2', name: 'Sarah Connor', subject: 'Physics', isPresent: true },
        { id: 'T3', name: 'Bruce Wayne', subject: 'Computer Science', isPresent: true },
        { id: 'T4', name: 'Clark Kent', subject: 'English', isPresent: true },
        { id: 'T5', name: 'Diana Prince', subject: 'History', isPresent: true }
    ],
    subjects: ['Mathematics', 'Physics', 'Computer Science', 'English', 'History'],
    timeSlots: ['09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00', '12:00 - 01:00', '01:00 - 02:00', '02:00 - 03:00'],
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    timetable: {}, // Structure: { Day: { Slot: { subject, teacherId, status, id } } }
    attendance: [], // Structure: { date, lectureId, status, markedBy }
    shuffledLectures: [] // Structure: { date, slot, originalTeacher, newTeacher }
};

// Data Access Object
const DataManager = {
    init() {
        if (!localStorage.getItem(STORAGE_KEY)) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
            console.log('Data Initialized');
        }
    },

    getData() {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : defaultData;
    },

    saveData(data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        // Dispatch event for cross-tab or same-page updates
        window.dispatchEvent(new Event('dataUpdated'));
    },

    getTeachers() {
        return this.getData().teachers;
    },

    updateTeacherStatus(teacherId, status) {
        const data = this.getData();
        const teacher = data.teachers.find(t => t.id === teacherId);
        if (teacher) {
            teacher.isPresent = status;
            this.saveData(data);
        }
    },

    addTeacher(teacher) {
        const data = this.getData();
        data.teachers.push(teacher);
        this.saveData(data);
    },

    deleteTeacher(teacherId) {
        const data = this.getData();
        data.teachers = data.teachers.filter(t => t.id !== teacherId);
        this.saveData(data);
    },

    getTimetable() {
        return this.getData().timetable;
    },

    saveTimetable(timetable) {
        const data = this.getData();
        data.timetable = timetable;
        // clear old shuffles on new generation
        data.shuffledLectures = [];
        this.saveData(data);
    },

    getAttributes() {
        const data = this.getData();
        return {
            subjects: data.subjects,
            timeSlots: data.timeSlots,
            days: data.days
        };
    },

    addShuffleLog(log) {
        const data = this.getData();
        data.shuffledLectures.push(log);
        this.saveData(data);
    },
    
    getShuffledLogs() {
        return this.getData().shuffledLectures;
    },

    // Attendance Methods
    markAttendance(record) {
        const data = this.getData();
        // Check if exists
        const existingIndex = data.attendance.findIndex(a => 
            a.date === record.date && a.lectureId === record.lectureId
        );
        
        if (existingIndex >= 0) {
            data.attendance[existingIndex] = record;
        } else {
            data.attendance.push(record);
        }
        this.saveData(data);
    },

    getAttendance() {
        return this.getData().attendance;
    },
    
    resetSystem() {
        localStorage.removeItem(STORAGE_KEY);
        this.init();
        window.location.reload();
    }
};

// Initialize on load
DataManager.init();
