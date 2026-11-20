// Indicadores básicos de Café Origen, con ciclos manuales (sin map, filter ni reduce).

// Valor de una línea de venta: precio unitario por cantidad.
function valorVenta(venta) {
  return venta.cantidad * venta.precio;
}

// Suma el valor de todas las ventas. Arreglo vacío -> 0.
function totalVendido(ventas) {
  let total = 0;
  for (const venta of ventas) {
    total += valorVenta(venta);
  }
  return total;
}

// Suma las unidades de todas las ventas. Arreglo vacío -> 0.
function unidadesVendidas(ventas) {
  let unidades = 0;
  for (const venta of ventas) {
    unidades += venta.cantidad;
  }
  return unidades;
}

// Devuelve el registro completo de la venta de mayor valor.
// Ignora ventas con cantidad 0. Arreglo vacío (o sin ventas válidas) -> null.
function ventaMayor(ventas) {
  let mayor = null;
  for (const venta of ventas) {
    if (venta.cantidad > 0) {
      if (mayor === null || valorVenta(venta) > valorVenta(mayor)) {
        mayor = venta;
      }
    }
  }
  return mayor;
}

// Valor total dividido entre las ventas válidas (cantidad > 0).
// Sin ventas válidas -> 0 (evita dividir entre cero y devolver NaN).
function ticketPromedio(ventas) {
  let total = 0;
  let validas = 0;
  for (const venta of ventas) {
    if (venta.cantidad > 0) {
      total += valorVenta(venta);
      validas += 1;
    }
  }
  if (validas === 0) {
    return 0;
  }
  return total / validas;
}

// Total vendido en una ciudad, ignorando mayúsculas y espacios sobrantes.
// Ciudad sin ventas o arreglo vacío -> 0.
function ventasPorCiudad(ventas, ciudad) {
  const objetivo = ciudad.trim().toLowerCase();
  let total = 0;
  for (const venta of ventas) {
    if (venta.ciudad.trim().toLowerCase() === objetivo) {
      total += valorVenta(venta);
    }
  }
  return total;
}

module.exports = {
  valorVenta,
  totalVendido,
  unidadesVendidas,
  ventaMayor,
  ticketPromedio,
  ventasPorCiudad,
};