/**
 * GOOGLE APPS SCRIPT PARA EL ESTABLO
 * 
 * Este script recibe datos de pedidos y reservas desde la web de El Establo
 * y los guarda en una hoja de cálculo de Google Sheets.
 * 
 * INSTRUCCIONES DE CONFIGURACIÓN:
 * 1. Crear una nueva hoja de cálculo en Google Sheets
 * 2. Abrir Extensions > Apps Script
 * 3. Pegar este código completo
 * 4. Configurar las hojas según las instrucciones
 * 5. Publicar como Web App
 * 6. Copiar la URL y reemplazar en script.js
 */

// ID de la hoja de cálculo (reemplazar con el ID de tu hoja)
const SPREADSHEET_ID = 'TU_ID_DE_HOJA_DE_CALCULO_AQUI';

// Nombres de las hojas
const SHEET_NAMES = {
  ORDERS: 'Pedidos',
  RESERVATIONS: 'Reservas',
  LOGS: 'Logs'
};

// Configuración de columnas para cada hoja
const COLUMNS = {
  ORDERS: [
    'Timestamp',
    'ID_Pedido',
    'Nombre_Cliente',
    'Telefono',
    'Email',
    'Tipo_Entrega',
    'Zona_Entrega',
    'Costo_Envio',
    'Subtotal',
    'Total',
    'Cantidad_Productos',
    'Detalle_Productos',
    'Personalizaciones',
    'Estado',
    'Notas'
  ],
  RESERVATIONS: [
    'Timestamp',
    'ID_Reserva',
    'Nombre_Cliente',
    'Telefono',
    'Fecha_Reserva',
    'Personas',
    'Tipo_Evento',
    'Notas_Especiales',
    'Consentimiento_Promociones',
    'Estado',
    'Confirmado_Por',
    'Fecha_Confirmacion'
  ]
};

/**
 * Función principal que maneja las solicitudes POST
 * @param {Object} e - Evento de la solicitud HTTP
 * @return {Object} Respuesta JSON
 */
function doPost(e) {
  try {
    // Registrar la solicitud
    logRequest(e);
    
    // Parsear los datos JSON
    const data = JSON.parse(e.postData.contents);
    
    // Determinar el tipo de solicitud
    if (data.type === 'reserva') {
      return handleReservation(data);
    } else {
      return handleOrder(data);
    }
    
  } catch (error) {
    // Manejar errores
    return createErrorResponse(error);
  }
}

/**
 * Maneja los datos de pedidos
 * @param {Object} data - Datos del pedido
 * @return {Object} Respuesta JSON
 */
function handleOrder(data) {
  try {
    // Abrir la hoja de cálculo
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAMES.ORDERS) || createOrdersSheet(spreadsheet);
    
    // Generar ID único para el pedido
    const orderId = 'ORD-' + Utilities.formatDate(new Date(), 'America/Caracas', 'yyyyMMdd-HHmmss') + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();
    
    // Preparar datos para la fila
    const rowData = [
      new Date().toISOString(), // Timestamp
      orderId, // ID_Pedido
      data.customer?.name || 'No proporcionado', // Nombre_Cliente
      data.customer?.phone || 'No proporcionado', // Telefono
      data.customer?.email || 'No proporcionado', // Email
      data.delivery?.type === 'retiro' ? 'Retiro en local' : 'Delivery', // Tipo_Entrega
      data.delivery?.zone?.name || 'No aplica', // Zona_Entrega
      data.delivery?.cost || 0, // Costo_Envio
      data.totals?.subtotal || 0, // Subtotal
      data.totals?.total || 0, // Total
      data.order?.itemsCount || 0, // Cantidad_Productos
      formatProducts(data.cart), // Detalle_Productos
      formatCustomizations(data.cart), // Personalizaciones
      'Pendiente', // Estado
      '' // Notas
    ];
    
    // Agregar la fila a la hoja
    sheet.appendRow(rowData);
    
    // Aplicar formato a la nueva fila
    formatOrderRow(sheet, sheet.getLastRow());
    
    // Registrar éxito
    logSuccess('Pedido', orderId, data.customer?.name);
    
    // Retornar respuesta exitosa
    return createSuccessResponse('Pedido registrado exitosamente', {
      orderId: orderId,
      timestamp: new Date().toISOString(),
      status: 'Pendiente'
    });
    
  } catch (error) {
    logError('Error en handleOrder', error);
    throw error;
  }
}

/**
 * Maneja los datos de reservas
 * @param {Object} data - Datos de la reserva
 * @return {Object} Respuesta JSON
 */
