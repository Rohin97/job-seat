const API_URL = "http://127.0.0.1:8000/api/v1/jobs";

// Window Element
window.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get(null, data => {
    for (const key in data) {
      const el = document.getElementById(key);
      if (el) {
        el.value = data[key];
      }
    }
  });
});

// Modal Elements
const gridContainer = document.getElementById("gridContainer");
const companyJobEntry = document.getElementById("company");
const roleJobEntry = document.getElementById("role");
const statusJobEntry = document.getElementById("status");
const urlJobEntry = document.getElementById("url");
const locationJobEntry = document.getElementById("location");
const industryJobEntry = document.getElementById("industry");

// Buttons
const btnAdd = document.getElementById("btn_add");
const btnClear = document.getElementById("btn_clear");

// Event listeners
gridContainer.addEventListener("change", function(e) {
  e.preventDefault();
  if (e.target) {
    if (e.target.id === "company") {
      chrome.storage.local.set({ company: e.target.value });
    } else if (e.target.id === "role") {
      chrome.storage.local.set({ role: e.target.value });
    } else if (e.target.id === "status") {
      chrome.storage.local.set({ status: e.target.value });
    } else if (e.target.id === "url") {
      chrome.storage.local.set({ url: e.target.value });
    } else if (e.target.id === "location") {
      chrome.storage.local.set({ jobLocation: e.target.value });
    } else if (e.target.id === "industry") {
      chrome.storage.local.set({ industry: e.target.value });
    }
  }
});

btnAdd.addEventListener("click", async function(e) {
  e.preventDefault();
  const jobEntry = {
    company: companyJobEntry.value,
    role: roleJobEntry.value,
    status: statusJobEntry.value,
    jobUrl: urlJobEntry.value,
    location: locationJobEntry.value,
    industry: industryJobEntry.value
  };
  await addJob(jobEntry);
  clear();
});

btnClear.addEventListener("click", clear);

function clear() {
  chrome.storage.local.clear();
  companyJobEntry.value = roleJobEntry.value = urlJobEntry.value = "";
  statusJobEntry.value = "Applied📄";
  locationJobEntry.value = "NYC";
  industryJobEntry.value = "Not Specified";
}

// API calls
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
  } catch (err) {
    alert(err);
    console.error(err.message);
  }
}
