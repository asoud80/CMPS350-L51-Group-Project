document.addEventListener('DOMContentLoaded', function() {
    
    // Reference to search and filter elements
    const courseSearch = document.getElementById('courseSearch');
    const categoryFilter = document.getElementById('categoryFilter');
    
    // Add event listeners for search and filter
    courseSearch.addEventListener('input', filterCourses);
    categoryFilter.addEventListener('change', filterCourses);
    
    // Load courses from JSON file
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
                // Store courses in a global variable for filtering
                window.allCourses = courses;
                // Display all courses initially
                displayCourses(courses);
            })
            .catch(error => {
                console.error('Error loading courses:', error);
                document.getElementById('courseList').innerHTML = 
                    '<div class="error-message">Failed to load courses. Please try again later.</div>';
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
                    '<button class="register-btn">Register</button>' : ''}
            `;
            courseList.appendChild(courseCard);
        });
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
        // display the filtered courses
        displayCourses(filteredCourses);
    }
    
});