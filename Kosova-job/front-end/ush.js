 document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contactForm");
  const responseMsg = document.getElementById("responseMsg");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.error || "Failed to save message");

      responseMsg.style.color = "green";
      responseMsg.textContent = `Message sent successfully, ${result.name}!`;
      form.reset();
    } catch (err) {
      responseMsg.style.color = "red";
      responseMsg.textContent = `Error: ${err.message}`;
      console.error(err);
    }
  });
});
