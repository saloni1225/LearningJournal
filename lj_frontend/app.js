// ===================== COMMON FUNCTIONS =====================
function togglePassword(id, btn) {
  const input = document.getElementById(id);
  if (input.type === "password") {
    input.type = "text";
    btn.innerText = "Hide";
  } else {
    input.type = "password";
    btn.innerText = "Show";
  }
}

function showAlert(msg) {
  alert(msg);
}

const page = document.body.dataset.page;

// ===================== LOGIN & SIGNUP PAGE =====================
if (page === "login") {
  let selectedRole = ""; // admin / student

  // Show login form
  window.showLogin = function (role) {
    selectedRole = role;
    document.getElementById("roleCards").style.display = "none";
    document.getElementById("loginForm").style.display = "flex";
    document.getElementById("loginTitle").innerText =
      role === "admin" ? "Admin Login" : "Student Login";

    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
  };

  // Back to role cards
  window.goBack = function () {
    document.getElementById("roleCards").style.display = "flex";
    document.getElementById("loginForm").style.display = "none";
  };

  // Show signup form
  window.showStudentSignup = function () {
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("signupForm").style.display = "flex";
  };

  // Back to login
  window.goBackSignup = function () {
    document.getElementById("signupForm").style.display = "none";
    document.getElementById("loginForm").style.display = "flex";
  };

  // -------- LOGIN --------
  window.handleLogin = async function () {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
      showAlert("❌ Enter all fields");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selectedRole, username, password })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      // Save session
      sessionStorage.setItem("role", data.role);
      sessionStorage.setItem("userId", data.userId);
      sessionStorage.setItem("fullName", data.fullName || "");

      // Redirect
      if (data.role === "admin") {
        window.location.href = "admin_entries.html";
      } else {
        window.location.href = "index.html";
      }

    } catch (err) {
      showAlert("❌ " + err.message);
    }
  };

  // -------- SIGNUP --------
  window.handleSignup = async function () {
    const fullName = document.getElementById("signupFullName").value.trim();
    const username = document.getElementById("signupUsername").value.trim();
    const password = document.getElementById("signupPassword").value.trim();

    if (!fullName || !username || !password) {
      showAlert("❌ All fields are required");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "student",
          fullName,
          username,
          password
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Signup failed");

      showAlert("✅ " + data.message);
      goBackSignup();

    } catch (err) {
      showAlert("❌ " + err.message);
    }
  };

  // Enter key submit
  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      if (document.getElementById("loginForm").style.display === "flex") {
        handleLogin();
      }
      if (document.getElementById("signupForm").style.display === "flex") {
        handleSignup();
      }
    }
  });
}

// ===================== STUDENT PAGE =====================
if (page === "student") {
  if (sessionStorage.getItem("role") !== "student") {
    window.location.href = "login.html";
  }

  window.logoutUser = function () {
    sessionStorage.clear();
    window.location.href = "login.html";
  };
}

// ===================== ADMIN PAGE =====================
if (page === "admin") {
  if (sessionStorage.getItem("role") !== "admin") {
    window.location.href = "login.html";
  }

  window.logoutUser = function () {
    sessionStorage.clear();
    window.location.href = "login.html";
  };
}
