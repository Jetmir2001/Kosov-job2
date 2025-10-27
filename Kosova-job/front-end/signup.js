 document.addEventListener("DOMContentLoaded", () => {
  // ------------------------------
  // DOM ELEMENTS
  // ------------------------------
  const signupForm = document.getElementById("signup-form");
  const signinForm = document.getElementById("signin-form");
  const resetForm = document.getElementById("reset-form");

  const showLogin = document.getElementById("show-login");
  const showSignup = document.getElementById("show-signup");
  const forgotPassword = document.getElementById("forgot-password");
  const backToLogin = document.getElementById("back-to-login");

  // ------------------------------
  // LOCAL STORAGE HELPERS
  // ------------------------------
  const getLocalUsers = () => JSON.parse(localStorage.getItem("users")) || [];
  const saveLocalUsers = (users) => localStorage.setItem("users", JSON.stringify(users));

  const syncUserToLocal = (user) => {
    const users = getLocalUsers();
    if (!users.find((u) => u.email === user.email)) {
      users.push(user);
      saveLocalUsers(users);
    }
  };

  // ------------------------------
  // GENERAL HELPERS
  // ------------------------------
  const toggleForms = (showForm, hideForm) => {
    hideForm.classList.add("hidden");
    showForm.classList.remove("hidden");
  };

  const handleFormError = (message) => alert(message);

  const saveUserAndRedirect = (user, redirectUrl = "agency.html") => {
    localStorage.setItem("loggedInUser", JSON.stringify(user));
    window.location.href = redirectUrl;
  };

  const postData = async (url, payload) => {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Request failed");
    return data;
  };

  // ------------------------------
  // VALIDATION HELPERS
  // ------------------------------
  const showError = (inputId, message) => {
    let errorEl = document.querySelector(`#${inputId}-error`);
    if (!errorEl) {
      const input = document.getElementById(inputId);
      errorEl = document.createElement("small");
      errorEl.id = `${inputId}-error`;
      errorEl.style.color = "red";
      errorEl.style.display = "block";
      errorEl.style.marginTop = "4px";
      input.insertAdjacentElement("afterend", errorEl);
    }
    errorEl.textContent = message;
  };

  const clearError = (inputId) => {
    const errorEl = document.querySelector(`#${inputId}-error`);
    if (errorEl) errorEl.textContent = "";
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password) => password.length >= 6;
  const validateName = (name) => name.trim().length >= 2;

  // ------------------------------
  // FORM TOGGLING
  // ------------------------------
  showLogin?.addEventListener("click", () => toggleForms(signinForm, signupForm));
  showSignup?.addEventListener("click", () => toggleForms(signupForm, signinForm));
  forgotPassword?.addEventListener("click", () => toggleForms(resetForm, signinForm));
  backToLogin?.addEventListener("click", () => toggleForms(signinForm, resetForm));

  // ------------------------------
  // SIGN UP VALIDATION + SUBMIT
  // ------------------------------
  signupForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("signup-name").value.trim();
    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value;
    const confirmPassword = document.getElementById("signup-confirm-password").value;
    const role = document.querySelector('input[name="role"]:checked')?.value;

    // Clear previous errors
    ["signup-name", "signup-email", "signup-password", "signup-confirm-password"].forEach(clearError);

    // Validation
    let valid = true;
    if (!validateName(name)) {
      showError("signup-name", "Please enter your full name.");
      valid = false;
    }
    if (!validateEmail(email)) {
      showError("signup-email", "Please enter a valid email address.");
      valid = false;
    }
    if (!validatePassword(password)) {
      showError("signup-password", "Password must be at least 6 characters long.");
      valid = false;
    }
    if (password !== confirmPassword) {
      showError("signup-confirm-password", "Passwords do not match.");
      valid = false;
    }
    if (!role) {
      handleFormError("Please select a role.");
      valid = false;
    }

    if (!valid) return;

    const newUser = { id: Date.now(), name, email, password, role, verified: true };

    try {
      const data = await postData("http://localhost:4000/api/register", { name, email, password, role });
      syncUserToLocal(newUser);
      alert(data.message + " Verify your email before logging in.");
      toggleForms(signinForm, signupForm);
    } catch (err) {
      const users = getLocalUsers();
      if (users.find((u) => u.email === email)) return handleFormError("Email already exists (offline)");
      users.push(newUser);
      saveLocalUsers(users);
      alert("Offline: Registration saved locally. You can sign in now.");
      toggleForms(signinForm, signupForm);
    }
  });

  // ------------------------------
  // SIGN IN VALIDATION + SUBMIT
  // ------------------------------
  signinForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("signin-email").value.trim();
    const password = document.getElementById("signin-password").value;

    clearError("signin-email");
    clearError("signin-password");

    let valid = true;
    if (!validateEmail(email)) {
      showError("signin-email", "Please enter a valid email.");
      valid = false;
    }
    if (!validatePassword(password)) {
      showError("signin-password", "Password must be at least 6 characters.");
      valid = false;
    }
    if (!valid) return;

    try {
      const data = await postData("http://localhost:4000/api/login", { email, password });
      syncUserToLocal(data.user);
      saveUserAndRedirect(data.user);
    } catch (err) {
      const users = getLocalUsers();
      const user = users.find((u) => u.email === email && u.password === password);
      if (!user) return handleFormError("Login failed (offline)");
      saveUserAndRedirect(user);
    }
  });

  // ------------------------------
  // PASSWORD RESET VALIDATION + SUBMIT
  // ------------------------------
  resetForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("reset-email").value.trim();
    const newPassword = document.getElementById("reset-new-password").value;

    clearError("reset-email");
    clearError("reset-new-password");

    let valid = true;
    if (!validateEmail(email)) {
      showError("reset-email", "Please enter a valid email.");
      valid = false;
    }
    if (!validatePassword(newPassword)) {
      showError("reset-new-password", "Password must be at least 6 characters.");
      valid = false;
    }
    if (!valid) return;

    try {
      const { resetToken } = await postData("http://localhost:4000/api/request-reset", { email });
      await postData("http://localhost:4000/api/reset-password", { email, token: resetToken, newPassword });

      const users = getLocalUsers();
      const user = users.find((u) => u.email === email);
      if (user) {
        user.password = newPassword;
        saveLocalUsers(users);
      }

      alert("Password reset successful. You can now log in.");
      toggleForms(signinForm, resetForm);
    } catch (err) {
      const users = getLocalUsers();
      const user = users.find((u) => u.email === email);
      if (!user) return handleFormError("User not found (offline)");

      user.password = newPassword;
      saveLocalUsers(users);
      alert("Offline: Password reset saved locally. You can now log in.");
      toggleForms(signinForm, resetForm);
    }
  });
});
