// Enhanced common.js with better error handling and loading states
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const currentUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!currentUser && !window.location.href.includes('login.html')) {
        // Redirect to login page if not logged in
        window.location.href = 'login.html';
        return;
    }
    
    // Set user name in the header if element exists
    const userNameElement = document.getElementById('userName');
    if (userNameElement && currentUser) {
        userNameElement.textContent = currentUser.name;
    }
    
    // Logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('loggedInUser');
            window.location.href = 'login.html';
        });
    }

    // Configure path to backend based on environment
    window.apiBasePath = '../backend';
    
    // Utility function to show loading state
    window.showLoading = function(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            // Save original content to restore later if needed
            element.dataset.originalContent = element.innerHTML;
            
            // Create loading skeleton elements
            let skeletonHTML = '';
            for (let i = 0; i < 3; i++) {
                skeletonHTML += '<div class="skeleton"></div>';
            }
            
            element.innerHTML = skeletonHTML;
        }
    };
    
    // Utility function to hide loading state
    window.hideLoading = function(elementId, restoreOriginal = false) {
        const element = document.getElementById(elementId);
        if (element) {
            if (restoreOriginal && element.dataset.originalContent) {
                element.innerHTML = element.dataset.originalContent;
            }
        }
    };
    
    // Utility function to show error message
    window.showError = function(elementId, message) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = `<div class="error-message">${message}</div>`;
        }
    };
    
    // Utility function to format date
    window.formatDate = function(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };
    
    // Utility function to fetch data with proper error handling
    window.fetchData = async function(url, options = {}) {
        try {
            const response = await fetch(url, options);
            
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`Error fetching data from ${url}:`, error);
            
            // Try to load from localStorage as fallback
            const localStorageKey = url.split('/').pop().split('.')[0];
            const cachedData = localStorage.getItem(localStorageKey);
            
            if (cachedData) {
                console.log(`Using cached data for ${localStorageKey}`);
                return JSON.parse(cachedData);
            }
            
            throw error;
        }
    };
    
    // Utility function to get course name from ID
    window.getCourseNameById = function(courseId) {
        const courses = JSON.parse(localStorage.getItem('allCourses') || '[]');
        const course = courses.find(c => c.id === courseId);
        return course ? course.name : 'Unknown Course';
    };
    
    // Utility function to get user name from ID
    window.getUserNameById = function(userId) {
        const users = JSON.parse(localStorage.getItem('allUsers') || '[]');
        const user = users.find(u => u.id === userId);
        return user ? user.name : 'Unknown User';
    };
    
    // Check page access based on user type
    function checkPageAccess() {
        if (!currentUser) return;
        
        const currentPage = window.location.pathname.split('/').pop();
        
        // Pages only accessible to administrators
        const adminOnlyPages = ['admin-dashboard.html', 'statistics-dashboard.html'];
        if (adminOnlyPages.includes(currentPage) && currentUser.userType !== 'administrator') {
            alert('You do not have permission to access this page.');
            redirectToUserDashboard(currentUser.userType);
            return;
        }
        
        // Pages only accessible to instructors
        const instructorOnlyPages = ['instruct-dashboard.html'];
        if (instructorOnlyPages.includes(currentPage) && currentUser.userType !== 'instructor') {
            alert('You do not have permission to access this page.');
            redirectToUserDashboard(currentUser.userType);
            return;
        }
        
        // Pages only accessible to students
        const studentOnlyPages = ['student-dashboard.html', 'learning-path.html'];
        if (studentOnlyPages.includes(currentPage) && currentUser.userType !== 'student') {
            alert('You do not have permission to access this page.');
            redirectToUserDashboard(currentUser.userType);
            return;
        }
    }
    
    function redirectToUserDashboard(userType) {
        switch (userType) {
            case 'student':
                window.location.href = 'student-dashboard.html';
                break;
            case 'instructor':
                window.location.href = 'instruct-dashboard.html';
                break;
            case 'administrator':
                window.location.href = 'admin-dashboard.html';
                break;
            default:
                window.location.href = 'login.html';
        }
    }
    
    // Check page access permissions
    checkPageAccess();
    
    // Preload common data
    async function preloadCommonData() {
        try {
            // Only load if user is authenticated
            if (!currentUser) return;
            
            // Load courses data if not already in localStorage
            if (!localStorage.getItem('allCourses')) {
                const coursesUrl = `${window.apiBasePath}/json-files/courses.json`;
                const courses = await window.fetchData(coursesUrl);
                localStorage.setItem('allCourses', JSON.stringify(courses));
            }
            
            // Load users data if not already in localStorage
            if (!localStorage.getItem('allUsers')) {
                const usersUrl = `${window.apiBasePath}/json-files/users.json`;
                const users = await window.fetchData(usersUrl);
                localStorage.setItem('allUsers', JSON.stringify(users));
            }
            
            // Load classes data if not already in localStorage
            if (!localStorage.getItem('classes')) {
                const classesUrl = `${window.apiBasePath}/json-files/classes.json`;
                const classes = await window.fetchData(classesUrl);
                localStorage.setItem('classes', JSON.stringify(classes));
            }
        } catch (error) {
            console.error('Error preloading common data:', error);
        }
    }
    
    // Start preloading data
    preloadCommonData();
});