# Rendimiento del motor de analítica Café Origen (v0.2)

Este documento describe cuánto trabajo hace cada función del motor y cómo crece cuando aumentan los ventas. Está pensado para cualquier desarrollador que vaya a conectar el motor con la plataforma del marketplace.

## Resumen

- Todas las funciones del motor son de tiempo **constante o lineal**, excepto una: `clientesRecurrentes`, que es **cuadrática, O(n²)**.
- Con 1.000.000 de ventas, las funciones lineales tardan del orden de milisegundos a décimas de segundo. `clientesRecurrentes` tardaría alrededor de **1,5 horas**.
- Es el principal riesgo del motor y la primera función que se debe optimizar.

## Cómo se midió

- **Datos:** historiales generados con `generarVentas(n)` (`src/generador.js`): 5 productos, 4 ciudades, cantidades entre 1 y 5, clientes entre 1 y n/3 distintos.
- **Operaciones:** se cuenta 1 por cada elemento visitado y 1 por cada comparación (regla del MiniReto 5, instrumentada en `src/instrumentadas.js`). Son iguales en cualquier computador. Las de las funciones sin versión instrumentada se calcularon con la misma regla leyendo el código.
- **Tiempos:** `performance.now()` y `console.time`, promediando varias repeticiones después de un calentamiento (`src/medir-todo.js`, `src/medir.js`, `src/medir-tiempos.js`). Dependen del equipo: sirven como orden de magnitud, no como valor exacto.
- **Símbolos:** n = número de ventas; m = ventas que cumplen un filtro (m ≤ n); g = grupos distintos (ciudades o productos); r = clientes recurrentes.
- **Espacio:** se cuenta solo la memoria **extra** que usa la función; el arreglo de entrada no cuenta.

## Clasificación de las funciones

| Función | Qué hace | Tiempo | Espacio | Justificación (en el código) | Operaciones con n = 10.000 |
|---|---|---|---|---|---|
| `valorVenta` | Calcula cantidad × precio de una venta | O(1) | O(1) | Una sola multiplicación, sin ciclos | 1 |
| `normalizarCiudad` | Quita espacios, pasa a minúsculas y capitaliza una ciudad | O(1) | O(1) | `trim`, `toLowerCase` y `slice` sobre un texto corto; no depende de n | 1 por llamada |
| `totalVendido` | Suma el valor de todas las ventas | O(n) | O(1) | Un `for...of` con un acumulador | 10.000 |
| `unidadesVendidas` | Suma las unidades vendidas | O(n) | O(1) | Un `for...of` con un acumulador | 10.000 |
| `ventaMayor` | Devuelve la venta de mayor valor | O(n) | O(1) | Un ciclo con 3 comparaciones por vuelta (`cantidad > 0`, `mayor === null`, valor mayor); guarda una referencia, no una copia | 39.999 |
| `ticketPromedio` | Valor total entre ventas válidas | O(n) | O(1) | Un ciclo con una comparación (`cantidad > 0`) y dos acumuladores; el `if` final evita dividir entre 0 | 20.001 |
| `ventasPorCiudad` | Total vendido en una ciudad (ciclo) | O(n) | O(1) | Un ciclo que compara la ciudad normalizada y acumula | 20.000 |
| `totalVendidoM` | Total vendido con `map` + `reduce` | O(n) | O(n) | `map` recorre n ventas y **crea un arreglo de n valores**; `reduce` los recorre otra vez | 20.000 |
| `unidadesVendidasM` | Unidades vendidas con `reduce` | O(n) | O(1) | Solo `reduce`: un recorrido y ningún arreglo nuevo | 10.000 |
| `ventasPorCiudadM` | Total de una ciudad con `filter` + `reduce` | O(n) | O(m) ≤ O(n) | `filter` recorre n y crea un arreglo de m ventas; `reduce` recorre m | ≈ 22.500 |
| `totalPorCiudad` | Total vendido por cada ciudad (objeto) | O(n) | O(g) | Un `reduce` con una consulta al objeto por venta; el objeto tiene una clave por ciudad distinta (4), no por venta | 20.000 |
| `unidadesPorProducto` | Unidades por producto (objeto) | O(n) | O(g) | Igual que `totalPorCiudad`, con una clave por producto (5) | 20.000 |
| `topProductosPorValor` | Los k productos que más dinero generaron | O(n + g log g) | O(g) | Un recorrido de n para agrupar; `Object.entries` y `map` recorren g; `sort` sobre la copia `[...ranking]` cuesta g log g; `slice` recorta a k. Todos los arreglos son de tamaño g, no n | ≈ 20.000 + el ordenamiento de 5 productos |
| `ventasDelDia` | Ventas de una fecha | O(n) | O(m) ≤ O(n) | Un `filter`: recorre n y crea un arreglo con las ventas del día (referencias, no copias) | 20.000 |
| `clientesRecurrentes` | Clientes con más de una compra | **O(n²)** | O(r) ≤ O(n) | **Un ciclo dentro de otro**: cada venta se compara con todas las siguientes, n(n-1)/2 comparaciones; además `includes` recorre `recurrentes` en cada coincidencia | **49.995.000** comparaciones |
| `totalCiudadCadena` | Total de una ciudad con `map` → `filter` → `map` → `reduce` | O(n) | O(n) | 4 recorridos (n + n + m + m) y 3 arreglos nuevos; el primer `map` copia n ventas con `...venta` | ≈ 35.000 |
| `totalCiudadUnaPasada` | Total de una ciudad con un solo ciclo | O(n) | O(1) | Un `for...of` y un acumulador; no crea arreglos | 20.000 |
| `primeraVenta` | Devuelve la primera venta | O(1) | O(1) | Un acceso por índice, sin recorrer | 1 |
| `generarVentas` | Genera n ventas al azar (para pruebas) | O(n) | O(n) | Un ciclo que crea un objeto por venta; el resultado es el arreglo de n ventas, así que la memoria no se puede evitar | 10.000 |
| `totalVendidoContado`, `ventaMayorContado`, `totalPorCiudadContado` | Versiones instrumentadas de `totalVendido`, `ventaMayor` y `totalPorCiudad` | O(n) | O(1), O(1) y O(g) | Mismo recorrido que las originales, más un contador que se suma por referencia | 10.000, 39.999 y 20.000 |

