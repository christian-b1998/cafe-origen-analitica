const { generarVentas } = require("./generador");
const { totalVendido, ventaMayor, totalPorCiudad } = require("./analitica");
const {
  totalVendidoContado,
  ventaMayorContado,
  totalPorCiudadContado,
  primeraVenta,
} = require("./instrumentadas");

const tamanos = [100, 1000, 10000, 100000];
const filas = [];

for (const n of tamanos) {
  const ventas = generarVentas(n);

  // Un contador nuevo por función: así cada una cuenta lo suyo.
  const cTotal = { operaciones: 0 };
  const cMayor = { operaciones: 0 };
  const cCiudad = { operaciones: 0 };
  const cPrimera = { operaciones: 0 };

  const total = totalVendidoContado(ventas, cTotal);
  const mayor = ventaMayorContado(ventas, cMayor);
  const ciudades = totalPorCiudadContado(ventas, cCiudad);
  primeraVenta(ventas, cPrimera);

  // Control: la versión instrumentada debe dar lo mismo que la original.
  const igual =
    total === totalVendido(ventas) &&
    mayor === ventaMayor(ventas) &&
    JSON.stringify(ciudades) === JSON.stringify(totalPorCiudad(ventas));

  filas.push({
    n,
    totalVendido: cTotal.operaciones,
    ventaMayor: cMayor.operaciones,
    totalPorCiudad: cCiudad.operaciones,
    primeraVenta: cPrimera.operaciones,
    mismoResultado: igual ? "OK" : "DIFERENTE",
  });
}

console.table(filas);

// Cuánto se multiplican las operaciones entre un tamaño y el siguiente.
console.log("\nFactor de crecimiento al pasar de un tamaño al siguiente (n x10):");
const factores = [];
for (let i = 1; i < filas.length; i++) {
  const antes = filas[i - 1];
  const ahora = filas[i];
  factores.push({
    de: antes.n + " -> " + ahora.n,
    totalVendido: ahora.totalVendido / antes.totalVendido,
    ventaMayor: Number((ahora.ventaMayor / antes.ventaMayor).toFixed(2)),
    totalPorCiudad: ahora.totalPorCiudad / antes.totalPorCiudad,
    primeraVenta: ahora.primeraVenta / antes.primeraVenta,
  });
}
console.table(factores);