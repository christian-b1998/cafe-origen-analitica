// Mide el tiempo de todas las funciones del motor y proyecta a 1.000.000 de ventas.
const { generarVentas } = require("./generador");
const a = require("./analitica");
const { primeraVenta } = require("./instrumentadas");

const N = 10000;
const GRANDE = 1000000;
const ventas = generarVentas(N);
const grandes = generarVentas(GRANDE);

// Tiempo medio en ms de una función, repitiéndola varias veces.
function tiempoMedio(funcion, datos, repeticiones) {
  funcion(datos); // calentamiento
  const inicio = performance.now();
  for (let i = 0; i < repeticiones; i++) {
    funcion(datos);
  }
  return (performance.now() - inicio) / repeticiones;
}

const formato = (valor) =>
  valor < 0.001 ? "< 0,001" : valor.toLocaleString("es-CO", { maximumFractionDigits: 3 });

// Funciones lineales (recorren las ventas): se mide con 10.000 y con 1.000.000.
const lineales = [
  ["totalVendido", (v) => a.totalVendido(v)],
  ["unidadesVendidas", (v) => a.unidadesVendidas(v)],
  ["ventaMayor", (v) => a.ventaMayor(v)],
  ["ticketPromedio", (v) => a.ticketPromedio(v)],
  ["ventasPorCiudad", (v) => a.ventasPorCiudad(v, "Medellín")],
  ["totalVendidoM", (v) => a.totalVendidoM(v)],
  ["unidadesVendidasM", (v) => a.unidadesVendidasM(v)],
  ["ventasPorCiudadM", (v) => a.ventasPorCiudadM(v, "Medellín")],
  ["totalPorCiudad", (v) => a.totalPorCiudad(v)],
  ["unidadesPorProducto", (v) => a.unidadesPorProducto(v)],
  ["topProductosPorValor", (v) => a.topProductosPorValor(v, 3)],
  ["ventasDelDia", (v) => a.ventasDelDia(v, "2026-09-15")],
  ["totalCiudadCadena", (v) => a.totalCiudadCadena(v, "Medellín")],
  ["totalCiudadUnaPasada", (v) => a.totalCiudadUnaPasada(v, "Medellín")],
];

console.log("| Función | Tiempo con 10.000 (ms) | Estimado para 1.000.000 (ms) | Medido con 1.000.000 (ms) |");
console.log("|---|---|---|---|");

for (const [nombre, funcion] of lineales) {
  const t10k = tiempoMedio(funcion, ventas, 50);
  const estimado = t10k * (GRANDE / N); // lineal: x100
  const real = tiempoMedio(funcion, grandes, 3);
  console.log(`| \`${nombre}\` | ${formato(t10k)} | ${formato(estimado)} | ${formato(real)} |`);
}

// Funciones de costo constante: no dependen de n.
const tValor = tiempoMedio(() => a.valorVenta(ventas[0]), null, 100000);
const tPrimera = tiempoMedio((v) => primeraVenta(v, { operaciones: 0 }), ventas, 100000);
console.log(`| \`valorVenta\` | ${formato(tValor)} | no cambia | no cambia |`);
console.log(`| \`primeraVenta\` | ${formato(tPrimera)} | no cambia | no cambia |`);

// generarVentas: se mide con 10.000 y una vez con 1.000.000.
const tGen = tiempoMedio((n) => generarVentas(n), N, 20);
const inicioGen = performance.now();
generarVentas(GRANDE);
const tGenGrande = performance.now() - inicioGen;
console.log(`| \`generarVentas\` | ${formato(tGen)} | ${formato(tGen * 100)} | ${formato(tGenGrande)} |`);

// clientesRecurrentes: cuadrática. Solo se mide con 10.000 (con 1.000.000 tardaría horas).
const tRecurrentes = tiempoMedio((v) => a.clientesRecurrentes(v), ventas, 1);
console.log(`| \`clientesRecurrentes\` | ${formato(tRecurrentes)} | ver sección Proyección | no se ejecuta |`);