 document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("resumeForm");
  const previewDiv = document.getElementById("resumePreview");
  const previewContent = document.getElementById("previewContent");
  const downloadBtn = document.getElementById("downloadBtn");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // -----------------------------
    // 1. Collect form values
    // -----------------------------
    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const skills = document.getElementById("skills").value.trim();
    const experience = document.getElementById("experience").value.trim();
    const education = document.getElementById("education").value.trim();

    // -----------------------------
    // 2. Validate required fields
    // -----------------------------
    if (!fullName || !email || !phone) {
      alert("Please fill in all required fields (Name, Email, Phone).");
      return;
    }

    // -----------------------------
    // 3. Send resume to backend
    // -----------------------------
    try {
      const res = await fetch("http://localhost:4000/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, phone, skills, experience, education })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save resume");

      alert("✅ Resume saved successfully!");

    } catch (err) {
      console.error(err);
      alert("❌ Something went wrong while saving your resume");
      return; // stop PDF generation if saving fails
    }

    // -----------------------------
    // 4. Generate resume HTML preview
    // -----------------------------
    const resumeHTML = `
      <div class="resume">
        <h3>${fullName}</h3>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <h4>Skills</h4>
        <p>${skills || "N/A"}</p>
        <h4>Experience</h4>
        <p>${experience || "N/A"}</p>
        <h4>Education</h4>
        <p>${education || "N/A"}</p>
      </div>
    `;

    previewContent.innerHTML = resumeHTML;
    previewDiv.style.display = "block";

    // Scroll to preview
    previewDiv.scrollIntoView({ behavior: "smooth" });
  });

  // -----------------------------
  // 5. Download PDF
  // -----------------------------
  downloadBtn.addEventListener("click", () => {
    if (!previewContent.innerHTML.trim()) {
      alert("Please generate your resume first!");
      return;
    }

    html2pdf().from(previewContent).save("My_Resume.pdf");
  });
});
