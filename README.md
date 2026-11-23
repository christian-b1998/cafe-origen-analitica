# Café Origen: Analítica de ventas (v1.0)

Motor de analítica en JavaScript y Node.js que convierte el historial de ventas de Café Origen en un reporte de negocio legible por consola. Se ejecuta con un solo comando, sin abrir el código, y procesa 100.000 ventas en una fracción de segundo.

## Requisitos

- [Node.js](https://nodejs.org) (versión LTS). No hay dependencias que instalar.
- Git, solo para clonar el repositorio.

## Cómo ejecutarlo

1. Clona el repositorio y entra a la carpeta:

        git clone https://github.com/christian-b1998/cafe-origen-analitica.git
        cd cafe-origen-analitica

2. Ejecuta el reporte con los datos reales (12 ventas del historial exportado):

        node src/reporte.js

3. O ejecútalo con n ventas generadas al azar, por ejemplo 100.000:

        node src/reporte.js 100000

Si el argumento no es un número entero positivo, el programa muestra cómo se usa.

## Qué muestra el reporte

1. **Resumen general:** registros, ventas válidas, total vendido, unidades, ticket promedio y venta más grande.
2. **Ventas por ciudad**, con porcentaje y un control de que la suma cuadra.
3. **Unidades por producto.**
4. **Top 3 de productos por valor generado.**
5. **Resumen por día**, con un día con ventas y un día sin ventas.
6. **Clientes recurrentes.**
7. **Producto estrella por ciudad** (en un empate gana el que apareció primero).
8. **Combos de regalo sugeridos:** para la tarjeta de $ 87.000 y para un presupuesto corporativo de $ 100.000.
9. **Cliente para el cupón de regreso:** el primero que compró una sola vez.
10. **Mejor semana de ventas** (siete días consecutivos).

Al final muestra cuánto tardó el cálculo.

## Qué preguntas responde

- ¿Cuánto se vendió en total, cuántas unidades salieron y cuál fue la venta más grande?
- ¿Cuánto gasta en promedio un cliente por compra?
- ¿Cuánto se vendió en cada ciudad y qué productos venden más?
- ¿Qué productos generan más dinero?
- ¿Cómo le fue a un día concreto, aunque no haya tenido ventas?
- ¿Qué clientes compran más de una vez?
- ¿Cuál es el producto estrella de cada ciudad?
- ¿Qué dos productos sumar para una tarjeta regalo o para un presupuesto?
- ¿A qué cliente enviar un cupón de regreso?
- ¿Cuál fue la mejor semana de ventas?

## Rendimiento

Todas las funciones del reporte son de tiempo lineal o mejor; ninguna es O(n²). El informe completo, con la clasificación de cada función en tiempo y memoria, la proyección para 1.000.000 de ventas y la comparación entre la v0.1 y la v1.0, está en [`RENDIMIENTO.md`](RENDIMIENTO.md). Para repetir las mediciones:

        node src/comparar-versiones.js

(Tarda cerca de un minuto, porque mide la versión original de clientes recurrentes con 100.000 ventas.)

## Estructura del proyecto

**Motor**

- `src/datos.js`: las 12 ventas del historial real (sin limpiar) y los totales diarios de septiembre.
- `src/catalogo.js`: catálogo de productos con sus precios.
- `src/analitica.js`: todas las funciones de análisis (indicadores, agrupaciones, rankings, recurrentes, combos, frecuencias, ventana deslizante y dos punteros).
- `src/reporte.js`: reporte final por consola.
- `src/generador.js`: genera historiales de ventas y totales diarios de cualquier tamaño.
- `src/instrumentadas.js`: versiones de funciones que cuentan operaciones.

**Pruebas y mediciones**

- `src/explorar.js`: exploración inicial de los datos.
- `src/probar.js`, `src/probar-agrupaciones.js`, `src/probar-combos.js`, `src/probar-ventana.js`: pruebas de las funciones.
- `src/verificar.js`, `src/verificar-recurrentes.js`: comprueban que las versiones optimizadas dan el mismo resultado que las originales.
- `src/depurar.js`: reproduce los errores reportados y muestra que están corregidos.
- `src/medir.js`, `src/medir-tiempos.js`, `src/medir-todo.js`, `src/medir-recurrentes.js`, `src/comparar-ciudad.js`, `src/comparar-versiones.js`: mediciones de operaciones y de tiempo.
- `src/probar-recurrentes.js`: prueba de `clientesRecurrentes` con los 12 datos del Día 1.

**Documentación**

- `RENDIMIENTO.md`: informe de rendimiento.
- `bitacora.md`: diccionario de datos, casos borde, planes, trazas, depuración, mediciones y cierre de la semana.

## Decisiones de calidad de datos

Los datos se conservan tal como vienen. La limpieza se hace al analizar: las ciudades se normalizan (espacios y mayúsculas) y las ventas con cantidad 0 no cuentan como ventas válidas para el ticket promedio. El detalle está en `bitacora.md`.