// Compara el tiempo total de cálculo del reporte v0.1 con el de la v1.0.
const path = require("path");
const { execFileSync } = require("child_process");
const { generarVentas } = require("./generador");
const a = require("./analitica");
const { calcularReporte } = require("./reporte");

// Cálculos del reporte v0.1 (cinco secciones, todas con funciones lineales).
// Si se pasa una función de recurrentes, se le suma el reporte de clientes recurrentes.
function calcularReporteV01(ventas, recurrentes) {
  return {
    total: a.totalVendido(ventas),
    unidades: a.unidadesVendidas(ventas),
    mayor: a.ventaMayor(ventas),
    ticket: a.ticketPromedio(ventas),
    ciudades: a.totalPorCiudad(ventas),
    productos: a.unidadesPorProducto(ventas),
    top: a.topProductosPorValor(ventas, 3),
    diaConVentas: a.ventasDelDia(ventas, "2026-09-03"),
    diaSinVentas: a.ventasDelDia(ventas, "2026-10-01"),
    recurrentes: recurrentes ? recurrentes(ventas) : null,
  };
}

// Tiempo medio en ms. Con varias repeticiones hay una ejecución previa de calentamiento.
function medir(funcion, repeticiones) {
  if (repeticiones > 1) {
    funcion();
  }
  const inicio = performance.now();
  for (let i = 0; i < repeticiones; i++) {
    funcion();
  }
  return (performance.now() - inicio) / repeticiones;
}

const formato = (ms) => ms.toLocaleString("es-CO", { maximumFractionDigits: 1 });

console.log("Midiendo (con 100.000 ventas, la versión con la función original tarda cerca de un minuto)...\n");

const filas = [];
for (const n of [10000, 100000]) {
  const ventas = generarVentas(n);
  const rapido = n <= 10000 ? 20 : 5;
  filas.push({
    n,
    v01: medir(() => calcularReporteV01(ventas), rapido),
    v01Lento: medir(() => calcularReporteV01(ventas, a.clientesRecurrentes), 1),
    v10: medir(() => calcularReporte(ventas), rapido),
  });
}

console.log("| Reporte | 10.000 ventas | 100.000 ventas |");
console.log("|---|---|---|");
console.log(`| v0.1 como se entregó (5 secciones) | ${formato(filas[0].v01)} ms | ${formato(filas[1].v01)} ms |`);
console.log(`| v0.1 + clientes recurrentes con la función original O(n²) | ${formato(filas[0].v01Lento)} ms | ${formato(filas[1].v01Lento)} ms |`);
console.log(`| v1.0 (10 secciones) | ${formato(filas[0].v10)} ms | ${formato(filas[1].v10)} ms |`);
console.log(
  `| Mejora de v1.0 frente a v0.1 + recurrentes original | ${formato(filas[0].v01Lento / filas[0].v10)} veces más rápida | ${formato(filas[1].v01Lento / filas[1].v10)} veces más rápida |`
);

// Tiempo de punta a punta del comando real (incluye arrancar Node, generar los datos e imprimir).
const reporte = path.join(__dirname, "reporte.js");
const inicio = performance.now();
execFileSync(process.execPath, [reporte, "100000"], { stdio: "pipe", maxBuffer: 1024 * 1024 * 10 });
const total = performance.now() - inicio;
console.log(`\nComando \`node src/reporte.js 100000\` de punta a punta: ${formato(total)} ms (${(total / 1000).toFixed(2)} s)`);