function handleReservation(data) {
  try {
    // Abrir la hoja de cálculo
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAMES.RESERVATIONS) || createReservationsSheet(spreadsheet);
    
    // Generar ID único para la reserva
    const reservationId = 'RES-' + Utilities.formatDate(new Date(), 'America/Caracas', 'yyyyMMdd-HHmmss') + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();
    
    // Formatear fecha de reserva
    const reservationDate = new Date(data.date);
    const formattedDate = Utilities.formatDate(reservationDate, 'America/Caracas', 'dd/MM/yyyy');
    
    // Mapear tipo de evento
    const eventMap = {
      'cumpleaños': 'Cumpleaños',
      'aniversario': 'Aniversario',
      'corporativo': 'Corporativo',
      'cena-privada': 'Cena privada',
      'otro': 'Otro'
    };
    
    // Preparar datos para la fila
    const rowData = [
      new Date().toISOString(), // Timestamp
      reservationId, // ID_Reserva
      data.name || 'No proporcionado', // Nombre_Cliente
      data.phone || 'No proporcionado', // Telefono
      formattedDate, // Fecha_Reserva
      data.people || 1, // Personas
      eventMap[data.event] || data.event || 'No especificado', // Tipo_Evento
      data.notes || '', // Notas_Especiales
      data.promoConsent ? 'Sí' : 'No', // Consentimiento_Promociones
      'Pendiente', // Estado
      '', // Confirmado_Por
      '' // Fecha_Confirmacion
    ];
    
    // Agregar la fila a la hoja
    sheet.appendRow(rowData);
    
    // Aplicar formato a la nueva fila
    formatReservationRow(sheet, sheet.getLastRow());
    
    // Registrar éxito
    logSuccess('Reserva', reservationId, data.name);
    
    // Retornar respuesta exitosa
    return createSuccessResponse('Reserva registrada exitosamente', {
      reservationId: reservationId,
      timestamp: new Date().toISOString(),
      status: 'Pendiente'
    });
    
  } catch (error) {
    logError('Error en handleReservation', error);
    throw error;
  }
}

/**
 * Formatea los productos para mostrar en la hoja
 * @param {Array} cart - Array de productos del carrito
 * @return {String} Texto formateado
 */
function formatProducts(cart) {
  if (!cart || !Array.isArray(cart)) return 'Sin productos';
  
  return cart.map(item => {
    return `${item.quantity}x ${item.name} - $${item.total.toFixed(2)}`;
  }).join('\n');
}

/**
 * Formatea las personalizaciones para mostrar en la hoja
 * @param {Array} cart - Array de productos del carrito
 * @return {String} Texto formateado
 */
function formatCustomizations(cart) {
  if (!cart || !Array.isArray(cart)) return 'Sin personalizaciones';
  
  const customizations = [];
  
  cart.forEach(item => {
    if (item.options) {
      const itemCustomizations = [];
      
      // Término de la carne
      if (item.options.meatDoneness) {
        const donenessMap = {
          'medio': 'Medio',
          'tres-cuartos': '3/4',
          'bien-cocido': 'Bien cocido'
        };
        itemCustomizations.push(`Término: ${donenessMap[item.options.meatDoneness]}`);
      }
      
      // Ingredientes para quitar
      if (item.options.removeItems && item.options.removeItems.length > 0) {
        const removeMap = {
          'sin-cebolla': 'Sin cebolla',
          'sin-salsas': 'Sin salsas'
        };
        const removeText = item.options.removeItems.map(item => removeMap[item] || item).join(', ');
        itemCustomizations.push(`Quitar: ${removeText}`);
      }
      
      // Extras
      if (item.options.extras && item.options.extras.length > 0) {
        const extraMap = {
          'doble-tocino': 'Doble tocino',
          'queso-fundido': 'Queso fundido'
        };
        const extrasText = item.options.extras.map(extra => {
          const extraName = extraMap[extra.name] || extra.name;
          return `${extraName} (+$${extra.price.toFixed(2)})`;
        }).join(', ');
        itemCustomizations.push(`Extras: ${extrasText}`);
      }
      
      // Notas especiales
      if (item.options.specialNotes) {
        itemCustomizations.push(`Notas: ${item.options.specialNotes}`);
      }
      
      if (itemCustomizations.length > 0) {
        customizations.push(`${item.name}: ${itemCustomizations.join(' | ')}`);
      }
    }
  });
  
  return customizations.join('\n');
}

/**
 * Crea la hoja de pedidos si no existe
 * @param {Spreadsheet} spreadsheet - Hoja de cálculo
 * @return {Sheet} Hoja de pedidos
 */
function createOrdersSheet(spreadsheet) {
  const sheet = spreadsheet.insertSheet(SHEET_NAMES.ORDERS);
  sheet.getRange(1, 1, 1, COLUMNS.ORDERS.length).setValues([COLUMNS.ORDERS]);
  sheet.getRange(1, 1, 1, COLUMNS.ORDERS.length).setFontWeight('bold');
  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, COLUMNS.ORDERS.length);
  return sheet;
}

/**
 * Crea la hoja de reservas si no existe
 * @param {Spreadsheet} spreadsheet - Hoja de cálculo
 * @return {Sheet} Hoja de reservas
 */
