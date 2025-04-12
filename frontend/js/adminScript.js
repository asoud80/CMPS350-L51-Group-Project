document.addEventListener('DOMContentLoaded', function () {
    const courseClassList = document.getElementById('courseClassList');
    const createCourseForm = document.getElementById('createCourseForm');
    const createClassForm = document.getElementById('createClassForm');

  
    let courses = JSON.parse(localStorage.getItem('courses')) || [];
    let classes = JSON.parse(localStorage.getItem('classes')) || [];

  
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
                            <button class="register-btn" data-validate="${c.classId}">Validate</button>
                            <button class="register-btn" data-cancel="${c.classId}">Cancel</button>
                        </li>
                    `).join('')}
                </ul>
            `;
            courseClassList.appendChild(section);
        });

        // Event delegation for Validate and Cancel buttons
        document.querySelectorAll('[data-validate]').forEach(btn => {
            btn.addEventListener('click', () => validateClass(btn.dataset.validate));
        });

        document.querySelectorAll('[data-cancel]').forEach(btn => {
            btn.addEventListener('click', () => cancelClass(btn.dataset.cancel));
        });
    }

   
    createCourseForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const newCourse = {
            id: document.getElementById('courseId').value,
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

        const newClass = {
            classId: 'CLS' + (classes.length + 101),
            courseId: document.getElementById('classCourseId').value,
            instructorId: document.getElementById('instructorId').value,
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

    
    function validateClass(classId) {
        const foundClass = classes.find(c => c.classId === classId);
        if (foundClass) {
            if (foundClass.students.length >= 3) {
                foundClass.status = 'validated';
                localStorage.setItem('classes', JSON.stringify(classes));
                alert(`Class ${classId} validated.`);
            } else {
                alert(`Class ${classId} has too few students to be validated.`);
            }
        }
        renderCourses();
    }

   
    function cancelClass(classId) {
        classes = classes.filter(c => c.classId !== classId);
        localStorage.setItem('classes', JSON.stringify(classes));
        alert(`Class ${classId} has been cancelled.`);
        renderCourses();
    }

    renderCourses();
});
