 document.addEventListener("DOMContentLoaded", () => {
  const alertForm = document.getElementById("alertForm");
  const alertList = document.getElementById("alertList");

  function loadAlerts() {
    const alerts = JSON.parse(localStorage.getItem("jobAlerts")) || [];
    alertList.innerHTML = "";
    alerts.forEach((alert, index) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <div>
          <strong>${alert.keyword}</strong> in ${alert.location} 
          <em>(${alert.jobType})</em> → ${alert.email}
        </div>
        <button onclick="deleteAlert(${index})">Delete</button>
      `;
      alertList.appendChild(li);
    });
  }

  alertForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const keyword = document.getElementById("keyword").value;
    const location = document.getElementById("location").value;
    const jobType = document.getElementById("jobType").value;
    const email = document.getElementById("email").value;

    const newAlert = { keyword, location, jobType, email };

    const alerts = JSON.parse(localStorage.getItem("jobAlerts")) || [];
    alerts.push(newAlert);
    localStorage.setItem("jobAlerts", JSON.stringify(alerts));

    alertForm.reset();
    loadAlerts();
  });

  window.deleteAlert = (index) => {
    const alerts = JSON.parse(localStorage.getItem("jobAlerts")) || [];
    alerts.splice(index, 1);
    localStorage.setItem("jobAlerts", JSON.stringify(alerts));
    loadAlerts();
  };

  loadAlerts();
});
