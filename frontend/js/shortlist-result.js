document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("results");

  const userId = localStorage.getItem("user_id");
  const shortlistData = JSON.parse(localStorage.getItem("shortlistData"));
  const uploadBatchId = localStorage.getItem("upload_batch_id");

  if (!userId || !shortlistData || !uploadBatchId) {
    container.innerHTML = "<p>Please upload resume and submit skills first.</p>";
    return;
  }

  fetch("http://127.0.0.1:8000/shortlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: Number(userId),
      skills: shortlistData.skills,
      upload_batch_id: uploadBatchId
    })
  })
    .then(res => {
      if (!res.ok) throw new Error("Failed to fetch shortlist results");
      return res.json();
    })
    .then(data => {
      if (!data.results || data.results.length === 0) {
        container.innerHTML = "<p>No resumes found.</p>";
        return;
      }
      renderResults(data.results);
    })
    .catch(err => {
      console.error(err);
      container.innerHTML = `<p>Error loading results: ${err.message}</p>`;
    });
});


function renderResults(results) {
  const container = document.getElementById("results");
  container.innerHTML = "";

  results.forEach(r => {

    // 🎯 Score color logic
    const scoreColor =
      r.match_score >= 70 ? "#28a745" :
      r.match_score >= 40 ? "#ffc107" : "#dc3545";

    // ✅ PROGRESS BAR (USED CORRECTLY)
    const progress = `
      <div class="progress">
        <div class="progress-bar" style="width:${r.match_score}%; background:${scoreColor}">
          ${r.match_score}%
        </div>
      </div>
    `;

    const card = document.createElement("div");
    card.className = "result-card";

    card.innerHTML = `
      <h3>${r.file_name}</h3>
      ${r.best_match ? '<span class="best-match">Best Match</span>' : ""}

      ${progress}

      <p><b>Matched Skills:</b> ${
        r.matched_skills && r.matched_skills.length
          ? r.matched_skills.join(", ")
          : "None"
      }</p>

      <p><b>Missing Skills:</b> ${
        r.missing_skills && r.missing_skills.length
          ? r.missing_skills.join(", ")
          : "None"
      }</p>

      <div class="actions">
        <a href="${r.file_url}" target="_blank" class="btn view">View PDF</a>
        <a href="${r.file_url}" download class="btn download">Download</a>
      </div>
    `;

    container.appendChild(card);
  });
}
