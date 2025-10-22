// ===================== COMMON FUNCTIONS =====================
function togglePassword(id, btn) {
  const input = document.getElementById(id);
  input.type = input.type === "password" ? "text" : "password";
  btn.innerText = input.type === "password" ? "Show" : "Hide";
}

function showAlert(msg) {
  alert(msg);
}

const page = document.body.dataset.page; // must be set in HTML <body data-page="...">

// ===================== LOGIN & SIGNUP PAGE =====================
if(page === "login") {
  let selectedRole = "";

  function showLogin(role) {
    selectedRole = role;
    document.getElementById("roleCards").style.display = "none";
    document.getElementById("loginForm").style.display = "flex";
    document.getElementById("loginTitle").innerText =
      role === "admin" ? "Admin Login" : "Student Login";
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
  }

  function goBack() {
    document.getElementById("roleCards").style.display = "flex";
    document.getElementById("loginForm").style.display = "none";
  }

  function showStudentSignup() {
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("signupForm").style.display = "flex";
  }

  function goBackSignup() {
    document.getElementById("signupForm").style.display = "none";
    document.getElementById("loginForm").style.display = "flex";
  }

  async function handleLogin() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) { showAlert("Enter all fields"); return; }

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selectedRole, username, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      sessionStorage.setItem("role", data.role);
      sessionStorage.setItem("userId", data.userId);
      sessionStorage.setItem("fullName", data.fullName || "");

      if (data.role === "admin") window.location.href = "admin_entries.html";
      else window.location.href = "index.html";

    } catch (err) { showAlert(err.message); }
  }

  async function handleSignup() {
    const fullName = document.getElementById("signupFullName").value.trim();
    const username = document.getElementById("signupUsername").value.trim();
    const password = document.getElementById("signupPassword").value.trim();

    if (!fullName || !username || !password) { showAlert("All fields required"); return; }

    try {
      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "student", fullName, username, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Signup failed");
      showAlert(data.message);
      goBackSignup();
    } catch (err) { showAlert(err.message); }
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      if (document.getElementById("loginForm").style.display === "flex") handleLogin();
      if (document.getElementById("signupForm").style.display === "flex") handleSignup();
    }
  });
}

// ===================== STUDENT PAGE =====================
if(page === "student") {
  if(sessionStorage.getItem("role") !== "student") window.location.href = "login.html";

  function logoutUser() {
    sessionStorage.clear();
    window.location.href = "login.html";
  }

  const usnInput = document.getElementById("usn");
  const usnError = document.getElementById("usnError");

  function validateUSN(usn) {
    const pattern = /^[0-9][A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{3}$/;
    return pattern.test(usn);
  }

  usnInput.addEventListener("input", () => {
    const usn = usnInput.value.trim().toUpperCase();
    usnInput.value = usn;
    usnError.textContent = validateUSN(usn) ? "" : "USN format wrong";
  });

  const limits = { topics: 80, keyTerms: 40, summary: 100, doubts: 50, makeup: 50 };
  Object.keys(limits).forEach(id => {
    const textarea = document.getElementById(id);
    const counter = document.getElementById(id + "Counter");
    textarea.addEventListener("input", () => {
      const words = textarea.value.trim().split(/\s+/).filter(Boolean);
      if (words.length > limits[id]) textarea.value = words.slice(0, limits[id]).join(" ");
      counter.textContent = `${words.length} / ${limits[id]} words`;
    });
  });

  document.getElementById("journalForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const startDate = document.getElementById("startDate").value;
    const endDate = document.getElementById("endDate").value;
    if(!startDate || !endDate){ showAlert("Select dates"); return; }
    if(new Date(startDate) > new Date(endDate)){ showAlert("End date cannot be before start"); return; }
    const usn = usnInput.value.trim().toUpperCase();
    if(!validateUSN(usn)){ usnError.textContent="Invalid USN"; return; }

    const entryData = {
      week: document.getElementById("week").value.trim(),
      weekRange: `${startDate} - ${endDate}`,
      courseCode: document.getElementById("courseCode").value.trim(),
      courseName: document.getElementById("courseName").value.trim(),
      module: document.getElementById("module").value.trim(),
      topics: document.getElementById("topics").value.trim(),
      keyTerms: document.getElementById("keyTerms").value.trim(),
      summary: document.getElementById("summary").value.trim(),
      doubts: document.getElementById("doubts").value.trim(),
      makeup: document.getElementById("makeup").value.trim(),
      usn,
      studentName: document.getElementById("studentName").value.trim(),
      semester: document.getElementById("semester").value,
      classSection: document.getElementById("classSection").value
    };

    try {
      const res = await fetch("http://localhost:5000/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entryData)
      });
      if(!res.ok) throw new Error((await res.json()).message || "Save failed");
      showAlert("Entry saved!");
      document.getElementById("journalForm").reset();
    } catch(err) { showAlert(err.message); }
  });
}

// ===================== ADMIN PAGE =====================
if(page === "admin") {
  if(sessionStorage.getItem("role") !== "admin") window.location.href = "login.html";

  async function fetchAllEntries() {
    try {
      const res = await fetch("http://localhost:5000/api/journal");
      if(!res.ok) throw new Error("Fetch failed");
      return await res.json();
    } catch(err) { showAlert(err.message); return []; }
  }

  async function renderEntries() {
    const allEntries = await fetchAllEntries();
    const entriesList = document.getElementById("entriesList");
    entriesList.innerHTML = "";
    if(allEntries.length === 0) { entriesList.innerHTML = "<p>No entries found.</p>"; return; }

    allEntries.forEach(ent => {
      const div = document.createElement("div");
      div.className = "entry";
      div.innerHTML = `
        <div class="entry-header" onclick="toggleEntry(this)">
          <input type="checkbox" class="selectEntry" value="${ent._id}" onclick="event.stopPropagation()">
          Week ${ent.week} - ${ent.studentName} (${ent.usn})
        </div>
        <div class="entry-details">
          <strong>${ent.courseCode} - ${ent.courseName}</strong><br>
          Topics: ${ent.topics}<br>
          Summary: ${ent.summary}<br>
          <textarea id="remark-${ent._id}" placeholder="Enter remark...">${ent.remark||""}</textarea>
          <button onclick="saveRemark('${ent._id}')">Save Remark</button>
        </div>
      `;
      entriesList.appendChild(div);
    });
  }

  function toggleEntry(el) {
    const details = el.nextElementSibling;
    details.style.display = details.style.display === "block" ? "none" : "block";
  }

  async function saveRemark(id) {
    const remarkText = document.getElementById(`remark-${id}`).value;
    try {
      const res = await fetch(`http://localhost:5000/api/journal/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ remark: remarkText })
      });
      if(!res.ok) throw new Error((await res.json()).message || "Failed");
      showAlert("Remark saved!");
      renderEntries();
    } catch(err) { showAlert(err.message); }
  }

  async function deleteSelectedEntries() {
    const checkboxes = document.querySelectorAll(".selectEntry:checked");
    if(checkboxes.length === 0){ showAlert("Select at least one entry"); return; }
    if(!confirm(`Delete ${checkboxes.length} entries?`)) return;
    for(let cb of checkboxes){
      await fetch(`http://localhost:5000/api/journal/${cb.value}`, { method: "DELETE" });
    }
    showAlert("Deleted!");
    renderEntries();
  }

  renderEntries();
}
