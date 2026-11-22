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

// ===== MiniReto 6: clientes recurrentes (versión del compañero, tal cual) =====

// Clientes que compraron más de una vez. Compara cada venta con todas las siguientes.
function clientesRecurrentes(ventas) {
  const recurrentes = [];
  for (let i = 0; i < ventas.length; i++) {
    for (let j = i + 1; j < ventas.length; j++) {
      if (ventas[i].cliente === ventas[j].cliente &&
          !recurrentes.includes(ventas[i].cliente)) {
        recurrentes.push(ventas[i].cliente);
      }
    }
  }
  return recurrentes;
}

// ===== MiniReto 7: dos formas de calcular el total de una ciudad =====

// Cadena de métodos: map -> filter -> map -> reduce.
// 4 recorridos y 3 arreglos nuevos (el primero copia cada venta).
function totalCiudadCadena(ventas, ciudad) {
  const objetivo = normalizarCiudad(ciudad);
  return ventas
    .map((venta) => ({ ...venta, ciudad: normalizarCiudad(venta.ciudad) }))
    .filter((venta) => venta.ciudad === objetivo)
    .map((venta) => valorVenta(venta))
    .reduce((acum, valor) => acum + valor, 0);
}

// Un solo ciclo, sin arreglos intermedios: solo un acumulador.
function totalCiudadUnaPasada(ventas, ciudad) {
  const objetivo = normalizarCiudad(ciudad);
  let total = 0;
  for (const venta of ventas) {
    if (normalizarCiudad(venta.ciudad) === objetivo) {
      total += valorVenta(venta);
    }
  }
  return total;
}

// ===== MiniReto 9: clientes recurrentes en tiempo lineal =====

// Versión con Set: un solo recorrido, con un Set de clientes ya vistos
// y otro Set con los recurrentes (sin repetidos).
function clientesRecurrentesSet(ventas) {
  const vistos = new Set();
  const recurrentes = new Set();
  for (const venta of ventas) {
    if (vistos.has(venta.cliente)) {
      recurrentes.add(venta.cliente);
    } else {
      vistos.add(venta.cliente);
    }
  }
  return [...recurrentes];
}

// Map cliente -> número de compras.
function comprasPorCliente(ventas) {
  const compras = new Map();
  for (const venta of ventas) {
    compras.set(venta.cliente, (compras.get(venta.cliente) || 0) + 1);
  }
  return compras;
}

// Versión con Map: los recurrentes son los clientes con más de 1 compra.
function clientesRecurrentesMap(ventas) {
  const recurrentes = [];
  for (const [cliente, compras] of comprasPorCliente(ventas)) {
    if (compras > 1) {
      recurrentes.push(cliente);
    }
  }
  return recurrentes;
}

// ===== MiniReto 10: combos de regalo y frecuencias =====

// Fuerza bruta: prueba todos los pares (i, j) con i < j.
// Tiempo O(n²), espacio O(1). Devuelve [productoA, productoB] o null.
function comboRegalo(catalogo, valor) {
  for (let i = 0; i < catalogo.length; i++) {
    for (let j = i + 1; j < catalogo.length; j++) {
      if (catalogo[i].precio + catalogo[j].precio === valor) {
        return [catalogo[i], catalogo[j]];
      }
    }
  }
  return null;
}

// Optimizada: un Map precio -> producto con los productos ya vistos.
// Para cada producto se pregunta si ya apareció su complemento (valor - precio).
// Tiempo O(n), espacio O(n). Devuelve [productoA, productoB] o null.
function comboRegaloMap(catalogo, valor) {
  const vistos = new Map();
  for (const producto of catalogo) {
    const complemento = valor - producto.precio;
    if (vistos.has(complemento)) {
      return [vistos.get(complemento), producto];
    }
    vistos.set(producto.precio, producto); // se guarda DESPUÉS de preguntar
  }
  return null;
}

// Producto que más veces aparece en las ventas de cada ciudad.
// Cuenta apariciones (registros de venta), no unidades.
// Empate: gana el producto que apareció primero en las ventas de esa ciudad.
// Devuelve { Ciudad: { producto, veces } }. Arreglo vacío -> {}.
function productoEstrellaPorCiudad(ventas) {
  const porCiudad = new Map(); // ciudad -> Map(producto -> veces)
  for (const venta of ventas) {
    const ciudad = normalizarCiudad(venta.ciudad);
    if (!porCiudad.has(ciudad)) {
      porCiudad.set(ciudad, new Map());
    }
    const conteo = porCiudad.get(ciudad);
    conteo.set(venta.producto, (conteo.get(venta.producto) || 0) + 1);
  }

  const estrellas = {};
  for (const [ciudad, conteo] of porCiudad) {
    let mejor = null;
    let veces = 0;
    for (const [producto, apariciones] of conteo) {
      if (apariciones > veces) { // estricto: en un empate se queda el primero
        mejor = producto;
        veces = apariciones;
      }
    }
    estrellas[ciudad] = { producto: mejor, veces };
  }
  return estrellas;
}

// Primer cliente (en orden de las ventas) que aparece una sola vez en todo el historial.
// Recorrido 1: contar compras por cliente (comprasPorCliente, del MiniReto 9).
// Recorrido 2: buscar el primero con 1 compra. Ninguno -> null.
function primerClienteUnico(ventas) {
  const compras = comprasPorCliente(ventas);
  for (const venta of ventas) {
    if (compras.get(venta.cliente) === 1) {
      return venta.cliente;
    }
  }
  return null;
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
  ventasDelDia,
  clientesRecurrentes,
  totalCiudadCadena,
  totalCiudadUnaPasada,
  clientesRecurrentesSet,
  comprasPorCliente,
  clientesRecurrentesMap,
  comboRegalo,
  comboRegaloMap,
  productoEstrellaPorCiudad,
  primerClienteUnico,
};