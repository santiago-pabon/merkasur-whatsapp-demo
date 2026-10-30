function openCheckout() {
  if (!itemCount()) return;
  closeCart();
  $('#storeView').classList.add('hidden');
  $('.site-footer').classList.add('hidden');
  $('#checkoutView').classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function backToStore() {
  $('#checkoutView').classList.add('hidden');
  $('#storeView').classList.remove('hidden');
  $('.site-footer').classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function sendOrder() {
  const form = $('#addressForm');
  if (!form.reportValidity()) return;
  const items = getCartProducts();
  if (!items.length) {
    backToStore();
    showToast('Agrega al menos un producto para continuar.');
    return;
  }
  const data = new FormData(form);
  const name = data.get('name').trim();
  const phone = data.get('phone').trim();
  const address = data.get('address').trim();
  const neighborhood = data.get('neighborhood').trim();
  const building = data.get('building').trim();
  const unit = data.get('unit').trim();
  const notes = data.get('notes').trim();
  const lines = items.map((item) => '• ' + quantityLabel(item) + ' de ' + item.name + ' — ' + money(item.price * item.quantity));
  const location = [address, neighborhood, building, unit].filter(Boolean).join(', ');
  const message = [
    storeSettings.greeting,
    '',
    ...lines,
    '',
    `Subtotal estimado: ${money(subtotal())}`,
    'Domicilio: ' + (deliveryFee() === 0 ? 'gratis' : money(DELIVERY_FEE)),
    'Total estimado con domicilio: ' + money(subtotal() + deliveryFee()),
    '(Entiendo que el valor final depende de la disponibilidad.)',
    '',
    `Nombre: ${name}`,
    `Celular: ${phone}`,
    `Dirección: ${location}`,
    notes ? `Indicaciones: ${notes}` : '',
    '',
    storeSettings.closing
  ].filter(Boolean).join('\n');
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
  cart = {};
  saveCart();
  window.setTimeout(() => window.location.reload(), 700);
}

$('#addressForm').addEventListener('submit', (event) => event.preventDefault());

