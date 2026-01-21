// EmergencyProfile type
interface EmergencyProfile {
  fullName: string;
  dob: string;
  bloodType: string;
  language: string;
  heightWeight: string;
  allergies: string;
  medications: string;
  conditions: string;
  specialInstructions: string;
  organDonor: string;
  insurance: string;
  ice1Name: string;
  ice1Phone: string;
  ice2Name: string;
  ice2Phone: string;
  doctorName: string;
  doctorPhone: string;
  hospital: string;
  nextOfKin: string;
  photoDataUrl?: string;
}

// QRCode & html2canvas
declare const QRCode: any;
declare const html2canvas: any;

//  Helper to get element
function getEl<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id) as T | null;
  if (!el) throw new Error(`Missing element: #${id}`);
  return el;
}

// Format DOB
function formatDOB(dob: string): string {
  if (!dob) return "—";
  const months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
  const date = new Date(dob);
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

// Collect profile 
function collectProfile(): EmergencyProfile {
  return {
    fullName: getEl<HTMLInputElement>("fullName").value.trim(),
    dob: getEl<HTMLInputElement>("dob").value,
    bloodType: getEl<HTMLSelectElement>("bloodType").value,
    language: getEl<HTMLInputElement>("language").value.trim(),
    heightWeight: getEl<HTMLInputElement>("heightWeight").value.trim(),
    allergies: getEl<HTMLInputElement>("allergies").value.trim(),
    medications: getEl<HTMLInputElement>("medications").value.trim(),
    conditions: getEl<HTMLInputElement>("conditions").value.trim(),
    specialInstructions: getEl<HTMLInputElement>("specialInstructions").value.trim(),
    organDonor: getEl<HTMLSelectElement>("organDonor").value,
    insurance: getEl<HTMLInputElement>("insurance").value.trim(),
    ice1Name: getEl<HTMLInputElement>("ice1Name").value.trim(),
    ice1Phone: getEl<HTMLInputElement>("ice1Phone").value.trim(),
    ice2Name: getEl<HTMLInputElement>("ice2Name").value.trim(),
    ice2Phone: getEl<HTMLInputElement>("ice2Phone").value.trim(),
    doctorName: getEl<HTMLInputElement>("doctorName").value.trim(),
    doctorPhone: getEl<HTMLInputElement>("doctorPhone").value.trim(),
    hospital: getEl<HTMLInputElement>("hospital").value.trim(),
    nextOfKin: getEl<HTMLInputElement>("nextOfKin").value.trim(),
    photoDataUrl: getEl<HTMLImageElement>("cardPhoto").src || undefined
  };
}

// Convert profile to plain text for QR
function profileToText(profile: EmergencyProfile): string {
  return `
EMERGENCY CARD

Name: ${profile.fullName || "-"}
DOB: ${profile.dob || "-"}
Blood Type: ${profile.bloodType || "-"}
Language: ${profile.language || "-"}
Height / Weight: ${profile.heightWeight || "-"}
Allergies: ${profile.allergies || "None"}
Medications: ${profile.medications || "None"}
Conditions: ${profile.conditions || "None"}
Special Instructions: ${profile.specialInstructions || "-"}

Emergency Contact 1: ${profile.ice1Name || "-"}${profile.ice1Phone ? ` (${profile.ice1Phone})` : ""}
Emergency Contact 2: ${profile.ice2Name || "-"}${profile.ice2Phone ? ` (${profile.ice2Phone})` : ""}
Primary Doctor: ${profile.doctorName || "-"}${profile.doctorPhone ? ` (${profile.doctorPhone})` : ""}
Preferred Hospital: ${profile.hospital || "-"}
Next of Kin: ${profile.nextOfKin || "-"}
Organ Donor: ${profile.organDonor || "-"}
Insurance: ${profile.insurance || "-"}
`;
}

// Render live preview
function renderPreview(profile: EmergencyProfile) {
  const fields: { [key: string]: string } = {
    cardName: profile.fullName || "—",
    cardDOB: formatDOB(profile.dob),
    cardBlood: profile.bloodType || "—",
    cardLang: profile.language || "—",
    cardHeightWeight: profile.heightWeight || "—",
    cardAllergies: profile.allergies || "None",
    cardMeds: profile.medications || "None",
    cardConditions: profile.conditions || "None",
    cardSpecialInstructions: profile.specialInstructions || "—",
    cardICE1: profile.ice1Name || "—",
    cardICE2: profile.ice2Name || "—",
    cardDoctor: profile.doctorName || "—",
    cardHospital: profile.hospital || "—",
    cardNextOfKin: profile.nextOfKin || "—",
    cardDonor: profile.organDonor || "—",
    cardInsurance: profile.insurance || "—"
  };

  Object.entries(fields).forEach(([id, value]) => {
    getEl<HTMLElement>(id).textContent = value;
  });

  const photoEl = getEl<HTMLImageElement>("cardPhoto");
  if (profile.photoDataUrl) photoEl.src = profile.photoDataUrl;
  else photoEl.src = "";

  generateQR("qrFront", profile);
  generateQR("qrBack", profile);
}

// Generate QR code
function generateQR(containerId: string, profile: EmergencyProfile) {
  const container = getEl<HTMLDivElement>(containerId);
  container.innerHTML = "";
  try {
    QRCode.toCanvas(
      container,
      profileToText(profile),
      { width: 150, margin: 1, errorCorrectionLevel: "M" },
      (error: Error | null) => {
        if (error) console.error(`QR generation failed (${containerId}):`, error);
      }
    );
  } catch (err) {
    console.error(`QR generation failed (${containerId}):`, err);
  }
}

// Save / Restore profile
function saveProfile(profile: EmergencyProfile) {
  localStorage.setItem("emergencyProfile", JSON.stringify(profile));
}

function restoreProfile() {
  const saved = localStorage.getItem("emergencyProfile");
  if (!saved) return;
  try {
    const profile: EmergencyProfile = JSON.parse(saved);
    Object.keys(profile).forEach((key) => {
      const el = document.getElementById(key);
      if (!el) return;

      // Narrow type properly
      if (el instanceof HTMLInputElement || el instanceof HTMLSelectElement) {
        (el as HTMLInputElement | HTMLSelectElement).value = (profile as any)[key] || "";
      } else if (el instanceof HTMLImageElement && (profile as any).photoDataUrl) {
        el.src = (profile as any).photoDataUrl;
      }
    });
    renderPreview(profile);
  } catch {
    console.warn("Failed to parse saved profile");
  }
}

// Photo upload
getEl<HTMLInputElement>("photoFile").addEventListener("change", (e) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => getEl<HTMLImageElement>("cardPhoto").src = reader.result as string;
  reader.readAsDataURL(file);
});