Notas sobre la tabla:

- Las operaciones de `totalVendido`, `ventaMayor`, `totalPorCiudad` y `primeraVenta` provienen de la medición del MiniReto 5. Las demás se calcularon con la misma regla leyendo el código. Donde aparece `≈`, el valor depende de cuántas ventas son de la ciudad pedida (m ≈ n/4, y varía en cada generación al azar).
- Con la muestra real de 12 ventas, `clientesRecurrentes` hace 66 comparaciones; con 10.000 son casi 50 millones. Esa es la diferencia entre O(n) y O(n²).

## Tiempos medidos

Salida de `node src/medir-todo.js`. "Estimado" es el tiempo con 10.000 multiplicado por 100 (la proyección lineal); "Medido" es el tiempo real con 1.000.000 de ventas.

## Tiempos medidos

Salida de `node src/medir-todo.js`. "Estimado" es el tiempo con 10.000 multiplicado por 100 (la proyección lineal); "Medido" es el tiempo real con 1.000.000 de ventas.

| Función | Tiempo con 10.000 (ms) | Estimado para 1.000.000 (ms) | Medido con 1.000.000 (ms) |
|---|---|---|---|
| `totalVendido` | 0,037 | 3,719 | 8,953 |
| `unidadesVendidas` | 0,029 | 2,866 | 3,912 |
| `ventaMayor` | 0,087 | 8,689 | 8,488 |
| `ticketPromedio` | 0,05 | 5,038 | 10,22 |
| `ventasPorCiudad` | 0,227 | 22,683 | 23,313 |
| `totalVendidoM` | 0,117 | 11,707 | 15,122 |
| `unidadesVendidasM` | 0,049 | 4,875 | 7,587 |
| `ventasPorCiudadM` | 0,291 | 29,074 | 29,144 |
| `totalPorCiudad` | 0,975 | 97,528 | 94,131 |
| `unidadesPorProducto` | 0,229 | 22,929 | 25,085 |
| `topProductosPorValor` | 0,244 | 24,421 | 28,54 |
| `ventasDelDia` | 0,09 | 9,02 | 10,105 |
| `totalCiudadCadena` | 0,818 | 81,751 | 173,092 |
| `totalCiudadUnaPasada` | 0,875 | 87,516 | 53,478 |
| `valorVenta` | < 0,001 | no cambia | no cambia |
| `primeraVenta` | < 0,001 | no cambia | no cambia |
| `generarVentas` | 1,073 | 107,328 | 257,542 |
| `clientesRecurrentes` | 332,933 | ver sección Proyección | no se ejecuta |

