document.getElementById("backBtn").addEventListener("click", () => {
  window.history.back();
});

document.getElementById("submitBtn").addEventListener("click", async () => {
  const clientName = document.getElementById("clientName").value.trim();
  const shiftDate = document.getElementById("shiftDate").value;
  const shiftPeriod = document.getElementById("shiftPeriod").value;
  const logEntry = document.getElementById("logEntry").value.trim();
  const spinner = document.getElementById("spinner");
  const submitBtn = document.getElementById("submitBtn");

  if (!clientName || !shiftDate || !shiftPeriod || !logEntry) {
    alert("Please fill in all fields before submitting.");
    return;
  }

  const payload = { clientName, shiftDate, shiftPeriod, logEntry };

  // Show spinner and disable the submit button
  spinner.classList.remove("hidden");
  submitBtn.disabled = true;

  try {
    const response = await fetch("/submit-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      // Navigate to final report without showing alert
      window.location.href = "/final-report.html";
    } else {
      const errorData = await response.json();
      console.error(`Error: ${errorData.error || "Unknown error occurred."}`);
    }
  } catch (error) {
    console.error("Error submitting log:", error);
  } finally {
    // Hide spinner and re-enable the submit button
    spinner.classList.add("hidden");
    submitBtn.disabled = false;
  }
});
