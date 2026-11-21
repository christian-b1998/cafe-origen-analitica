// Reproducción de los dos errores reportados por la gerente (MiniReto 4).
// Las funciones "ingenuas" imitan la versión preliminar del compañero.
// Las funciones corregidas son las de analitica.js.
const { ventas } = require("./datos");
const { totalPorCiudad, ticketPromedio, ventasDelDia, totalVendido } = require("./analitica");

// --- Versión preliminar: agrupa por ciudad SIN normalizar ---
function totalPorCiudadIngenuo(datos) {
  const grupos = {};
  for (const venta of datos) {
    grupos[venta.ciudad] = (grupos[venta.ciudad] || 0) + venta.cantidad * venta.precio;
  }
  return grupos;
}

// --- Versión preliminar: divide entre el número de ventas sin revisar si es 0 ---
function ticketPromedioIngenuo(datos) {
  let total = 0;
  for (const venta of datos) {
    total += venta.cantidad * venta.precio;
  }
  return total / datos.length;
}

// ===== Error 1: "Bogotá aparecía dos veces" =====
console.log("=== ERROR 1: grupos duplicados ===");

// Entrada que lo produce: la misma ciudad escrita con un espacio al final.
const conBogotaSucia = [...ventas, { id: 13, fecha: "2026-09-06", cliente: "C09", producto: "Molino manual", ciudad: "Bogotá ", cantidad: 1, precio: 120000 }];

console.log("Datos de la muestra, versión ingenua:", Object.keys(totalPorCiudadIngenuo(ventas)));
console.log("Con 'Bogotá ' (espacio), versión ingenua:", Object.keys(totalPorCiudadIngenuo(conBogotaSucia)));
console.log("Mismos datos, versión corregida:", Object.keys(totalPorCiudad(conBogotaSucia)));
console.log("Bogotá corregido:", totalPorCiudad(conBogotaSucia)["Bogotá"], "(esperado 276000 + 120000 = 396000)");

// ===== Error 2: ticket promedio NaN en un día sin ventas =====
console.log("\n=== ERROR 2: NaN en día sin ventas ===");
const diaSinVentas = ventasDelDia(ventas, "2026-09-07");
console.log("Ventas del 2026-09-07:", diaSinVentas, "-> longitud", diaSinVentas.length);
console.log("Versión ingenua:", ticketPromedioIngenuo(diaSinVentas), "(0 / 0)");
console.log("Versión corregida:", ticketPromedio(diaSinVentas));

// Variante: día con registros, pero todos con cantidad 0
const soloCero = [ventas[7]]; // id 8, cantidad 0
console.log("\nSolo ventas con cantidad 0 -> ingenua:", ticketPromedioIngenuo(soloCero), "| corregida:", ticketPromedio(soloCero));

// Comprobación de que el total no cambió
console.log("\nTotal vendido con la muestra:", totalVendido(ventas));