const manualRadio = document.getElementById("manualRadio");
const conditionRadio = document.getElementById("conditionRadio");
const manualBox = document.getElementById("manualBox");
const conditionBox = document.getElementById("conditionBox");

manualRadio.onclick = () => {
  manualBox.classList.remove("hidden");
  conditionBox.classList.add("hidden");
};

conditionRadio.onclick = () => {
  conditionBox.classList.remove("hidden");
  manualBox.classList.add("hidden");
};

function applyShortlist() {
  if (!manualRadio.checked && !conditionRadio.checked) {
    alert("Please select a shortlisting method");
    return;
  }

  let skills = [];

  if (manualRadio.checked) {
    skills = document.getElementById("manualSkills")
      .value
      .split(",")
      .map(s => s.trim().toLowerCase())
      .filter(Boolean);
  } else {
    skills = [...document.querySelectorAll(
      '#conditionBox input[type="checkbox"]:checked'
    )].map(cb => cb.value.toLowerCase());
  }

  if (skills.length === 0) {
    alert("Please enter at least one skill");
    return;
  }

  localStorage.setItem("shortlistData", JSON.stringify({ skills }));
  window.location.href = "shortlist-result.html";
}
