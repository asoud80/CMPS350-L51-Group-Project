document.addEventListener('DOMContentLoaded', function () {
    const classContainer = document.getElementById('instructorClasses');
    const currentUser = JSON.parse(localStorage.getItem('loggedInUser'));

    let classes = [
        { classId: 'CLS101', courseId: 'CMPS101', instructorId: 'i2001', students: ['s1001'], status: 'validated' },
        { classId: 'CLS251', courseId: 'CMPS251', instructorId: 'i2002', students: ['s1003', 's1004'], status: 'validated' },
        { classId: 'CLS351', courseId: 'CMPS351', instructorId: 'i2001', students: ['s1005', 's1006'], status: 'validated' }
    ];

    let users = [];
    let grades = {}; // store grades temporarily

    // Load users to map student info
    fetch('../backend/json-files/users.json')
        .then(res => res.json())
        .then(data => {
            users = data;
            renderInstructorClasses();
        })
        .catch(err => console.error('Error loading users:', err));

    function renderInstructorClasses() {
        const instructorClasses = classes.filter(cls => cls.instructorId === currentUser.id);
        classContainer.innerHTML = '';

        if (instructorClasses.length === 0) {
            classContainer.innerHTML = '<p>No classes assigned.</p>';
            return;
        }

        instructorClasses.forEach(cls => {
            const courseBox = document.createElement('div');
            courseBox.className = 'course-card';
            courseBox.innerHTML = `<h3>Class ${cls.classId} - ${cls.courseId}</h3>`;

            const studentList = document.createElement('ul');
            cls.students.forEach(studentId => {
                const student = users.find(u => u.id === studentId);
                const listItem = document.createElement('li');

                listItem.innerHTML = `
                    ${student.name} (${student.id})
                    <input type="text" placeholder="Grade" data-class="${cls.classId}" data-student="${student.id}" />
                `;
                studentList.appendChild(listItem);
            });

            const saveBtn = document.createElement('button');
            saveBtn.textContent = 'Submit Grades';
            saveBtn.className = 'register-btn';
            saveBtn.addEventListener('click', () => saveGrades(cls.classId));

            courseBox.appendChild(studentList);
            courseBox.appendChild(saveBtn);
            classContainer.appendChild(courseBox);
        });
    }

    function saveGrades(classId) {
        const inputs = document.querySelectorAll(`input[data-class='${classId}']`);
        grades[classId] = {};

        inputs.forEach(input => {
            const studentId = input.dataset.student;
            const grade = input.value.trim();
            if (grade) {
                grades[classId][studentId] = grade;
            }
        });

        console.log(`Grades submitted for ${classId}:`, grades[classId]);
        alert(`Grades for class ${classId} saved (mock).`);
    }
});