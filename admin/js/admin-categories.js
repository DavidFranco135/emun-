// ============================================================
// EMUNÁ ADMIN · Categorias
// ============================================================
import { initAdminLayout } from "./admin-layout.js";
import { showToast } from "./admin-toast.js";
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../js/firestore-service.js";

const $ = (sel, ctx = document) => ctx.querySelector(sel);

let categories = [];

async function loadData() {
  categories = await getAllCategories();
  categories.sort((a, b) => (a.order || 0) - (b.order || 0));
}

function renderTable() {
  const body = $("#categories-body");
  if (!categories.length) {
    body.innerHTML = `<tr><td colspan="5" class="empty-state">Nenhuma categoria cadastrada.</td></tr>`;
    return;
  }
  body.innerHTML = categories
    .map(
      (c) => `
      <tr data-id="${c.id}">
        <td><img class="table-thumb" src="${c.image || ""}" alt="" /></td>
        <td>${c.name}</td>
        <td>${c.icon || "—"}</td>
        <td>${c.order ?? "—"}</td>
        <td>
          <div class="table-actions">
            <button class="btn btn--ghost btn--sm" data-edit="${c.id}">Editar</button>
            <button class="btn btn--danger btn--sm" data-delete="${c.id}">Excluir</button>
          </div>
        </td>
      </tr>
    `
    )
    .join("");
}

function openSlideover(category = null) {
  $("#category-form-title").textContent = category ? "Editar categoria" : "Nova categoria";
  $("#cf-id").value = category?.id || "";
  $("#cf-name").value = category?.name || "";
  $("#cf-icon").value = category?.icon || "";
  $("#cf-order").value = category?.order ?? categories.length + 1;
  $("#cf-image").value = category?.image || "";
  $("#category-backdrop").classList.add("is-open");
  $("#category-slideover").classList.add("is-open");
}

function closeSlideover() {
  $("#category-backdrop").classList.remove("is-open");
  $("#category-slideover").classList.remove("is-open");
}

async function handleSubmit(e) {
  e.preventDefault();
  const id = $("#cf-id").value;
  const data = {
    name: $("#cf-name").value.trim(),
    icon: $("#cf-icon").value.trim(),
    order: parseInt($("#cf-order").value, 10) || 1,
    image: $("#cf-image").value.trim(),
  };

  if (id) {
    await updateCategory(id, data);
    showToast("Categoria atualizada.");
  } else {
    await createCategory(data);
    showToast("Categoria criada.");
  }

  closeSlideover();
  await loadData();
  renderTable();
}

async function handleTableClick(e) {
  const editId = e.target.closest("[data-edit]")?.dataset.edit;
  const delId = e.target.closest("[data-delete]")?.dataset.delete;

  if (editId) {
    openSlideover(categories.find((c) => c.id === editId));
  } else if (delId) {
    if (!confirm("Excluir esta categoria? Produtos associados não serão excluídos.")) return;
    await deleteCategory(delId);
    showToast("Categoria excluída.");
    await loadData();
    renderTable();
  }
}

async function init() {
  await initAdminLayout("categorias", "Categorias");
  await loadData();
  renderTable();

  $("#new-category-btn").addEventListener("click", () => openSlideover());
  $("#category-form-close").addEventListener("click", closeSlideover);
  $("#category-form-cancel").addEventListener("click", closeSlideover);
  $("#category-backdrop").addEventListener("click", closeSlideover);
  $("#category-form").addEventListener("submit", handleSubmit);
  $("#categories-body").addEventListener("click", handleTableClick);
}

init();
