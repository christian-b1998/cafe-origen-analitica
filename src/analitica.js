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

// ===== MiniReto 3: versiones con métodos de arreglo =====

// map transforma cada venta en su valor; reduce los acumula (inicio en 0).
function totalVendidoM(ventas) {
  return ventas.map((venta) => valorVenta(venta)).reduce((acum, valor) => acum + valor, 0);
}

function unidadesVendidasM(ventas) {
  return ventas.reduce((acum, venta) => acum + venta.cantidad, 0);
}

// filter deja solo las ventas de la ciudad; luego se acumula su valor.
function ventasPorCiudadM(ventas, ciudad) {
  const objetivo = ciudad.trim().toLowerCase();
  return ventas
    .filter((venta) => venta.ciudad.trim().toLowerCase() === objetivo)
    .reduce((acum, venta) => acum + valorVenta(venta), 0);
}

// ===== Agrupaciones y rankings =====

// Normaliza el nombre de una ciudad: sin espacios sobrantes, minúsculas
// y primera letra en mayúscula ("medellín " -> "Medellín").
function normalizarCiudad(ciudad) {
  const limpia = ciudad.trim().toLowerCase();
  return limpia.charAt(0).toUpperCase() + limpia.slice(1);
}

// Devuelve { Medellín: 356000, Bogotá: ..., ... }
function totalPorCiudad(ventas) {
  return ventas.reduce((grupos, venta) => {
    const clave = normalizarCiudad(venta.ciudad);
    grupos[clave] = (grupos[clave] || 0) + valorVenta(venta);
    return grupos;
  }, {});
}

// Devuelve { "Origen Huila 500 g": 7, ... }
function unidadesPorProducto(ventas) {
  return ventas.reduce((grupos, venta) => {
    grupos[venta.producto] = (grupos[venta.producto] || 0) + venta.cantidad;
    return grupos;
  }, {});
}

// Devuelve los k productos con mayor valor generado, de mayor a menor.
// Formato: [{ producto: "...", valor: 123 }, ...]
function topProductosPorValor(ventas, k) {
  const valores = ventas.reduce((grupos, venta) => {
    grupos[venta.producto] = (grupos[venta.producto] || 0) + valorVenta(venta);
    return grupos;
  }, {});

  const ranking = Object.entries(valores).map(([producto, valor]) => ({ producto, valor }));

  // [...ranking] copia el arreglo para ordenar sin tocar el original.
  return [...ranking].sort((a, b) => b.valor - a.valor).slice(0, k);
}

// ===== MiniReto 4: ventas de un día =====

// Devuelve las ventas cuya fecha (AAAA-MM-DD) coincide con la pedida.
// Fecha sin ventas o arreglo vacío -> [] (nunca null ni error).
function ventasDelDia(ventas, fecha) {
  const objetivo = fecha.trim();
  return ventas.filter((venta) => venta.fecha === objetivo);
}

module.exports = {
  valorVenta,
  totalVendido,
  unidadesVendidas,
  ventaMayor,
  ticketPromedio,
  ventasPorCiudad,
  totalVendidoM,
  unidadesVendidasM,
  ventasPorCiudadM,
  totalPorCiudad,
  unidadesPorProducto,
  topProductosPorValor,
  ventasDelDia,
};