document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("results");

  const userId = localStorage.getItem("user_id");
  const shortlistData = JSON.parse(localStorage.getItem("shortlistData"));

  if (!userId || !shortlistData || !Array.isArray(shortlistData.skills)) {
    container.innerHTML = "<p>Please submit skills first.</p>";
    return;
  }

  fetch("http://127.0.0.1:8000/shortlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: Number(userId),
      skills: shortlistData.skills
    })
  })
    .then(res => res.json())
    .then(data => {
      if (!data.results || data.results.length === 0) {
        container.innerHTML = "<p>No resumes found</p>";
        return;
      }
      renderResults(data.results);
    })
    .catch(() => {
      container.innerHTML = "<p>Error loading results</p>";
    });
});

function renderResults(results) {
  const container = document.getElementById("results");
  container.innerHTML = "";

  results.forEach(r => {
    const scoreColor =
      r.match_score >= 70 ? "green" :
      r.match_score >= 40 ? "orange" : "red";

    const card = document.createElement("div");
    card.className = "result-card";

    card.innerHTML = `
      <h3>${r.file_name}</h3>
      ${r.best_match ? '<span class="best-match">⭐ Best Match</span>' : ""}

      <div class="progress">
        <div class="progress-bar" style="width:${r.match_score}%; background:${scoreColor}">
          ${r.match_score}%
        </div>
      </div>

      <p><b>Matched Skills:</b> ${r.matched_skills.join(", ") || "None"}</p>
      <p><b>Missing Skills:</b> ${r.missing_skills.join(", ") || "None"}</p>

      <div class="actions">
        <a href="${r.file_url}" target="_blank" class="btn view"> View PDF</a>
        <a href="${r.file_url}" download class="btn download"> Download</a>
      </div>
    `;

    container.appendChild(card);
  });
}

