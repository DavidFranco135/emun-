// ============================================================
// EMUNÁ · Checkout
// ============================================================
import { getCart, getCartTotal, formatBRL, clearCart } from "./cart.js";
import { initLayout } from "./layout.js";

const $ = (sel, ctx = document) => ctx.querySelector(sel);

function renderOrderSummary() {
  const items = getCart();
  if (!items.length) {
    $("#checkout-empty").hidden = false;
    $("#checkout-layout").hidden = true;
    return false;
  }
  $("#checkout-empty").hidden = true;
  $("#checkout-layout").hidden = false;

  $("#checkout-items").innerHTML = items
    .map(
      (i) => `
      <div class="checkout-item-row">
        <span>${i.qty}× ${i.name}</span>
        <span>${formatBRL(i.price * i.qty)}</span>
      </div>
    `
    )
    .join("");

  const subtotal = getCartTotal();
  $("#ck-subtotal").textContent = formatBRL(subtotal);
  $("#ck-total").textContent = formatBRL(subtotal);
  return true;
}

function generateOrderId() {
  return "EMU-" + Math.random().toString(36).slice(2, 8).toUpperCase();
}

function initForm() {
  $("#checkout-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const orderId = generateOrderId();

    // Aqui, futuramente: gravar o pedido em /orders/{id} no Firestore
    // e disparar a integração de pagamento conforme o método escolhido.

    $("#success-order-id").textContent = `#${orderId}`;
    $("#checkout-layout").hidden = true;
    $("#checkout-success").hidden = false;
    clearCart();
  });
}

async function init() {
  await initLayout();
  const hasItems = renderOrderSummary();
  if (hasItems) initForm();
}

init();
