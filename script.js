const API_URL = "http://127.0.0.1:8000/api/v1/jobs";
const jobData = [
  {
    company: "OpenAI",
    role: "Backend Engineer",
    status: "Interviewing",
    url: "https://openai.com/careers/backend",
    languages: ["Python", "Go"],
    dateApplied: "2025-07-10",
    dateUpdated: "2025-07-15",
    location: "Remote",
    industry: "AI",
    notes: "2 rounds completed. Waiting for final."
  },
  {
    company: "Stripe",
    role: "Software Engineer",
    status: "Applied",
    url: "https://stripe.com/jobs",
    languages: ["Java", "Scala"],
    dateApplied: "2025-07-12",
    dateUpdated: "2025-07-13",
    location: "San Francisco",
    industry: "Fintech",
    notes: "Heard back from recruiter. Waiting for screen."
  }
];

//Table Elements
const tableHead = document.getElementById("tableHead");
const jobTable = document.getElementById("jobTable");
const selectAllCheckbox = document.getElementById("select-all");

// Job Modal Elements
const jobModal = document.getElementById("jobModal");
const companyJobEntry = document.getElementById("company");
const roleJobEntry = document.getElementById("role");
const statusJobEntry = document.getElementById("status");
const urlJobEntry = document.getElementById("url");
const scheduledAt = document.getElementById("scheduledAt");
const dateAppliedJobEntry = document.getElementById("dateApplied");
const locationJobEntry = document.getElementById("location");
const industryJobEntry = document.getElementById("industry");
const notesJobEntry = document.getElementById("notes");

// Notes Modal Elements
const notesModal = document.getElementById("notesModal");
const notesText = document.getElementById("notesText");
const notesClose = document.getElementById("notesModalClose");

// Buttons
const btnAdd = document.getElementById("btn_add");
const btnUpdate = document.getElementById("btn_update");
const btnDelete = document.getElementById("btn_del");
const btnAddJobEntry = document.getElementById("btn_add--job_entry");
const btnUpdateJobEntry = document.getElementById("btn_update--job_entry");
const btnCancel = document.getElementById("btn_cancel--job_entry");

// Data Structures and Variables
const selectedJobs = new Set();
let jobIdInFocus;
let sortBy = "";
let prevSortById = "";
let asc = false;

//Event Listeners
tableHead.addEventListener("click", async function(e) {
  if (e.target && e.target.id !== "" && e.target.id !== "select-all") {
    let target = e.target.id;
    target = target.substring(0, target.length - 3);
    if (target === sortBy && asc) {
      await fetchJobs(`${API_URL}/?sort=-${target}`);
      asc = false;
      e.target.innerHTML = e.target.innerHTML + "↑";
      return;
    }
    await fetchJobs(`${API_URL}/?sort=${target}`);
    sortBy = target;
    prevSortById = e.target.id;
    asc = true;
    e.target.innerHTML = e.target.innerHTML + "↓";
  }
});

selectAllCheckbox.addEventListener("change", function(e) {
  const checkboxes = document.querySelectorAll(".row-checkbox");
  checkboxes.forEach(cb => {
    cb.checked = selectAllCheckbox.checked;
    checkboxToSet(cb);
  });
});

jobTable.addEventListener("change", function(e) {
  if (e.target && e.target.classList.contains("row-checkbox")) {
    checkboxToSet(e.target);
  }
});

jobTable.addEventListener("click", async function(e) {
  if (e.target && e.target.classList.contains("row-notes")) {
    const jobId = e.target.dataset.id;
    const job = await fetchJob(jobId);
    notesText.textContent = job.interviewNotes;
    notesModal.classList.toggle("hidden");
  }
});

notesClose.addEventListener("click", closeNotes);

window.addEventListener("click", e => {
  if (e.target === notesModal) {
    closeNotes();
  }
});

