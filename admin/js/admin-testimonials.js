// ============================================================
// EMUNÁ ADMIN · Depoimentos
// ============================================================
import { initAdminLayout } from "./admin-layout.js";
import { showToast } from "./admin-toast.js";
import {
  getAllTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from "../../js/firestore-service.js";
import { uploadImageToImgBB } from "../../js/imgbb-upload.js";

const $ = (sel, ctx = document) => ctx.querySelector(sel);

let testimonials = [];
let currentPhoto = "";

async function loadData() {
  testimonials = await getAllTestimonials();
}

function renderTable() {
  const body = $("#testimonials-body");
  if (!testimonials.length) {
    body.innerHTML = `<tr><td colspan="5" class="empty-state">Nenhum depoimento cadastrado.</td></tr>`;
    return;
  }
  body.innerHTML = testimonials
    .map(
      (t) => `
      <tr data-id="${t.id}">
        <td><img class="table-thumb" src="${t.photo || ""}" alt="" /></td>
        <td>${t.name}</td>
        <td>${t.text.length > 70 ? t.text.slice(0, 70) + "…" : t.text}</td>
        <td>${"★".repeat(t.rating || 5)}</td>
        <td>
          <div class="table-actions">
            <button class="btn btn--ghost btn--sm" data-edit="${t.id}">Editar</button>
            <button class="btn btn--danger btn--sm" data-delete="${t.id}">Excluir</button>
          </div>
        </td>
      </tr>
    `
    )
    .join("");
}

function renderPhotoThumb() {
  const wrap = $("#tf-photo-thumb");
  wrap.innerHTML = currentPhoto
    ? `<div class="image-thumb"><img src="${currentPhoto}" alt="" /><button type="button" aria-label="Remover">×</button></div>`
    : "";
  wrap.querySelector("button")?.addEventListener("click", () => {
    currentPhoto = "";
    renderPhotoThumb();
  });
}

async function handlePhotoUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  const statusEl = $("#tf-upload-status");
  statusEl.className = "upload-status";
  statusEl.textContent = "Enviando foto…";
  try {
    currentPhoto = await uploadImageToImgBB(file);
    renderPhotoThumb();
    statusEl.textContent = "Foto enviada com sucesso.";
    setTimeout(() => (statusEl.textContent = ""), 2500);
  } catch (err) {
    statusEl.className = "upload-status is-error";
    statusEl.textContent = err.message;
  }
  e.target.value = "";
}

function openSlideover(testimonial = null) {
  $("#testimonial-form-title").textContent = testimonial ? "Editar depoimento" : "Novo depoimento";
  $("#tf-id").value = testimonial?.id || "";
  $("#tf-name").value = testimonial?.name || "";
  $("#tf-text").value = testimonial?.text || "";
  $("#tf-rating").value = testimonial?.rating || 5;
  currentPhoto = testimonial?.photo || "";
  renderPhotoThumb();
  $("#tf-upload-status").textContent = "";
  $("#testimonial-backdrop").classList.add("is-open");
  $("#testimonial-slideover").classList.add("is-open");
}

function closeSlideover() {
  $("#testimonial-backdrop").classList.remove("is-open");
  $("#testimonial-slideover").classList.remove("is-open");
}

async function handleSubmit(e) {
  e.preventDefault();
  const id = $("#tf-id").value;
  const data = {
    name: $("#tf-name").value.trim(),
    text: $("#tf-text").value.trim(),
    rating: Math.min(5, Math.max(1, parseInt($("#tf-rating").value, 10) || 5)),
    photo: currentPhoto,
  };

  if (id) {
    await updateTestimonial(id, data);
    showToast("Depoimento atualizado.");
  } else {
    await createTestimonial(data);
    showToast("Depoimento criado.");
  }

  closeSlideover();
  await loadData();
  renderTable();
}

async function handleTableClick(e) {
  const editId = e.target.closest("[data-edit]")?.dataset.edit;
  const delId = e.target.closest("[data-delete]")?.dataset.delete;

  if (editId) {
    openSlideover(testimonials.find((t) => t.id === editId));
  } else if (delId) {
    if (!confirm("Excluir este depoimento?")) return;
    await deleteTestimonial(delId);
    showToast("Depoimento excluído.");
    await loadData();
    renderTable();
  }
}

async function init() {
  await initAdminLayout("depoimentos", "Depoimentos");
  await loadData();
  renderTable();

  $("#new-testimonial-btn").addEventListener("click", () => openSlideover());
  $("#testimonial-form-close").addEventListener("click", closeSlideover);
  $("#testimonial-form-cancel").addEventListener("click", closeSlideover);
  $("#testimonial-backdrop").addEventListener("click", closeSlideover);
  $("#testimonial-form").addEventListener("submit", handleSubmit);
  $("#tf-photo-upload").addEventListener("change", handlePhotoUpload);
  $("#testimonials-body").addEventListener("click", handleTableClick);
}

init();
