// ================= AUTH ONLY =================
// Handles ONLY registration & login
// Requires showSuccessPopup() from common.js


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

    // ✅ SUCCESS POPUP
    showSuccessPopup(
      "Registration Successful 🎉",
      "Your account has been created",
      "login.html"
    );

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

    // ✅ SAFELY READ RESPONSE
    const text = await res.text();
    let data;

    try {
      data = JSON.parse(text);
    } catch {
      throw new Error("Invalid JSON from server");
    }

    if (!res.ok) {
      alert(data.detail || "Invalid email or password");
      return;
    }

    // ✅ SAVE SESSION
    localStorage.setItem("user_id", data.user_id);
    localStorage.setItem("username", data.username);

    alert("Login successful!");
    window.location.href = "upload.html";

  } catch (err) {
    console.error("Login error:", err);
    alert("❌ Login failed due to response format issue");
  }
}