// Buttons
// Save
getEl<HTMLButtonElement>("saveBtn").addEventListener("click", () => {
  const profile = collectProfile();
  saveProfile(profile);
  renderPreview(profile);
  alert("Profile saved!");
});

// Clear
getEl<HTMLButtonElement>("clearBtn").addEventListener("click", () => {
  getEl<HTMLFormElement>("profileForm").reset();
  renderPreview({
    fullName: "", dob: "", bloodType: "", language: "", heightWeight: "",
    allergies: "", medications: "", conditions: "", specialInstructions: "",
    organDonor: "", insurance: "", ice1Name: "", ice1Phone: "", ice2Name: "",
    ice2Phone: "", doctorName: "", doctorPhone: "", hospital: "", nextOfKin: ""
  });
  getEl<HTMLImageElement>("cardPhoto").src = "";
  getEl<HTMLDivElement>("qrFront").innerHTML = "";
  getEl<HTMLDivElement>("qrBack").innerHTML = "";
  localStorage.removeItem("emergencyProfile");
  alert("All fields cleared!");
});

// Print
getEl<HTMLButtonElement>("printBtn").addEventListener("click", () => {
  html2canvas(getEl<HTMLDivElement>("cardCanvas"), { scale: 1 }).then((canvas: HTMLCanvasElement) => {
    const win = window.open();
    if (!win) return;
    win.document.write(`<img src="${canvas.toDataURL()}" onload="window.print();window.close()">`);
  });
});

// Download PNG
getEl<HTMLButtonElement>("pngBtn").addEventListener("click", () => {
  html2canvas(getEl<HTMLDivElement>("cardCanvas")).then((canvas: HTMLCanvasElement) => {
    const link = document.createElement("a");
    link.download = "emergency-card.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  });
});

// Auto restore
document.addEventListener("DOMContentLoaded", restoreProfile);
