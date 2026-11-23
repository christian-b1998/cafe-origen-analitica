# Rendimiento del motor de analítica Café Origen (v1.0)

Este documento describe cuánto trabajo hace cada función del motor y cómo crece cuando aumentan las ventas. Está pensado para cualquier desarrollador que vaya a conectar el motor con la plataforma del marketplace.

## Resumen

- Ninguna función del reporte final (v1.0) es O(n²): todas son de tiempo **constante, lineal u O(n log n) sobre pocos elementos** (días o productos).
- `clientesRecurrentes` (O(n²)) se conserva solo como referencia y para la comparación; el reporte usa `clientesRecurrentesMap` (O(n)).
- `node src/reporte.js 100000` calcula y muestra las diez secciones en una fracción de segundo (0,16 s de punta a punta); la v0.1 con la función original de recurrentes tardó unos 44 s con esa misma cantidad de ventas (ver "Comparación v0.1 frente a v1.0").

## Cómo se midió

- **Datos:** historiales generados con `generarVentas(n)` (`src/generador.js`): 5 productos, 4 ciudades, cantidades entre 1 y 5, clientes entre 1 y n/3 distintos.
- **Operaciones:** se cuenta 1 por cada elemento visitado y 1 por cada comparación (regla del MiniReto 5, instrumentada en `src/instrumentadas.js`). Son iguales en cualquier computador. Las de las funciones sin versión instrumentada se calcularon con la misma regla leyendo el código.
- **Tiempos:** `performance.now()` y `console.time`, promediando varias repeticiones después de un calentamiento (`src/medir-todo.js`, `src/medir.js`, `src/medir-tiempos.js`). Dependen del equipo: sirven como orden de magnitud, no como valor exacto.
- **Símbolos:** n = número de ventas; m = ventas que cumplen un filtro (m ≤ n); g = grupos distintos (ciudades o productos); r = clientes recurrentes; c = clientes distintos; p = productos del catálogo; d = días distintos con ventas; k = tamaño de la ventana (días).
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
| `clientesRecurrentes` | Clientes con más de una compra | **O(n²)** | O(r) ≤ O(n) | **Un ciclo dentro de otro**: cada venta se compara con todas las siguientes, n(n-1)/2 comparaciones; además `includes` recorre `recurrentes` en cada coincidencia. Con datos como los generados domina el ciclo doble (O(n²)); en un peor caso artificial, `includes` podría llevarla hacia O(n³) | **49.995.000** comparaciones |
| `totalCiudadCadena` | Total de una ciudad con `map` → `filter` → `map` → `reduce` | O(n) | O(n) | 4 recorridos (n + n + m + m) y 3 arreglos nuevos; el primer `map` copia n ventas con `...venta` | ≈ 35.000 |
| `totalCiudadUnaPasada` | Total de una ciudad con un solo ciclo | O(n) | O(1) | Un `for...of` y un acumulador; no crea arreglos | 20.000 |
| `primeraVenta` | Devuelve la primera venta | O(1) | O(1) | Un acceso por índice, sin recorrer | 1 |
| `generarVentas` | Genera n ventas al azar (para pruebas) | O(n) | O(n) | Un ciclo que crea un objeto por venta; el resultado es el arreglo de n ventas, así que la memoria no se puede evitar | 10.000 |
| `totalVendidoContado`, `ventaMayorContado`, `totalPorCiudadContado` | Versiones instrumentadas de `totalVendido`, `ventaMayor` y `totalPorCiudad` | O(n) | O(1), O(1) y O(g) | Mismo recorrido que las originales, más un contador que se suma por referencia | 10.000, 39.999 y 20.000 |
| `clientesRecurrentesSet` | Clientes recurrentes con dos `Set` | O(n) | O(c + r) | Un `for...of`; por venta una consulta `has` y una inserción `add`, de costo constante | ≈ 30.000 (3 por venta) |
| `comprasPorCliente` | `Map` cliente -> número de compras | O(n) | O(c) | Un recorrido con `get` y `set` por venta | ≈ 30.000 (3 por venta) |
| `clientesRecurrentesMap` | Clientes recurrentes a partir de ese `Map` | O(n + c) | O(c) | `comprasPorCliente` más un recorrido de las c entradas | ≈ 36.000 |
| `comboRegalo` | Dos productos que suman un valor (fuerza bruta) | O(p²) | O(1) | Ciclo doble sobre los p productos del catálogo | 28 pares (8 productos) |
| `comboRegaloMap` | Lo mismo con un `Map` de complementos | O(p) | O(p) | Un recorrido del catálogo; por producto una consulta y una inserción | 3 pasos para 87.000 (8 productos) |
| `productoEstrellaPorCiudad` | Producto más frecuente de cada ciudad | O(n) | O(g) | Un recorrido de las ventas con un `Map` de `Map`; luego se revisan las g parejas (ciudad, producto) | ≈ 50.000 (5 por venta) |
| `primerClienteUnico` | Primer cliente con una sola compra | O(n) | O(c) | Dos recorridos y un `Map` | ≤ 50.000 (3n + hasta 2n) |
| `mejorSemanaBruta` | Mejor bloque de k días, sumando cada bloque desde cero | O(d · k) | O(1) | Ciclo doble: (d - k + 1) posiciones por k sumas | ≈ 70.000 sumas (10.000 días, k = 7) |
| `mejorSemana` | Mejor bloque de k días con ventana deslizante | O(d) | O(1) | Suma la primera ventana y luego una suma y una resta por desplazamiento | ≈ 10.000 pasos (10.000 días) |
| `parMasCercano` | Dos productos con suma máxima sin pasar un presupuesto | O(p log p) | O(p) | Ordena una copia (p log p) y recorre con dos punteros (a lo sumo p pasos) | ≈ 24 comparaciones al ordenar + 7 pasos (8 productos) |
| `totalesPorDia` | Total vendido por fecha, ordenado | O(n + d log d) | O(d) | Un recorrido de las ventas con un `Map`; luego se ordenan las d fechas | ≈ 30.000 + ordenar 30 fechas |
| `calcularReporte` | Todos los cálculos del reporte v1.0 | **O(n + d log d + p log p)**, es decir, O(n) con pocos días y productos | O(n) | Suma de las funciones anteriores: casi todas son O(n); `totalesPorDia` ordena d fechas y `topProductosPorValor` y `parMasCercano` ordenan pocos productos. En las pruebas hay 30 días y 5 a 8 productos, así que pesan poco; si cada venta cayera en un día distinto (d = n), sería O(n log n). El único arreglo grande es el `filter` que cuenta las ventas válidas | no aplica |

