function renderAdmin() {
  $('#settingName').value = storeSettings.name;
  $('#settingPhone').value = storeSettings.phone;
  $('#settingLogo').value = storeSettings.logoUrl || '';
  $('#settingGreeting').value = storeSettings.greeting;
  $('#settingClosing').value = storeSettings.closing;
  $('#settingTagline').value = storeSettings.tagline || '';
  $('#settingFont').value = storeSettings.font || 'brand';
  $('#settingHeroTitle').value = storeSettings.heroTitle || '';
  $('#settingHeroSubtitle').value = storeSettings.heroSubtitle || '';
  const colors = storeSettings.colors || defaultSettings.colors;
  $('#settingPrimary').value = colors.primary || defaultSettings.colors.primary;
  $('#settingAccent').value = colors.accent || defaultSettings.colors.accent;
  $('#settingBackground').value = colors.background || defaultSettings.colors.background;
  $('#settingText').value = colors.text || defaultSettings.colors.text;
  const categorySelect = $('#productCategory');
  categorySelect.replaceChildren();
  categories.filter((category) => category.id !== 'Todos').forEach((category) => {
    const option = document.createElement('option');
    option.value = category.id;
    option.textContent = category.icon + ' ' + category.label;
    categorySelect.append(option);
  });
  $('#adminProductCount').textContent = products.length + ' productos en el catálogo';
  const list = $('#adminProductList');
  list.replaceChildren();
  products.forEach((product) => {
    const row = document.createElement('div');
    row.className = 'admin-product-row';
    const visual = document.createElement('div');
    visual.className = 'admin-product-thumb';
    if (product.imageUrl) {
      const image = document.createElement('img');
      image.src = product.imageUrl;
      image.alt = '';
      visual.append(image);
    } else visual.textContent = product.emoji || '🛍️';
    const details = document.createElement('div');
    details.className = 'admin-product-details';
    const name = document.createElement('b');
    name.textContent = product.name;
    const info = document.createElement('small');
    const category = categories.find((entry) => entry.id === product.category);
    info.textContent = (category?.label || product.category) + ' · ' + (product.variants ? '3 presentaciones con precio propio' : product.measure === 'lb' ? 'por libra' : product.measure === 'pack' ? 'por paquete' : 'por unidad');
    details.append(name, info);
    const price = document.createElement('strong');
    price.textContent = product.variants ? '3 presentaciones' : money(product.price) + (product.measure === 'lb' ? ' / lb' : product.measure === 'pack' ? ' / paquete' : ' / unidad');
    const actions = document.createElement('div');
    actions.className = 'admin-product-actions';
    const edit = document.createElement('button');
    edit.type = 'button';
    edit.className = 'button-quiet';
    edit.textContent = 'Editar';
    edit.dataset.editProduct = product.id;
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'button-quiet danger-button';
    remove.textContent = 'Eliminar';
    remove.dataset.deleteProduct = product.id;
    actions.append(edit, remove);
    row.append(visual, details, price, actions);
    list.append(row);
  });
  const categoryList = $('#adminCategoryList');
  categoryList.replaceChildren();
  categories.forEach((category) => {
    const chip = document.createElement('span');
    chip.className = 'admin-category-chip';
    chip.textContent = category.icon + ' ' + category.label;
    const uses = products.some((product) => product.category === category.id);
    if (!uses && category.id !== 'Todos') {
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.textContent = '×';
      remove.setAttribute('aria-label', 'Eliminar categoría ' + category.label);
      remove.dataset.removeCategory = category.id;
      chip.append(remove);
    }
    categoryList.append(chip);
  });
}

function openAdmin() {
  $('#loginError').textContent = '';
  $('#adminPassword').value = '';
  $('#adminLogin').classList.remove('hidden');
  setTimeout(() => $('#adminPassword').focus(), 50);
}

