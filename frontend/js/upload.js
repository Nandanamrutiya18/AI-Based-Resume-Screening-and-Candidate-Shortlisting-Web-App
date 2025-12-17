function uploadResume() {
  // 🔹 Get selected upload type
  const selectedType = document.querySelector("input[name='uploadType']:checked");

  if (!selectedType) {
    alert("❗ Please select an upload type");
    return;
  }

  const uploadType = selectedType.value;
  const userId = localStorage.getItem("user_id");

  if (!userId) {
    alert("❗ Please login again");
    window.location.href = "login.html";
    return;
  }

  const formData = new FormData();
  formData.append("upload_type", uploadType);
  formData.append("user_id", userId);

  // 🔹 Handle upload types
  if (uploadType === "single") {
    const fileInput = document.getElementById("singleFile");
    if (!fileInput.files.length) {
      alert("❗ Please select a PDF file");
      return;
    }
    formData.append("file", fileInput.files[0]);
  }

  else if (uploadType === "multiple") {
    const filesInput = document.getElementById("multipleFiles");
    if (!filesInput.files.length) {
      alert("❗ Please select at least one PDF");
      return;
    }

    for (let file of filesInput.files) {
      formData.append("files", file);
    }
  }

  else if (uploadType === "zip") {
    const zipInput = document.getElementById("zipFile");
    if (!zipInput.files.length) {
      alert("❗ Please select a ZIP file");
      return;
    }
    formData.append("file", zipInput.files[0]);
  }

  // 🔹 Upload request
  fetch("http://127.0.0.1:8000/upload/", {
    method: "POST",
    body: formData
  })
    .then(async res => {
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Upload failed");
      }
      return data;
    })
    .then(data => {
      alert(` Upload successful!\nFiles uploaded: ${data.files?.length || 1}`);
      window.location.href = "shortlist.html";
    })
    .catch(err => {
      alert("❌ " + err.message);
    });
}
