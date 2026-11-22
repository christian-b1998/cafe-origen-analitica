// Generador de historiales de ventas con la misma estructura del Día 1.
const PRODUCTOS = [
  { nombre: "Origen Huila 500 g", precio: 42000 },
  { nombre: "Origen Nariño 250 g", precio: 26000 },
  { nombre: "Origen Sierra 500 g", precio: 45000 },
  { nombre: "Prensa francesa", precio: 95000 },
  { nombre: "Molino manual", precio: 120000 },
];
const CIUDADES = ["Medellín", "Bogotá", "Cali", "Pereira"];

// Entero al azar entre min y max, ambos incluidos.
function enteroEntre(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function elegir(lista) {
  return lista[Math.floor(Math.random() * lista.length)];
}

// "2026-09-" + día entre 01 y 30
function fechaAlAzar() {
  const dia = enteroEntre(1, 30);
  return "2026-09-" + String(dia).padStart(2, "0");
}

function generarVentas(n) {
  const maxClientes = Math.max(1, Math.floor(n / 3));
  const ventas = [];
  for (let i = 1; i <= n; i++) {
    const producto = elegir(PRODUCTOS);
    ventas.push({
      id: i,
      fecha: fechaAlAzar(),
      cliente: "C" + String(enteroEntre(1, maxClientes)).padStart(2, "0"),
      producto: producto.nombre,
      ciudad: elegir(CIUDADES),
      cantidad: enteroEntre(1, 5),
      precio: producto.precio,
    });
  }
  return ventas;
}

// Totales diarios al azar (miles de pesos), entre 200 y 800.
function generarDias(n) {
  const dias = [];
  for (let i = 0; i < n; i++) {
    dias.push(enteroEntre(200, 800));
  }
  return dias;
}

module.exports = { generarVentas, generarDias };