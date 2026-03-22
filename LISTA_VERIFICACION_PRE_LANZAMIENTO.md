# ✅ LISTA DE VERIFICACIÓN PRE-LANZAMIENTO - EL ESTABLO

## 📋 Resumen
Esta lista de verificación garantiza que tu sitio web de El Establo esté completamente funcional y listo para producción antes del lanzamiento oficial.

## 🌐 Pruebas de Navegación y Estructura

### 1. Navegación Principal
- [ ] El logo redirige al inicio (#hero)
- [ ] Todos los enlaces del menú funcionan correctamente
- [ ] El menú es responsive (se convierte en hamburguesa en móviles)
- [ ] El carrito se abre al hacer clic en el ícono
- [ ] El contador del carrito se actualiza correctamente

### 2. Sección Hero (Inicio)
- [ ] El carrusel se desliza automáticamente
- [ ] Los botones "Ordenar ahora" funcionan
- [ ] Las flechas de navegación del carrusel funcionan
- [ ] Los puntos de paginación funcionan

### 3. Sección de Productos
- [ ] Todas las categorías muestran productos (Promos, Hamburguesas, Tex-Mex, Parrilla, Bebidas)
- [ ] Las tarjetas de producto muestran imagen, nombre, descripción y precio
- [ ] El botón "Personalizar" abre el modal de personalización
- [ ] Al hacer clic en la tarjeta también abre el modal

### 4. Sección "Quiénes Somos"
- [ ] Muestra la imagen correctamente
- [ ] El texto de historia es legible
- [ ] El horario se muestra correctamente
- [ ] El mapa de Google Maps está integrado
- [ ] Los botones de acción funcionan

### 5. Sección de Reservaciones
- [ ] El formulario tiene todos los campos requeridos
- [ ] La validación funciona (nombre, teléfono, fecha, personas)
- [ ] El botón de envío funciona
- [ ] Se abre WhatsApp con los datos correctos
- [ ] Se limpia el formulario después del envío

### 6. Footer
- [ ] Los íconos de redes sociales tienen enlaces correctos
- [ ] La información de contacto es correcta
- [ ] El horario se muestra correctamente
- [ ] Los enlaces del footer funcionan

## 🛒 Pruebas del Sistema de Pedidos

### 1. Carrito de Compras
- [ ] Agregar producto al carrito funciona
- [ ] Eliminar producto del carrito funciona
- [ ] El contador se actualiza en tiempo real
- [ ] El modal del carrito muestra productos correctamente
- [ ] El total se calcula correctamente

### 2. Personalización de Productos
- [ ] El modal de personalización se abre correctamente
- [ ] Las opciones de término de carne funcionan
- [ ] Las opciones "para quitar" funcionan
- [ ] Los extras muestran precio adicional
- [ ] El precio se actualiza en tiempo real
- [ ] Las notas especiales se guardan

### 3. Flujo de Checkout
- [ ] Botón "Finalizar pedido" abre modal de entrega
- [ ] Opción "Retiro en local" funciona
- [ ] Opción "Delivery" muestra selección de zonas
- [ ] Los costos de envío se calculan correctamente
- [ ] Modal de datos del cliente valida correctamente
- [ ] Modal de cross-sell muestra productos sugeridos
- [ ] El proceso completo termina con envío a WhatsApp

### 4. WhatsApp Integration
- [ ] El mensaje de pedido incluye todos los datos
- [ ] El mensaje es claro y profesional
- [ ] Los precios se muestran correctamente
- [ ] Las personalizaciones se incluyen en el mensaje
- [ ] El mensaje de reservas incluye todos los datos

## 📱 Pruebas de Responsividad

### 1. Móviles (320px - 768px)
- [ ] El menú se convierte en hamburguesa
- [ ] Las tarjetas de producto se apilan verticalmente
- [ ] Los modales ocupan toda la pantalla
- [ ] Los botones son lo suficientemente grandes para toque
- [ ] El texto es legible sin zoom
- [ ] Las imágenes se escalan correctamente
- [ ] La sección "Quiénes Somos" se apila verticalmente

### 2. Tablets (768px - 1024px)
- [ ] El diseño se adapta correctamente
- [ ] Las tarjetas de producto muestran 2 por fila
- [ ] Los modales tienen tamaño adecuado
- [ ] La navegación es fácil de usar

### 3. Desktop (1024px+)
- [ ] El diseño es óptimo para pantallas grandes
- [ ] Las tarjetas de producto muestran 3-4 por fila
- [ ] Los modales están centrados
- [ ] La experiencia de usuario es fluida

## 🔧 Pruebas Funcionales

### 1. Validación de Formularios
- [ ] Formulario de reservas valida todos los campos
- [ ] Mensajes de error son claros
- [ ] El formato de teléfono se valida correctamente
- [ ] Las fechas no permiten seleccionar días pasados
- [ ] El email opcional valida formato si se ingresa

### 2. Estado y Persistencia
- [ ] El carrito mantiene los productos durante la navegación
- [ ] Al recargar la página, el carrito se vacía (comportamiento esperado)
- [ ] El pop-up de entrada solo se muestra una vez por sesión

### 3. Performance
- [ ] Las imágenes se cargan rápidamente
- [ ] Los modales se abren sin retraso
- [ ] No hay errores en la consola del navegador
- [ ] El sitio es usable con JavaScript deshabilitado (fallback básico)

## 🔐 Pruebas de Seguridad

### 1. Sanitización de Datos
- [ ] Los datos ingresados por usuarios se sanitizan
- [ ] No hay vulnerabilidades XSS en los mensajes de WhatsApp
- [ ] Los datos se limitan a 500 caracteres para evitar overflow

### 2. Google Apps Script
- [ ] La URL del Web App está configurada como "Anyone"
- [ ] Los permisos están correctamente otorgados
- [ ] El script maneja errores correctamente
- [ ] Los datos se guardan en la hoja de cálculo correctamente

## 📊 Pruebas de Integración con Google Sheets

### 1. Configuración Inicial
- [ ] Hoja de cálculo creada con nombre "El Establo - Pedidos y Reservas"
- [ ] ID de hoja copiado correctamente en el script
- [ ] Script de Apps Script desplegado correctamente
- [ ] URL del Web App obtenida y guardada

### 2. Pruebas de Envío de Datos
- [ ] Los pedidos se guardan en la hoja "Pedidos"
- [ ] Las reservas se guardan en la hoja "Reservas"
- [ ] Los logs se guardan en la hoja "Logs"
- [ ] Los IDs únicos se generan correctamente
- [ ] Los timestamps son correctos (hora de Venezuela)

### 3. Formato de Datos
- [ ] Los precios tienen formato de moneda
- [ ] Las fechas tienen formato correcto
- [ ] Los datos de personalización son legibles
- [ ] Las filas tienen formato alternado para mejor legibilidad

## 📱 Pruebas en Diferentes Dispositivos y Navegadores

### 1. Navegadores Desktop
- [ ] **Chrome:** Funciona correctamente
- [ ] **Firefox:** Funciona correctamente
- [ ] **Edge:** Funciona correctamente
- [ ] **Safari:** Funciona correctamente (si es posible probar)

### 2. Navegadores Móviles
- [ ] **Chrome Mobile:** Funciona correctamente
- [ ] **Safari Mobile:** Funciona correctamente (si es posible probar)
- [ ] **Firefox Mobile:** Funciona correctamente

### 3. Sistemas Operativos
- [ ] **Windows:** Funciona correctamente
- [ ] **macOS:** Funciona correctamente (si es posible probar)
- [ ] **Android:** Funciona correctamente
- [ ] **iOS:** Funciona correctamente (si es posible probar)

## 🚀 Pruebas de Lanzamiento

### 1. Dominio y Hosting
- [ ] El dominio está configurado correctamente
- [ ] El SSL/HTTPS está activado
- [ ] Los archivos están subidos al servidor
- [ ] Las rutas relativas funcionan en producción

### 2. Configuración Final
- [ ] La variable `WHATSAPP_NUMBER` tiene el número correcto
- [ ] La variable `GOOGLE_SHEETS_WEBHOOK` tiene la URL correcta
- [ ] Las imágenes de productos son las finales
- [ ] Los precios son los correctos
- [ ] La información de contacto es la correcta

### 3. Pruebas de Carga
- [ ] El sitio carga rápidamente (menos de 3 segundos)
- [ ] Las imágenes están optimizadas
- [ ] No hay recursos bloqueantes
- [ ] El sitio es usable con conexión lenta

## 📈 Monitoreo Post-Lanzamiento

### 1. Analytics
- [ ] Google Analytics configurado (si aplica)
- [ ] Search Console configurado (si aplica)
- [ ] Métricas de conversión establecidas

### 2. Notificaciones
- [ ] Notificaciones de Google Sheets configuradas
- [ ] Email de notificaciones configurado
- [ ] Sistema de alertas para errores

### 3. Backup
- [ ] Backup automático de la hoja de cálculo configurado
- [ ] Backup del código del sitio
- [ ] Plan de recuperación ante desastres

## 🆘 Procedimientos de Emergencia

### 1. Si el WhatsApp no funciona
- [ ] Verificar que el número esté correcto en `script.js`
- [ ] Probar el enlace de WhatsApp manualmente
- [ ] Verificar que el mensaje no exceda límites de caracteres

### 2. Si Google Sheets no recibe datos
- [ ] Verificar la URL del Web App en `script.js`
- [ ] Revisar los logs en la hoja "Logs"
- [ ] Verificar permisos en Apps Script
- [ ] Probar el Web App directamente en el navegador

### 3. Si el sitio no carga correctamente
- [ ] Verificar que todos los archivos estén subidos
- [ ] Revisar la consola del navegador para errores
- [ ] Verificar que las rutas de archivos sean correctas
- [ ] Probar en modo incógnito

## ✅ Lista de Verificación Rápida (Último Paso)

- [ ] Todos los enlaces funcionan
- [ ] Todos los formularios funcionan
- [ ] El carrito funciona correctamente
- [ ] WhatsApp se abre con mensajes correctos
- [ ] Google Sheets recibe datos
- [ ] El sitio es responsive en todos los dispositivos
- [ ] No hay errores en la consola
- [ ] Los precios son correctos
- [ ] La información de contacto es correcta
- [ ] Las imágenes se cargan correctamente

---

**🎉 ¡FELICITACIONES!** Tu sitio web de El Establo está listo para lanzamiento. Realiza estas pruebas finales y estarás listo para recibir pedidos y reservas en línea.

**📅 Recomendación:** Realiza pruebas durante 24 horas antes del lanzamiento oficial para asegurarte de que todo funcione correctamente en diferentes momentos del día.