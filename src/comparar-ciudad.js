const { ventas } = require("./datos");
const { generarVentas } = require("./generador");
const { valorVenta, ventasPorCiudad, totalCiudadCadena, totalCiudadUnaPasada } = require("./analitica");

function comparar(nombre, datos, ciudad) {
  const cadena = totalCiudadCadena(datos, ciudad);
  const unaPasada = totalCiudadUnaPasada(datos, ciudad);
  const referencia = ventasPorCiudad(datos, ciudad); // versión del MiniReto 2
  const estado = cadena === unaPasada && unaPasada === referencia ? "OK" : "DIFERENTE";
  console.log(`${estado}  ${nombre} "${ciudad}": cadena ${cadena}, una pasada ${unaPasada}, referencia ${referencia}`);
}

// 1) Muestra del Día 1 (incluye "medellín " con minúscula y espacio)
comparar("muestra (12)", ventas, "Medellín");
comparar("muestra (12)", ventas, "  BOGOTÁ ");
comparar("muestra (12)", ventas, "Cartagena");

// 2) Arreglo vacío
comparar("vacío", [], "Medellín");

// 3) 10.000 ventas generadas
const grandes = generarVentas(10000);
for (const ciudad of ["Medellín", "Bogotá", "Cali", "Pereira"]) {
  comparar("10.000 ventas", grandes, ciudad);
}

// 4) Tamaño de los arreglos intermedios de la cadena (n = 10.000, "Medellín")
const paso1 = grandes.map((v) => ({ ...v, ciudad: v.ciudad.trim().toLowerCase() }));
const paso2 = paso1.filter((v) => v.ciudad === "medellín");
const paso3 = paso2.map((v) => valorVenta(v));
console.log("\nArreglos intermedios de la cadena con n = 10.000:");
console.table([
  { paso: "1. map (normaliza)", "elementos del arreglo nuevo": paso1.length },
  { paso: "2. filter (ciudad)", "elementos del arreglo nuevo": paso2.length },
  { paso: "3. map (valor)", "elementos del arreglo nuevo": paso3.length },
  { paso: "4. reduce (suma)", "elementos del arreglo nuevo": "ninguno (devuelve un número)" },
]);

// 5) Tiempo con muchos datos
const enormes = generarVentas(1000000);
console.time("cadena       (1.000.000)");
totalCiudadCadena(enormes, "Medellín");
console.timeEnd("cadena       (1.000.000)");
console.time("una pasada   (1.000.000)");
totalCiudadUnaPasada(enormes, "Medellín");
console.timeEnd("una pasada   (1.000.000)");