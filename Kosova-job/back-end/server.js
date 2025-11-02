 // ================================
// SERVER.JS - Kosova-Job Backend
// ================================
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
const nodemailer = require("nodemailer");


const app = express();
const PORT = 4000;



// ------------------------------
// HELPERS
// ------------------------------
const readJSON = (file) => {
  try {
    return JSON.parse(fs.readFileSync(path.join(__dirname, file), "utf8"));
  } catch {
    return [];
  }
};

const writeJSON = (file, data) => {
  fs.writeFileSync(path.join(__dirname, file), JSON.stringify(data, null, 2));
};

// ------------------------------
// MIDDLEWARE
// ------------------------------
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "..", "front-end")));

// ------------------------------
// USERS API
// ------------------------------
app.post("/api/register", (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role)
    return res.status(400).json({ message: "All fields are required" });

  const users = readJSON("users.json");
  if (users.find(u => u.email === email))
    return res.status(400).json({ message: "Email already exists" });

  const newUser = { 
    id: Date.now(), 
    name, 
    email, 
    password, 
    role, 
    verified: true // email verification optional
  };
  users.push(newUser);
  writeJSON("users.json", users);

  res.json({ message: "Registration successful", user: newUser });
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  const users = readJSON("users.json");

  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ message: "Invalid email or password" });

  res.json({ message: "Login successful", user });
});

app.post("/api/reset-password", (req, res) => {
  const { email, newPassword } = req.body;
  const users = readJSON("users.json");
  const user = users.find(u => u.email === email);

  if (!user) return res.status(404).json({ message: "User not found" });

  user.password = newPassword;
  writeJSON("users.json", users);

  res.json({ message: "Password reset successful" });
});

// ------------------------------
// JOBS API
// ------------------------------
app.get("/api/jobs", (req, res) => {
  const jobs = readJSON("jobs.json");
  res.json(jobs);
});


//JOBS API2
app.post("/api/jobs", (req, res) => {
  const jobs = readJSON("jobs.json");
  const newJob = { id: Date.now(), ...req.body };
  jobs.push(newJob);
  writeJSON("jobs.json", jobs);
  res.status(201).json(newJob);
});


//delete.edit job
// UPDATE job
app.put("/api/jobs/:id", (req, res) => {
  const jobs = readJSON("jobs.json");
  const jobId = Number(req.params.id);
  const index = jobs.findIndex((j) => j.id === jobId);

  if (index === -1) return res.status(404).json({ error: "Job not found" });

  jobs[index] = { ...jobs[index], ...req.body, id: jobId };
  writeJSON("jobs.json", jobs);
  res.json(jobs[index]);
});

// DELETE job
app.delete("/api/jobs/:id", (req, res) => {
  const jobs = readJSON("jobs.json");
  const jobId = Number(req.params.id);
  const newJobs = jobs.filter((j) => j.id !== jobId);

  if (jobs.length === newJobs.length) return res.status(404).json({ error: "Job not found" });

  writeJSON("jobs.json", newJobs);
  res.json({ success: true });
});



// ------------------------------
// RESUMES API
// ------------------------------
app.post("/api/resumes", (req, res) => {
  const { fullName, email, phone, skills, experience, education } = req.body;
  if (!fullName || !email || !phone)
    return res.status(400).json({ message: "Full name, email, and phone are required" });

  const resumes = readJSON("resumes.json");
  const newResume = {
    id: Date.now(),
    fullName,
    email,
    phone,
    skills,
    experience,
    education,
    createdAt: new Date()
  };

  resumes.push(newResume);
  writeJSON("resumes.json", resumes);

  res.json({ message: "Resume uploaded successfully", resume: newResume });
});

app.get("/api/resumes", (req, res) => {
  const resumes = readJSON("resumes.json");
  res.json(resumes);
});

app.delete("/api/resumes/:id", (req, res) => {
  const { id } = req.params;
  let resumes = readJSON("resumes.json");

  resumes = resumes.filter(r => r.id != id);
  writeJSON("resumes.json", resumes);

  res.json({ message: "Resume deleted successfully" });
});

// ------------------------------
// CATCH UNMATCHED API ROUTES
// ------------------------------
app.use("/api/*", (req, res) => {
  res.status(404).json({ message: "API endpoint not found" });
});

// ------------------------------
// SPA / FALLBACK ROUTE
// ------------------------------
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "front-end", "mainpage.html"));
});

// ------------------------------
// START SERVER
// ------------------------------








const applicationsFile = "./data/applications.json";

// Fetch all applications
app.get("/api/applications", (req, res) => {
  fs.readFile(applicationsFile, "utf8", (err, data) => {
    if (err) return res.status(500).send("Error reading applications");
    res.json(JSON.parse(data || "[]"));
  });
});

// Post new application
app.post("/api/applications", (req, res) => {
  fs.readFile(applicationsFile, "utf8", (err, data) => {
    if (err) return res.status(500).send("Error reading applications");

    let applications = JSON.parse(data || "[]");
    const newApplication = {
      id: Date.now(),
      jobTitle: req.body.jobTitle,
      company: req.body.company,
      status: "Pending",
      appliedOn: new Date()
    };

    applications.push(newApplication);

    fs.writeFile(applicationsFile, JSON.stringify(applications, null, 2), (err) => {
      if (err) return res.status(500).send("Error saving application");
      res.status(201).json(newApplication);
    });
  });
});



//send messages
app.post("/api/support", (req, res) =>{
  const {message, date} = req.body;
    console.log("📩 Support message received:", message, "🕒", date);
  res.json({ success: true });
});





app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));





























//chatbot
// server.js
