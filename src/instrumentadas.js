// Versiones instrumentadas: cada una recibe un objeto contador ({ operaciones: 0 })
// y suma 1 por cada elemento visitado y por cada comparación.
// Se pasa por referencia: la función modifica el mismo objeto que creó quien la llama.
const { valorVenta } = require("./analitica");

function totalVendidoContado(ventas, contador) {
  let total = 0;
  for (const venta of ventas) {
    contador.operaciones += 1; // visita
    total += valorVenta(venta);
  }
  return total;
}

function ventaMayorContado(ventas, contador) {
  let mayor = null;
  for (const venta of ventas) {
    contador.operaciones += 1; // visita
    contador.operaciones += 1; // comparación: venta.cantidad > 0
    if (venta.cantidad > 0) {
      contador.operaciones += 1; // comparación: mayor === null
      if (mayor === null) {
        mayor = venta;
      } else {
        contador.operaciones += 1; // comparación: valorVenta(venta) > valorVenta(mayor)
        if (valorVenta(venta) > valorVenta(mayor)) {
          mayor = venta;
        }
      }
    }
  }
  return mayor;
}

function totalPorCiudadContado(ventas, contador) {
  const grupos = {};
  for (const venta of ventas) {
    contador.operaciones += 1; // visita
    const ciudad = venta.ciudad.trim().toLowerCase();
    const clave = ciudad.charAt(0).toUpperCase() + ciudad.slice(1);
    contador.operaciones += 1; // consulta: ¿ya existe el grupo?
    grupos[clave] = (grupos[clave] || 0) + valorVenta(venta);
  }
  return grupos;
}

// Complejidad constante: no recorre nada.
function primeraVenta(ventas, contador) {
  contador.operaciones += 1; // un solo acceso por índice
  return ventas.length > 0 ? ventas[0] : null;
}

module.exports = { totalVendidoContado, ventaMayorContado, totalPorCiudadContado, primeraVenta };