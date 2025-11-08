class AuthService {
    static isAuthenticated() {
        return localStorage.getItem('access') !== null;
    }

    static getRole() {
        return localStorage.getItem('userRole');
    }

    static getUsername() {
        return localStorage.getItem('username');
    }

    static logout() {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('userRole');
        localStorage.removeItem('username');
        window.location.href = '/';
    }

    static setAuthInfo(data) {
        localStorage.setItem('access', data.access);
        localStorage.setItem('refresh', data.refresh);
        localStorage.setItem('userRole', data.userRole);
        localStorage.setItem('username', data.username);
    }
}

export default AuthService;