btnAdd.addEventListener("click", function(e) {
  e.preventDefault();
  setWriteFields();
  btnAddJobEntry.classList.remove("hidden");
  jobModal.classList.toggle("hidden");
});

btnUpdate.addEventListener("click", async function(e) {
  e.preventDefault();
  try {
    if (selectedJobs.size !== 1) {
      throw new Error(
        "Please select the job you want to update. One at a time."
      );
    }
    const it = selectedJobs.values();
    const job = await fetchJob(it.next().value);
    renderJobDetails(job);
    setReadOnlyFields();
    btnUpdateJobEntry.classList.remove("hidden");
    jobModal.classList.toggle("hidden");
  } catch (err) {
    alert(err.message);
    console.error(err);
  }
});

btnDelete.addEventListener("click", function(e) {
  e.preventDefault();
  try {
    if (selectedJobs.size === 0) {
      throw new Error("Please select the job(s) you want to delete.");
    }
    const jobs = { ids: [...selectedJobs] };
    confirm(
      `Confirming to delete ${selectedJobs.size} job(s). Press OK to proceed.`
    )
      ? deleteJobs(jobs)
      : alert("Delete job canceled.");
  } catch (err) {
    alert(err.message);
    console.error(err);
  }
});

btnAddJobEntry.addEventListener("click", addJobEntryModal);

btnUpdateJobEntry.addEventListener("click", updateJobEntryModal);

btnCancel.addEventListener("click", closeJobEntryModal);

//////////////////////////////////////////////////////////////////////////////////////////////////////////

// Dynamic JS
async function addJobEntryModal(e) {
  e.preventDefault();
  const jobEntry = {
    company: companyJobEntry.value,
    role: roleJobEntry.value,
    status: statusJobEntry.value,
    jobUrl: urlJobEntry.value,
    scheduledAt: scheduledAt.value,
    dateApplied: dateAppliedJobEntry.value,
    dateUpdated: Date.now(),
    location: locationJobEntry.value,
    industry: industryJobEntry.value,
    interviewNotes: notesJobEntry.value
  };
  await addJob(jobEntry);
}

async function updateJobEntryModal(e) {
  e.preventDefault();
  const jobEntry = {
    status: statusJobEntry.value,
    scheduledAt: scheduledAt.value,
    dateUpdated: Date.now(),
    industry:
      industryJobEntry.value === "" ? "Not specified" : industryJobEntry.value,
    interviewNotes: notesJobEntry.value
  };
  await updateJob(jobEntry);
}

function closeJobEntryModal() {
  clearJobEntryFields();
  jobModal.classList.toggle("hidden");
  btnAddJobEntry.classList.add("hidden");
  btnUpdateJobEntry.classList.add("hidden");
}

// Helper Functions
function clearJobEntryFields() {
  companyJobEntry.value = roleJobEntry.value = urlJobEntry.value = dateAppliedJobEntry.value = scheduledAt.value = industryJobEntry.value = notesJobEntry.value =
    "";
  locationJobEntry.value = "NYC";
  statusJobEntry.value = "Applied📄";
}

function renderJobDetails(job) {
  jobIdInFocus = job.id;
  companyJobEntry.value = job.company;
  roleJobEntry.value = job.role;
  urlJobEntry.value = job.jobUrl;
  scheduledAt.value = job.scheduledAt;
  dateAppliedJobEntry.value = formatDate(job.dateApplied);
  locationJobEntry.value = job.location;
  industryJobEntry.value = job.industry;
  notesJobEntry.value = !job.interviewNotes ? "" : job.interviewNotes;
  statusJobEntry.value = job.status;
}

function formatDate(date) {
  date = new Date(date);
  month = "" + (date.getMonth() + 1);
  day = "" + date.getDate();
  return `${date.getFullYear()}-${month.length === 1 ? `0${month}` : month}-${
    day.length === 1 ? `0${day}` : day
  }`;
}

