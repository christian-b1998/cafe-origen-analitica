# Café Origen: Analítica de ventas (v0.2)

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
- ¿Qué clientes compraron más de una vez?

## Estructura

- `src/datos.js`: arreglo `ventas` con 12 registros (sin limpiar).
- `src/analitica.js`: funciones de análisis (indicadores con ciclos, versiones con métodos, agrupaciones, ranking, `ventasDelDia`, `clientesRecurrentes` y las dos versiones de `totalCiudad`).
- `src/reporte.js`: reporte completo por consola.
- `src/explorar.js`: exploración inicial de los datos.
- `src/verificar.js`: compara cada versión con ciclo contra su versión con métodos.
- `src/depurar.js`: reproduce los errores reportados y muestra que están corregidos.
- `src/generador.js`: genera historiales de ventas de cualquier tamaño.
- `src/instrumentadas.js`: versiones de las funciones que cuentan operaciones.
- `src/medir.js`: cuenta operaciones con n = 100 hasta 100.000 y muestra cómo crece el trabajo.
- `src/medir-tiempos.js`: mide el tiempo de `clientesRecurrentes` con distintos tamaños.
- `src/medir-todo.js`: mide el tiempo de todas las funciones con 10.000 y 1.000.000 de ventas.
- `src/comparar-ciudad.js`: compara la cadena de métodos con el recorrido único.
- `src/probar.js` y `src/probar-agrupaciones.js`: pruebas de las funciones.
- `RENDIMIENTO.md`: informe de rendimiento (complejidad, mediciones, proyección, riesgos y plan de optimización).
- `bitacora.md`: diccionario de datos, casos borde, pseudocódigo, trazas, registro de depuración y análisis de rendimiento.
- `src/probar-recurrentes.js`: prueba de `clientesRecurrentes` con los 12 datos del Día 1.
- `src/verificar-recurrentes.js`: comprueba que las tres versiones de clientes recurrentes dan los mismos clientes.
- `src/medir-recurrentes.js`: compara el tiempo de la versión original, la de Set y la de Map.
- `src/catalogo.js`: catálogo de productos con sus precios.
- `src/probar-combos.js`: pruebas del combo de regalo, el producto estrella por ciudad y el primer cliente único.

## Otros scripts

        node src/explorar.js
        node src/verificar.js
        node src/depurar.js
        node src/medir.js
        node src/medir-tiempos.js
        node src/medir-todo.js
        node src/comparar-ciudad.js

## Decisiones de calidad de datos

Los datos se conservan tal como vienen. La limpieza se hace al analizar: las ciudades se normalizan (espacios y mayúsculas) y las ventas con cantidad 0 no cuentan como ventas válidas para el ticket promedio. El detalle está en `bitacora.md`.