function createReservationsSheet(spreadsheet) {
  const sheet = spreadsheet.insertSheet(SHEET_NAMES.RESERVATIONS);
  sheet.getRange(1, 1, 1, COLUMNS.RESERVATIONS.length).setValues([COLUMNS.RESERVATIONS]);
  sheet.getRange(1, 1, 1, COLUMNS.RESERVATIONS.length).setFontWeight('bold');
  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, COLUMNS.RESERVATIONS.length);
  return sheet;
}

/**
 * Aplica formato a una fila de pedido
 * @param {Sheet} sheet - Hoja de pedidos
 * @param {Number} row - Número de fila
 */
function formatOrderRow(sheet, row) {
  const range = sheet.getRange(row, 1, 1, COLUMNS.ORDERS.length);
  
  // Alternar colores de fondo para mejor legibilidad
  if (row % 2 === 0) {
    range.setBackground('#f9f9f9');
  }
  
  // Formato de moneda para columnas de precios
  [8, 9, 10].forEach(col => { // Costo_Envio, Subtotal, Total
    sheet.getRange(row, col).setNumberFormat('$#,##0.00');
  });
  
  // Formato de fecha para timestamp
  sheet.getRange(row, 1).setNumberFormat('yyyy-mm-dd hh:mm:ss');
  
  // Autoajustar altura de fila para productos y personalizaciones
  sheet.setRowHeight(row, 60);
}

/**
 * Aplica formato a una fila de reserva
 * @param {Sheet} sheet - Hoja de reservas
 * @param {Number} row - Número de fila
 */
function formatReservationRow(sheet, row) {
  const range = sheet.getRange(row, 1, 1, COLUMNS.RESERVATIONS.length);
  
  // Alternar colores de fondo para mejor legibilidad
  if (row % 2 === 0) {
    range.setBackground('#f9f9f9');
  }
  
  // Formato de fecha para timestamp
  sheet.getRange(row, 1).setNumberFormat('yyyy-mm-dd hh:mm:ss');
  
  // Formato de fecha para fecha de reserva
  sheet.getRange(row, 5).setNumberFormat('dd/mm/yyyy');
  
  // Autoajustar altura de fila para notas
  sheet.setRowHeight(row, 40);
}

/**
 * Crea una respuesta de éxito
 * @param {String} message - Mensaje de éxito
 * @param {Object} data - Datos adicionales
 * @return {Object} Respuesta JSON
 */
function createSuccessResponse(message, data = {}) {
  return ContentService
    .createTextOutput(JSON.stringify({
      success: true,
      message: message,
      timestamp: new Date().toISOString(),
      data: data
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Crea una respuesta de error
 * @param {Error} error - Objeto de error
 * @return {Object} Respuesta JSON
 */
function createErrorResponse(error) {
  logError('Error en doPost', error);
  
  return ContentService
    .createTextOutput(JSON.stringify({
      success: false,
      error: error.toString(),
      message: 'Error al procesar la solicitud',
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Registra una solicitud en el log
 * @param {Object} e - Evento de la solicitud
 */
function logRequest(e) {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let logSheet = spreadsheet.getSheetByName(SHEET_NAMES.LOGS);
    
    if (!logSheet) {
      logSheet = spreadsheet.insertSheet(SHEET_NAMES.LOGS);
      logSheet.getRange(1, 1, 1, 5).setValues([[
        'Timestamp', 'IP', 'Method', 'ContentType', 'Payload'
      ]]);
      logSheet.getRange(1, 1, 1, 5).setFontWeight('bold');
      logSheet.setFrozenRows(1);
    }
    
    const ip = e?.parameter?.source_ip || 'Desconocida';
    const payload = e?.postData?.contents ? e.postData.contents.substring(0, 500) : 'Sin datos';
    
    logSheet.appendRow([
      new Date().toISOString(),
      ip,
      'POST',
      e?.postData?.type || 'application/json',
      payload
    ]);
    
  } catch (logError) {
    console.error('Error al registrar log:', logError);
  }
}

/**
 * Registra un éxito en el log
 * @param {String} type - Tipo de operación
 * @param {String} id - ID del registro
 * @param {String} name - Nombre del cliente
 */
function logSuccess(type, id, name) {
  console.log(`✅ ${type} registrado: ${id} - ${name}`);
}

/**
 * Registra un error en el log
 * @param {String} context - Contexto del error
 * @param {Error} error - Objeto de error
 */
function logError(context, error) {
  console.error(`❌ ${context}:`, error.toString());
  
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let logSheet = spreadsheet.getSheetByName(SHEET_NAMES.LOGS);
    
    if (!logSheet) {
      logSheet = spreadsheet.insertSheet(SHEET_NAMES.LOGS);
    }
    
    logSheet.appendRow([
      new Date().toISOString(),
      'ERROR',
      context,
      error.toString(),
      error.stack || ''
    ]);
    
  } catch (logError) {
    console.error('Error al registrar error en log:', logError);
  }
}

/**
 * Función GET para pruebas (opcional)
 * @param {Object} e - Evento de la solicitud HTTP
 * @return {Object} Respuesta JSON
 */
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'online',
      service: 'El Establo - Backend API',
      version: '1.0',
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}