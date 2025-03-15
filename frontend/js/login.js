document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");
    const loginError = document.getElementById("loginError");

    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault(); // Prevent form from refreshing the page

        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim();

        try {
            // Fetch users data from users.json
            const response = await fetch("../backend/json-files/users.json");
            if (!response.ok) throw new Error("Failed to load user data");

            const users = await response.json();
            const user = users.find(u => u.username === username && u.password === password);

            if (user) {
                // Store user session
                localStorage.setItem("loggedInUser", JSON.stringify(user));

                // Redirect based on user type
                if (user.userType === 'student') {window.location.href = 'student-dashboard.html';} 

                else if (user.userType === 'instructor') {window.location.href = 'instruct-dashboard.html';} 
 
                else if (user.userType === 'administrator') {window.location.href = 'admin-dashboard.html';}

            } else {
                loginError.textContent = "Invalid username or password.";
            }

        } catch (error) {
            console.error("Error:", error);
            loginError.textContent = "Error logging in. Try again later.";
        }
    });
});
