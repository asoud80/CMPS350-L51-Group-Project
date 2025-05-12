document.addEventListener('DOMContentLoaded', function () {
    const classContainer = document.getElementById('instructorClasses');
    const currentUser = JSON.parse(localStorage.getItem('loggedInUser'));
    const userName = document.getElementById('userName');

    // Set instructor name in header
    if (currentUser) {
        userName.textContent = currentUser.name;
    }

    let classes = [];
    let users = [];
    let courses = [];
    let grades = {}; // store grades temporarily

    // Load all necessary data
    Promise.all([
        fetch('../backend/json-files/classes.json').then(res => res.json()),
        fetch('../backend/json-files/users.json').then(res => res.json()),
        fetch('../backend/json-files/courses.json').then(res => res.json())
    ])
    .then(([classesData, usersData, coursesData]) => {
        classes = classesData;
        users = usersData;
        courses = coursesData;
        
        // Store users in localStorage for reference by other pages
        localStorage.setItem('allUsers', JSON.stringify(users));
        localStorage.setItem('allCourses', JSON.stringify(courses));
        
        renderInstructorClasses();
    })
    .catch(err => {
        console.error('Error loading data:', err);
        classContainer.innerHTML = '<div class="error-message">Failed to load data. Please try again later.</div>';
        
        // Fallback to mock data
        classes = [
            { classId: 'CLS101', courseId: 'CMPS101', instructorId: 'i2001', students: ['s1001', 's1007', 's1008', 's1009', 's1010'], status: 'validated' },
            { classId: 'CLS251', courseId: 'CMPS251', instructorId: 'i2002', students: ['s1003', 's1004'], status: 'validated' },
            { classId: 'CLS351', courseId: 'CMPS351', instructorId: 'i2001', students: ['s1005', 's1006'], status: 'validated' }
        ];
        
        users = [
            { id: 's1001', name: 'Sara Ali', userType: 'student' },
            { id: 's1003', name: 'Alaa Hasan', userType: 'student' },
            { id: 's1004', name: 'Noora Hamad', userType: 'student' },
            { id: 's1005', name: 'Reem Mahmoud', userType: 'student' },
            { id: 's1006', name: 'Mai Khalid', userType: 'student' },
            { id: 's1007', name: 'Ahmed Hassan', userType: 'student' },
            { id: 's1008', name: 'Yousef Al-Malki', userType: 'student' },
            { id: 's1009', name: 'Maryam Al-Sulaiti', userType: 'student' },
            { id: 's1010', name: 'Hamad Al-Thani', userType: 'student' }
        ];
        
        courses = [
            { id: 'CMPS101', name: 'Introduction to Computing', category: 'Foundation' },
            { id: 'CMPS251', name: 'Object-Oriented Programming', category: 'Programming' },
            { id: 'CMPS351', name: 'Database Systems', category: 'Databases' }
        ];
        
        renderInstructorClasses();
    });

    function renderInstructorClasses() {
        const instructorClasses = classes.filter(cls => cls.instructorId === currentUser.id);
        classContainer.innerHTML = '';

        if (instructorClasses.length === 0) {
            classContainer.innerHTML = '<p>No classes assigned to you currently.</p>';
            return;
        }

        instructorClasses.forEach(cls => {
            const course = courses.find(c => c.id === cls.courseId) || { id: cls.courseId, name: 'Unknown Course', category: 'Unknown' };
            
            const courseBox = document.createElement('div');
            courseBox.className = 'course-card';
            
            // Create course header with details
            courseBox.innerHTML = `
                <h3>${course.id}: ${course.name}</h3>
                <div class="category">${course.category}</div>
                <div class="class-details">
                    <div>Class ID: ${cls.classId}</div>
                    <div>Student Count: ${cls.students.length}/${cls.maxStudents}</div>
                    <div>Status: <span class="status-badge status-${cls.status}">${cls.status}</span></div>
                </div>
                <h4>Students</h4>
            `;

            // Create student list if there are students
            if (cls.students.length === 0) {
                const emptyMsg = document.createElement('p');
                emptyMsg.textContent = 'No students enrolled in this class yet.';
                courseBox.appendChild(emptyMsg);
            } else {
                const studentList = document.createElement('ul');
                
                cls.students.forEach(studentId => {
                    const student = users.find(u => u.id === studentId);
                    if (!student) return;
                    
                    const listItem = document.createElement('li');
                    listItem.className = 'student-item';

                    listItem.innerHTML = `
                        <div class="student-info">
                            <span>${student.name}</span>
                            <span class="student-id">(${student.id})</span>
                        </div>
                        <div class="grade-input">
                            <input type="text" placeholder="Grade (e.g., A, B+)" 
                                data-class="${cls.classId}" 
                                data-student="${student.id}" 
                                maxlength="2" />
                        </div>
                    `;
                    studentList.appendChild(listItem);
                });

                // Add button to submit grades
                const saveBtn = document.createElement('button');
                saveBtn.textContent = 'Submit Grades';
                saveBtn.className = 'register-btn';
                saveBtn.addEventListener('click', () => saveGrades(cls.classId, course.id));

                courseBox.appendChild(studentList);
                courseBox.appendChild(saveBtn);
            }

            classContainer.appendChild(courseBox);
        });
    }

    function saveGrades(classId, courseId) {
        const inputs = document.querySelectorAll(`input[data-class='${classId}']`);
        let gradesToSubmit = {};
        let allValid = true;
        
        // Validate grades
        inputs.forEach(input => {
            const studentId = input.dataset.student;
            const grade = input.value.trim().toUpperCase();
            
            if (grade) {
                // Simple validation: A+, A, A-, B+, B, B-, C+, C, C-, D+, D, D-, F
                const validGradePattern = /^(A\+|A|A-|B\+|B|B-|C\+|C|C-|D\+|D|D-|F)$/;
                
                if (!validGradePattern.test(grade)) {
                    input.style.borderColor = 'red';
                    allValid = false;
                } else {
                    input.style.borderColor = '';
                    gradesToSubmit[studentId] = grade;
                }
            }
        });

        if (!allValid) {
            alert('Please check grades format. Valid formats are: A+, A, A-, B+, B, B-, C+, C, C-, D+, D, D-, F');
            return;
        }
        
        if (Object.keys(gradesToSubmit).length === 0) {
            alert('No grades to submit.');
            return;
        }

        // In a real application, this would send the data to the server
        // For now, we'll just store it locally and show a success message
        grades[classId] = gradesToSubmit;
        
        // Here we would normally update the backend
        console.log(`Grades submitted for ${classId}:`, gradesToSubmit);
        
        // Show success message
        const successMsg = document.createElement('div');
        successMsg.className = 'success-message';
        successMsg.textContent = `Grades for class ${classId} saved successfully.`;
        
        // Find the course card
        const courseCard = document.querySelector(`.course-card:has(input[data-class='${classId}'])`);
        if (courseCard) {
            // Remove any existing messages
            const existingMsg = courseCard.querySelector('.success-message, .error-message');
            if (existingMsg) {
                existingMsg.remove();
            }
            courseCard.appendChild(successMsg);
            
            // Clear inputs after successful submission
            inputs.forEach(input => {
                if (gradesToSubmit[input.dataset.student]) {
                    input.value = '';
                    input.placeholder = `Grade: ${gradesToSubmit[input.dataset.student]} (Saved)`;
                    input.classList.add('grade-submitted');
                }
            });
        } else {
            alert(`Grades for class ${classId} saved successfully.`);
        }
    }
});