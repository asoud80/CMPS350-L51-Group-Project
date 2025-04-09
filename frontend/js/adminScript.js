document.addEventListener('DOMContentLoaded', function () {
    const courseClassList = document.getElementById('courseClassList');
    const createCourseForm = document.getElementById('createCourseForm');
    const createClassForm = document.getElementById('createClassForm');

    let courses = [];
    let classes = []; // new array to hold class data

    // Load existing courses from JSON
    fetch('../backend/json-files/courses.json')
        .then(response => response.json())
        .then(data => {
            courses = data;
            renderCourses();
        })
        .catch(error => console.error('Error loading courses:', error));

    // Mock data for existing classes
    classes = [
        { classId: 'CLS101', courseId: 'CMPS101', instructorId: 'i2001', students: ['s1001'], status: 'pending' },
        { classId: 'CLS251', courseId: 'CMPS251', instructorId: 'i2002', students: ['s1003', 's1004'], status: 'pending' }
    ];

    function renderCourses() {
        courseClassList.innerHTML = '';
        courses.forEach(course => {
            const relatedClasses = classes.filter(c => c.courseId === course.id);
            const section = document.createElement('div');
            section.className = 'course-card';
            section.innerHTML = `
                <h3>${course.id}: ${course.name}</h3>
                <p><strong>Category:</strong> ${course.category}</p>
                <p><strong>Status:</strong> ${course.isOpenForRegistration ? 'Open' : 'Closed'}</p>
                <p><strong>Description:</strong> ${course.description}</p>
                <p><strong>Classes:</strong></p>
                <ul>
                    ${relatedClasses.map(c => `
                        <li>
                            Class ${c.classId} (Instructor: ${c.instructorId}) - ${c.students.length} students
                            <button onclick="validateClass('${c.classId}')">Validate</button>
                            <button onclick="cancelClass('${c.classId}')">Cancel</button>
                        </li>
                    `).join('')}
                </ul>
            `;
            courseClassList.appendChild(section);
        });
    }

    // Handle course creation
    createCourseForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const newCourse = {
            id: document.getElementById('courseId').value,
            name: document.getElementById('courseName').value,
            category: document.getElementById('courseCategory').value,
            description: document.getElementById('courseDescription').value,
            prerequisites: document.getElementById('coursePrerequisites').value.split(',').map(p => p.trim()).filter(p => p),
            credits: 3,
            isOpenForRegistration: true
        };

        courses.push(newCourse);
        renderCourses();
        createCourseForm.reset();
        alert('Course added successfully!');
    });

    // Handle class creation
    createClassForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const newClass = {
            classId: 'CLS' + (classes.length + 101),
            courseId: document.getElementById('classCourseId').value,
            instructorId: document.getElementById('instructorId').value,
            students: [],
            maxStudents: parseInt(document.getElementById('maxStudents').value),
            status: 'pending'
        };

        classes.push(newClass);
        renderCourses();
        createClassForm.reset();
        alert('Class created successfully!');
    });

    // Validate a class
    window.validateClass = function (classId) {
        const foundClass = classes.find(c => c.classId === classId);
        if (foundClass) {
            if (foundClass.students.length >= 3) {
                foundClass.status = 'validated';
                alert(`Class ${classId} validated.`);
            } else {
                alert(`Class ${classId} has too few students to be validated.`);
            }
        }
        renderCourses();
    }

    // Cancel a class
    window.cancelClass = function (classId) {
        classes = classes.filter(c => c.classId !== classId);
        alert(`Class ${classId} has been cancelled.`);
        renderCourses();
    }
});