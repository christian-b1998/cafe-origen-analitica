const { ventas } = require("./datos");
const { totalPorCiudad, unidadesPorProducto, topProductosPorValor } = require("./analitica");

const copiaAntes = JSON.stringify(ventas);

console.log("totalPorCiudad:", totalPorCiudad(ventas));
console.log("Ciudades:", Object.keys(totalPorCiudad(ventas)).length);
console.log("unidadesPorProducto:", unidadesPorProducto(ventas));
console.log("top 3:", topProductosPorValor(ventas, 3));
console.log("top 10:", topProductosPorValor(ventas, 10).length, "productos");
console.log("top 3 de []:", topProductosPorValor([], 3));
console.log("¿ventas intacto?", JSON.stringify(ventas) === copiaAntes);