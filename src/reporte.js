// Café Origen - Analítica v0.1: reporte de ventas por consola.
const { ventas } = require("./datos");
const {
  totalVendido,
  unidadesVendidas,
  ventaMayor,
  ticketPromedio,
  valorVenta,
  totalPorCiudad,
  unidadesPorProducto,
  topProductosPorValor,
  ventasDelDia,
} = require("./analitica");

const ANCHO = 62;

// ---------- Utilidades de formato ----------

function pesos(valor) {
  return "$ " + valor.toLocaleString("es-CO");
}

function titulo(texto) {
  console.log("\n" + "=".repeat(ANCHO));
  console.log(texto.toUpperCase());
  console.log("=".repeat(ANCHO));
}

// Una línea "etiqueta ........ valor" alineada a la derecha.
function fila(etiqueta, valor) {
  const texto = String(valor);
  const puntos = ANCHO - etiqueta.length - texto.length - 2;
  console.log(`${etiqueta} ${".".repeat(Math.max(puntos, 2))} ${texto}`);
}

// Convierte un diccionario { clave: número } en un arreglo ordenado de mayor a menor.
function ordenarDiccionario(diccionario) {
  return Object.entries(diccionario).sort((a, b) => b[1] - a[1]);
}

function porcentaje(parte, todo) {
  if (todo === 0) {
    return "0,0 %";
  }
  return ((parte / todo) * 100).toFixed(1).replace(".", ",") + " %";
}

// ---------- Secciones ----------

function resumenGeneral(datos) {
  titulo("1. Resumen general");
  const validas = datos.filter((venta) => venta.cantidad > 0).length;
  const mayor = ventaMayor(datos);

  fila("Registros en el historial", datos.length);
  fila("Ventas válidas (cantidad > 0)", validas);
  fila("Total vendido", pesos(totalVendido(datos)));
  fila("Unidades vendidas", unidadesVendidas(datos));
  fila("Ticket promedio por venta", pesos(Math.round(ticketPromedio(datos))));
  if (mayor === null) {
    fila("Venta más grande", "sin ventas");
  } else {
    fila("Venta más grande", pesos(valorVenta(mayor)));
    console.log(`   (id ${mayor.id}: ${mayor.producto}, ${mayor.ciudad}, ${mayor.fecha})`);
  }
}

function seccionCiudades(datos) {
  titulo("2. Ventas por ciudad");
  const total = totalVendido(datos);
  const ciudades = ordenarDiccionario(totalPorCiudad(datos));
  for (const [ciudad, valor] of ciudades) {
    const etiqueta = ciudad.padEnd(14);
    console.log(`${etiqueta}${pesos(valor).padStart(16)}${porcentaje(valor, total).padStart(12)}`);
  }
  const sumaCiudades = ciudades.reduce((acum, [, valor]) => acum + valor, 0);
  const cuadra = sumaCiudades === total ? "OK" : "NO CUADRA";
  console.log("-".repeat(ANCHO));
  console.log(`Control: suma de ciudades = total vendido -> ${cuadra}`);
}

function seccionProductos(datos) {
  titulo("3. Unidades por producto");
  for (const [producto, unidades] of ordenarDiccionario(unidadesPorProducto(datos))) {
    console.log(`${producto.padEnd(24)}${String(unidades).padStart(6)} uds`);
  }
}

function seccionTop(datos) {
  titulo("4. Top 3 productos por valor generado");
  const top = topProductosPorValor(datos, 3);
  top.forEach((item, indice) => {
    console.log(`${indice + 1}. ${item.producto.padEnd(24)}${pesos(item.valor).padStart(16)}`);
  });
}

function resumenDelDia(datos, fecha) {
  const delDia = ventasDelDia(datos, fecha);
  console.log(`\nDía ${fecha}`);
  console.log("-".repeat(ANCHO));
  if (delDia.length === 0) {
    console.log("Sin ventas registradas este día.");
  }
  fila("Ventas del día", delDia.length);
  fila("Total vendido", pesos(totalVendido(delDia)));
  fila("Unidades vendidas", unidadesVendidas(delDia));
  fila("Ticket promedio", pesos(Math.round(ticketPromedio(delDia))));
}

function seccionDias(datos) {
  titulo("5. Resumen por día");
  resumenDelDia(datos, "2026-09-03"); // día con ventas
  resumenDelDia(datos, "2026-09-07"); // día sin ventas
}

// ---------- Reporte completo ----------

console.log("CAFÉ ORIGEN - REPORTE DE VENTAS (Analítica v0.1)");
console.log("Periodo: " + ventas[0].fecha + " a " + ventas[ventas.length - 1].fecha);
resumenGeneral(ventas);
seccionCiudades(ventas);
seccionProductos(ventas);
seccionTop(ventas);
seccionDias(ventas);
console.log("\n" + "=".repeat(ANCHO));
console.log("Fin del reporte");