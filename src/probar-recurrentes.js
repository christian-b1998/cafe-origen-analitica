const { ventas } = require("./datos");
const { clientesRecurrentes } = require("./analitica");

console.log(clientesRecurrentes(ventas));