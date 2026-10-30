function renderCategories() {
  $('#categoryList').innerHTML = categories.map(({ id, label, icon }) => `
    <button class="category-chip ${selectedCategory === id ? 'active' : ''}" data-category="${escapeHTML(id)}" aria-pressed="${selectedCategory === id}"><span>${escapeHTML(icon)}</span>${escapeHTML(label)}</button>
  `).join('');
}

function renderProducts() {
  const query = $('#searchInput').value.trim().toLocaleLowerCase('es');
  const filtered = products.filter((product) => {
    const inCategory = selectedCategory === 'Todos' || product.category === selectedCategory;
    const matches = `${product.name} ${product.detail} ${product.category}`.toLocaleLowerCase('es').includes(query);
    return inCategory && matches;
  });
  const title = selectedCategory === 'Todos' ? 'Los más pedidos' : selectedCategory;
  $('#categoryTitle').textContent = query ? 'Resultados de búsqueda' : title;
  $('#productCount').textContent = `${filtered.length} ${filtered.length === 1 ? 'producto' : 'productos'}`;
  $('#emptyResults').classList.toggle('hidden', filtered.length > 0);
  productGrid.classList.toggle('hidden', filtered.length === 0);
  productGrid.innerHTML = filtered.map((product) => `
    <article class="product-card">
      <div class="product-visual" style="background:${escapeHTML(product.color)}">
        ${product.tag ? '<span class="product-tag">' + escapeHTML(product.tag) + '</span>' : ''}
        <span class="product-emoji" aria-hidden="true">${escapeHTML(product.emoji)}</span>
      </div>
      <div class="product-body"><h4 class="product-name">${escapeHTML(product.name)}</h4><p class="product-detail">${escapeHTML(product.detail)}</p>
        <div class="product-bottom"><span class="product-price">${money(product.price)} <small>/ ${product.category === 'Frutas' || product.category === 'Verduras' || product.category === 'Carnes' || product.category === 'Granos' ? 'unidad' : 'und.'}</small></span><button class="add-button" data-add="${escapeHTML(product.id)}" aria-label="Agregar ${escapeHTML(product.name)}">+</button></div>
      </div>
    </article>
  `).join('');
  addProductControls(filtered);
}

function addProductControls(filtered) {
  filtered.forEach((product) => {
    const addButton = productGrid.querySelector('[data-add="' + product.id + '"]');
    if (!addButton) return;
    const card = addButton.closest('.product-card');
    if (product.imageUrl) {
      const visual = card.querySelector('.product-visual');
      const image = document.createElement('img');
      image.src = product.imageUrl;
      image.alt = product.name;
      image.className = 'product-photo';
      image.onerror = () => { image.remove(); };
      visual.querySelector('.product-emoji')?.remove();
      visual.append(image);
    }
    const priceUnit = card.querySelector('.product-price small');
    if (priceUnit) priceUnit.textContent = product.measure === 'lb' ? '/ libra' : product.measure === 'pack' ? '/ paquete' : product.variants ? '/ presentación' : '/ unidad';
    if (product.variants) {
      const label = document.createElement('label');
      label.className = 'egg-option-label';
      label.textContent = 'Presentación';
      const select = document.createElement('select');
      select.className = 'egg-option';
      select.dataset.eggOption = product.id;
      product.variants.forEach((variant) => {
        const option = document.createElement('option');
        option.value = variant.key;
        option.textContent = variant.label + ' · ' + money(variant.price);
        select.append(option);
      });
      const priceNode = card.querySelector('.product-price');
      const priceUnit = priceNode.querySelector('small');
      priceNode.firstChild.textContent = 'Desde ' + money(Math.min(...product.variants.map((variant) => variant.price))) + ' ';
      priceUnit.textContent = '/ presentación';
      select.addEventListener('change', () => {
        const selected = product.variants.find((variant) => variant.key === select.value);
        priceNode.firstChild.textContent = money(selected.price) + ' ';
        priceUnit.textContent = '/ ' + selected.measure;
      });
      label.append(select);
      card.querySelector('.product-detail').after(label);
    }
    if (product.measure === 'lb') {
      const group = document.createElement('div');
      group.className = 'product-add-group';
      const picker = document.createElement('div');
      picker.className = 'amount-picker';
      picker.setAttribute('aria-label', 'Cantidad en libras');
      picker.innerHTML = '<button type="button" data-picker="' + product.id + '" data-delta="-1" aria-label="Restar una libra">−</button><span data-count="' + product.id + '">1</span><button type="button" data-picker="' + product.id + '" data-delta="1" aria-label="Agregar una libra">+</button>';
      group.append(picker, addButton);
      card.querySelector('.product-bottom').append(group);
      addButton.setAttribute('aria-label', 'Agregar ' + product.name + ' por libra al carrito');
    }
  });
}

$('#categoryList').addEventListener('click', (event) => {
  const button = event.target.closest('[data-category]');
  if (!button) return;
  selectedCategory = button.dataset.category;
  renderCategories();
  renderProducts();
});

$('#searchInput').addEventListener('input', renderProducts);
$('#searchInput').addEventListener('keydown', (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    $('#searchInput').focus();
  }
});


productGrid.addEventListener('click', (event) => {
  const pickerButton = event.target.closest('[data-picker]');
  if (pickerButton) {
    const value = productGrid.querySelector('[data-count="' + pickerButton.dataset.picker + '"]');
    const next = Math.max(1, Number(value.textContent) + Number(pickerButton.dataset.delta));
    value.textContent = next;
    return;
  }
  const button = event.target.closest('[data-add]');
  if (!button) return;
  const product = products.find((item) => item.id === button.dataset.add);
  const card = button.closest('.product-card');
  const variant = product.variants?.find((item) => item.key === card.querySelector('[data-egg-option]')?.value);
  const cartKey = variant?.key || product.id;
  const amount = product.measure === 'lb' ? Number(card.querySelector('[data-count]')?.textContent || 1) : 1;
  cart[cartKey] = (Number(cart[cartKey]) || 0) + amount;
  renderCart();
  showToast(`${product.name} agregado a tu carrito`);
});


