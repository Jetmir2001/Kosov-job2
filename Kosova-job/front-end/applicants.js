 document.addEventListener("DOMContentLoaded", async () => {
  const applicationsList = document.getElementById("applicationsList");

  async function fetchApplications() {
    try {
      const res = await fetch("http://localhost:4000/api/applications");
      const applications = await res.json();

      applicationsList.innerHTML = "";
      applications.forEach(app => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${app.jobTitle}</td>
          <td>${app.company}</td>
          <td>${app.status}</td>
          <td>${new Date(app.appliedOn).toLocaleDateString()}</td>
        `;
        applicationsList.appendChild(row);
      });
    } catch (err) {
      console.error("Error fetching applications:", err);
    }
  }

  fetchApplications();
});