Notas sobre la tabla:

- Las operaciones de `totalVendido`, `ventaMayor`, `totalPorCiudad` y `primeraVenta` provienen de la medición del MiniReto 5. Las demás se calcularon con la misma regla leyendo el código. Donde aparece `≈`, el valor depende de cuántas ventas son de la ciudad pedida (m ≈ n/4, y varía en cada generación al azar).
- Con la muestra real de 12 ventas, `clientesRecurrentes` hace 66 comparaciones; con 10.000 son casi 50 millones. Esa es la diferencia entre O(n) y O(n²).

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

La medición de 100.000 ventas varió entre ejecuciones: 53,9 s (MiniReto 6) y 44,4 s (MiniReto 12). Con 44,4 s, k = 4,44 × 10⁻⁶ ms y la estimación para 1.000.000 es ≈ 4.442 s (≈ 1,2 horas). Por eso la proyección se expresa como un rango: **entre 1,2 y 1,5 horas**.

| Reporte | Tiempo proyectado con 1.000.000 de ventas |
|---|---|
| Resumen general, ciudades, productos, top 3 y día (funciones lineales) | Décimas de segundo o menos |
| `totalCiudadCadena` | ≈ 0,2 s (medido) |
| `totalCiudadUnaPasada` | ≈ 0,09 s (medido) |
| `clientesRecurrentes` | **≈ 1,2 a 1,5 horas** |

**Ejemplo completo del cálculo** (con la medición de 44,4 s para 100.000 ventas):

- k = 44.424,6 ms / (100.000)² = 4,44 × 10⁻⁶ ms
- Para n = 1.000.000: 4,44 × 10⁻⁶ × (1.000.000)² = 4,44 × 10⁶ ms ≈ 4.442 s ≈ 1,2 horas

**Esta cifra es una estimación**: la función no se ejecutó con 1.000.000 de ventas. En cambio, las funciones lineales de la tabla de "Tiempos medidos" sí se midieron directamente con 1.000.000.

