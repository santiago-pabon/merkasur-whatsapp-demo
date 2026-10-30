const BRAND_ICON_SVG = '<svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="M8 20h32l-3.2 21H11.2L8 20Z" fill="currentColor"/><path d="M16 20c0-7 3.8-12 8-12s8 5 8 12" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/><path d="M18 27v8m6-8v8m6-8v8" stroke="#F8F7F0" stroke-width="2.3" stroke-linecap="round"/></svg>';

function applyStoreSettings() {
  document.title = storeSettings.name + ' — tu mercado de confianza';
  document.querySelectorAll('.brand-name').forEach((element) => {
    element.textContent = storeSettings.name;
    const tagline = document.createElement('small');
    tagline.textContent = storeSettings.tagline || '';
    element.append(tagline);
  });
  document.querySelectorAll('.brand-mark').forEach((element) => {
    if (storeSettings.logoUrl) {
      const image = document.createElement('img');
      image.src = storeSettings.logoUrl;
      image.alt = 'Logo de ' + storeSettings.name;
      image.className = 'brand-logo-image';
      element.replaceChildren(image);
    } else element.innerHTML = BRAND_ICON_SVG;
  });
  const footerCopyright = $('#footerCopyright');
  if (footerCopyright) footerCopyright.textContent = '© ' + new Date().getFullYear() + ' ' + storeSettings.name;
  const heading = $('#storeView .hero h1');
  if (heading) {
    const parts = (storeSettings.heroTitle || '').split('|');
    heading.replaceChildren(document.createTextNode(parts[0] || storeSettings.name), document.createElement('br'));
    const emphasis = document.createElement('em');
    emphasis.textContent = parts[1] || '';
    heading.append(emphasis);
  }
  const heroSubtitle = $('#storeView .hero-copy > p');
  if (heroSubtitle) heroSubtitle.textContent = storeSettings.heroSubtitle || '';
  const colors = storeSettings.colors || defaultSettings.colors;
  const safeColor = (value, fallback) => CSS.supports('color', value) ? value : fallback;
  document.documentElement.style.setProperty('--green', safeColor(colors.primary, defaultSettings.colors.primary));
  document.documentElement.style.setProperty('--green-2', safeColor(colors.primary, defaultSettings.colors.primary));
  document.documentElement.style.setProperty('--lime', safeColor(colors.accent, defaultSettings.colors.accent));
  document.documentElement.style.setProperty('--cream', safeColor(colors.background, defaultSettings.colors.background));
  document.documentElement.style.setProperty('--ink', safeColor(colors.text, defaultSettings.colors.text));
  const fonts = {
    brand: { body: "'DM Sans', sans-serif", heading: "'Manrope', sans-serif" },
    nunito: { body: "'Nunito', sans-serif", heading: "'Nunito', sans-serif" },
    system: { body: "system-ui, sans-serif", heading: "system-ui, sans-serif" }
  };
  const selectedFont = fonts[storeSettings.font] || fonts.brand;
  document.documentElement.style.setProperty('--font-body', selectedFont.body);
  document.documentElement.style.setProperty('--font-heading', selectedFont.heading);
  WHATSAPP_NUMBER = storeSettings.phone || '5731280619981';
}


