// ============================================================
// EMUNÁ ADMIN · Arrastar e soltar para reordenar
// ============================================================
// Usa a API nativa de Drag and Drop do navegador — sem bibliotecas.
// Aplica-se a linhas de tabela (<tr>) dentro de um <tbody>. Cada linha
// precisa ter o atributo draggable="true" e um data-id no <tr>.
// Ao soltar, chama onReorder(novaOrdemDeIds).
// ============================================================

export function initDragReorder(tbodyEl, onReorder) {
  if (!tbodyEl) return;
  let draggedRow = null;

  tbodyEl.addEventListener("dragstart", (e) => {
    const row = e.target.closest("tr[draggable='true']");
    if (!row) return;
    draggedRow = row;
    row.classList.add("is-dragging-row");
    e.dataTransfer.effectAllowed = "move";
  });

  tbodyEl.addEventListener("dragend", () => {
    draggedRow?.classList.remove("is-dragging-row");
    draggedRow = null;
  });

  tbodyEl.addEventListener("dragover", (e) => {
    e.preventDefault();
    const row = e.target.closest("tr[draggable='true']");
    if (!row || row === draggedRow || !draggedRow) return;

    const rect = row.getBoundingClientRect();
    const isAfter = e.clientY - rect.top > rect.height / 2;
    row.parentNode.insertBefore(draggedRow, isAfter ? row.nextSibling : row);
  });

  tbodyEl.addEventListener("drop", (e) => {
    e.preventDefault();
    const ids = Array.from(tbodyEl.querySelectorAll("tr[data-id]")).map((tr) => tr.dataset.id);
    onReorder(ids);
  });
}
