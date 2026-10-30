function getCartProducts() {
  return products.flatMap((product) => {
    if (product.variants) {
      return product.variants
        .filter((variant) => Number(cart[variant.key]) > 0)
        .map((variant) => ({ ...product, ...variant, cartKey: variant.key, quantity: Number(cart[variant.key]), lineName: product.name }));
    }
    return Number(cart[product.id]) > 0
      ? [{ ...product, cartKey: product.id, quantity: Number(cart[product.id]), lineName: product.name }]
      : [];
  });
}

function quantityLabel(item, quantity = item.quantity) {
  if (item.measure === 'lb') return quantity + (quantity === 1 ? ' libra' : ' libras');
  if (item.measure === 'unidad' || item.measure === 'unit' || !item.measure) return quantity + (quantity === 1 ? ' unidad' : ' unidades');
  if (item.measure === 'pack') return quantity + (quantity === 1 ? ' paquete' : ' paquetes');
  return quantity + ' × ' + item.measure;
}

function itemCount() {
  return getCartProducts().reduce((sum, product) => sum + product.quantity, 0);
}

function subtotal() {
  return getCartProducts().reduce((sum, product) => sum + product.price * product.quantity, 0);
}

function deliveryFee() {
  return subtotal() >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
}

function renderDeliverySuggestion(elementId) {
  const element = document.getElementById(elementId);
  const amountLeft = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal());
  if (!itemCount()) {
    element.innerHTML = '';
    element.classList.add('hidden');
    return;
  }
  element.classList.remove('hidden');
  if (amountLeft === 0) {
    element.innerHTML = '<span class="suggestion-icon">✳</span><p><b>¡Domicilio gratis!</b> Tu pedido ya llegó a $10.000.</p>';
    return;
  }
  const mint = products.find((product) => product.id === 'mentas');
  const addMore = Math.max(0, amountLeft - mint.price);
  const suggestion = addMore === 0
    ? 'Te faltan ' + money(amountLeft) + ' para que el domicilio sea gratis. ¡Con unas mentas completas el monto!'
    : 'Te faltan ' + money(amountLeft) + ' para domicilio gratis. Agrega unas mentas y otro producto por ' + money(addMore) + ' o más.';
  element.innerHTML = '<span class="suggestion-icon">✳</span><p>' + suggestion + '</p><button type="button" class="suggestion-action" data-add="mentas">Agregar mentas · ' + money(mint.price) + ' <span>+</span></button>';
}

function renderCart() {
  const items = getCartProducts();
  const count = itemCount();
  $('#cartCount').textContent = count;
  $('#drawerItemCount').textContent = `(${count})`;
  $('#checkoutCount').textContent = `(${count})`;
  $('#cartSubtotal').textContent = money(subtotal());
  $('#checkoutSubtotal').textContent = money(subtotal());
  const fee = deliveryFee();
  const feeLabel = fee === 0 ? 'Domicilio gratis' : 'Domicilio';
  $('#deliveryLabel').textContent = feeLabel;
  $('#checkoutDeliveryLabel').textContent = feeLabel;
  $('#deliveryFee').textContent = fee === 0 ? 'Gratis' : money(fee);
  $('#checkoutDeliveryFee').textContent = fee === 0 ? 'Gratis' : money(fee);
  $('#cartTotal').textContent = money(subtotal() + fee);
  $('#checkoutTotal').textContent = money(subtotal() + fee);
  $('#cartItems').innerHTML = items.map((item) => `
    <div class="cart-row">
      <div class="cart-thumb" style="background:${escapeHTML(item.color)}">${escapeHTML(item.emoji)}</div>
      <div><h4>${escapeHTML(item.name)}</h4><p>${escapeHTML(quantityLabel(item))} · ${money(item.price)} · ${item.measure === 'lb' ? 'por libra' : ''}</p><div class="quantity-control"><button data-quantity="${escapeHTML(item.cartKey)}" data-delta="-1" aria-label="Quitar una unidad de ${escapeHTML(item.name)}">−</button><span>${item.quantity}</span><button data-quantity="${escapeHTML(item.cartKey)}" data-delta="1" aria-label="Agregar una unidad de ${escapeHTML(item.name)}">+</button></div></div>
      <span class="cart-line-price">${money(item.price * item.quantity)}</span>
    </div>
  `).join('');
  $('#summaryItems').innerHTML = items.map((item) => `
    <div class="summary-row"><div class="summary-thumb" style="background:${escapeHTML(item.color)}">${escapeHTML(item.emoji)}</div><div class="summary-product"><b>${escapeHTML(item.name)}</b><small>${escapeHTML(quantityLabel(item))} · ${money(item.price)} · ${item.measure === 'lb' ? 'por libra' : ''}</small></div><strong>${money(item.price * item.quantity)}</strong></div>
  `).join('');
  renderDeliverySuggestion('deliverySuggestion');
  renderDeliverySuggestion('checkoutSuggestion');
  $('#cartEmpty').classList.toggle('hidden', count > 0);
  $('#drawerFooter').classList.toggle('hidden', count === 0);
  saveCart();
}

function openCart() {
  $('#cartDrawer').classList.add('open');
  $('#cartDrawer').setAttribute('aria-hidden', 'false');
  $('#overlay').classList.add('visible');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  $('#cartDrawer').classList.remove('open');
  $('#cartDrawer').setAttribute('aria-hidden', 'true');
  $('#overlay').classList.remove('visible');
  document.body.style.overflow = '';
}

function addSuggestedProduct(event) {
  const button = event.target.closest('[data-add="mentas"]');
  if (!button) return;
  const product = products.find((item) => item.id === 'mentas');
  cart[product.id] = (Number(cart[product.id]) || 0) + 1;
  renderCart();
  showToast('Mentas agregadas a tu carrito');
}

$('#deliverySuggestion').addEventListener('click', addSuggestedProduct);
$('#checkoutSuggestion').addEventListener('click', addSuggestedProduct);

$('#cartItems').addEventListener('click', (event) => {
  const button = event.target.closest('[data-quantity]');
  if (!button) return;
  const id = button.dataset.quantity;
  cart[id] = (Number(cart[id]) || 0) + Number(button.dataset.delta);
  if (cart[id] <= 0) delete cart[id];
  renderCart();
});

$('#openCart').addEventListener('click', openCart);
$('#closeCart').addEventListener('click', closeCart);
$('#overlay').addEventListener('click', closeCart);
$('#emptyContinue').addEventListener('click', closeCart);
$('#goCheckout').addEventListener('click', openCheckout);
$('#backToStore').addEventListener('click', backToStore);
$('#editCart').addEventListener('click', () => { backToStore(); openCart(); });
$('#sendOrder').addEventListener('click', sendOrder);
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeCart(); });


