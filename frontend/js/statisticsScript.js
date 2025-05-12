document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    const currentUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    // Only allow administrators to access this page
    if (currentUser.userType !== 'administrator') {
        alert('You do not have permission to access this page.');
        if (currentUser.userType === 'student') {
            window.location.href = 'student-dashboard.html';
        } else if (currentUser.userType === 'instructor') {
            window.location.href = 'instruct-dashboard.html';
        } else {
            window.location.href = 'login.html';
        }
        return;
    }

    // Display user name
    document.getElementById('userName').textContent = currentUser.name;

    // Reference elements
    const backToMainBtn = document.getElementById('backToMain');
    
    // Navigation
    backToMainBtn.addEventListener('click', () => {
        window.location.href = 'admin-dashboard.html';
    });

    // Load data from local storage
    const courses = JSON.parse(localStorage.getItem('courses')) || [];
    const classes = JSON.parse(localStorage.getItem('classes')) || [];
    const users = JSON.parse(localStorage.getItem('allUsers')) || [];

    // Basic statistics calculations
    const studentsCount = users.filter(user => user.userType === 'student').length;
    const coursesCount = courses.length;
    const classesCount = classes.length;
    
    // Calculate total enrollments and average class size
    let totalEnrollments = 0;
    classes.forEach(cls => {
        totalEnrollments += cls.students.length;
    });
    const avgClassSize = classesCount > 0 ? (totalEnrollments / classesCount).toFixed(1) : 0;

    // Update basic statistics display
    document.getElementById('totalStudents').textContent = studentsCount;
    document.getElementById('totalCourses').textContent = coursesCount;
    document.getElementById('totalClasses').textContent = classesCount;
    document.getElementById('avgClassSize').textContent = avgClassSize;

    // Create course enrollment data
    const courseEnrollments = [];
    courses.forEach(course => {
        const courseTotalStudents = classes
            .filter(cls => cls.courseId === course.id)
            .reduce((total, cls) => total + cls.students.length, 0);
        
        courseEnrollments.push({
            courseId: course.id,
            courseName: course.name,
            enrollmentCount: courseTotalStudents
        });
    });
    
    // Sort by enrollment count, descending
    courseEnrollments.sort((a, b) => b.enrollmentCount - a.enrollmentCount);
    
    // Get top 5 for display
    const topCourseEnrollments = courseEnrollments.slice(0, 5);
    
    // Create enrollment by course chart
    createCourseEnrollmentChart(topCourseEnrollments);
    
    // Create category distribution data
    const categoryCount = {};
    courses.forEach(course => {
        if (!categoryCount[course.category]) {
            categoryCount[course.category] = 0;
        }
        categoryCount[course.category]++;
    });
    
    const categoryDistribution = Object.keys(categoryCount).map(category => ({
        category: category,
        count: categoryCount[category]
    }));
    
    // Create category distribution chart
    createCategoryDistributionChart(categoryDistribution);
    
    // Create grade distribution data (from completed courses)
    const gradeCount = {};
    users.forEach(user => {
        if (user.userType === 'student' && user.completedCourses) {
            user.completedCourses.forEach(course => {
                if (!gradeCount[course.grade]) {
                    gradeCount[course.grade] = 0;
                }
                gradeCount[course.grade]++;
            });
        }
    });
    
    const gradeDistribution = Object.keys(gradeCount).map(grade => ({
        grade: grade,
        count: gradeCount[grade]
    }));
    
    // Sort grades in standard order
    const gradeOrder = {
        'A+': 0, 'A': 1, 'A-': 2,
        'B+': 3, 'B': 4, 'B-': 5,
        'C+': 6, 'C': 7, 'C-': 8,
        'D+': 9, 'D': 10, 'D-': 11,
        'F': 12
    };
    
    gradeDistribution.sort((a, b) => {
        return (gradeOrder[a.grade] || 99) - (gradeOrder[b.grade] || 99);
    });
    
    // Create grade distribution chart
    createGradeDistributionChart(gradeDistribution);
    
    // Create instructor class load data
    const instructorClassCount = {};
    classes.forEach(cls => {
        if (!instructorClassCount[cls.instructorId]) {
            instructorClassCount[cls.instructorId] = 0;
        }
        instructorClassCount[cls.instructorId]++;
    });
    
    const instructorLoads = Object.keys(instructorClassCount).map(instructorId => {
        const instructor = users.find(user => user.id === instructorId);
        return {
            id: instructorId,
            name: instructor ? instructor.name : `Instructor ${instructorId}`,
            classCount: instructorClassCount[instructorId]
        };
    });
    
    // Sort by class count, descending
    instructorLoads.sort((a, b) => b.classCount - a.classCount);
    
    // Create instructor class load chart
    createInstructorClassChart(instructorLoads);
    
    // Create student progress data
    const studentProgress = {
        'No courses': 0,
        '1-2 courses': 0,
        '3-5 courses': 0,
        '6+ courses': 0
    };
    
    users.filter(user => user.userType === 'student').forEach(student => {
        const completedCount = student.completedCourses ? student.completedCourses.length : 0;
        
        if (completedCount === 0) {
            studentProgress['No courses']++;
        } else if (completedCount <= 2) {
            studentProgress['1-2 courses']++;
        } else if (completedCount <= 5) {
            studentProgress['3-5 courses']++;
        } else {
            studentProgress['6+ courses']++;
        }
    });
    
    // Create student progress chart
    createStudentProgressChart(studentProgress);
    
    // Create mock registration trends data (this would normally come from backend)
    createRegistrationTrendsChart();
    
    // Create completion rates data
    const completionRates = [];
    courses.forEach(course => {
        // For each course, count completed vs. enrolled
        const completedCount = users.filter(user => 
            user.userType === 'student' && 
            user.completedCourses && 
            user.completedCourses.some(c => c.courseId === course.id)
        ).length;
        
        const enrolledCount = classes
            .filter(cls => cls.courseId === course.id)
            .reduce((total, cls) => total + cls.students.length, 0);
        
        // Only include courses with at least some enrollments
        if (enrolledCount > 0) {
            const completionRate = Math.round((completedCount / (completedCount + enrolledCount)) * 100);
            completionRates.push({
                courseId: course.id,
                rate: completionRate
            });
        }
    });
    
    // Sort by completion rate, descending
    completionRates.sort((a, b) => b.rate - a.rate);
    
    // Create completion rates chart
    createCompletionRatesChart(completionRates.slice(0, 8)); // Show top 8
    
    // Create recent registrations (mock data)
    createRecentRegistrationsList();
    
    // Create prerequisite analysis
    createPrerequisiteAnalysisChart();
    
    // Create popular courses chart (using the enrollment data we already have)
    createPopularCoursesChart(topCourseEnrollments);

    // Function to create course enrollment chart
    function createCourseEnrollmentChart(enrollmentData) {
        const ctx = document.getElementById('courseEnrollmentChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: enrollmentData.map(item => item.courseId),
                datasets: [{
                    label: 'Student Enrollments',
                    data: enrollmentData.map(item => item.enrollmentCount),
                    backgroundColor: '#8B6939',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Number of Students'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Course ID'
                        }
                    }
                }
            }
        });
    }

    function createCategoryDistributionChart(categoryData) {
        const categories = categoryData.map(item => item.category);
        const counts = categoryData.map(item => item.count);
        
        // Create colors array
        const colors = [
            '#8B6939', '#9B7949', '#AB8959', '#BB9969', '#CB9979', 
            '#DB9989', '#EB9999', '#6B4919', '#5B3909', '#4B2900'
        ];
        
        const ctx = document.getElementById('categoryDistributionChart').getContext('2d');
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: categories,
                datasets: [{
                    data: counts,
                    backgroundColor: colors.slice(0, categories.length),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right'
                    },
                    title: {
                        display: true,
                        text: 'Course Distribution by Category'
                    }
                }
            }
        });
    }

    function createGradeDistributionChart(gradeData) {
        const ctx = document.getElementById('gradeDistributionChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: gradeData.map(item => item.grade),
                datasets: [{
                    label: 'Count',
                    data: gradeData.map(item => item.count),
                    backgroundColor: '#8B6939',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Number of Grades'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Grade'
                        }
                    }
                }
            }
        });
    }
    
    function createInstructorClassChart(instructorData) {
        const ctx = document.getElementById('instructorClassChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: instructorData.map(item => item.name),
                datasets: [{
                    label: 'Number of Classes',
                    data: instructorData.map(item => item.classCount),
                    backgroundColor: '#8B6939',
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Number of Classes'
                        }
                    }
                }
            }
        });
    }

    function createStudentProgressChart(progressGroups) {
        const ctx = document.getElementById('studentProgressChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(progressGroups),
                datasets: [{
                    label: 'Number of Students',
                    data: Object.values(progressGroups),
                    backgroundColor: '#8B6939',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Number of Students'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Completed Courses'
                        }
                    }
                }
            }
        });
    }

    function createRegistrationTrendsChart() {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        // Mock data - this would normally come from backend
        const registrations = [65, 40, 35, 50, 75, 90, 70, 120, 130, 85, 60, 45];
        
        const ctx = document.getElementById('registrationTrendsChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    label: 'Course Registrations',
                    data: registrations,
                    borderColor: '#8B6939',
                    backgroundColor: 'rgba(139, 105, 57, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Number of Registrations'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Month'
                        }
                    }
                }
            }
        });
    }

    function createCompletionRatesChart(completionRates) {
        const ctx = document.getElementById('completionRatesChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: completionRates.map(item => item.courseId),
                datasets: [{
                    label: 'Completion Rate (%)',
                    data: completionRates.map(item => item.rate),
                    backgroundColor: '#8B6939',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Completion Rate (%)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Course ID'
                        }
                    }
                }
            }
        });
    }

    function createRecentRegistrationsList() {
        // Mock data for recent registrations - in a real app this would come from backend
        const mockRegistrations = [
            { student: 'Sara Ali', course: 'CMPS101: Introduction to Computing', class: 'CLS101', date: '2025-05-10' },
            { student: 'Fatima Ahmed', course: 'CMPS151: Programming Concepts', class: 'CLS151', date: '2025-05-09' },
            { student: 'Alaa Hasan', course: 'CMPS251: Object-Oriented Programming', class: 'CLS251', date: '2025-05-08' },
            { student: 'Noora Hamad', course: 'CMPS303: Data Structures', class: 'CLS303', date: '2025-05-07' },
            { student: 'Reem Mahmoud', course: 'CMPS310: Software Engineering', class: 'CLS310', date: '2025-05-06' },
            { student: 'Mai Khalid', course: 'CMPS351: Database Systems', class: 'CLS351', date: '2025-05-05' },
            { student: 'Ahmed Hassan', course: 'CMPS350: Web Development Fundamentals', class: 'CLS350', date: '2025-05-04' },
            { student: 'Yousef Al-Malki', course: 'CMPS355: Data Communication & Networks1', class: 'CLS355', date: '2025-05-03' }
        ];
        
        const tableBody = document.getElementById('recentRegistrationsList');
        tableBody.innerHTML = '';
        
        mockRegistrations.forEach(reg => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${reg.student}</td>
                <td>${reg.course}</td>
                <td>${reg.class}</td>
                <td>${reg.date}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    function createPrerequisiteAnalysisChart() {
        // Analyze prerequisites
        const prerequisitesDistribution = {
            'No prerequisites': 0,
            '1 prerequisite': 0,
            '2 prerequisites': 0,
            '3+ prerequisites': 0
        };
        
        courses.forEach(course => {
            const count = course.prerequisites ? course.prerequisites.length : 0;
            if (count === 0) {
                prerequisitesDistribution['No prerequisites']++;
            } else if (count === 1) {
                prerequisitesDistribution['1 prerequisite']++;
            } else if (count === 2) {
                prerequisitesDistribution['2 prerequisites']++;
            } else {
                prerequisitesDistribution['3+ prerequisites']++;
            }
        });
        
        const ctx = document.getElementById('prerequisiteAnalysisChart').getContext('2d');
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(prerequisitesDistribution),
                datasets: [{
                    data: Object.values(prerequisitesDistribution),
                    backgroundColor: [
                        '#8B6939', '#9B7949', '#AB8959', '#BB9969'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right'
                    },
                    title: {
                        display: true,
                        text: 'Prerequisite Requirements'
                    }
                }
            }
        });
    }

    function createPopularCoursesChart(courseData) {
        const ctx = document.getElementById('popularCoursesChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: courseData.map(course => `${course.courseId}: ${course.courseName.substring(0, 15)}${course.courseName.length > 15 ? '...' : ''}`),
                datasets: [{
                    label: 'Number of Enrollments',
                    data: courseData.map(course => course.enrollmentCount),
                    backgroundColor: '#8B6939',
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Number of Students'
                        }
                    }
                }
            }
        });
    }
});