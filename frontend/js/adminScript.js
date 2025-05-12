document.addEventListener('DOMContentLoaded', function () {
    const courseClassList = document.getElementById('courseClassList');
    const createCourseForm = document.getElementById('createCourseForm');
    const createClassForm = document.getElementById('createClassForm');
    const viewStatisticsBtn = document.getElementById('viewStatisticsBtn');
    const userName = document.getElementById('userName');

    let currentUser = JSON.parse(localStorage.getItem('loggedInUser'));
    let courses = [];
    let classes = [];
    let users = [];

    // Set admin name in header
    if (currentUser) {
        userName.textContent = currentUser.name;
    }

    // Navigate to statistics page
    if (viewStatisticsBtn) {
        viewStatisticsBtn.addEventListener('click', function() {
            window.location.href = 'statistics-dashboard.html';
        });
    }

    // Load data from backend
    Promise.all([
        fetch('../backend/json-files/courses.json').then(res => res.json()),
        fetch('../backend/json-files/classes.json').then(res => res.json()),
        fetch('../backend/json-files/users.json').then(res => res.json())
    ])
    .then(([coursesData, classesData, usersData]) => {
        courses = coursesData;
        classes = classesData;
        users = usersData;

        // Store data in localStorage
        localStorage.setItem('courses', JSON.stringify(courses));
        localStorage.setItem('classes', JSON.stringify(classes));
        localStorage.setItem('allUsers', JSON.stringify(users));

        renderCourses();
    })
    .catch(error => {
        console.error('Error loading data:', error);
        
        // Try loading from localStorage as fallback
        courses = JSON.parse(localStorage.getItem('courses')) || [];
        classes = JSON.parse(localStorage.getItem('classes')) || [];
        users = JSON.parse(localStorage.getItem('allUsers')) || [];
        
        if (courses.length > 0 && classes.length > 0) {
            renderCourses();
        } else {
            courseClassList.innerHTML = '<div class="error-message">Failed to load data. Please try again later.</div>';
        }
    });

    function renderCourses() {
        courseClassList.innerHTML = '';
        
        courses.forEach(course => {
            const relatedClasses = classes.filter(c => c.courseId === course.id);
            const section = document.createElement('div');
            section.className = 'course-card';
            
            let classesHTML = '';
            if (relatedClasses.length > 0) {
                classesHTML = '<ul>' + relatedClasses.map(c => {
                    // Count number of students
                    const studentCount = c.students ? c.students.length : 0;
                    
                    // Get instructor name
                    const instructor = users.find(u => u.id === c.instructorId);
                    const instructorName = instructor ? instructor.name : c.instructorId;
                    
                    return `
                        <li>
                            Class ${c.classId} (Instructor: ${instructorName}) - ${studentCount}/${c.maxStudents} students
                            <span class="status-badge ${c.status === 'validated' ? 'status-validated' : 'status-pending'}">
                                ${c.status}
                            </span><br/>
                            <button class="action-btn validate-btn" data-classid="${c.classId}" ${c.status === 'validated' ? 'disabled' : ''}>
                                ${c.status === 'validated' ? 'Validated' : 'Validate'}
                            </button>
                            <button class="action-btn cancel-btn" data-classid="${c.classId}">Cancel</button>
                        </li>
                    `;
                }).join('') + '</ul>';
            } else {
                classesHTML = '<p>No classes for this course yet.</p>';
            }
            
            section.innerHTML = `
                <h3>${course.id}: ${course.name}</h3>
                <p><strong>Category:</strong> ${course.category}</p>
                <p><strong>Status:</strong> ${course.isOpenForRegistration ? 'Open' : 'Closed'}</p>
                <p><strong>Description:</strong> ${course.description}</p>
                <p><strong>Classes:</strong></p>
                ${classesHTML}
                <button class="toggle-btn" data-courseid="${course.id}">
                    ${course.isOpenForRegistration ? 'Close Registration' : 'Open Registration'}
                </button>
            `;
            
            courseClassList.appendChild(section);
        });

        // Add event listeners after rendering all courses
        addEventListeners();
    }

    function addEventListeners() {
        // Event delegation for Validate, Cancel, and Toggle buttons
        courseClassList.addEventListener('click', function(e) {
            // Validate class button
            if (e.target.classList.contains('validate-btn')) {
                const classId = e.target.dataset.classid;
                validateClass(classId);
            }
            
            // Cancel class button
            if (e.target.classList.contains('cancel-btn')) {
                const classId = e.target.dataset.classid;
                cancelClass(classId);
            }
            
            // Toggle course registration status
            if (e.target.classList.contains('toggle-btn')) {
                const courseId = e.target.dataset.courseid;
                toggleCourseRegistration(courseId);
            }
        });
    }

    createCourseForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const courseId = document.getElementById('courseId').value;
        
        // Check for duplicate course ID
        if (courses.some(c => c.id === courseId)) {
            alert(`Course with ID ${courseId} already exists!`);
            return;
        }

        const newCourse = {
            id: courseId,
            name: document.getElementById('courseName').value,
            category: document.getElementById('courseCategory').value,
            description: document.getElementById('courseDescription').value,
            prerequisites: document.getElementById('coursePrerequisites').value
                .split(',')
                .map(p => p.trim())
                .filter(p => p),
            credits: 3,
            isOpenForRegistration: true
        };

        courses.push(newCourse);
        localStorage.setItem('courses', JSON.stringify(courses));
        renderCourses();
        createCourseForm.reset();
        alert('Course added successfully!');
    });

    createClassForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const courseId = document.getElementById('classCourseId').value;
        const instructorId = document.getElementById('instructorId').value;
        
        // Validate course exists
        if (!courses.some(c => c.id === courseId)) {
            alert(`Course with ID ${courseId} does not exist!`);
            return;
        }
        
        // Validate instructor exists
        if (!users.some(u => u.id === instructorId && u.userType === 'instructor')) {
            alert(`Instructor with ID ${instructorId} does not exist!`);
            return;
        }

        const newClass = {
            classId: generateClassId(courseId),
            courseId: courseId,
            instructorId: instructorId,
            students: [],
            maxStudents: parseInt(document.getElementById('maxStudents').value),
            status: 'pending'
        };

        classes.push(newClass);
        localStorage.setItem('classes', JSON.stringify(classes));
        renderCourses();
        createClassForm.reset();
        alert('Class created successfully!');
    });

    function generateClassId(courseId) {
        // Find existing classes for this course
        const courseClasses = classes.filter(c => c.courseId === courseId);
        
        // If no classes exist, use the first variant
        if (courseClasses.length === 0) {
            return `CLS${courseId.substring(courseId.length - 3)}`;
        }
        
        // Otherwise, add a letter suffix (A, B, C, etc.)
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        return `CLS${courseId.substring(courseId.length - 3)}${letters[courseClasses.length % 26]}`;
    }

    function validateClass(classId) {
        const foundClass = classes.find(c => c.classId === classId);
        if (foundClass) {
            if (foundClass.students.length >= 3) {
                foundClass.status = 'validated';
                localStorage.setItem('classes', JSON.stringify(classes));
                alert(`Class ${classId} validated.`);
                renderCourses();
            } else {
                alert(`Class ${classId} has too few students to be validated.`);
            }
        }
    }

    function cancelClass(classId) {
        if (confirm(`Are you sure you want to cancel class ${classId}?`)) {
            classes = classes.filter(c => c.classId !== classId);
            localStorage.setItem('classes', JSON.stringify(classes));
            alert(`Class ${classId} has been cancelled.`);
            renderCourses();
        }
    }

    function toggleCourseRegistration(courseId) {
        const course = courses.find(c => c.id === courseId);
        if (course) {
            course.isOpenForRegistration = !course.isOpenForRegistration;
            localStorage.setItem('courses', JSON.stringify(courses));
            renderCourses();
        }
    }
});