Cómo leerla:

- Las funciones lineales con 1.000.000 de ventas están en el orden de milisegundos a décimas de segundo. El estimado y el medido pueden diferir varias veces por el calentamiento de Node y por la memoria caché, pero no cambian de orden de magnitud.
- `valorVenta` y `primeraVenta` no cambian con n.
- `clientesRecurrentes` ya con 10.000 ventas es mucho más lenta que todas las demás.

## Proyección para 1.000.000 de ventas

**Funciones lineales:** si el trabajo es proporcional a n, pasar de 10.000 a 1.000.000 (x100) multiplica el tiempo por 100. Los valores de la tabla anterior confirman que quedan por debajo de un segundo.

**Cadena frente a una pasada** (medición del MiniReto 7, con 1.000.000 de ventas): `totalCiudadCadena` 221,75 ms y `totalCiudadUnaPasada` 85,59 ms. Ambas son O(n), pero la cadena es unas 2,6 veces más lenta y además crea 3 arreglos y 1.000.000 de copias.

En la medición de `medir-todo.js` la relación fue similar: 173,09 ms frente a 53,48 ms (unas 3,2 veces).

**`clientesRecurrentes`** (mediciones del MiniReto 6). El tiempo es proporcional a n², así que tiempo(n) ≈ k · n²:

| Base | k (ms por n²) | Estimación para 1.000.000 |
|---|---|---|
| Medición con n = 16.000: 894,05 ms | 3,49 × 10⁻⁶ | 3.492 s ≈ 58 min |
| Medición real con n = 100.000: 53,9 s | 5,39 × 10⁻⁶ | **5.390 s ≈ 1,5 horas** |

Comprobación de que el crecimiento es cuadrático: con n = 10.000 la función tardó 332,9 ms, es decir, k = 332,9 / 10.000² ≈ 3,3 × 10⁻⁶ ms, muy cercano a la k obtenida con n = 16.000 (3,49 × 10⁻⁶). Si el crecimiento fuera lineal, k cambiaría mucho entre tamaños.

Se adopta la segunda estimación, porque la primera quedó corta: con n = 100.000 la estimación hecha con 16.000 fue 34,9 s y el tiempo real fue 53,9 s (54 % más). En 1.000.000 de ventas se harían unas 5 × 10¹¹ comparaciones.

| Reporte | Tiempo proyectado con 1.000.000 de ventas |
|---|---|
| Resumen general, ciudades, productos, top 3 y día (funciones lineales) | Décimas de segundo o menos |
| `totalCiudadCadena` | ≈ 0,2 s (medido) |
| `totalCiudadUnaPasada` | ≈ 0,09 s (medido) |
| `clientesRecurrentes` | **≈ 1,5 horas** |

## Riesgos

Ordenados de mayor a menor riesgo cuando los datos crezcan.

**Criterio:** (1) cómo crece el tiempo con n; (2) si la memoria extra crece con n; (3) qué tan lenta es la proyección medida para 1.000.000; (4) si hay un peor caso oculto en el código.

