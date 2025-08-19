"use strict";
// --- Helper to get element ---
function getEl(id) {
    const el = document.getElementById(id);
    if (!el)
        throw new Error(`Missing element: #${id}`);
    return el;
}
function formatDOB(dob) {
    if (!dob)
        return "—";
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const date = new Date(dob);
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
}
// --- Collect profile ---
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
        photoDataUrl: getEl("cardPhoto").src || undefined,
    };
}
// --- Render live preview ---
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
    getEl("cardICE1").textContent = `${profile.ice1Name} (${profile.ice1Phone})` || "—";
    getEl("cardICE2").textContent = `${profile.ice2Name} (${profile.ice2Phone})` || "—";
    getEl("cardDoctor").textContent = `${profile.doctorName} (${profile.doctorPhone})` || "—";
    getEl("cardHospital").textContent = profile.hospital || "—";
    getEl("cardNextOfKin").textContent = profile.nextOfKin || "—";
    getEl("cardDonor").textContent = profile.organDonor || "—";
    getEl("cardInsurance").textContent = profile.insurance || "—";
    if (profile.photoDataUrl) {
        getEl("cardPhoto").src = profile.photoDataUrl;
    }
    else {
        getEl("cardPhoto").src = "";
    }
    // --- Generate front QR code ---
    const qrFrontContainer = getEl("qrFront");
    qrFrontContainer.innerHTML = ""; // clear previous
    try {
        QRCode.toCanvas(qrFrontContainer, JSON.stringify(profile), { width: 150, margin: 1, errorCorrectionLevel: "M" }, (error) => {
            if (error)
                console.error("Front QR generation failed:", error);
        });
    }
    catch (err) {
        console.error("Front QR generation failed", err);
    }
    // --- Generate back QR code ---
    const qrBackContainer = getEl("qrBack");
    qrBackContainer.innerHTML = ""; // clear previous
    try {
        QRCode.toCanvas(qrBackContainer, JSON.stringify(profile), { width: 150, margin: 1, errorCorrectionLevel: "M" }, (error) => {
            if (error)
                console.error("Back QR generation failed:", error);
        });
    }
    catch (err) {
        console.error("Back QR generation failed", err);
    }
}
// --- Save / Restore profile ---
function saveProfile(profile) {
    localStorage.setItem("emergencyProfile", JSON.stringify(profile));
}
function restoreProfile() {
    const saved = localStorage.getItem("emergencyProfile");
    if (!saved)
        return;
    try {
        const profile = JSON.parse(saved);
        Object.keys(profile).forEach((key) => {
            const el = document.getElementById(key);
            if (el && "value" in el)
                el.value = profile[key];
            else if (el && el.tagName === "IMG" && profile.photoDataUrl)
                el.src = profile.photoDataUrl;
        });
        renderPreview(profile);
    }
    catch {
        console.warn("Failed to parse saved profile");
    }
}
// --- Photo upload ---
getEl("photoFile").addEventListener("change", (e) => {
    var _a;
    const file = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0];
    if (!file)
        return;
    const reader = new FileReader();
    reader.onload = () => {
        getEl("cardPhoto").src = reader.result;
    };
    reader.readAsDataURL(file);
});
// --- Print / PNG ---
getEl("printBtn").addEventListener("click", () => {
    html2canvas(getEl("cardCanvas"), { scale: 1 }).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const win = window.open();
        if (!win)
            return;
        win.document.write(`<img src="${imgData}" onload="window.print();window.close()" />`);
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
// --- Save button ---
getEl("saveBtn").addEventListener("click", () => {
    const profile = collectProfile();
    saveProfile(profile);
    renderPreview(profile);
    alert("Profile saved!");
});
// --- Auto restore ---
document.addEventListener("DOMContentLoaded", () => {
    restoreProfile();
});
// --- Clear All ---
getEl("clearBtn").addEventListener("click", () => {
    // Clear form inputs
    document.getElementById("profileForm").reset();
    // Clear preview
    const fields = [
        "cardName", "cardDOB", "cardBlood", "cardLang", "cardHeightWeight",
        "cardAllergies", "cardMeds", "cardConditions", "cardSpecialInstructions",
        "cardICE1", "cardICE2", "cardDoctor", "cardHospital", "cardNextOfKin",
        "cardDonor", "cardInsurance"
    ];
    fields.forEach(id => getEl(id).textContent = "—");
    // Clear photo
    getEl("cardPhoto").src = "";
    // Clear QR codes
    getEl("qrFront").innerHTML = "";
    getEl("qrBack").innerHTML = "";
    // Remove saved data
    localStorage.removeItem("emergencyProfile");
    alert("All fields cleared!");
});
