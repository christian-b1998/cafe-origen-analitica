const { generarVentas } = require("./generador");
const {
  clientesRecurrentes,
  clientesRecurrentesSet,
  comprasPorCliente,
  clientesRecurrentesMap,
} = require("./analitica");

// Tiempo medio en ms; la primera ejecución sirve de calentamiento.
function tiempoMedio(funcion, datos, repeticiones) {
  funcion(datos);
  const inicio = performance.now();
  for (let i = 0; i < repeticiones; i++) {
    funcion(datos);
  }
  return (performance.now() - inicio) / repeticiones;
}

const formato = (valor) =>
  valor < 0.001 ? "< 0,001" : valor.toLocaleString("es-CO", { maximumFractionDigits: 3 });

const tamanos = [1000, 10000, 100000, 1000000];
const LIMITE_ORIGINAL = 10000; // la original es O(n²): con 100.000 tarda casi un minuto

console.log("| n | Original (ms) | Set (ms) | Map (ms) | Clientes distintos | Recurrentes |");
console.log("|---|---|---|---|---|---|");

for (const n of tamanos) {
  const ventas = generarVentas(n);
  const repeticiones = n <= 10000 ? 50 : 5;

  const original = n <= LIMITE_ORIGINAL ? formato(tiempoMedio(clientesRecurrentes, ventas, 1)) : "no se ejecuta";
  const conSet = tiempoMedio(clientesRecurrentesSet, ventas, repeticiones);
  const conMap = tiempoMedio(clientesRecurrentesMap, ventas, repeticiones);

  const distintos = comprasPorCliente(ventas).size;
  const recurrentes = clientesRecurrentesSet(ventas).length;
  console.log(
    `| ${n.toLocaleString("es-CO")} | ${original} | ${formato(conSet)} | ${formato(conMap)} | ${distintos.toLocaleString("es-CO")} | ${recurrentes.toLocaleString("es-CO")} |`
  );
}

// Prueba del requisito de rendimiento: 100.000 ventas en menos de un segundo.
const cien = generarVentas(100000);
console.log("\nPrueba con 100.000 ventas (una sola ejecución):");
console.time("Set");
clientesRecurrentesSet(cien);
console.timeEnd("Set");
console.time("Map");
clientesRecurrentesMap(cien);
console.timeEnd("Map");