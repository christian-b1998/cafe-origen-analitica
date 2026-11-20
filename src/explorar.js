const { ventas } = require("./datos");

console.log("Cantidad de registros:", ventas.length);
console.log("Primer registro:", ventas[0]);
console.log("Último registro:", ventas[ventas.length - 1]);
// Posición 4 (cuarto registro de la tabla) = índice 3, porque los arreglos empiezan en 0
console.log("Producto en la posición 4:", ventas[3].producto);

console.log("\nTabla completa:");
console.table(ventas);