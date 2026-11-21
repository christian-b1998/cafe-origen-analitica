const { generarVentas } = require("./generador");
const { clientesRecurrentes } = require("./analitica");

// Mide una ejecución: imprime con console.time y devuelve los milisegundos.
function medir(etiqueta, ventas) {
  console.time(etiqueta);
  const inicio = performance.now();
  clientesRecurrentes(ventas);
  const ms = performance.now() - inicio;
  console.timeEnd(etiqueta);
  return ms;
}

// Calentamiento: la primera ejecución suele ser más lenta mientras Node optimiza.
clientesRecurrentes(generarVentas(500));

const tamanos = [1000, 2000, 4000, 8000, 16000];
const filas = [];
let anterior = null;

for (const n of tamanos) {
  const ms = medir("n = " + n, generarVentas(n));
  filas.push({
    n,
    ms: Number(ms.toFixed(2)),
    "veces vs. anterior": anterior === null ? "-" : Number((ms / anterior).toFixed(2)),
  });
  anterior = ms;
}

console.table(filas);

// Estimación: si tiempo = k * n², entonces k = tiempo / n² (con la medición más grande).
const ultima = filas[filas.length - 1];
const k = ultima.ms / (ultima.n * ultima.n);
const estimar = (n) => (k * n * n) / 1000; // segundos

const est100k = estimar(100000);
const est1M = estimar(1000000);
console.log("\nk (ms por n²):", k);
console.log("Estimación n = 100.000:   " + est100k.toFixed(1) + " s (" + (est100k / 60).toFixed(1) + " min)");
console.log("Estimación n = 1.000.000: " + est1M.toFixed(0) + " s (" + (est1M / 3600).toFixed(1) + " horas)");

// Solo se ejecuta 100.000 si la estimación es menor a dos minutos.
if (est100k < 120) {
  const real = medir("n = 100000 (real)", generarVentas(100000)) / 1000;
  console.log("Medido n = 100.000: " + real.toFixed(1) + " s (estimado " + est100k.toFixed(1) + " s)");
} else {
  console.log("No se ejecuta n = 100.000: la estimación supera los dos minutos.");
}