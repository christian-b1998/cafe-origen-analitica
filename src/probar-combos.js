const { catalogo } = require("./catalogo");
const { ventas } = require("./datos");
const { generarVentas } = require("./generador");
const {
  comboRegalo,
  comboRegaloMap,
  productoEstrellaPorCiudad,
  primerClienteUnico,
} = require("./analitica");

const nombres = (par) => (par === null ? null : par.map((p) => p.nombre));

// ===== Combos de regalo =====
console.log("=== comboRegalo (fuerza bruta) y comboRegaloMap (Map) ===");
const casos = [
  ["87.000", catalogo, 87000],
  ["61.000", catalogo, 61000],
  ["50.000 (sin combinación)", catalogo, 50000],
  ["52.000 (26.000 + 26.000: el mismo producto no vale)", catalogo, 52000],
  ["0", catalogo, 0],
  ["catálogo vacío", [], 87000],
  ["catálogo de un producto", [catalogo[0]], 52000],
];
for (const [nombre, datos, valor] of casos) {
  const bruta = comboRegalo(datos, valor);
  const optimizada = comboRegaloMap(datos, valor);
  const igual = JSON.stringify(bruta) === JSON.stringify(optimizada);
  console.log(`${igual ? "OK" : "DIFERENTE"}  ${nombre}: ${JSON.stringify(nombres(optimizada))}`);
}

// Dos productos distintos con el mismo precio sí pueden formar el combo
const iguales = [
  { nombre: "A", precio: 40000 },
  { nombre: "B", precio: 40000 },
];
console.log("Dos productos de 40.000 y valor 80.000:", JSON.stringify(nombres(comboRegaloMap(iguales, 80000))));

// ===== Traza de la versión optimizada para 87.000 =====
console.log("\n=== Traza de comboRegaloMap con 87.000 ===");
const vistos = new Map();
const traza = [];
for (const producto of catalogo) {
  const complemento = 87000 - producto.precio;
  const encontrado = vistos.has(complemento);
  traza.push({
    producto: producto.nombre,
    precio: producto.precio,
    complemento,
    "¿está en el Map?": encontrado ? "sí: " + vistos.get(complemento).nombre : "no",
    "Map antes de guardar": [...vistos.keys()].join(", ") || "(vacío)",
  });
  if (encontrado) break;
  vistos.set(producto.precio, producto);
}
console.table(traza);

// ===== Producto estrella por ciudad =====
console.log("\n=== productoEstrellaPorCiudad ===");
console.log("Día 1:", productoEstrellaPorCiudad(ventas));
console.log("Vacío:", productoEstrellaPorCiudad([]));

// Empate: gana el primero que apareció en la ciudad
const empate = [
  { ciudad: "Cali", producto: "B" },
  { ciudad: "Cali", producto: "A" },
  { ciudad: "Cali", producto: "A" },
  { ciudad: "Cali", producto: "B" },
];
console.log("Empate B,A,A,B en Cali:", productoEstrellaPorCiudad(empate));

// Comprobación cruzada con un conteo independiente (filter) sobre 5.000 ventas
const muestra = generarVentas(5000);
const estrellas = productoEstrellaPorCiudad(muestra);
let correcto = Object.keys(estrellas).length === 4;
for (const ciudad of Object.keys(estrellas)) {
  const deLaCiudad = muestra.filter((v) => v.ciudad === ciudad);
  const conteos = {};
  for (const v of deLaCiudad) conteos[v.producto] = (conteos[v.producto] || 0) + 1;
  const maximo = Math.max(...Object.values(conteos));
  if (conteos[estrellas[ciudad].producto] !== maximo || estrellas[ciudad].veces !== maximo) correcto = false;
}
console.log("5.000 ventas, 4 ciudades y cada estrella tiene el máximo:", correcto ? "OK" : "DIFERENTE");

// ===== Primer cliente único =====
console.log("\n=== primerClienteUnico ===");
console.log("Día 1:", primerClienteUnico(ventas), "(esperado C04)");
console.log("Vacío:", primerClienteUnico([]));
console.log("Todos repetidos [A, A]:", primerClienteUnico([{ cliente: "A" }, { cliente: "A" }]));
console.log("Un solo cliente [A]:", primerClienteUnico([{ cliente: "A" }]));
console.log("[A, A, B, C, C]:", primerClienteUnico([{ cliente: "A" }, { cliente: "A" }, { cliente: "B" }, { cliente: "C" }, { cliente: "C" }]));

// Comprobación cruzada con fuerza bruta (n² con 2.000 ventas)
const chica = generarVentas(2000);
let esperado = null;
for (const v of chica) {
  if (chica.filter((x) => x.cliente === v.cliente).length === 1) {
    esperado = v.cliente;
    break;
  }
}
console.log("2.000 ventas, igual que fuerza bruta:", primerClienteUnico(chica) === esperado ? "OK" : "DIFERENTE", `(${esperado})`);

// ===== Tiempo con 100.000 ventas =====
const grande = generarVentas(100000);
console.log("\n=== Tiempo con 100.000 ventas ===");
console.time("productoEstrellaPorCiudad");
productoEstrellaPorCiudad(grande);
console.timeEnd("productoEstrellaPorCiudad");
console.time("primerClienteUnico");
primerClienteUnico(grande);
console.timeEnd("primerClienteUnico");