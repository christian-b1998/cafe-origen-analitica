// Café Origen - Analítica v1.0: reporte final de ventas por consola.
//
// Uso:
//   node src/reporte.js          -> datos reales del Día 1 (12 ventas)
//   node src/reporte.js 100000   -> 100.000 ventas generadas al azar
const { ventas: ventasReales, ventasDiarias } = require("./datos");
const { catalogo } = require("./catalogo");
const { generarVentas } = require("./generador");
const {
  totalVendido,
  unidadesVendidas,
  ventaMayor,
  ticketPromedio,
  valorVenta,
  totalPorCiudad,
  unidadesPorProducto,
  topProductosPorValor,
  ventasDelDia,
  comprasPorCliente,
  clientesRecurrentesMap,
  productoEstrellaPorCiudad,
  comboRegaloMap,
  parMasCercano,
  primerClienteUnico,
  mejorSemana,
  totalesPorDia,
} = require("./analitica");

const ANCHO = 62;
const TARJETA = 87000; // tarjeta regalo
const PRESUPUESTO = 100000; // presupuesto corporativo
const DIA_CON_VENTAS = "2026-09-03";
const DIA_SIN_VENTAS = "2026-10-01";
const DIAS_SEMANA = 7;

// ---------- Cálculo (sin imprimir): todas las funciones son lineales ----------

// totalesDiarios: [{ fecha, total }] ordenado por fecha. Por defecto, se calcula desde las ventas.
function calcularReporte(ventas, totalesDiarios = totalesPorDia(ventas)) {
  const semana = mejorSemana(
    totalesDiarios.map((dia) => dia.total),
    DIAS_SEMANA
  );
  return {
    registros: ventas.length,
    validas: ventas.filter((venta) => venta.cantidad > 0).length,
    total: totalVendido(ventas),
    unidades: unidadesVendidas(ventas),
    mayor: ventaMayor(ventas),
    ticket: ticketPromedio(ventas),
    ciudades: totalPorCiudad(ventas),
    productos: unidadesPorProducto(ventas),
    top: topProductosPorValor(ventas, 3),
    diaConVentas: ventasDelDia(ventas, DIA_CON_VENTAS),
    diaSinVentas: ventasDelDia(ventas, DIA_SIN_VENTAS),
    clientesDistintos: comprasPorCliente(ventas).size,
    recurrentes: clientesRecurrentesMap(ventas),
    estrellas: productoEstrellaPorCiudad(ventas),
    combo: comboRegaloMap(catalogo, TARJETA),
    parPresupuesto: parMasCercano(catalogo, PRESUPUESTO),
    cupon: primerClienteUnico(ventas),
    dias: totalesDiarios.length,
    semana: semana && {
      total: semana.total,
      desde: totalesDiarios[semana.inicio].fecha,
      hasta: totalesDiarios[semana.inicio + DIAS_SEMANA - 1].fecha,
    },
  };
}

// ---------- Utilidades de formato ----------

function pesos(valor) {
  return "$ " + valor.toLocaleString("es-CO");
}

function titulo(texto) {
  console.log("\n" + "=".repeat(ANCHO));
  console.log(texto.toUpperCase());
  console.log("=".repeat(ANCHO));
}

// Una línea "etiqueta ........ valor" alineada a la derecha.
function fila(etiqueta, valor) {
  const texto = String(valor);
  const puntos = ANCHO - etiqueta.length - texto.length - 2;
  console.log(`${etiqueta} ${".".repeat(Math.max(puntos, 2))} ${texto}`);
}

function ordenarDiccionario(diccionario) {
  return Object.entries(diccionario).sort((a, b) => b[1] - a[1]);
}

function porcentaje(parte, todo) {
  if (todo === 0) {
    return "0,0 %";
  }
  return ((parte / todo) * 100).toFixed(1).replace(".", ",") + " %";
}

const nombresDelPar = (par) => par.map((producto) => producto.nombre).join(" + ");

// ---------- Secciones ----------

function resumenGeneral(r) {
  titulo("1. Resumen general");
  fila("Registros en el historial", r.registros.toLocaleString("es-CO"));
  fila("Ventas válidas (cantidad > 0)", r.validas.toLocaleString("es-CO"));
  fila("Total vendido", pesos(r.total));
  fila("Unidades vendidas", r.unidades.toLocaleString("es-CO"));
  fila("Ticket promedio por venta", pesos(Math.round(r.ticket)));
  if (r.mayor === null) {
    fila("Venta más grande", "sin ventas");
  } else {
    fila("Venta más grande", pesos(valorVenta(r.mayor)));
    console.log(`   (id ${r.mayor.id}: ${r.mayor.producto}, ${r.mayor.ciudad}, ${r.mayor.fecha})`);
  }
}

function seccionCiudades(r) {
  titulo("2. Ventas por ciudad");
  const ciudades = ordenarDiccionario(r.ciudades);
  for (const [ciudad, valor] of ciudades) {
    console.log(`${ciudad.padEnd(14)}${pesos(valor).padStart(20)}${porcentaje(valor, r.total).padStart(12)}`);
  }
  const suma = ciudades.reduce((acum, [, valor]) => acum + valor, 0);
  console.log("-".repeat(ANCHO));
  console.log(`Control: suma de ciudades = total vendido -> ${suma === r.total ? "OK" : "NO CUADRA"}`);
}

function seccionProductos(r) {
  titulo("3. Unidades por producto");
  for (const [producto, unidades] of ordenarDiccionario(r.productos)) {
        console.log(`${producto.padEnd(24)}${unidades.toLocaleString("es-CO").padStart(12)} ${unidades === 1 ? "ud " : "uds"}`);
  }
}

