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
            });
    }
    
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
                window.allCourses = courses;
                displayCourses(courses);
            })
            .catch(error => {
                console.error('Error loading courses:', error);
                document.getElementById('courseList').innerHTML = 
                    '<div class="error-message">Failed to load courses. Please try again later.</div>';
            });
    }
    
    // Function to load classes
    function loadClasses() {
        // In a real application, this would be fetched from a JSON file or API
        // For now, we'll use mock data
        classes = [
            { classId: 'CLS101', courseId: 'CMPS101', instructorId: 'i2001', students: ['s1001'], status: 'validated', maxStudents: 30 },
            { classId: 'CLS151', courseId: 'CMPS151', instructorId: 'i2003', students: ['s1002'], status: 'validated', maxStudents: 30 },
            { classId: 'CLS251', courseId: 'CMPS251', instructorId: 'i2003', students: ['s1003', 's1004'], status: 'validated', maxStudents: 30 },
            { classId: 'CLS303', courseId: 'CMPS303', instructorId: 'i2002', students: ['s1004', 's1005'], status: 'validated', maxStudents: 30 },
            { classId: 'CLS310', courseId: 'CMPS310', instructorId: 'i2003', students: ['s1005'], status: 'validated', maxStudents: 30 },
            { classId: 'CLS351', courseId: 'CMPS351', instructorId: 'i2001', students: ['s1005', 's1006'], status: 'validated', maxStudents: 30 }
        ];
        
        // Store in localStorage for use in learning path
        localStorage.setItem('classes', JSON.stringify(classes));
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
            
            // Create course card and add a Register button if it's open
            courseCard.innerHTML = `
                <h3>${course.id}: ${course.name}</h3>
                <div class="category">${course.category}</div>
                <div class="description">${course.description}</div>
                <div class="prerequisites">Prerequisites: ${prerequisitesText}</div>
                <div class="status ${statusClass}">
                    ${course.isOpenForRegistration ? 'Open for Registration' : 'Closed'}
                </div>
                ${course.isOpenForRegistration ? 
                    `<button class="register-btn" data-course-id="${course.id}" ${!canRegister ? 'disabled' : ''}>
                        ${canRegister ? 'Register' : 'Prerequisites Not Met'}
                    </button>` : ''}
            `;
            
            // Add event listener to the register button
            const registerBtn = courseCard.querySelector('.register-btn');
            if (registerBtn) {
                registerBtn.addEventListener('click', () => openRegistrationModal(course));
            }
            
            courseList.appendChild(courseCard);
        });
    }
    
    // Function to check if user has completed prerequisites
    function checkPrerequisites(course) {
        if (!course.prerequisites || course.prerequisites.length === 0) {
            return true;
        }
        
        const completedCourseIds = currentUser.completedCourses.map(c => c.courseId);
        return course.prerequisites.every(prereq => completedCourseIds.includes(prereq));
    }
    
    // Function to open registration modal
    function openRegistrationModal(course) {
        modalCourseName.textContent = `${course.id}: ${course.name}`;
        courseDescription.textContent = course.description;
        registrationMessage.textContent = '';
        registrationMessage.className = '';
        
        // Get instructors who can teach this course
        const instructors = allUsers.filter(user => 
            user.userType === 'instructor' && 
            (!user.expertiseAreas || user.expertiseAreas.includes(course.category))
        );
        
        // Get classes for this course
        const courseClasses = classes.filter(cls => cls.courseId === course.id && cls.status === 'validated');
        
        // Display instructors and their classes
        instructorList.innerHTML = '';
        
        instructors.forEach(instructor => {
            const instructorClasses = courseClasses.filter(cls => cls.instructorId === instructor.id);
            
            instructorClasses.forEach(cls => {
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
        });
        
        if (instructorList.children.length === 0) {
            instructorList.innerHTML = '<p>No available classes for this course at the moment.</p>';
        }
        
        // Show the modal
        registrationModal.style.display = 'block';
    }
    
    // Function to register for a class
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
        // In a real app, this would be done on the server
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
    }
    
    // Helper function to get instructor name
    function getInstructorName(instructorId) {
        const instructor = allUsers.find(user => user.id === instructorId);
        return instructor ? instructor.name : 'Unknown Instructor';
    }
    
    // Function to filter courses
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