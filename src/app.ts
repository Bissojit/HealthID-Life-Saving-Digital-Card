// --- EmergencyProfile type ---
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

// --- QRCode & html2canvas ---
declare const QRCode: any;
declare const html2canvas: any;

// --- Helper to get element ---
function getEl<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id) as T | null;
  if (!el) throw new Error(`Missing element: #${id}`);
  return el;
}

function formatDOB(dob: string): string {
  if (!dob) return "—";
  const months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
  const date = new Date(dob);
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

// --- Collect profile ---
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
    photoDataUrl: getEl<HTMLImageElement>("cardPhoto").src || undefined,
  };
}

// --- Render live preview ---
function renderPreview(profile: EmergencyProfile) {
  getEl<HTMLElement>("cardName").textContent = profile.fullName || "—";
  getEl<HTMLElement>("cardDOB").textContent = formatDOB(profile.dob);
  getEl<HTMLElement>("cardBlood").textContent = profile.bloodType || "—";
  getEl<HTMLElement>("cardLang").textContent = profile.language || "—";
  getEl<HTMLElement>("cardHeightWeight").textContent = profile.heightWeight || "—";
  getEl<HTMLElement>("cardAllergies").textContent = profile.allergies || "None";
  getEl<HTMLElement>("cardMeds").textContent = profile.medications || "None";
  getEl<HTMLElement>("cardConditions").textContent = profile.conditions || "None";
  getEl<HTMLElement>("cardSpecialInstructions").textContent = profile.specialInstructions || "—";
  getEl<HTMLElement>("cardICE1").textContent = `${profile.ice1Name} (${profile.ice1Phone})` || "—";
  getEl<HTMLElement>("cardICE2").textContent = `${profile.ice2Name} (${profile.ice2Phone})` || "—";
  getEl<HTMLElement>("cardDoctor").textContent = `${profile.doctorName} (${profile.doctorPhone})` || "—";
  getEl<HTMLElement>("cardHospital").textContent = profile.hospital || "—";
  getEl<HTMLElement>("cardNextOfKin").textContent = profile.nextOfKin || "—";
  getEl<HTMLElement>("cardDonor").textContent = profile.organDonor || "—";
  getEl<HTMLElement>("cardInsurance").textContent = profile.insurance || "—";

  if (profile.photoDataUrl) {
    getEl<HTMLImageElement>("cardPhoto").src = profile.photoDataUrl;
  } else {
    getEl<HTMLImageElement>("cardPhoto").src = "";
  }

  // --- Generate front QR code ---
  const qrFrontContainer = getEl<HTMLDivElement>("qrFront");
  qrFrontContainer.innerHTML = ""; // clear previous
  try {
    QRCode.toCanvas(
      qrFrontContainer,
      JSON.stringify(profile),
      { width: 150, margin: 1, errorCorrectionLevel: "M" },
      (error: Error | null) => {
        if (error) console.error("Front QR generation failed:", error);
      }
    );
  } catch (err) {
    console.error("Front QR generation failed", err);
  }

  // --- Generate back QR code ---
  const qrBackContainer = getEl<HTMLDivElement>("qrBack");
  qrBackContainer.innerHTML = ""; // clear previous
  try {
    QRCode.toCanvas(
      qrBackContainer,
      JSON.stringify(profile),
      { width: 150, margin: 1, errorCorrectionLevel: "M" },
      (error: Error | null) => {
        if (error) console.error("Back QR generation failed:", error);
      }
    );
  } catch (err) {
    console.error("Back QR generation failed", err);
  }
}

// --- Save / Restore profile ---
function saveProfile(profile: EmergencyProfile) {
  localStorage.setItem("emergencyProfile", JSON.stringify(profile));
}

function restoreProfile() {
  const saved = localStorage.getItem("emergencyProfile");
  if (!saved) return;
  try {
    const profile = JSON.parse(saved) as EmergencyProfile;
    Object.keys(profile).forEach((key) => {
      const el = document.getElementById(key) as HTMLInputElement | HTMLSelectElement | HTMLImageElement;
      if (el && "value" in el) (el as any).value = (profile as any)[key];
      else if (el && el.tagName === "IMG" && (profile as any).photoDataUrl) el.src = (profile as any).photoDataUrl;
    });
    renderPreview(profile);
  } catch {
    console.warn("Failed to parse saved profile");
  }
}

// --- Photo upload ---
getEl<HTMLInputElement>("photoFile").addEventListener("change", (e) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    getEl<HTMLImageElement>("cardPhoto").src = reader.result as string;
  };
  reader.readAsDataURL(file);
});

// --- Print / PNG ---
getEl<HTMLButtonElement>("printBtn").addEventListener("click", () => {
  html2canvas(getEl<HTMLElement>("cardCanvas"), { scale: 1 }).then((canvas: HTMLCanvasElement) => {
    const imgData = canvas.toDataURL("image/png");
    const win = window.open();
    if (!win) return;
    win.document.write(`<img src="${imgData}" onload="window.print();window.close()" />`);
  });
});


getEl<HTMLButtonElement>("pngBtn").addEventListener("click", () => {
  html2canvas(getEl<HTMLElement>("cardCanvas")).then((canvas: HTMLCanvasElement) => {
    const link = document.createElement("a");
    link.download = "emergency-card.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  });
});

// --- Save button ---
getEl<HTMLButtonElement>("saveBtn").addEventListener("click", () => {
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
getEl<HTMLButtonElement>("clearBtn").addEventListener("click", () => {
  // Clear form inputs
  (document.getElementById("profileForm") as HTMLFormElement).reset();

  // Clear preview
  const fields = [
    "cardName","cardDOB","cardBlood","cardLang","cardHeightWeight",
    "cardAllergies","cardMeds","cardConditions","cardSpecialInstructions",
    "cardICE1","cardICE2","cardDoctor","cardHospital","cardNextOfKin",
    "cardDonor","cardInsurance"
  ];
  fields.forEach(id => getEl<HTMLElement>(id).textContent = "—");

  // Clear photo
  getEl<HTMLImageElement>("cardPhoto").src = "";

  // Clear QR codes
  getEl<HTMLDivElement>("qrFront").innerHTML = "";
  getEl<HTMLDivElement>("qrBack").innerHTML = "";

  // Remove saved data
  localStorage.removeItem("emergencyProfile");

  alert("All fields cleared!");
});
