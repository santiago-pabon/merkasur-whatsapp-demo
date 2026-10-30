# MerkaSur Amarilo Express

Frontend estático para explorar productos, armar un carrito y enviar por WhatsApp el pedido con los datos de entrega. No procesa pagos ni confirma existencias; la tienda responde por WhatsApp con disponibilidad, total final y medios de pago.

## Abrir

Abre **index.html** en un navegador. No requiere instalar dependencias ni compilar.

## Estructura del proyecto

```text
index.html                  Estructura de la tienda, carrito, pedido y panel
assets/
  app.js                    Inicio de la aplicación
  admin/
    admin.js                Funciones y formularios del panel administrativo
    admin.css               Estilos del panel y acceso
    auth.js                 Hash y verificación de contraseña
  cart/cart.js              Carrito, cantidades y sugerencia de mentas
  checkout/checkout.js      Resumen, dirección y envío del pedido por WhatsApp
  core/
    state.js                Estado, almacenamiento local y configuración base
    helpers.js              Formato de precios, texto seguro y notificaciones
  css/
    styles.css              Estilos principales
    custom.css              Ajustes visuales de la tienda
  images/                   Imágenes locales de productos y marca
  products/
    categories.js           Categorías predeterminadas
    products.js             Catálogo y precios de ejemplo
  storefront/
    catalog.js              Filtros, búsqueda y tarjetas de productos
    settings.js             Identidad y apariencia de la tienda
```

## Configuración

- El WhatsApp de la tienda está configurado como **5731280619981**.
- El domicilio es gratis desde $10.000; por debajo se agregan $2.000.
- Los productos de muestra se editan en **assets/products/products.js**; las categorías, en **assets/products/categories.js**.
- El estilo del panel está en **assets/admin/admin.css** y su comportamiento en **assets/admin/admin.js**.
- Las imágenes locales deben guardarse en **assets/images/**. El panel también permite usar una URL para el logo.
- El carrito se conserva en el navegador del cliente.

El carrito sugiere mentas de hierbabuena ($1.200) cuando falta monto para alcanzar el domicilio gratis. Ajusta ese producto y los valores de ejemplo al catálogo real.

Las frutas, verduras, granos y carnes con peso se muestran y se agregan por libra. En el panel de administración, cualquier producto puede configurarse con tres presentaciones y tres precios propios; por ejemplo, unidad, medio paquete y paquete completo. Huevos ya viene configurado como ejemplo.

En el pie de página está el panel **Administrar tienda**. La clave inicial es **Admin12345**; se guarda como hash PBKDF2 con sal aleatoria y se puede cambiar desde el panel. Permite editar marca, logo por URL, WhatsApp, mensajes, portada, tipografía y colores; elegir si los productos se venden por unidad, paquete o libra; agregar, editar y quitar productos; sumar categorías; y exportar o importar un respaldo JSON. Por ser un frontend sin servidor, la configuración y el hash quedan guardados en el navegador que la administra. Para un negocio en producción hace falta conectar el panel y la tienda a una base de datos con autenticación del lado del servidor, además de un servicio para subir imágenes.
