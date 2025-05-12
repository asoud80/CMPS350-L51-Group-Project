document.addEventListener('DOMContentLoaded', function() {
    
    // Reference to search and filter elements
    const courseSearch = document.getElementById('courseSearch');
    const categoryFilter = document.getElementById('categoryFilter');
    const registrationModal = document.getElementById('registrationModal');
    const modalCourseName = document.getElementById('modalCourseName');
    const courseDescription = document.getElementById('courseDescription');
    const instructorList = document.getElementById('instructorList');
    const registrationMessage = document.getElementById('registrationMessage');
    const closeModal = document.getElementById('closeModal');
    const viewLearningPath = document.getElementById('viewLearningPath');
    
    // Global variables
    let currentUser = JSON.parse(localStorage.getItem('loggedInUser'));
    window.allCourses = [];
    let allUsers = [];
    let classes = [];
    
    // Display username in header
    if (currentUser) {
        document.getElementById('userName').textContent = currentUser.name;
    }

    // Add event listeners
    courseSearch.addEventListener('input', filterCourses);
    categoryFilter.addEventListener('change', filterCourses);
    closeModal.addEventListener('click', () => registrationModal.style.display = 'none');
    
    // Navigation to learning path
    viewLearningPath.addEventListener('click', () => {
        window.location.href = 'learning-path.html';
    });
    
    // When clicking outside the modal, close it
    window.addEventListener('click', (e) => {
        if (e.target === registrationModal) {
            registrationModal.style.display = 'none';
        }
    });
    
    // Load necessary data
    loadUsers();
    loadCourses();
    loadClasses();
    
    // Function to load users
    function loadUsers() {
        fetch('../backend/json-files/users.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load users data');
                }
                return response.json();
            })
            .then(users => {
                allUsers = users;
                // Refresh current user data
                currentUser = allUsers.find(user => user.id === currentUser.id);
                localStorage.setItem('loggedInUser', JSON.stringify(currentUser));
            })
            .catch(error => {
                console.error('Error loading users:', error);
                // Try to load from localStorage
                allUsers = JSON.parse(localStorage.getItem('allUsers') || '[]');
            });
    }
    
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
                    window.allCourses = cachedCourses;
                    displayCourses(cachedCourses);
                } else {
                    console.log('Using mock courses data');
                    const mockCourses = getMockCourses();
                    window.allCourses = mockCourses;
                    displayCourses(mockCourses);
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
                    window.allCourses = courses;
                    displayCourses(courses);
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
    
    // Function to load classes
    function loadClasses() {
        fetch('../backend/json-files/classes.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load classes data');
                }
                return response.json();
            })
            .then(classesData => {
                classes = classesData;
                // Store in localStorage for use in learning path
                localStorage.setItem('classes', JSON.stringify(classes));
            })
            .catch(error => {
                console.error('Error loading classes:', error);
                // Try to load from localStorage
                classes = JSON.parse(localStorage.getItem('classes') || '[]');
            });
    }
    
    // Function to display courses
    function displayCourses(courses) {
        const courseList = document.getElementById('courseList');
        courseList.innerHTML = '';
        
        if (courses.length === 0) {
            courseList.innerHTML = '<div class="no-results">No courses match your search criteria.</div>';
            return;
        }
        
        courses.forEach(course => {
            const courseCard = document.createElement('div');
            courseCard.className = 'course-card';
            
            // Create prerequisites text
            let prerequisitesText = 'None';
            if (course.prerequisites && course.prerequisites.length > 0) {
                prerequisitesText = course.prerequisites.join(', ');
            }
            
            // Create status class
            const statusClass = course.isOpenForRegistration ? 'open' : 'closed';
            
            // Check if user can register (has completed prerequisites)
            const canRegister = checkPrerequisites(course);
            
            // Check if already enrolled
            const isEnrolled = checkIfEnrolled(course.id);
            
            // Create course card and add a Register button if it's open
            courseCard.innerHTML = `
                <h3>${course.id}: ${course.name}</h3>
                <div class="category">${course.category}</div>
                <div class="description">${course.description}</div>
                <div class="prerequisites">Prerequisites: ${prerequisitesText}</div>
                <div class="status ${statusClass}">
                    ${course.isOpenForRegistration ? 'Open for Registration' : 'Closed'}
                </div>
                ${isEnrolled ? 
                    '<div class="enrolled-status">Already Enrolled</div>' :
                    course.isOpenForRegistration ? 
                        `<button class="register-btn" data-course-id="${course.id}" ${!canRegister ? 'disabled' : ''}>
                            ${canRegister ? 'Register' : 'Prerequisites Not Met'}
                        </button>` : ''}
            `;
            
            // Add event listener to the register button
            const registerBtn = courseCard.querySelector('.register-btn');
            if (registerBtn && !registerBtn.disabled) {
                registerBtn.addEventListener('click', () => openRegistrationModal(course));
            }
            
            courseList.appendChild(courseCard);
        });
    }
    
    // Rest of your functions remain unchanged
    function checkIfEnrolled(courseId) {
        if (!currentUser || !currentUser.inProgressCourses) return false;
        
        return currentUser.inProgressCourses.some(course => course.courseId === courseId);
    }
    
    function checkPrerequisites(course) {
        if (!course.prerequisites || course.prerequisites.length === 0) {
            return true;
        }
        
        if (!currentUser.completedCourses) return false;
        
        const completedCourseIds = currentUser.completedCourses.map(c => c.courseId);
        return course.prerequisites.every(prereq => completedCourseIds.includes(prereq));
    }
    
    function openRegistrationModal(course) {
        modalCourseName.textContent = `${course.id}: ${course.name}`;
        courseDescription.textContent = course.description;
        registrationMessage.textContent = '';
        registrationMessage.className = '';
        
        // Get instructors who can teach this course
        const instructors = allUsers.filter(user => 
            user.userType === 'instructor' && 
            (!user.expertiseAreas || user.expertiseAreas.includes(course.category) || 
             (user.teachingCourses && user.teachingCourses.includes(course.id)))
        );
        
        // Get classes for this course
        const courseClasses = classes.filter(cls => cls.courseId === course.id && cls.status === 'validated');
        
        // Display instructors and their classes
        instructorList.innerHTML = '';
        
        if (courseClasses.length === 0) {
            instructorList.innerHTML = '<p>No available classes for this course at the moment.</p>';
            return;
        }
        
        courseClasses.forEach(cls => {
            const instructor = instructors.find(instr => instr.id === cls.instructorId);
            if (!instructor) return;
            
            const remainingSpots = cls.maxStudents - cls.students.length;
            const instructorItem = document.createElement('div');
            instructorItem.className = 'instructor-item';
            
            instructorItem.innerHTML = `
                <div>
                    <div><strong>${instructor.name}</strong></div>
                    <div>Class: ${cls.classId} - ${cls.students.length}/${cls.maxStudents} students</div>
                </div>
                <button class="register-btn" data-class-id="${cls.classId}" 
                    ${remainingSpots <= 0 ? 'disabled' : ''}>
                    ${remainingSpots > 0 ? 'Select' : 'Full'}
                </button>
            `;
            
            // Add event listener to register button
            const classRegisterBtn = instructorItem.querySelector('.register-btn');
            if (classRegisterBtn && !classRegisterBtn.disabled) {
                classRegisterBtn.addEventListener('click', () => registerForClass(cls, course));
            }
            
            instructorList.appendChild(instructorItem);
        });
        
        if (instructorList.children.length === 0) {
            instructorList.innerHTML = '<p>No available classes for this course at the moment.</p>';
        }
        
        // Show the modal
        registrationModal.style.display = 'block';
    }
    
    function registerForClass(cls, course) {
        // Check if already registered
        if (cls.students.includes(currentUser.id)) {
            registrationMessage.textContent = 'You are already registered for this class.';
            registrationMessage.className = 'error-message';
            return;
        }
        
        // Register the student
        cls.students.push(currentUser.id);
        
        // Update localStorage
        localStorage.setItem('classes', JSON.stringify(classes));
        
        // Create "in progress" course in user's record if doesn't exist yet
        if (!currentUser.inProgressCourses) {
            currentUser.inProgressCourses = [];
        }
        
        // Check if course is already in progress
        const alreadyInProgress = currentUser.inProgressCourses.some(c => c.courseId === course.id);
        if (!alreadyInProgress) {
            currentUser.inProgressCourses.push({
                courseId: course.id,
                classId: cls.classId,
                status: 'pending' // Not yet validated by admin
            });
            
            // Update user in localStorage
            localStorage.setItem('loggedInUser', JSON.stringify(currentUser));
        }
        
        // Show success message
        registrationMessage.textContent = `Successfully registered for ${course.id} with ${getInstructorName(cls.instructorId)}. Pending admin approval.`;
        registrationMessage.className = 'success-message';
        
        // Disable all registration buttons
        const allButtons = instructorList.querySelectorAll('.register-btn');
        allButtons.forEach(btn => btn.disabled = true);
        
        // Refresh course list to update "Already Enrolled" status
        displayCourses(window.allCourses);
    }
    
    function getInstructorName(instructorId) {
        const instructor = allUsers.find(user => user.id === instructorId);
        return instructor ? instructor.name : 'Unknown Instructor';
    }
    
    function filterCourses() {
        const searchTerm = courseSearch.value.toLowerCase();
        const categoryValue = categoryFilter.value;
        
        const filteredCourses = window.allCourses.filter(course => {
            // Check if course name or ID matches the search term
            const matchesSearch = course.name.toLowerCase().includes(searchTerm) || 
                                 course.id.toLowerCase().includes(searchTerm);
            
            // Check if course category matches the selected category
            const matchesCategory = categoryValue === '' || course.category === categoryValue;
            
            return matchesSearch && matchesCategory;
        });
        
        // Display the filtered courses
        displayCourses(filteredCourses);
    }
});