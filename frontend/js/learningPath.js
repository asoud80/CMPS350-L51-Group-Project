document.addEventListener('DOMContentLoaded', function() {
    // References to elements
    const completedCoursesContainer = document.getElementById('completedCourses');
    const inProgressCoursesContainer = document.getElementById('inProgressCourses');
    const pendingCoursesContainer = document.getElementById('pendingCourses');
    const backToCoursesBtn = document.getElementById('backToCourses');
    const userName = document.getElementById('userName');

    // Global variables
    let currentUser = JSON.parse(localStorage.getItem('loggedInUser'));
    let allCourses = [];
    let classes = JSON.parse(localStorage.getItem('classes')) || [];

    // Set user name in the header
    if (currentUser) {
        userName.textContent = currentUser.name;
    }

    // Navigation back to courses
    backToCoursesBtn.addEventListener('click', () => {
        window.location.href = 'student-dashboard.html';
    });

    // Load courses data
    loadCourses();

    // Function to load courses
    function loadCourses() {
        // Try multiple potential paths
        const possiblePaths = [
            '../backend/json-files/courses.json',
            '/backend/json-files/courses.json',
            '/json-files/courses.json',
            '/api/courses'
        ];
        
        let pathIndex = 0;
        tryLoadCourses();
        
        function tryLoadCourses() {
            if (pathIndex >= possiblePaths.length) {
                // All paths failed, try localStorage or use mockup data
                const cachedCourses = JSON.parse(localStorage.getItem('courses') || '[]');
                if (cachedCourses.length > 0) {
                    console.log('Using cached courses data');
                    allCourses = cachedCourses;
                    displayLearningPath();
                } else {
                    console.log('Using mock courses data');
                    const mockCourses = getMockCourses();
                    allCourses = mockCourses;
                    displayLearningPath();
                    localStorage.setItem('courses', JSON.stringify(mockCourses));
                }
                return;
            }
            
            fetch(possiblePaths[pathIndex])
                .then(response => {
                    if (!response.ok) throw new Error('Failed to load courses data');
                    return response.json();
                })
                .then(result => {
                    // Handle potential API response format
                    const courses = result.data || result;
                    allCourses = courses;
                    displayLearningPath();
                    localStorage.setItem('courses', JSON.stringify(courses));
                })
                .catch(error => {
                    console.warn(`Failed to load courses from ${possiblePaths[pathIndex]}:`, error);
                    pathIndex++;
                    tryLoadCourses();
                });
        }
    }
    
    // Mock courses data for fallback
    function getMockCourses() {
        return [
            {
                "id": "CMPS101",
                "name": "Introduction to Computing",
                "category": "Foundation",
                "credits": 3,
                "prerequisites": [],
                "isOpenForRegistration": true,
                "description": "Basic concepts of computer systems, including hardware, software, and information processing."
            },
            {
                "id": "CMPS151",
                "name": "Programming Concepts",
                "category": "Programming",
                "credits": 3,
                "prerequisites": [],
                "isOpenForRegistration": true,
                "description": "Introduction to programming concepts using a high-level language."
            },
            {
                "id": "CMPS251",
                "name": "Object-Oriented Programming",
                "category": "Programming",
                "credits": 4,
                "prerequisites": ["CMPS151"],
                "isOpenForRegistration": true,
                "description": "Object-oriented design and implementation using a modern OOP language."
            },
            {
                "id": "CMPS303",
                "name": "Data Structures",
                "category": "Algorithms",
                "credits": 4,
                "prerequisites": ["CMPS251"],
                "isOpenForRegistration": true,
                "description": "Basic data structures and algorithms including lists, stacks, queues, trees, and graphs."
            },
            {
                "id": "CMPS351",
                "name": "Database Systems",
                "category": "Databases",
                "credits": 4,
                "prerequisites": ["CMPS251"],
                "isOpenForRegistration": true,
                "description": "Introduction to database concepts, data models, relational database design."
            }
        ];
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
                <div class="credits">Credits: ${course.credits}</div>
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

            const instructor = findInstructor(cls.instructorId);
            const instructorName = instructor ? instructor.name : 'Unknown Instructor';
            
            const courseCard = document.createElement('div');
            courseCard.className = 'course-card';
            
            courseCard.innerHTML = `
                <h3>${course.id}: ${course.name}</h3>
                <div class="category">${course.category}</div>
                <div class="description">${course.description}</div>
                <div class="class-info">
                    <div>Class: ${cls.classId}</div>
                    <div>Instructor: ${instructorName}</div>
                    <div>Students Enrolled: ${cls.students.length}/${cls.maxStudents}</div>
                </div>
                <div class="status active">Status: Active</div>
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

            const instructor = findInstructor(cls.instructorId);
            const instructorName = instructor ? instructor.name : 'Unknown Instructor';
            
            const courseCard = document.createElement('div');
            courseCard.className = 'course-card';
            
            courseCard.innerHTML = `
                <h3>${course.id}: ${course.name}</h3>
                <div class="category">${course.category}</div>
                <div class="description">${course.description}</div>
                <div class="class-info">
                    <div>Class: ${cls.classId}</div>
                    <div>Instructor: ${instructorName}</div>
                    <div>Students Enrolled: ${cls.students.length}/${cls.maxStudents}</div>
                </div>
                <div class="status pending">Status: Pending admin approval</div>
            `;
            
            pendingCoursesContainer.appendChild(courseCard);
        });
    }

    // Helper function to find instructor by ID
    function findInstructor(instructorId) {
        // Try to fetch from localStorage cache
        const cachedUsers = JSON.parse(localStorage.getItem('allUsers'));
        if (cachedUsers) {
            const instructor = cachedUsers.find(user => user.id === instructorId);
            if (instructor) return instructor;
        }

        // Fallback: just return an ID if we can't find the actual name
        return { name: `Instructor (ID: ${instructorId})` };
    }
});