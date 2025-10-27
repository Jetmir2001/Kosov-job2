 async function fetchAnalytics() {
  const res = await fetch("/api/analytics");
  const data = await res.json();
  return data;
}

function createBarChart(ctx, labels, values, label, color) {
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: label,
        data: values,
        backgroundColor: color
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } }
    }
  });
}

function createPieChart(ctx, labels, values, colors) {
  new Chart(ctx, {
    type: 'pie',
    data: { labels: labels, datasets: [{ data: values, backgroundColor: colors }] },
    options: { responsive: true }
  });
}

function populateCompaniesTable(companies) {
  const tbody = document.querySelector("#topCompaniesTable tbody");
  tbody.innerHTML = "";
  companies.forEach(c => {
    const row = document.createElement("tr");
    row.innerHTML = `<td>${c.company}</td><td>${c.jobs}</td>`;
    tbody.appendChild(row);
  });
}

async function initDashboard() {
  console.log("Initializing dashboard..."); // Check if JS runs
  const analytics = await fetchAnalytics();

  // Jobs per Category
  const ctx1 = document.getElementById('jobsCategoryChart').getContext('2d');
  createBarChart(ctx1, Object.keys(analytics.jobsPerCategory), Object.values(analytics.jobsPerCategory), 'Jobs', '#007bff');

  // Applications per Job
  const ctx2 = document.getElementById('applicationsJobChart').getContext('2d');
  createBarChart(ctx2, Object.keys(analytics.applicationsPerJob), Object.values(analytics.applicationsPerJob), 'Applications', '#28a745');

  // Top Companies Table
  populateCompaniesTable(analytics.topCompanies);

  // Active vs Expired Jobs
  const ctx3 = document.getElementById('statusChart').getContext('2d');
  createPieChart(ctx3,
    Object.keys(analytics.statusCounts),
    Object.values(analytics.statusCounts),
    ['#007bff', '#dc3545']
  );
}

// Make sure JS runs after DOM loads
document.addEventListener("DOMContentLoaded", () => {
  initDashboard();
});
