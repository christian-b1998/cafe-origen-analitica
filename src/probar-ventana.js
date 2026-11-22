const { catalogo } = require("./catalogo");
const { generarDias } = require("./generador");
const { mejorSemanaBruta, mejorSemana, parMasCercano } = require("./analitica");

const ventasDiarias = [320, 410, 280, 390, 510, 620, 700, 300, 290, 450,
  480, 530, 610, 680, 350, 330, 420, 470, 560, 640,
  710, 380, 360, 440, 500, 590, 650, 720, 400, 370];

const mismo = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// ===== Mejor semana =====
console.log("=== Septiembre (k = 7) ===");
const bruta = mejorSemanaBruta(ventasDiarias, 7);
const ventana = mejorSemana(ventasDiarias, 7);
console.log(mismo(bruta, ventana) ? "OK" : "DIFERENTE", "bruta:", bruta, "| ventana:", ventana);
console.log(`Mejor semana: del día ${ventana.inicio + 1} al día ${ventana.inicio + 7} de septiembre, total ${ventana.total} (miles)`);

console.log("\nTres primeras posiciones de la ventana:");
let suma = ventasDiarias.slice(0, 7).reduce((a, b) => a + b, 0);
console.log(`  días 1-7: ${suma}`);
for (let i = 7; i < 9; i++) {
  const entra = ventasDiarias[i];
  const sale = ventasDiarias[i - 7];
  suma += entra - sale;
  console.log(`  días ${i - 5}-${i + 1}: entra ${entra}, sale ${sale} -> ${suma}`);
}

console.log("\n=== Casos borde ===");
console.log("k mayor que los días:", mejorSemana([1, 2, 3], 5), mejorSemanaBruta([1, 2, 3], 5));
console.log("k = 0:", mejorSemana([1, 2, 3], 0));
console.log("arreglo vacío:", mejorSemana([], 3));
console.log("k = número de días:", mejorSemana([1, 2, 3], 3));
console.log("empate (todos iguales):", mejorSemana([5, 5, 5, 5], 2), mejorSemanaBruta([5, 5, 5, 5], 2));

console.log("\n=== 100.000 días generados ===");
const dias = generarDias(100000);
for (const k of [7, 100, 1000]) {
  console.time(`bruta   k=${k}`);
  const b = mejorSemanaBruta(dias, k);
  console.timeEnd(`bruta   k=${k}`);
  console.time(`ventana k=${k}`);
  const v = mejorSemana(dias, k);
  console.timeEnd(`ventana k=${k}`);
  console.log(`  ${mismo(b, v) ? "OK" : "DIFERENTE"} total ${v.total}, inicio ${v.inicio}`);
}

// ===== Par más cercano =====
console.log("\n=== parMasCercano ===");
const nombres = (r) => (r === null ? null : `${r.productos.map((p) => p.nombre).join(" + ")} = ${r.suma}`);
for (const presupuesto of [100000, 140000, 40000, 44000, 43999, 87000]) {
  console.log(`${presupuesto}:`, nombres(parMasCercano(catalogo, presupuesto)));
}
console.log("catálogo vacío:", parMasCercano([], 100000));
console.log("un producto:", parMasCercano([catalogo[0]], 100000));

// Catálogo original sin tocar
console.log("¿catálogo conserva su orden?", catalogo[0].nombre === "Origen Nariño 250 g");

// Comprobación cruzada con fuerza bruta (todos los pares)
function mejorParBruto(cat, presupuesto) {
  let mejor = -1;
  for (let i = 0; i < cat.length; i++)
    for (let j = i + 1; j < cat.length; j++) {
      const s = cat[i].precio + cat[j].precio;
      if (s <= presupuesto && s > mejor) mejor = s;
    }
  return mejor === -1 ? null : mejor;
}
let ok = true;
for (let presupuesto = 0; presupuesto <= 260000; presupuesto += 1000) {
  const r = parMasCercano(catalogo, presupuesto);
  const esperado = mejorParBruto(catalogo, presupuesto);
  if ((r === null ? null : r.suma) !== esperado) ok = false;
  if (r !== null && r.suma > presupuesto) ok = false;
}
console.log("Presupuestos de 0 a 260.000 contra fuerza bruta (nunca supera el presupuesto):", ok ? "OK" : "DIFERENTE");

console.log("\n=== Traza de los punteros con 100.000 ===");
const ord = [...catalogo].sort((a, b) => a.precio - b.precio);
let izq = 0, der = ord.length - 1, mejor = null, paso = 1;
while (izq < der) {
  const s = ord[izq].precio + ord[der].precio;
  let accion;
  if (s > 100000) { accion = "se pasa -> der--"; }
  else {
    if (mejor === null || s > mejor) { mejor = s; accion = "cabe y mejora (" + s + ") -> izq++"; }
    else accion = "cabe, no mejora -> izq++";
  }
  console.log(`${paso++}. izq=${izq} (${ord[izq].precio}) der=${der} (${ord[der].precio}) suma=${s}: ${accion}`);
  if (s > 100000) der--; else izq++;
}
console.log("mejor suma:", mejor);