## Comparación v0.1 frente a v1.0

Se mide el tiempo total de cálculo de todas las secciones del reporte (`src/comparar-versiones.js`), con datos generados.

- **v0.1 como se entregó:** las cinco secciones del MiniReto 4. Ya usaban funciones lineales, por lo que eran rápidas.
- **v0.1 + recurrentes original:** el reporte v0.1 al que se le suma el reporte de clientes recurrentes con la función original del compañero (O(n²)). Es la situación que la gerente reportó: "se quedó pensando".
- **v1.0:** las diez secciones, con `clientesRecurrentesMap` y las demás funciones optimizadas.

| Reporte | 10.000 ventas | 100.000 ventas |
|---|---|---|
| v0.1 como se entregó (5 secciones) | 1,9 ms | 18,7 ms |
| v0.1 + clientes recurrentes con la función original O(n²) | 335,4 ms | 44.424,6 ms |
| v1.0 (10 secciones) | 4,4 ms | 50,5 ms |
| Mejora de v1.0 frente a v0.1 + recurrentes original | 75,6 veces más rápida | 879,1 veces más rápida |

Comando `node src/reporte.js 100000` de punta a punta (incluye arrancar Node, generar los datos e imprimir): **156 ms (0,16 s)**.

Cómo leerla:

- La v1.0 hace **más cosas** que la v0.1 (diez secciones frente a cinco) y aun así sigue en el orden de milisegundos: 50,5 ms con 100.000 ventas. Por eso es algo más lenta que la v0.1 original (18,7 ms): calcula el doble de secciones, incluidas las nuevas.
- La combinación v0.1 + recurrentes original crece de forma cuadrática: al pasar de 10.000 a 100.000 ventas (n x10) su tiempo se multiplicó por unas 132 (335,4 ms -> 44.424,6 ms), cerca del x100 esperado para O(n²). El tiempo de la v1.0 se multiplicó por unas 11,5 (4,4 ms -> 50,5 ms), cerca del x10 esperado para O(n).
- Por eso la mejora aumenta con el tamaño de los datos: pasa de 75,6 veces con 10.000 ventas a 879,1 veces con 100.000.
- Con 100.000 ventas, el reporte pasó de unos 44 segundos a 50,5 ms. El requisito del marketplace (menos de un segundo con 100.000 ventas) se cumple con holgura, y el límite de este reto (5 segundos) también: el comando completo tarda 0,16 s.

## Riesgos (v0.2, histórico)

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

## Riesgos de la v1.0

Con `clientesRecurrentes` reemplazada, el riesgo crítico quedó resuelto. Los que quedan, ordenados de mayor a menor (mismo criterio: crecimiento del tiempo, memoria, proyección medida y peor caso):

| # | Función | Riesgo | Razón |
|---|---|---|---|
| 1 | `comprasPorCliente` y las versiones con `Map`/`Set` | Bajo-medio | Memoria O(c): con los datos generados c ≈ n/3, así que con 1.000.000 de ventas el `Map` tiene unas 317.000 entradas. En un servidor con poca memoria es el mayor consumidor del reporte. |
| 2 | `calcularReporte` (ventas válidas con `filter`) | Bajo | El `filter` crea un arreglo de hasta n elementos solo para contarlos; se podría contar con un ciclo y memoria O(1). |
| 3 | `parMasCercano` | Bajo | Ordena el catálogo en cada llamada (O(p log p)). Con un catálogo grande convendría ordenarlo una vez y reutilizarlo. |
| 4 | `totalesPorDia` | Bajo | Crece con los días distintos (O(d log d)), no con las ventas. |
| 5 | Resto de funciones lineales | Bajo | Un recorrido y memoria constante o proporcional a pocos grupos. |

**Limitación funcional:** `totalesPorDia` solo incluye las fechas que tienen ventas, así que si algún día no hubo ventas, la "mejor semana" calculada desde las ventas podría abarcar fechas no consecutivas. Con los datos generados (30 días, todos con ventas) y con los totales diarios entregados por la gerente no ocurre.

## Plan de optimización: `clientesRecurrentes`

*(Plan escrito en el MiniReto 8 y ya implementado en el MiniReto 9 como `clientesRecurrentesMap`; ver "Actualización (MiniReto 9)".)*

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