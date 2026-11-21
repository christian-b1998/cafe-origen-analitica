const { ventas } = require("./datos");
const { generarVentas } = require("./generador");
const {
  clientesRecurrentes,
  clientesRecurrentesSet,
  clientesRecurrentesMap,
} = require("./analitica");

// Ordena una copia (sin tocar el original) para comparar sin importar el orden.
const ordenado = (lista) => JSON.stringify([...lista].sort());

function comparar(nombre, datos) {
  const original = clientesRecurrentes(datos);
  const conSet = clientesRecurrentesSet(datos);
  const conMap = clientesRecurrentesMap(datos);
  const igual = ordenado(original) === ordenado(conSet) && ordenado(conSet) === ordenado(conMap);
  console.log(`${igual ? "OK" : "DIFERENTE"}  ${nombre}: ${original.length} recurrentes`);
  return { original, conSet, conMap };
}

const crear = (...clientes) => clientes.map((cliente, i) => ({ id: i + 1, cliente }));

// Datos del Día 1 y 5.000 ventas generadas
const dia1 = comparar("Día 1 (12 ventas)", ventas);
console.log("   Día 1 -> original:", dia1.original, "| Set:", dia1.conSet, "| Map:", dia1.conMap);
comparar("5.000 ventas generadas", generarVentas(5000));

// Casos borde
comparar("arreglo vacío", []);
comparar("una sola venta", crear("A"));
comparar("todos los clientes distintos", crear("A", "B", "C"));
comparar("un cliente con muchas compras", crear("A", "A", "A", "A"));

// El orden puede cambiar entre versiones
const orden = comparar("orden distinto [A, B, B, A]", crear("A", "B", "B", "A"));
console.log("   original:", orden.original, "| Set:", orden.conSet, "| Map:", orden.conMap);