function seccionTop(r) {
  titulo("4. Top 3 productos por valor generado");
  r.top.forEach((item, indice) => {
    console.log(`${indice + 1}. ${item.producto.padEnd(24)}${pesos(item.valor).padStart(20)}`);
  });
}

function resumenDelDia(fecha, delDia) {
  console.log(`\nDía ${fecha}`);
  console.log("-".repeat(ANCHO));
  if (delDia.length === 0) {
    console.log("Sin ventas registradas este día.");
  }
  fila("Ventas del día", delDia.length.toLocaleString("es-CO"));
  fila("Total vendido", pesos(totalVendido(delDia)));
  fila("Unidades vendidas", unidadesVendidas(delDia).toLocaleString("es-CO"));
  fila("Ticket promedio", pesos(Math.round(ticketPromedio(delDia))));
}

function seccionDias(r) {
  titulo("5. Resumen por día");
  resumenDelDia(DIA_CON_VENTAS, r.diaConVentas); // día con ventas
  resumenDelDia(DIA_SIN_VENTAS, r.diaSinVentas); // día sin ventas
}

function seccionRecurrentes(r) {
  titulo("6. Clientes recurrentes");
  fila("Clientes distintos", r.clientesDistintos.toLocaleString("es-CO"));
  fila("Clientes que compraron más de una vez", r.recurrentes.length.toLocaleString("es-CO"));
  fila("Porcentaje de recurrentes", porcentaje(r.recurrentes.length, r.clientesDistintos));
  if (r.recurrentes.length > 0) {
    const primeros = r.recurrentes.slice(0, 10).join(", ");
    const resto = r.recurrentes.length - 10;
    console.log("Primeros: " + primeros + (resto > 0 ? ` ... y ${resto.toLocaleString("es-CO")} más` : ""));
  }
}

function seccionEstrella(r) {
  titulo("7. Producto estrella por ciudad");
  for (const [ciudad, dato] of Object.entries(r.estrellas)) {
    const veces = dato.veces.toLocaleString("es-CO") + (dato.veces === 1 ? " vez" : " veces");
    console.log(`${ciudad.padEnd(12)}${dato.producto.padEnd(24)}${veces.padStart(16)}`);
  }
  console.log("(en un empate gana el producto que apareció primero en la ciudad)");
}

function seccionCombo(r) {
  titulo("8. Combos de regalo sugeridos");
  console.log(`Tarjeta regalo de ${pesos(TARJETA)}:`);
  console.log(r.combo === null ? "   No hay dos productos que sumen ese valor." : `   ${nombresDelPar(r.combo)}`);
  console.log(`Presupuesto corporativo de ${pesos(PRESUPUESTO)} (lo más cerca sin pasarse):`);
  if (r.parPresupuesto === null) {
    console.log("   Ningún par de productos cabe en ese presupuesto.");
  } else {
    console.log(`   ${nombresDelPar(r.parPresupuesto.productos)} = ${pesos(r.parPresupuesto.suma)}`);
  }
}

function seccionCupon(r) {
  titulo("9. Cliente para el cupón de regreso");
  if (r.cupon === null) {
    console.log("Ningún cliente compró una sola vez.");
  } else {
    console.log(`Primer cliente que compró una sola vez: ${r.cupon}`);
  }
}

function seccionSemana(r, origen) {
  titulo("10. Mejor semana de ventas");
  console.log(`Origen de los totales diarios: ${origen} (${r.dias} días)`);
  if (r.semana === null) {
    console.log(`No hay suficientes días para una semana de ${DIAS_SEMANA}.`);
  } else {
    fila("Mejor semana", `${r.semana.desde} a ${r.semana.hasta}`);
    fila("Total de la semana", pesos(r.semana.total));
  }
}

function imprimirReporte(r, descripcion, origenSemana) {
  console.log("CAFÉ ORIGEN - REPORTE DE VENTAS (Analítica v1.0)");
  console.log("Datos: " + descripcion);
  resumenGeneral(r);
  seccionCiudades(r);
  seccionProductos(r);
  seccionTop(r);
  seccionDias(r);
  seccionRecurrentes(r);
  seccionEstrella(r);
  seccionCombo(r);
  seccionCupon(r);
  seccionSemana(r, origenSemana);
}

// ---------- Programa principal ----------

function main() {
  const argumento = process.argv[2];
  let ventas = ventasReales;
  let descripcion = "historial real del Día 1 (12 ventas)";
  let totalesDiarios; // por defecto, se calculan desde las ventas
  let origenSemana = "calculados desde las ventas";

  if (argumento === undefined) {
    // Con los datos reales (6 días) no alcanza para una semana: se usan los totales de septiembre de la gerente.
    totalesDiarios = ventasDiarias.map((miles, indice) => ({
      fecha: "2026-09-" + String(indice + 1).padStart(2, "0"),
      total: miles * 1000,
    }));
    origenSemana = "totales de septiembre entregados por la gerente";
  } else {
    const n = Number(argumento);
    if (!Number.isInteger(n) || n <= 0) {
      console.log("Uso: node src/reporte.js [n]   (n = número de ventas a generar)");
      process.exit(1);
    }
    ventas = generarVentas(n);
    descripcion = `${n.toLocaleString("es-CO")} ventas generadas al azar`;
  }

  const inicio = performance.now();
  const resultado = calcularReporte(ventas, totalesDiarios);
  const ms = performance.now() - inicio;

  imprimirReporte(resultado, descripcion, origenSemana);
  console.log("\n" + "=".repeat(ANCHO));
  console.log(`Cálculo del reporte: ${ms.toLocaleString("es-CO", { maximumFractionDigits: 1 })} ms con ${ventas.length.toLocaleString("es-CO")} ventas`);
  console.log("Fin del reporte");
}

if (require.main === module) {
  main();
}

module.exports = { calcularReporte };