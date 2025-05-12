document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");
    const loginError = document.getElementById("loginError");
    const loginBtn = document.getElementById("loginBtn");
    
    // Initialize loading state
    let isLoading = false;
    
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        
        if (isLoading) return; // Prevent multiple submissions
        
        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim();
        
        if (!username || !password) {
            showError("Please enter both username and password.");
            return;
        }
        
        // Set loading state
        setLoading(true);
        
        try {
            // Try to load users from the JSON file
            const usersResponse = await fetch("../backend/json-files/users.json");
            
            if (!usersResponse.ok) {
                throw new Error("Failed to load user data. Server may be down.");
            }
            
            const users = await usersResponse.json();
            
            // Find user with matching credentials
            const user = users.find(u => 
                u.username === username && 
                u.password === password
            );
            
            if (user) {
                // Login successful
                const userInfo = {
                    id: user.id,
                    name: user.name,
                    username: user.username,
                    userType: user.userType,
                    // Include additional data as needed based on user type
                    ...(user.completedCourses && { completedCourses: user.completedCourses }),
                    ...(user.inProgressCourses && { inProgressCourses: user.inProgressCourses }),
                    ...(user.expertiseAreas && { expertiseAreas: user.expertiseAreas }),
                    ...(user.teachingCourses && { teachingCourses: user.teachingCourses }),
                    ...(user.role && { role: user.role })
                };
                
                // Store user in localStorage
                localStorage.setItem("loggedInUser", JSON.stringify(userInfo));
                
                // Also store all users for reference
                localStorage.setItem("allUsers", JSON.stringify(users));
                
                // Show success message
                showSuccess("Login successful! Redirecting...");
                
                // Redirect based on user type after a short delay
                setTimeout(() => {
                    if (user.userType === 'student') {
                        window.location.href = 'student-dashboard.html';
                    } else if (user.userType === 'instructor') {
                        window.location.href = 'instruct-dashboard.html';
                    } else if (user.userType === 'administrator') {
                        window.location.href = 'admin-dashboard.html';
                    }
                }, 1000);
            } else {
                showError("Invalid username or password.");
                setLoading(false);
            }
        } catch (error) {
            console.error("Error during login:", error);
            
            // Try fallback login with hardcoded data
            tryFallbackLogin(username, password);
        }
    });
    
    // Fallback login for when server is down
    function tryFallbackLogin(username, password) {
        // Hardcoded credentials for fallback
        const fallbackUsers = [
            {
                id: "s1001",
                username: "student1",
                password: "pass123",
                userType: "student",
                name: "Sara Ali"
            },
            {
                id: "i2001",
                username: "instructor1",
                password: "pass123",
                userType: "instructor",
                name: "Dr. Mahmoud Barhamgi"
            },
            {
                id: "a3001",
                username: "admin1",
                password: "pass123",
                userType: "administrator",
                name: "Prof. Amr Mohamed"
            }
        ];
        
        const user = fallbackUsers.find(u => 
            u.username === username && 
            u.password === password
        );
        
        if (user) {
            // Login successful with fallback data
            localStorage.setItem("loggedInUser", JSON.stringify(user));
            
            showSuccess("Login successful! Redirecting...");
            
            // Redirect based on user type
            setTimeout(() => {
                if (user.userType === 'student') {
                    window.location.href = 'student-dashboard.html';
                } else if (user.userType === 'instructor') {
                    window.location.href = 'instruct-dashboard.html';
                } else if (user.userType === 'administrator') {
                    window.location.href = 'admin-dashboard.html';
                }
            }, 1000);
        } else {
            showError("Invalid username or password. Server may be down.");
            setLoading(false);
        }
    }
    
    // Add GitHub login button functionality
    const githubLoginBtn = document.getElementById("githubLogin");
    if (githubLoginBtn) {
        githubLoginBtn.addEventListener("click", function() {
            // In a real app, this would redirect to GitHub OAuth
            showInfo("GitHub login is not implemented in this demo.");
        });
    }
    
    // Helper function to show error message
    function showError(message) {
        loginError.textContent = message;
        loginError.classList.add("error-message");
        loginError.classList.remove("success-message", "info-message");
        loginError.style.display = "block";
    }
    
    // Helper function to show success message
    function showSuccess(message) {
        loginError.textContent = message;
        loginError.classList.add("success-message");
        loginError.classList.remove("error-message", "info-message");
        loginError.style.display = "block";
    }
    
    // Helper function to show info message
    function showInfo(message) {
        loginError.textContent = message;
        loginError.classList.add("info-message");
        loginError.classList.remove("error-message", "success-message");
        loginError.style.display = "block";
    }
    
    // Helper function to set loading state
    function setLoading(loading) {
        isLoading = loading;
        loginBtn.disabled = loading;
        
        if (loading) {
            loginBtn.innerHTML = '<span class="spinner"></span> Logging in...';
        } else {
            loginBtn.textContent = "Login";
        }
    }
    
    // Add input validation
    const inputFields = document.querySelectorAll('#loginForm input');
    inputFields.forEach(field => {
        field.addEventListener('input', () => {
            loginError.style.display = "none";
        });
    });
});
