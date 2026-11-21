# Café Origen: Analítica de ventas (v0.1)

Motor de analítica en JavaScript y Node.js que convierte el historial de ventas de Café Origen en un reporte legible por consola. No requiere abrir el código: se ejecuta con un solo comando.

## Cómo ejecutarlo

1. Instala Node.js (versión LTS).
2. Clona el repositorio y entra a la carpeta:

        git clone https://github.com/christian-b1998/cafe-origen-analitica.git
        cd cafe-origen-analitica

3. Ejecuta el reporte:

        node src/reporte.js

No hay dependencias que instalar.

## Qué preguntas responde

- ¿Cuánto se vendió en total y cuántas unidades salieron?
- ¿Cuál fue la venta más grande?
- ¿Cuánto gasta en promedio un cliente por compra (ticket promedio)?
- ¿Cuánto se vendió en cada ciudad?
- ¿Cuántas unidades se vendieron de cada producto?
- ¿Cuáles son los tres productos que más dinero generaron?
- ¿Cómo le fue a un día concreto (y qué pasa si ese día no hubo ventas)?

## Estructura

- `src/datos.js`: arreglo `ventas` con 12 registros (sin limpiar).
- `src/analitica.js`: funciones de análisis (indicadores con ciclos, versiones con métodos, agrupaciones, ranking y `ventasDelDia`).
- `src/reporte.js`: reporte completo por consola.
- `src/explorar.js`: exploración inicial de los datos.
- `src/verificar.js`: compara cada versión con ciclo contra su versión con métodos.
- `src/depurar.js`: reproduce los errores reportados y muestra que están corregidos.
- `src/probar.js` y `src/probar-agrupaciones.js`: pruebas de las funciones.
- `bitacora.md`: diccionario de datos, casos borde, pseudocódigo, trazas y registro de depuración.

## Otros scripts

        node src/explorar.js
        node src/verificar.js
        node src/depurar.js
        node src/probar.js
        node src/probar-agrupaciones.js

## Decisiones de calidad de datos

Los datos se conservan tal como vienen. La limpieza se hace al analizar: las ciudades se normalizan (espacios y mayúsculas) y las ventas con cantidad 0 no cuentan como ventas válidas para el ticket promedio. El detalle está en `bitacora.md`.