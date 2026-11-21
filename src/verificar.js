const { ventas } = require("./datos");
const {
  totalVendido,
  totalVendidoM,
  unidadesVendidas,
  unidadesVendidasM,
  ventasPorCiudad,
  ventasPorCiudadM,
} = require("./analitica");

const conjuntos = [
  { nombre: "completo", datos: ventas },
  { nombre: "un elemento", datos: [ventas[0]] },
  { nombre: "vacío", datos: [] },
];

function comparar(nombre, resultadoCiclo, resultadoMetodo) {
  const estado = resultadoCiclo === resultadoMetodo ? "OK" : "DIFERENTE";
  console.log(`${estado}  ${nombre}  (ciclo: ${resultadoCiclo}, método: ${resultadoMetodo})`);
}

for (const conjunto of conjuntos) {
  const d = conjunto.datos;
  comparar(`totalVendido [${conjunto.nombre}]`, totalVendido(d), totalVendidoM(d));
  comparar(`unidadesVendidas [${conjunto.nombre}]`, unidadesVendidas(d), unidadesVendidasM(d));
  comparar(
    `ventasPorCiudad "Medellín" [${conjunto.nombre}]`,
    ventasPorCiudad(d, "Medellín"),
    ventasPorCiudadM(d, "Medellín")
  );
  comparar(
    `ventasPorCiudad "  BOGOTÁ " [${conjunto.nombre}]`,
    ventasPorCiudad(d, "  BOGOTÁ "),
    ventasPorCiudadM(d, "  BOGOTÁ ")
  );
}