// ============================================================
// EMUNÁ ADMIN · Configurações
// ============================================================
import { initAdminLayout } from "./admin-layout.js";
import { showToast } from "./admin-toast.js";
import { getStoreSettings, saveStoreSettings } from "../../js/firestore-service.js";
import { uploadImageToImgBB } from "../../js/imgbb-upload.js";

const $ = (sel, ctx = document) => ctx.querySelector(sel);

let currentAboutImage = "";

function renderAboutImageThumb() {
  const wrap = $("#st-about-image-thumb");
  wrap.innerHTML = currentAboutImage
    ? `<div class="image-thumb"><img src="${currentAboutImage}" alt="" /><button type="button" aria-label="Remover">×</button></div>`
    : "";
  wrap.querySelector("button")?.addEventListener("click", () => {
    currentAboutImage = "";
    renderAboutImageThumb();
  });
}

async function handleAboutImageUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  const statusEl = $("#st-about-upload-status");
  statusEl.className = "upload-status";
  statusEl.textContent = "Enviando foto…";
  try {
    currentAboutImage = await uploadImageToImgBB(file);
    renderAboutImageThumb();
    statusEl.textContent = "Foto enviada com sucesso.";
    setTimeout(() => (statusEl.textContent = ""), 2500);
  } catch (err) {
    statusEl.className = "upload-status is-error";
    statusEl.textContent = err.message;
  }
  e.target.value = "";
}

function fillForm(s) {
  $("#st-store-name").value = s.storeName || "";
  $("#st-email").value = s.email || "";
  $("#st-phone").value = s.phone || "";
  $("#st-whatsapp").value = s.whatsapp || "";
  $("#st-address").value = s.address || "";
  $("#st-logo").value = s.logo || "";
  $("#st-favicon").value = s.favicon || "";
  $("#st-instagram").value = s.instagram || "";
  $("#st-facebook").value = s.facebook || "";
  $("#st-about-eyebrow").value = s.aboutEyebrow || "";
  $("#st-about-title").value = s.aboutTitle || "";
  $("#st-about-text").value = s.aboutText || "";
  currentAboutImage = s.aboutImage || "";
  renderAboutImageThumb();
  $("#st-seo-title").value = s.seoTitle || "";
  $("#st-seo-desc").value = s.seoDescription || "";
  $("#st-ga").value = s.googleAnalytics || "";
  $("#st-gtm").value = s.googleTagManager || "";
  $("#st-pixel").value = s.metaPixel || "";
  $("#st-privacy").value = s.privacyPolicyText || "";
  $("#st-returns").value = s.returnsPolicyText || "";
}

function readForm() {
  return {
    storeName: $("#st-store-name").value.trim(),
    email: $("#st-email").value.trim(),
    phone: $("#st-phone").value.trim(),
    whatsapp: $("#st-whatsapp").value.trim(),
    address: $("#st-address").value.trim(),
    logo: $("#st-logo").value.trim(),
    favicon: $("#st-favicon").value.trim(),
    instagram: $("#st-instagram").value.trim(),
    facebook: $("#st-facebook").value.trim(),
    aboutEyebrow: $("#st-about-eyebrow").value.trim(),
    aboutTitle: $("#st-about-title").value.trim(),
    aboutText: $("#st-about-text").value.trim(),
    aboutImage: currentAboutImage,
    seoTitle: $("#st-seo-title").value.trim(),
    seoDescription: $("#st-seo-desc").value.trim(),
    googleAnalytics: $("#st-ga").value.trim(),
    googleTagManager: $("#st-gtm").value.trim(),
    metaPixel: $("#st-pixel").value.trim(),
    privacyPolicyText: $("#st-privacy").value.trim(),
    returnsPolicyText: $("#st-returns").value.trim(),
  };
}

async function init() {
  await initAdminLayout("configuracoes", "Configurações");
  const settings = await getStoreSettings();
  fillForm(settings);

  $("#settings-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    await saveStoreSettings(readForm());
    showToast("Configurações salvas.");
  });

  $("#st-about-image-upload").addEventListener("change", handleAboutImageUpload);
}

init();
