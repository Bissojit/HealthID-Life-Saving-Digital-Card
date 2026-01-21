"use strict";

// Helper to get element
function getEl(id) {
    const el = document.getElementById(id);
    if (!el) throw new Error(`Missing element: #${id}`);
    return el;
}

// Format DOB 
function formatDOB(dob) {
    if (!dob) return "—";
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const d = new Date(dob);
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

// Collect form data 
function collectProfile() {
    return {
        fullName: getEl("fullName").value.trim(),
        dob: getEl("dob").value,
        bloodType: getEl("bloodType").value,
        language: getEl("language").value.trim(),
        heightWeight: getEl("heightWeight").value.trim(),
        allergies: getEl("allergies").value.trim(),
        medications: getEl("medications").value.trim(),
        conditions: getEl("conditions").value.trim(),
        specialInstructions: getEl("specialInstructions").value.trim(),
        organDonor: getEl("organDonor").value,
        insurance: getEl("insurance").value.trim(),
        ice1Name: getEl("ice1Name").value.trim(),
        ice1Phone: getEl("ice1Phone").value.trim(),
        ice2Name: getEl("ice2Name").value.trim(),
        ice2Phone: getEl("ice2Phone").value.trim(),
        doctorName: getEl("doctorName").value.trim(),
        doctorPhone: getEl("doctorPhone").value.trim(),
        hospital: getEl("hospital").value.trim(),
        nextOfKin: getEl("nextOfKin").value.trim(),
        photoDataUrl: getEl("cardPhoto").src || undefined
    };
}

//  Render preview 
// Render preview
function renderPreview(profile) {
    getEl("cardName").textContent = profile.fullName || "—";
    getEl("cardDOB").textContent = formatDOB(profile.dob);
    getEl("cardBlood").textContent = profile.bloodType || "—";
    getEl("cardLang").textContent = profile.language || "—";
    getEl("cardHeightWeight").textContent = profile.heightWeight || "—";
    getEl("cardAllergies").textContent = profile.allergies || "None";
    getEl("cardMeds").textContent = profile.medications || "None";
    getEl("cardConditions").textContent = profile.conditions || "None";
    getEl("cardSpecialInstructions").textContent = profile.specialInstructions || "—";

    // Include phone numbers in preview
    getEl("cardICE1").textContent = profile.ice1Name 
        ? `${profile.ice1Name} (${profile.ice1Phone || "-"})` 
        : "-";
    getEl("cardICE2").textContent = profile.ice2Name 
        ? `${profile.ice2Name} (${profile.ice2Phone || "-"})` 
        : "-";
    getEl("cardDoctor").textContent = profile.doctorName 
        ? `${profile.doctorName} (${profile.doctorPhone || "-"})` 
        : "-";

    getEl("cardHospital").textContent = profile.hospital || "—";
    getEl("cardNextOfKin").textContent = profile.nextOfKin || "—";
    getEl("cardDonor").textContent = profile.organDonor || "—";
    getEl("cardInsurance").textContent = profile.insurance || "—";

    getEl("cardPhoto").src = profile.photoDataUrl || "";

    generateQR("qrBack", profile);
}


function profileToText(profile) {
    // Helper to format DOB for QR code
    function formatDOBForQR(dob) {
      if (!dob) return "-";
      const months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
      const d = new Date(dob);
      return d.getDate() + " " + months[d.getMonth()] + " " + d.getFullYear();
    }
  
    return `EMERGENCY CARD
  
  Name: ${profile.fullName || "-"}
  DOB: ${formatDOBForQR(profile.dob)}
  Blood Type: ${profile.bloodType || "-"}
  Language: ${profile.language || "-"}
  Height / Weight: ${profile.heightWeight || "-"}
  Allergies: ${profile.allergies || "None"}
  Medications: ${profile.medications || "None"}
  Conditions: ${profile.conditions || "None"}
  Special Instructions: ${profile.specialInstructions || "-"}
  
  Emergency Contact 1: ${profile.ice1Name || "-"}${profile.ice1Phone ? " (" + profile.ice1Phone + ")" : ""}
  Emergency Contact 2: ${profile.ice2Name || "-"}${profile.ice2Phone ? " (" + profile.ice2Phone + ")" : ""}
  Primary Doctor: ${profile.doctorName || "-"}${profile.doctorPhone ? " (" + profile.doctorPhone + ")" : ""}
  Preferred Hospital: ${profile.hospital || "-"}
  Next of Kin: ${profile.nextOfKin || "-"}
  Organ Donor: ${profile.organDonor || "-"}
  Insurance: ${profile.insurance || "-"}`;
  }
  

// QR generation
function generateQR(canvasId, profile) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error("QR canvas not found:", canvasId);
        return;
    }

    const textData = profileToText(profile); // convert to plain text

    QRCode.toCanvas(
        canvas,
        textData, // plain text instead of JSON
        {
            width: 150,
            margin: 1,
            errorCorrectionLevel: "M"
        },
        function (error) {
            if (error) console.error("QR error:", error);
        }
    );
}



// Storage
function saveProfile(profile) {
    localStorage.setItem("emergencyProfile", JSON.stringify(profile));
}

function clearProfileStorage() {
    localStorage.removeItem("emergencyProfile");
}

// Clear all UI 
function clearUI() {
    document.getElementById("profileForm").reset();
    getEl("cardPhoto").src = "";

    const qrBack = document.getElementById("qrBack");
    if (qrBack) {
        const ctx = qrBack.getContext("2d");
        ctx.clearRect(0, 0, qrBack.width, qrBack.height);
    }

    [
        "cardName","cardDOB","cardBlood","cardLang","cardHeightWeight",
        "cardAllergies","cardMeds","cardConditions","cardSpecialInstructions",
        "cardICE1","cardICE2","cardDoctor","cardHospital",
        "cardNextOfKin","cardDonor","cardInsurance"
    ].forEach(id => getEl(id).textContent = "—");
}


// Restore profile
function restoreProfile() {
    const saved = localStorage.getItem("emergencyProfile");
    if (!saved) {
        clearUI();
        return;
    }
    try {
        const profile = JSON.parse(saved);
        Object.keys(profile).forEach((key) => {
            const el = document.getElementById(key);
            if (!el) return;
            if ("value" in el) el.value = profile[key] || "";
            if (el.tagName === "IMG") el.src = profile.photoDataUrl || "";
        });
        renderPreview(profile);
    } catch {
        clearProfileStorage();
        clearUI();
    }
}

// Photo upload
getEl("photoFile").addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => getEl("cardPhoto").src = reader.result;
    reader.readAsDataURL(file);
});

// Save button
getEl("saveBtn").addEventListener("click", () => {
    const profile = collectProfile();
    saveProfile(profile);
    renderPreview(profile);
    alert("Profile saved!");
});

// Clear All button
getEl("clearBtn").addEventListener("click", () => {
    clearProfileStorage();
    clearUI();
    alert("All fields cleared!");
});

// Export
getEl("printBtn").addEventListener("click", () => {
    html2canvas(getEl("cardCanvas"), { scale: 1 }).then((canvas) => {
        const win = window.open();
        if (!win) return;
        win.document.write(`<img src="${canvas.toDataURL()}" onload="window.print();window.close()">`);
    });
});

getEl("pngBtn").addEventListener("click", () => {
    html2canvas(getEl("cardCanvas")).then((canvas) => {
        const link = document.createElement("a");
        link.download = "emergency-card.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
    });
});

// Auto restore on page load
document.addEventListener("DOMContentLoaded", restoreProfile);