function showAdminPanel() {
  adminAuthenticated = true;
  $('#adminLogin').classList.add('hidden');
  $('#storeView').classList.add('hidden');
  $('#checkoutView').classList.add('hidden');
  $('.site-footer').classList.add('hidden');
  $('#adminView').classList.remove('hidden');
  renderAdmin();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function closeAdmin() {
  adminAuthenticated = false;
  $('#adminView').classList.add('hidden');
  $('#storeView').classList.remove('hidden');
  $('.site-footer').classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetProductForm() {
  $('#productForm').reset();
  $('#editingProductId').value = '';
  $('#productEmoji').value = '🛍️';
  $('#submitProduct').textContent = 'Agregar al catálogo';
  $('#cancelEdit').classList.add('hidden');
  $('#variantLabel1').value = '';
  $('#variantLabel2').value = '';
  $('#variantLabel3').value = '';
  $('#variantPrice1').value = '';
  $('#variantPrice2').value = '';
  $('#variantPrice3').value = '';
  syncProductSaleMode();
}

function syncProductSaleMode() {
  const multiple = $('#productMeasure').value === 'variants';
  $('#variantEditor').classList.toggle('hidden', !multiple);
  $('#productPriceField').classList.toggle('hidden', multiple);
  $('#productPrice').required = !multiple;
  if (multiple) {
    ['Unidad', 'Medio paquete', 'Paquete'].forEach((label, index) => {
      const input = $('#variantLabel' + (index + 1));
      if (!input.value) input.value = label;
    });
  }
  ['variantLabel1', 'variantLabel2', 'variantLabel3', 'variantPrice1', 'variantPrice2', 'variantPrice3'].forEach((id) => {
    $('#' + id).required = multiple;
  });
}

$('#manageStore').addEventListener('click', openAdmin);
$('#leaveAdmin').addEventListener('click', closeAdmin);
$('#closeAdminLogin').addEventListener('click', () => $('#adminLogin').classList.add('hidden'));

$('#adminLoginForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    const valid = await verifyPassword($('#adminPassword').value, adminPasswordHash);
    if (!valid) {
      $('#loginError').textContent = 'La contraseña no coincide. Inténtalo de nuevo.';
      $('#adminPassword').select();
      return;
    }
    $('#adminLoginForm').reset();
    showAdminPanel();
  } catch {
    $('#loginError').textContent = 'Este navegador no permite validar la clave en esta página.';
  }
});

$('#passwordForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const current = $('#currentAdminPassword').value;
  const next = $('#newAdminPassword').value;
  const confirmation = $('#confirmAdminPassword').value;
  try {
    if (!(await verifyPassword(current, adminPasswordHash))) {
      showToast('La contraseña actual no coincide.');
      return;
    }
    if (next.length < 8) {
      showToast('La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (next !== confirmation) {
      showToast('Las contraseñas nuevas no coinciden.');
      return;
    }
    adminPasswordHash = await hashPassword(next);
    localStorage.setItem(ADMIN_PASSWORD_STORAGE_KEY, adminPasswordHash);
    $('#passwordForm').reset();
    showToast('Contraseña de administración actualizada.');
  } catch {
    showToast('No se pudo actualizar la contraseña en este navegador.');
  }
});

$('#saveSettings').addEventListener('click', () => {
  const digits = $('#settingPhone').value.replace(/\D/g, '');
  if (digits.length < 10) {
    showToast('Escribe el WhatsApp con indicativo de país.');
    return;
  }
  storeSettings = {
    name: $('#settingName').value.trim() || 'Mi supermercado',
    phone: digits.startsWith('57') ? digits : '57' + digits,
    logoUrl: $('#settingLogo').value.trim(),
    tagline: $('#settingTagline').value.trim(),
    heroTitle: $('#settingHeroTitle').value.trim() || defaultSettings.heroTitle,
    heroSubtitle: $('#settingHeroSubtitle').value.trim() || defaultSettings.heroSubtitle,
    font: $('#settingFont').value,
    colors: {
      primary: $('#settingPrimary').value,
      accent: $('#settingAccent').value,
      background: $('#settingBackground').value,
      text: $('#settingText').value
    },
    greeting: $('#settingGreeting').value.trim() || '¡Hola! Quiero hacer un pedido.',
    closing: $('#settingClosing').value.trim() || 'Por favor, confirmen la disponibilidad y el total. ¡Gracias!'
  };
  applyStoreSettings();
  saveContent();
  renderAdmin();
  showToast('Datos de la tienda guardados en este navegador');
});

