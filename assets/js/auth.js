/**
 * auth.js
 * Handles Login, Logout, and Session Management
 */

const SESSION_KEY = 'sf_current_user';

const Auth = {
    login(username, password, role) {
        const data = DataManager.getData();
        const user = data.users.find(u =>
            u.username === username &&
            u.password === password &&
            u.role === role
        );

        if (user) {
            localStorage.setItem(SESSION_KEY, JSON.stringify(user));
            return { success: true, user };
        } else {
            return { success: false, message: 'Invalid Credentials' };
        }
    },

    logout() {
        localStorage.removeItem(SESSION_KEY);
        window.location.href = 'index.html';
    },

    getCurrentUser() {
        const userStr = localStorage.getItem(SESSION_KEY);
        return userStr ? JSON.parse(userStr) : null;
    },

    checkSession() {
        const user = this.getCurrentUser();
        if (!user) {
            window.location.href = 'index.html';
            return null;
        }

        // Simple page protection based on filename
        const path = window.location.pathname;
        if (path.includes('admin') && user.role !== 'admin') window.location.href = 'index.html';
        if (path.includes('teacher') && user.role !== 'teacher') window.location.href = 'index.html';
        if (path.includes('student') && user.role !== 'student') window.location.href = 'index.html';
        if (path.includes('cr') && user.role !== 'cr') window.location.href = 'index.html';

        return user;
    }
};