| # | Función | Riesgo | Razón |
|---|---|---|---|
| 1 | `clientesRecurrentes` | **Crítico** | O(n²): el tiempo se cuadruplica al duplicar los datos y se proyecta a ≈ 1,5 h con 1.000.000 de ventas. Memoria hasta O(n). Además `includes` esconde otro recorrido que, en el peor caso, podría llevarla hacia O(n³). |
| 2 | `totalCiudadCadena` | Medio | O(n) en tiempo pero también O(n) en memoria: 3 arreglos y n objetos copiados. En un servidor con memoria limitada es el mayor consumidor entre las funciones lineales, y fue 2,6 veces más lenta que la versión de una pasada. No se usa en el reporte. |
| 3 | `totalVendidoM`, `ventasPorCiudadM`, `ventasDelDia` | Bajo-medio | O(n) en tiempo y memoria extra proporcional a n o a m por los arreglos de `map` y `filter`. Aceptable hoy, pero cada llamada reserva memoria. |
| 4 | `topProductosPorValor` | Bajo (vigilar) | Memoria O(g) y ordenamiento O(g log g). Con 5 productos es insignificante, pero crecería si el catálogo llegara a miles de productos. |
| 5 | `totalPorCiudad`, `unidadesPorProducto` | Bajo | O(n) en tiempo; la memoria depende de g (4 ciudades, 5 productos), no de n. |
| 6 | `totalVendido`, `unidadesVendidas`, `unidadesVendidasM`, `ventaMayor`, `ticketPromedio`, `ventasPorCiudad`, `totalCiudadUnaPasada` | Bajo | Un solo recorrido y memoria constante. |
| 7 | `valorVenta`, `normalizarCiudad`, `primeraVenta` | Sin riesgo | Costo constante. |

`generarVentas` es O(n) en tiempo y memoria, pero solo se usa para pruebas, no en el reporte.

## Plan de optimización: `clientesRecurrentes`

*(Solo la idea; todavía no está implementada.)*

**¿Qué trabajo se repite?**

- Cada venta se compara con **todas las siguientes**, aunque ya se sepa algo de ese cliente. Un cliente que compró 3 veces se vuelve a buscar entre todas las ventas desde cada una de sus compras.
- En cada coincidencia, `includes` vuelve a recorrer `recurrentes` desde el principio para ver si el cliente ya estaba.
- En el fondo, el programa "busca" a cada cliente una y otra vez en lugar de recordarlo.

**¿Qué información se podría guardar para no buscarla de nuevo?**

Un diccionario (objeto) con una clave por cliente y su número de compras, que se actualiza al leer cada venta. Con la información guardada, saber si un cliente ya apareció es una consulta directa y no una búsqueda entre las demás ventas.

```
conteo = {} ; recurrentes = []
para cada venta (un solo recorrido):
    anotar una compra más para venta.cliente en conteo
    si ese cliente llegó a 2 compras: agregarlo a recurrentes
devolver recurrentes
```

- **Tiempo esperado:** de ≈ n²/2 comparaciones a ≈ n pasos, es decir, de O(n²) a **O(n)**. Con 1.000.000 de ventas serían del orden de un millón de pasos y no 5 × 10¹¹.
- **Costo:** memoria extra O(c), con c clientes distintos (hasta n/3 en los datos generados). Se cambia memoria por tiempo.
- **Cómo se comprobará:** debe devolver los mismos clientes que la versión actual (C01, C02 y C03 con los datos del Día 1) y se medirá con `src/medir-tiempos.js`.
- **Detalle por resolver:** el orden de los clientes en el resultado podría cambiar entre las dos versiones. Hay que decidir y documentar cuál se usa.

## Limitaciones de este informe

- Los datos son sintéticos: ciudades siempre bien escritas, 4 ciudades y 5 productos. Con datos reales el número de grupos podría ser mayor.
- Los tiempos dependen del computador y varían entre ejecuciones; se usan como orden de magnitud.
- La complejidad espacial se obtuvo del análisis del código, no con una herramienta de medición de memoria.
- La normalización de ciudades no unifica tildes (`"Bogota"` y `"Bogotá"` serían grupos distintos).

## Actualización (MiniReto 9)

`clientesRecurrentes` se reemplazó por `clientesRecurrentesMap` (Map cliente -> compras): tiempo O(n + c), memoria extra O(c). Con 100.000 ventas pasó de 53,9 s a decenas de milisegundos. Con esto, el mayor riesgo del motor pasa a ser `totalCiudadCadena` (memoria O(n)), que no se usa en el reporte.