const { ventas } = require("./datos");
const {
  totalVendido,
  unidadesVendidas,
  ventaMayor,
  ticketPromedio,
  ventasPorCiudad,
} = require("./analitica");

const casos = [
  { nombre: "Arreglo completo (12)", datos: ventas },
  { nombre: "Un solo elemento", datos: [ventas[0]] },
  { nombre: "Arreglo vacío", datos: [] },
];

for (const caso of casos) {
  console.log("\n=== " + caso.nombre + " ===");
  console.log("totalVendido:", totalVendido(caso.datos));
  console.log("unidadesVendidas:", unidadesVendidas(caso.datos));
  console.log("ventaMayor:", ventaMayor(caso.datos));
  console.log("ticketPromedio:", ticketPromedio(caso.datos));
  console.log('ventasPorCiudad "Medellín":', ventasPorCiudad(caso.datos, "Medellín"));
}

console.log('\nVariantes de escritura:', ventasPorCiudad(ventas, "  MEDELLÍN "));