function checkboxToSet(cb) {
  const jobId = cb.dataset.id;
  if (cb.checked) {
    selectedJobs.add(jobId);
  } else {
    selectAllCheckbox.checked = false; // all checkboxes are not selected if even one is not selected
    selectedJobs.delete(jobId);
  }
}

function setReadOnlyFields() {
  companyJobEntry.setAttribute("readonly", "true");
  urlJobEntry.setAttribute("readonly", "true");
  locationJobEntry.setAttribute("readonly", "true");
}

function setWriteFields() {
  companyJobEntry.removeAttribute("readonly");
  urlJobEntry.removeAttribute("readonly");
  locationJobEntry.removeAttribute("readonly");
}

function closeNotes() {
  notesModal.classList.toggle("hidden");
}

// API calls
async function fetchJobs(api = API_URL) {
  try {
    const res = await fetch(api);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data);
    }
    const jobs = data.data.jobs;
    // Reset sort
    if (prevSortById) {
      const prevSortEl = document.getElementById(prevSortById);
      let prevLabel = prevSortEl.innerHTML;
      prevSortEl.innerHTML = prevLabel.substring(0, prevLabel.length - 1);
    }
    jobTable.replaceChildren();
    selectedJobs.clear();
    let count = 0;
    jobs.forEach(job => {
      const tableRow = document.createElement("tr");
      tableRow.className = "hover:bg-gray-50";

      tableRow.innerHTML = `
        <td class="px-4 py-3"><input type="checkbox" class="row-checkbox" data-id="${
          job.id
        }" /></td>
        <td class="px-4 py-3">${++count}</td>
        <td class="px-4 py-3">${job.company}</td>
        <td class="px-4 py-3">${job.role}</td>
        <td class="px-4 py-3">${job.status}</td>
        <td class="px-4 py-3"><a href="${
          job.url
        }" class="text-blue-500 underline" target="_blank">Link</a></td>
        <td class="px-4 py-3">${formatDate(job.dateApplied)}</td>
        <td class="px-4 py-3">${
          !job.scheduledAt ? "N/A" : formatDate(job.scheduledAt)
        }</td>
        <td class="px-4 py-3">${job.location}</td>
        <td class="px-4 py-3">${job.industry}</td>
        <td class="px-4 py-3">${formatDate(job.dateUpdated)}</td>
        <td data-id = ${job.id} ${
        !job.interviewNotes
          ? 'class="px-4 py-3">'
          : 'class="row-notes hover:opacity-60 px-4 py-3">📝'
      }</td>
      `;
      jobTable.appendChild(tableRow);
    });
  } catch (err) {
    alert(err.message);
    console.error(err.message);
  }
}

async function fetchJob(id) {
  try {
    const res = await fetch(`${API_URL}/${id}`);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data);
    }
    job = data.data.job;
    return job;
  } catch (err) {
    alert(err);
    console.error(err.message);
  }
}

async function addJob(job) {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify(job)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message);
    }
    closeJobEntryModal();
    await fetchJobs();
  } catch (err) {
    alert(err);
    console.error(err.message);
  }
}

async function updateJob(job) {
  try {
    const res = await fetch(`${API_URL}/${jobIdInFocus}`, {
      method: "PATCH",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify(job)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message);
    }
    closeJobEntryModal();
    await fetchJobs();
  } catch (err) {
    alert(err);
    console.error(err.message);
  }
}

async function deleteJobs(jobs) {
  try {
    const res = await fetch(`${API_URL}/bulk-delete`, {
      method: "DELETE",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify(jobs)
    });
    if (!res.ok) {
      throw new Error(data.message);
    }
    const data = await res.json();
    selectAllCheckbox.checked = false;
    await fetchJobs();
    alert(`${data.data.jobsDeleted} job(s) deleted successfully.😁`);
  } catch (err) {
    alert(err);
    console.error(err.message);
  }
}

fetchJobs();