$('#productForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const id = $('#editingProductId').value;
  const existing = products.find((product) => product.id === id);
  const product = {
    id: id || 'producto-' + Date.now(),
    name: $('#productName').value.trim(),
    detail: $('#productDetail').value.trim() || 'Disponible para tu mercado',
    price: Number($('#productPrice').value),
    measure: $('#productMeasure').value,
    category: $('#productCategory').value,
    emoji: $('#productEmoji').value.trim() || '🛍️',
    imageUrl: $('#productImage').value.trim(),
    tag: existing?.tag || '',
    color: existing?.color || '#eef2e5'
  };
  if (product.measure === 'variants') {
    const optionRows = [1, 2, 3].map((number) => ({
      label: $('#variantLabel' + number).value.trim(),
      price: Number($('#variantPrice' + number).value)
    }));
    if (optionRows.some((option) => !option.label || !Number.isFinite(option.price) || option.price <= 0)) {
      showToast('Completa el nombre y el precio de las tres presentaciones.');
      return;
    }
    product.variants = optionRows.map((option, index) => ({
      key: existing?.variants?.[index]?.key || product.id + '-opcion-' + (index + 1),
      label: option.label,
      measure: option.label.toLocaleLowerCase('es'),
      price: option.price
    }));
    product.price = Math.min(...product.variants.map((variant) => variant.price));
    delete product.measure;
  } else delete product.variants;
  if (existing) products = products.map((item) => item.id === id ? product : item);
  else products.unshift(product);
  saveContent();
  resetProductForm();
  renderAdmin();
  renderProducts();
  renderCart();
  showToast(existing ? 'Producto actualizado' : 'Producto agregado al catálogo');
});

$('#productMeasure').addEventListener('change', syncProductSaleMode);

$('#adminProductList').addEventListener('click', (event) => {
  const editButton = event.target.closest('[data-edit-product]');
  if (editButton) {
    const product = products.find((item) => item.id === editButton.dataset.editProduct);
    $('#editingProductId').value = product.id;
    $('#productName').value = product.name;
    $('#productPrice').value = product.price;
    $('#productCategory').value = product.category;
    $('#productMeasure').value = product.variants ? 'variants' : product.measure === 'lb' ? 'lb' : product.measure === 'pack' ? 'pack' : 'unit';
    $('#productDetail').value = product.detail || '';
    $('#productEmoji').value = product.emoji || '';
    $('#productImage').value = product.imageUrl || '';
    syncProductSaleMode();
    if (product.variants) {
      [1, 2, 3].forEach((number) => {
        const variant = product.variants[number - 1];
        $('#variantLabel' + number).value = variant?.label || '';
        $('#variantPrice' + number).value = variant?.price || '';
      });
    }
    $('#submitProduct').textContent = 'Guardar producto';
    $('#cancelEdit').classList.remove('hidden');
    $('#productForm').scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }
  const deleteButton = event.target.closest('[data-delete-product]');
  if (!deleteButton) return;
  const removed = products.find((product) => product.id === deleteButton.dataset.deleteProduct);
  products = products.filter((product) => product.id !== deleteButton.dataset.deleteProduct);
  if (removed) {
    delete cart[removed.id];
    removed.variants?.forEach((variant) => delete cart[variant.key]);
  }
  saveContent();
  renderAdmin();
  renderProducts();
  renderCart();
  showToast('Producto eliminado del catálogo');
});

$('#cancelEdit').addEventListener('click', resetProductForm);

$('#categoryForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const label = $('#newCategoryName').value.trim();
  const id = label.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  if (!id || categories.some((category) => category.id === id)) {
    showToast('Esa categoría ya existe o el nombre no es válido.');
    return;
  }
  categories.push({ id, label, icon: $('#newCategoryIcon').value.trim() || '📦' });
  saveContent();
  $('#categoryForm').reset();
  renderAdmin();
  renderCategories();
  renderProducts();
  showToast('Categoría agregada');
});

$('#adminCategoryList').addEventListener('click', (event) => {
  const button = event.target.closest('[data-remove-category]');
  if (!button) return;
  categories = categories.filter((category) => category.id !== button.dataset.removeCategory);
  saveContent();
  renderAdmin();
  renderCategories();
  renderProducts();
});

$('#exportStore').addEventListener('click', () => {
  const backup = new Blob([JSON.stringify({ categories, products, settings: storeSettings }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(backup);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'configuracion-merkasur.json';
  link.click();
  URL.revokeObjectURL(url);
});

$('#importStore').addEventListener('change', async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    const imported = JSON.parse(await file.text());
    if (!Array.isArray(imported.categories) || !Array.isArray(imported.products) || !imported.settings) throw new Error('Formato inválido');
    categories = imported.categories;
    products = imported.products;
    storeSettings = { ...defaultSettings, ...imported.settings };
    applyStoreSettings();
    saveContent();
    renderAdmin();
    renderCategories();
    renderProducts();
    renderCart();
    showToast('Configuración importada');
  } catch {
    showToast('No pudimos leer el archivo de configuración.');
  }
  event.target.value = '';
});


