// auth.js
// Handles ONLY registration & login

// ================= REGISTER =================
async function register() {
  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !email || !password) {
    alert("All fields are required");
    return;
  }

  try {
    const res = await fetch("http://127.0.0.1:8000/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.detail || "Registration failed");
      return;
    }

    alert("Registration successful. Please login.");
    window.location.href = "login.html";

  } catch (err) {
    alert("Server error during registration");
    console.error(err);
  }
}


// ================= LOGIN =================
async function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("Email and password required");
    return;
  }

  try {
    const res = await fetch("http://127.0.0.1:8000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.detail || "Invalid email or password");
      return;
    }

    // ✅ save login session
    localStorage.setItem("user_id", data.user_id);
    localStorage.setItem("username", data.username);

    // ✅ DIRECT redirect to upload page
    window.location.href = "upload.html";

  } catch (err) {
    alert("Server error during login");
    console.error(err);
  }
}
