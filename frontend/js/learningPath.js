document.addEventListener('DOMContentLoaded', function() {
    // References to elements
    const completedCoursesContainer = document.getElementById('completedCourses');
    const inProgressCoursesContainer = document.getElementById('inProgressCourses');
    const pendingCoursesContainer = document.getElementById('pendingCourses');
    const backToCoursesBtn = document.getElementById('backToCourses');

    // Global variables
    let currentUser = JSON.parse(localStorage.getItem('loggedInUser'));
    let allCourses = [];
    let classes = JSON.parse(localStorage.getItem('classes')) || [];

    // Navigation back to courses
    backToCoursesBtn.addEventListener('click', () => {
        window.location.href = 'student-dashboard.html';
    });

    // Load courses data
    loadCourses();

    // Function to load courses
    function loadCourses() {
        fetch('../backend/json-files/courses.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load courses data');
                }
                return response.json();
            })
            .then(courses => {
                allCourses = courses;
                displayLearningPath();
            })
            .catch(error => {
                console.error('Error loading courses:', error);
                document.querySelector('.learning-paths').innerHTML = 
                    '<div class="error-message">Failed to load courses. Please try again later.</div>';
            });
    }

    // Function to display the user's learning path
    function displayLearningPath() {
        displayCompletedCourses();
        displayInProgressCourses();
        displayPendingCourses();
    }

    // Function to display completed courses
    function displayCompletedCourses() {
        completedCoursesContainer.innerHTML = '';

        if (!currentUser.completedCourses || currentUser.completedCourses.length === 0) {
            completedCoursesContainer.innerHTML = '<p>No completed courses yet.</p>';
            return;
        }

        currentUser.completedCourses.forEach(completedCourse => {
            const course = allCourses.find(c => c.id === completedCourse.courseId);
            if (!course) return;

            const courseCard = document.createElement('div');
            courseCard.className = 'course-card';
            
            courseCard.innerHTML = `
                <h3>${course.id}: ${course.name}</h3>
                <div class="category">${course.category}</div>
                <div class="description">${course.description}</div>
                <div class="grade">Grade: ${completedCourse.grade}</div>
            `;
            
            completedCoursesContainer.appendChild(courseCard);
        });
    }

    // Function to display in-progress courses
    function displayInProgressCourses() {
        inProgressCoursesContainer.innerHTML = '';

        // Check if user has in-progress courses
        if (!currentUser.inProgressCourses || currentUser.inProgressCourses.length === 0) {
            inProgressCoursesContainer.innerHTML = '<p>No courses in progress.</p>';
            return;
        }

        // Filter to get only validated courses (active)
        const activeCourses = currentUser.inProgressCourses.filter(ip => {
            const cls = classes.find(c => c.classId === ip.classId);
            return cls && cls.status === 'validated' && ip.status !== 'pending';
        });

        if (activeCourses.length === 0) {
            inProgressCoursesContainer.innerHTML = '<p>No active courses in progress.</p>';
            return;
        }

        activeCourses.forEach(inProgressCourse => {
            const course = allCourses.find(c => c.id === inProgressCourse.courseId);
            if (!course) return;

            const cls = classes.find(c => c.classId === inProgressCourse.classId);
            if (!cls) return;

            const instructorId = cls.instructorId;
            
            const courseCard = document.createElement('div');
            courseCard.className = 'course-card';
            
            courseCard.innerHTML = `
                <h3>${course.id}: ${course.name}</h3>
                <div class="category">${course.category}</div>
                <div class="description">${course.description}</div>
                <div>Class: ${cls.classId}</div>
                <div>Instructor ID: ${instructorId}</div>
                <div>Status: Active</div>
            `;
            
            inProgressCoursesContainer.appendChild(courseCard);
        });
    }

    // Function to display pending courses
    function displayPendingCourses() {
        pendingCoursesContainer.innerHTML = '';

        // Check if user has pending courses
        if (!currentUser.inProgressCourses || currentUser.inProgressCourses.length === 0) {
            pendingCoursesContainer.innerHTML = '<p>No pending registrations.</p>';
            return;
        }

        // Filter to get only pending courses
        const pendingCourses = currentUser.inProgressCourses.filter(ip => ip.status === 'pending');

        if (pendingCourses.length === 0) {
            pendingCoursesContainer.innerHTML = '<p>No pending registrations.</p>';
            return;
        }

        pendingCourses.forEach(pendingCourse => {
            const course = allCourses.find(c => c.id === pendingCourse.courseId);
            if (!course) return;

            const cls = classes.find(c => c.classId === pendingCourse.classId);
            if (!cls) return;

            const instructorId = cls.instructorId;
            
            const courseCard = document.createElement('div');
            courseCard.className = 'course-card';
            
            courseCard.innerHTML = `
                <h3>${course.id}: ${course.name}</h3>
                <div class="category">${course.category}</div>
                <div class="description">${course.description}</div>
                <div>Class: ${cls.classId}</div>
                <div>Instructor ID: ${instructorId}</div>
                <div>Status: Pending admin approval</div>
            `;
            
            pendingCoursesContainer.appendChild(courseCard);
        });
    }
});