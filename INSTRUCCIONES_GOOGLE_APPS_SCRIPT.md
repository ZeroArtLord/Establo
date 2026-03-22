# INSTRUCCIONES PARA CONFIGURAR GOOGLE APPS SCRIPT - EL ESTABLO

## 📋 Resumen
Este documento explica cómo configurar el backend de Google Apps Script para recibir pedidos y reservas desde la web de El Establo y guardarlos en Google Sheets.

## 🚀 Pasos de Configuración

### 1. Crear la Hoja de Cálculo
1. Ve a [Google Sheets](https://sheets.google.com)
2. Crea una nueva hoja de cálculo llamada "El Establo - Pedidos y Reservas"
3. No es necesario crear las hojas manualmente, el script las creará automáticamente

### 2. Obtener el ID de la Hoja de Cálculo
1. Abre tu hoja de cálculo
2. Mira la URL en el navegador:
   ```
   https://docs.google.com/spreadsheets/d/ESTE_ES_TU_ID_DE_HOJA/edit#gid=0
   ```
3. Copia el texto entre `/d/` y `/edit` (ej: `1AbC2dEf3GhI4jKl5MnOp6QrStUvWxYz`)

### 3. Configurar Google Apps Script
1. En tu hoja de cálculo, ve a **Extensions > Apps Script**
2. Se abrirá una nueva pestaña del editor de Apps Script
3. Borra todo el código que aparece por defecto
4. Copia y pega el código completo del archivo `google_apps_script.js`
5. **IMPORTANTE:** Reemplaza `'TU_ID_DE_HOJA_DE_CALCULO_AQUI'` con tu ID real de hoja de cálculo (paso 2)

### 4. Configurar Permisos
1. En el editor de Apps Script, haz clic en **Deploy > New deployment**
2. Selecciona **Web app** como tipo de despliegue
3. Configura los siguientes parámetros:
   - **Description:** "El Establo - Backend API"
   - **Execute as:** "Me" (tu cuenta de Google)
   - **Who has access:** "Anyone" (cualquiera puede acceder)
4. Haz clic en **Deploy**
5. **IMPORTANTE:** La primera vez te pedirá autorización:
   - Haz clic en "Review permissions"
   - Selecciona tu cuenta de Google
   - Haz clic en "Advanced" y luego "Go to El Establo - Backend API (unsafe)"
   - Haz clic en "Allow" para conceder permisos

### 5. Obtener la URL del Webhook
1. Después del despliegue, copia la **URL del Web App**
2. Se verá algo como:
   ```
   https://script.google.com/macros/s/AKfycby.../exec
   ```
3. **GUARDA ESTA URL** - la necesitarás en el siguiente paso

### 6. Actualizar el Archivo script.js
1. Abre el archivo `script.js` en tu proyecto
2. Busca la línea que dice:
   ```javascript
   const GOOGLE_SHEETS_WEBHOOK = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
   ```
3. Reemplaza la URL con la que obtuviste en el paso 5
4. Guarda el archivo

## 📊 Estructura de la Hoja de Cálculo

El script creará automáticamente 3 hojas:

### 1. Hoja "Pedidos"
- **Timestamp:** Fecha y hora del pedido
- **ID_Pedido:** Identificador único (ej: ORD-20250322-153045-ABC1)
- **Nombre_Cliente:** Nombre completo del cliente
- **Telefono:** Número de teléfono
- **Email:** Correo electrónico (opcional)
- **Tipo_Entrega:** "Retiro en local" o "Delivery"
- **Zona_Entrega:** Zona de delivery (si aplica)
- **Costo_Envio:** Costo del envío
- **Subtotal:** Subtotal del pedido
- **Total:** Total a pagar
- **Cantidad_Productos:** Número de productos
- **Detalle_Productos:** Lista de productos con cantidades y precios
- **Personalizaciones:** Opciones personalizadas (término, extras, etc.)
- **Estado:** "Pendiente" (puedes cambiarlo manualmente)
- **Notas:** Campo para notas internas

### 2. Hoja "Reservas"
- **Timestamp:** Fecha y hora de la solicitud
- **ID_Reserva:** Identificador único (ej: RES-20250322-153045-DEF2)
- **Nombre_Cliente:** Nombre completo
- **Telefono:** Número de teléfono
- **Fecha_Reserva:** Fecha solicitada para la reserva
- **Personas:** Número de personas
- **Tipo_Evento:** Cumpleaños, Aniversario, etc.
- **Notas_Especiales:** Notas del cliente
- **Consentimiento_Promociones:** "Sí" o "No"
- **Estado:** "Pendiente" (puedes cambiarlo manualmente)
- **Confirmado_Por:** Para registrar quién confirmó la reserva
- **Fecha_Confirmacion:** Fecha de confirmación

### 3. Hoja "Logs" (automática)
- Registra todas las solicitudes recibidas
- Útil para debugging y monitoreo

## 🔧 Pruebas de Funcionamiento

### Prueba 1: Verificar que el Script está Activo
1. Abre la URL de tu Web App en el navegador
2. Deberías ver un mensaje JSON como:
   ```json
   {"status":"online","service":"El Establo - Backend API","version":"1.0"}
   ```

### Prueba 2: Probar con un Pedido Simulado
1. Abre la consola del navegador en tu sitio web
2. Agrega productos al carrito
3. Completa el proceso de checkout
4. Verifica que:
   - Se abre WhatsApp con el mensaje del pedido
   - En la consola aparece "✅ Pedido registrado: ORD-..."
   - En tu hoja de Google Sheets aparece una nueva fila en "Pedidos"

### Prueba 3: Probar con una Reserva
1. Llena el formulario de reservaciones
2. Envía la solicitud
3. Verifica que:
   - Se abre WhatsApp con los detalles de la reserva
   - En la consola aparece "✅ Reserva registrada: RES-..."
   - En tu hoja de Google Sheets aparece una nueva fila en "Reservas"

## ⚠️ Advertencias de Seguridad y Límites

### Límites de Google Apps Script (Plan Gratuito)
- **100,000 llamadas por día** (más que suficiente para un restaurante)
- **6 minutos de tiempo de ejecución** por solicitud
- **50 MB de almacenamiento** para scripts
- **250 MB de almacenamiento** para propiedades del script

### Recomendaciones de Seguridad
1. **No compartas la URL del Web App** públicamente
2. **Monitorea los logs** regularmente para detectar actividad sospechosa
3. **Configura notificaciones** en Google Sheets para nuevos pedidos
4. **Haz backups periódicos** de la hoja de cálculo

### Configuración de Notificaciones en Google Sheets
1. Abre tu hoja de cálculo
2. Ve a **Tools > Notification rules**
3. Configura:
   - "A user submits a form" → "Any changes are made"
   - "Email notification frequency" → "Right away"
   - Ingresa tu email

## 🛠️ Solución de Problemas Comunes

### Problema: "Error al procesar la solicitud"
- **Causa:** ID de hoja de cálculo incorrecto
- **Solución:** Verifica que el ID en el script sea correcto

### Problema: No aparecen datos en la hoja
- **Causa:** Permisos no configurados correctamente
- **Solución:** Revisa los permisos en Apps Script y vuelve a desplegar

### Problema: Error 403 (Forbidden)
- **Causa:** La Web App no está configurada como "Anyone"
- **Solución:** Cambia los permisos a "Anyone" y vuelve a desplegar

### Problema: Datos truncados o incompletos
- **Causa:** Límite de caracteres en celdas de Google Sheets
- **Solución:** El script ya limita los datos a 500 caracteres para evitar esto

## 📱 Configuración para Móviles

### Notificaciones en tu Teléfono
1. Instala la app **Google Sheets** en tu teléfono
2. Abre tu hoja de cálculo "El Establo - Pedidos y Reservas"
3. Activa las notificaciones push en la app
4. Cada nuevo pedido/reserva te llegará como notificación

### Acceso Rápido desde el Teléfono
1. Agrega un acceso directo a la hoja de cálculo en tu pantalla de inicio
2. Configura filtros para ver solo pedidos "Pendientes"

## 🔄 Mantenimiento y Actualizaciones

### Actualizar el Script
1. Si necesitas hacer cambios en el código:
   - Edita el archivo `google_apps_script.js`
   - Copia y pega en Apps Script
   - Haz un nuevo despliegue (Deploy > Manage deployments > Edit)
   - No cambies la URL para no tener que actualizar `script.js`

### Limpieza Periódica
1. **Mensualmente:** Exporta los datos antiguos a otro archivo
2. **Trimestralmente:** Revisa y elimina registros duplicados
3. **Anualmente:** Revisa los límites de uso

## 📞 Soporte

Si tienes problemas con la configuración:
1. Revisa los logs en la hoja "Logs"
2. Verifica la consola del navegador para mensajes de error
3. Asegúrate de que la URL del Web App sea correcta en `script.js`

## ✅ Lista de Verificación Final

- [ ] Hoja de cálculo creada
- [ ] ID de hoja copiado correctamente
- [ ] Script de Apps Script pegado y configurado
- [ ] Permisos otorgados correctamente
- [ ] Web App desplegada con acceso "Anyone"
- [ ] URL del Web App copiada
- [ ] Variable `GOOGLE_SHEETS_WEBHOOK` actualizada en `script.js`
- [ ] Prueba de pedido exitosa
- [ ] Prueba de reserva exitosa
- [ ] Notificaciones configuradas en Google Sheets
- [ ] App de Google Sheets instalada en el teléfono

---

**¡Felicidades!** 🎉 Tu sistema de pedidos y reservas de El Establo está completamente funcional. Los datos se guardarán automáticamente en Google Sheets y recibirás notificaciones de cada nuevo pedido/reserva.