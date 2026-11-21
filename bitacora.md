# Bitácora: Café Origen

## Diccionario de datos

Cada registro representa **una línea de venta**: un cliente compró cierta cantidad de un producto en una fecha y ciudad.

| Propiedad | Tipo (JS) | Significado |
|-----------|-----------|-------------|
| `id` | number | Identificador único y consecutivo de la venta. |
| `fecha` | string | Fecha de la venta en formato `AAAA-MM-DD`. Es texto, no un objeto `Date`. |
| `cliente` | string | Código del cliente (`C01`...`C08`). Un mismo cliente puede aparecer en varias ventas. |
| `producto` | string | Nombre del producto vendido (cafés de origen, prensa francesa, molino manual). |
| `ciudad` | string | Ciudad donde se realizó la venta. |
| `cantidad` | number | Número de unidades vendidas en esa línea. |
| `precio` | number | Precio **por unidad** en pesos colombianos (COP), no el total de la venta. |

> Nota: el total de una venta no viene en los datos; se calcula como `cantidad * precio`.

## Casos borde detectados

| # | Problema | Registros | Decisión |
|---|----------|-----------|----------|
| 1 | **Ciudad con mayúsculas inconsistentes y espacio sobrante**: "medellín " (minúscula y con espacio al final) frente a "Medellín". | id 5 | Normalizar las ciudades antes de agrupar (capitalizar la primera letra, o comparar en minúsculas). No se modifica el dato original en `datos.js`, la limpieza se hace al analizar. |
| 2 | **Cantidad igual a 0**: una venta sin unidades no genera ingreso y distorsiona conteos y promedios. | id 8 | Excluirla del conteo de ventas válidas (ticket promedio y venta mayor); en totales y unidades no afecta porque suma 0. Se conserva en los datos y se registra como posible venta cancelada o error de captura, pendiente de confirmar con el negocio. |
| 3 | **Clientes repetidos**: C01 aparece 3 veces, C02 y C03 aparecen 2 veces. El número de registros (12) no es el número de clientes (8). | ids 1, 4, 11 (C01); 2, 7 (C02); 3, 9 (C03) | Para contar clientes, usar valores únicos y no `ventas.length`. Los registros repetidos no se eliminan: son compras reales distintas. |
| 4 | **`precio` es unitario**: sumar `precio` directamente daría un ingreso incorrecto. | Todos | Calcular el ingreso siempre como `cantidad * precio`. |
| 5 | **Mezcla de tipos de producto**: cafés (250 g y 500 g) se venden junto a accesorios (prensa, molino). Comparar unidades entre ellos no es equivalente. | Varios | Mantenerlos juntos por ahora; en el análisis, considerar separar categorías si hace falta. |
| 6 | **`fecha` es texto**, no un objeto `Date`. | Todos | El formato `AAAA-MM-DD` permite ordenar alfabéticamente. Convertir a `Date` solo si se necesitan cálculos de fechas. |

---

# MiniReto 2: Indicadores con ciclos

## Plan en pseudocódigo

**valorVenta(venta)**
```
devolver venta.cantidad * venta.precio
```

**totalVendido(ventas)** (patrón acumulador)
```
total = 0
para cada venta de ventas:
    total = total + valorVenta(venta)
devolver total
```

**unidadesVendidas(ventas)** (patrón acumulador)
```
unidades = 0
para cada venta de ventas:
    unidades = unidades + venta.cantidad
devolver unidades
```

**ventaMayor(ventas)** (patrón máximo)
```
mayor = null                      // aún no hay ninguna candidata
para cada venta de ventas:
    si venta.cantidad > 0:        // ignora ventas sin unidades
        si mayor es null O valorVenta(venta) > valorVenta(mayor):
            mayor = venta
devolver mayor                    // null si no hubo ventas válidas
```

**ticketPromedio(ventas)** (acumulador + contador)
```
total = 0
validas = 0
para cada venta de ventas:
    si venta.cantidad > 0:
        total = total + valorVenta(venta)
        validas = validas + 1
si validas es 0: devolver 0       // evita dividir entre cero
devolver total / validas
```

**ventasPorCiudad(ventas, ciudad)** (filtro + acumulador)
```
objetivo = ciudad sin espacios sobrantes y en minúsculas
total = 0
para cada venta de ventas:
    si venta.ciudad sin espacios y en minúsculas es igual a objetivo:
        total = total + valorVenta(venta)
devolver total
```

## Comportamiento con arreglo vacío y casos borde

| Función | Entrada vacía | Justificación |
|---------|---------------|---------------|
| `totalVendido([])` | `0` | Es el valor inicial del acumulador; "no se vendió nada" es 0. |
| `unidadesVendidas([])` | `0` | Igual que el anterior. |
| `ventaMayor([])` | `null` | No existe un registro que devolver; `null` indica "no hay resultado". Quien la use debe revisar si es `null`. |
| `ticketPromedio([])` | `0` | Sin ventas válidas habría una división 0/0 que daría `NaN`; se controla con un `if` y se devuelve 0. |
| `ventasPorCiudad([], x)` | `0` | Ninguna venta coincide, el acumulador queda en su valor inicial. |

Otras decisiones:
- **Venta con cantidad 0 (id 8):** se ignora en `ventaMayor` y `ticketPromedio` (no es una venta válida). En totales y unidades no hace falta excluirla porque suma 0.
- **Ciudad mal escrita (id 5, "medellín ")**: `ventasPorCiudad` normaliza ambos lados con `trim()` y `toLowerCase()`. El dato original no se modifica.
- **Ciudad sin ventas** (por ejemplo `"Cartagena"`): devuelve 0.

## Trazas manuales

### Traza 1: `totalVendido` con la muestra completa

Inicio: `total = 0`

| id | cantidad × precio | valorVenta | total acumulado |
|----|-------------------|-----------|-----------------|
| 1 | 2 × 42000 | 84000 | 84000 |
| 2 | 1 × 26000 | 26000 | 110000 |
| 3 | 1 × 95000 | 95000 | 205000 |
| 4 | 1 × 42000 | 42000 | 247000 |
| 5 | 3 × 45000 | 135000 | 382000 |
| 6 | 2 × 26000 | 52000 | 434000 |
| 7 | 1 × 120000 | 120000 | 554000 |
| 8 | 0 × 42000 | 0 | 554000 |
| 9 | 2 × 45000 | 90000 | 644000 |
| 10 | 4 × 42000 | 168000 | 812000 |
| 11 | 1 × 95000 | 95000 | 907000 |
| 12 | 3 × 26000 | 78000 | 985000 |

**Resultado a mano: 985.000.** Coincide con el programa.

### Traza 2: `ventaMayor` con la muestra completa

Inicio: `mayor = null`

| id | cantidad | valorVenta | ¿Reemplaza? | mayor queda en |
|----|----------|-----------|-------------|----------------|
| 1 | 2 | 84000 | sí (mayor era null) | id 1 |
| 2 | 1 | 26000 | no | id 1 |
| 3 | 1 | 95000 | sí (95000 > 84000) | id 3 |
| 4 | 1 | 42000 | no | id 3 |
| 5 | 3 | 135000 | sí (135000 > 95000) | id 5 |
| 6 | 2 | 52000 | no | id 5 |
| 7 | 1 | 120000 | no (120000 < 135000) | id 5 |
| 8 | 0 | n/a | se ignora (cantidad 0) | id 5 |
| 9 | 2 | 90000 | no | id 5 |
| 10 | 4 | 168000 | sí (168000 > 135000) | id 10 |
| 11 | 1 | 95000 | no | id 10 |
| 12 | 3 | 78000 | no | id 10 |

**Resultado a mano: el registro id 10 (168.000).** Coincide con el programa.

### Traza 3 (extra): `ticketPromedio`

Ventas válidas (cantidad > 0): 11 de 12 (se excluye id 8). Total = 985000.
985000 / 11 ≈ **89.545,45**. Coincide con el programa.

---

# MiniReto 3: Del ciclo al método

## Preguntas de la sesión por función

| Función | ¿Qué recorro? | ¿Qué filtro? | ¿Qué transformo? | ¿Qué acumulo? | ¿Cómo agrupo? |
|---|---|---|---|---|---|
| `totalVendidoM` | Todas las ventas | Nada | Cada venta en su valor (`map`) | La suma de valores (`reduce`, inicio 0) | No agrupa |
| `unidadesVendidasM` | Todas las ventas | Nada | Nada (se lee `cantidad` directo) | La suma de cantidades (`reduce`, inicio 0) | No agrupa |
| `ventasPorCiudadM` | Todas las ventas | Solo las de la ciudad pedida, normalizada (`filter`) | Cada venta en su valor | La suma de valores (`reduce`, inicio 0) | No agrupa |
| `totalPorCiudad` | Todas las ventas | Nada | El nombre de ciudad, normalizado | El valor de venta en cada ciudad | Objeto con la ciudad como clave; si no existe se inicia en 0 |
| `unidadesPorProducto` | Todas las ventas | Nada | Nada | Las unidades de cada producto | Objeto con el producto como clave |
| `topProductosPorValor` | Las ventas y luego las entradas del diccionario | Nada con `filter`; `slice` recorta a los k primeros | Entradas `[producto, valor]` en objetos `{ producto, valor }` (`Object.entries` + `map`) | El valor generado por producto | Objeto por producto; después se ordena una copia con `sort` descendente |

## Decisiones

- **Sin modificar el original:** `topProductosPorValor` ordena una copia (`[...ranking]`). `sort` modifica el arreglo sobre el que se llama, por eso nunca se llama sobre `ventas`.
- **`reduce` siempre con valor inicial** (`0` o `{}`), para que un arreglo vacío no lance error.
- **Normalización de ciudad:** `trim()`, `toLowerCase()` y primera letra en mayúscula, así "Bogotá" y "Bogotá " caen en el mismo grupo.
- **Venta con cantidad 0 (id 8):** no necesita filtro especial, aporta 0 a totales y unidades.
- **Empates en el ranking:** `sort` es estable, por lo que los productos con igual valor conservan el orden en que aparecieron.
- **`topProductosPorValor([], 3)`:** devuelve `[]`. Si k es mayor que los productos disponibles, devuelve todos.

## Verificación ciclo vs. método

`node src/verificar.js` mostró **OK en los 12 pares**: 3 indicadores (`totalVendido`, `unidadesVendidas`, `ventasPorCiudad`), este último probado con dos escrituras ("Medellín" y "  BOGOTÁ "), sobre 3 conjuntos de datos (completo, un elemento y vacío). Cada método reproduce exactamente el resultado del ciclo que reemplaza.

Resultados con la muestra completa: totalVendido 985000, unidadesVendidas 21, ventasPorCiudad "Medellín" 356000 y "Bogotá" 276000.

## Pruebas de agrupaciones y ranking

`node src/probar-agrupaciones.js` confirmó:
- `totalPorCiudad` devuelve exactamente 4 ciudades: Medellín 356000, Bogotá 276000, Cali 185000, Pereira 168000 (suma 985000, igual que `totalVendido`).
- `unidadesPorProducto`: Huila 7, Nariño 6, Sierra 5, Prensa francesa 2, Molino manual 1 (suma 21).
- `topProductosPorValor(ventas, 3)`: Huila (294000), Sierra (225000), Prensa francesa (190000), de mayor a menor.
- `ventas` conserva su orden original después de llamar a las funciones (se comparó una copia en texto antes y después con `JSON.stringify`).

---

# MiniReto 4: Analítica v0.1 y depuración

## Decisiones del reporte

- `src/reporte.js` solo **integra**: importa los datos y las funciones de `analitica.js` y las muestra con formato. No recalcula nada por su cuenta (salvo contar ventas válidas para el resumen).
- Valores en pesos con `toLocaleString("es-CO")` (por ejemplo `$ 985.000`). El formato se aplica solo al mostrar; los cálculos usan números.
- El ticket promedio se redondea con `Math.round` solo al mostrarlo (89.545,45 -> `$ 89.545`).
- `ventasDelDia(ventas, fecha)` devuelve el **arreglo** de ventas de esa fecha, y `[]` si no hay ninguna (nunca `null` ni error). Así todas las funciones anteriores se reutilizan sobre el resultado.
- **Día sin ventas:** el reporte muestra el mensaje "Sin ventas registradas este día." y los valores en cero.
- El reporte incluye un control: la suma de las ciudades debe ser igual al total vendido.

## Registro de depuración

Los dos errores se reproducen con `node src/depurar.js`, que contiene una versión "ingenua" (imitando la versión preliminar del compañero) y la compara con la versión corregida.

### Error 1: "Bogotá aparecía dos veces"

| Campo | Detalle |
|---|---|
| **Síntoma** | En el total por ciudad aparecen dos grupos para la misma ciudad. |
| **Entrada que lo produce** | La misma ciudad escrita de dos formas, por ejemplo `"Bogotá"` y `"Bogotá "` (espacio al final). Con la muestra original ocurre igual con `"Medellín"` y `"medellín "` (id 5). |
| **Hipótesis** | (a) El agrupamiento usa el texto de la ciudad tal cual, sin normalizar. (b) Hay un error en la suma. Descarté (b) porque la suma total sí era correcta; solo estaba repartida en dos grupos. |
| **Prueba realizada** | Se agrupó con la versión ingenua y se imprimió `Object.keys(...)`. Salieron `'Medellín'`, `'medellín '` y, al agregar un registro con `"Bogotá "`, también `'Bogotá'` y `'Bogotá '` por separado. Se repitió con `totalPorCiudad` y salieron exactamente 4 claves. |
| **Causa** | Las claves de un objeto distinguen mayúsculas, minúsculas y espacios: `"Bogotá"` y `"Bogotá "` son claves distintas. |
| **Corrección** | `totalPorCiudad` normaliza el nombre con `normalizarCiudad` (`trim()`, `toLowerCase()` y primera letra en mayúscula) antes de usarlo como clave. |
| **Evidencia** | Con la muestra: 4 ciudades (Medellín, Bogotá, Cali, Pereira). Con el registro extra `"Bogotá "`: sigue habiendo 4 y Bogotá suma 396000 (276000 + 120000). |

**Limitación conocida:** la normalización no unifica tildes. `"Bogota"` (sin tilde) seguiría siendo un grupo aparte de `"Bogotá"`. La muestra no trae ese caso; queda como mejora futura.

### Error 2: "El ticket promedio daba NaN en un día sin ventas"

| Campo | Detalle |
|---|---|
| **Síntoma** | Al filtrar un día sin ventas, el ticket promedio muestra `NaN`. |
| **Entrada que lo produce** | `ventasDelDia(ventas, "2026-09-07")`, que devuelve `[]`, y luego `ticketPromedio` sobre ese arreglo vacío. |
| **Hipótesis** | (a) La función divide entre la cantidad de ventas sin revisar si es 0. (b) El filtro por día devuelve `undefined` en vez de un arreglo. Descarté (b): el filtro devuelve `[]`. |
| **Prueba realizada** | Se imprimió el arreglo del día (`[]`, longitud 0) y se calculó `total / datos.length` en la versión ingenua: `0 / 0` da `NaN`. Se llamó a `ticketPromedio` con el mismo arreglo vacío y devolvió `0`. |
| **Causa** | En JavaScript `0 / 0` es `NaN`. La versión preliminar dividía sin comprobar que hubiera ventas. |
| **Corrección** | `ticketPromedio` cuenta las ventas válidas y, si son 0, devuelve 0 antes de dividir. El reporte además muestra el mensaje "Sin ventas registradas este día.". |
| **Evidencia** | `ticketPromedio([])` es `0` y el reporte del 2026-09-07 no muestra `NaN`. |

## Verificación final de v0.1

- `node src/reporte.js` muestra las cinco secciones (resumen general, ciudades, productos, top 3 y resumen por día) sin `NaN`, `undefined` ni grupos duplicados.
- El control "suma de ciudades = total vendido" sale `OK` (985.000).
- Resumen del 2026-09-03 verificado a mano: ids 5 y 6 = 135.000 + 52.000 = 187.000 en 5 unidades, ticket 93.500.
- `node src/verificar.js` sigue mostrando `OK` en los 12 pares.

---

# MiniReto 5: ¿Cuánto cuesta cada reporte?

## Qué cuenta como operación

Sumo 1 por cada elemento visitado y 1 por cada comparación. En `totalPorCiudad` cuento también la consulta "¿ya existe el grupo?" y asumo que acceder a una clave de un objeto cuesta una sola operación.

## Predicción (escrita antes de medir)

Si n se multiplica por 10:

| Función | Predicción | Razonamiento |
|---|---|---|
| `totalVendido` | Operaciones x10 | Un ciclo que visita cada venta una vez. |
| `ventaMayor` | Operaciones x10 | Un solo ciclo; en cada vuelta hace un número fijo de comparaciones. |
| `totalPorCiudad` | Operaciones x10 | Un solo ciclo; solo hay 4 ciudades, así que los grupos no crecen con n. |
| `primeraVenta` | Operaciones x1 (no cambia) | Solo accede a la posición 0, sin recorrer. |

## Resultados medidos

| n | totalVendido | ventaMayor | totalPorCiudad | primeraVenta |
|---|---|---|---|---|
| 100 | 100 | 399 | 200 | 1 |
| 1.000 | 1.000 | 3.999 | 2.000 | 1 |
| 10.000 | 10.000 | 39.999 | 20.000 | 1 |
| 100.000 | 100.000 | 399.999 | 200.000 | 1 |

En las tres funciones lineales, cada vez que n se multiplica por 10 las operaciones también se multiplican por 10 (10,02 en `ventaMayor` de 100 a 1.000). En `primeraVenta` el valor es siempre 1. Las versiones instrumentadas dieron el mismo resultado que las originales (`mismoResultado: OK`).

## Predicción vs. resultado

| Función | Predicción | Resultado | ¿Coincide? |
|---|---|---|---|
| `totalVendido` | x10 | x10 | Sí |
| `ventaMayor` | x10 | x10 | Sí |
| `totalPorCiudad` | x10 | x10 | Sí |
| `primeraVenta` | x1 | x1 | Sí |

Detalle que no había previsto: `ventaMayor` hace unas 4 operaciones por venta (visita y tres comparaciones), `totalPorCiudad` hace 2 y `totalVendido` hace 1. Por eso los números absolutos son distintos entre funciones, pero el crecimiento es el mismo.

## Clasificación Big O

| Función | Clasificación | Justificación |
|---|---|---|
| `totalVendido` | **O(n)** | Un solo `for...of` que visita cada venta una vez: n operaciones exactas. |
| `ventaMayor` | **O(n)** | Un solo ciclo con un número fijo de comparaciones por vuelta (≈ 4n - 1). La constante 4 no cambia el crecimiento: x10 cuando n es x10. |
| `totalPorCiudad` | **O(n)** | Un solo ciclo con 2 operaciones por venta (2n). El número de grupos es constante (4 ciudades) y no depende de n. |
| `primeraVenta` | **O(1)** | Accede a `ventas[0]` sin recorrer nada: siempre 1 operación, con 100 o con 100.000 ventas. |

Ninguna función es O(n²): ninguna tiene un ciclo dentro de otro ciclo sobre las ventas.

## Conclusión

Las constantes (1, 2 o 4 operaciones por venta) no importan para el crecimiento; lo que importa es cuántas veces se recorre el arreglo. Con 100.000 ventas, un reporte que recorre los datos unas pocas veces sigue siendo manejable, pero lo que sí podría dispararse es un ciclo dentro de otro (eso se investiga en el MiniReto 6).

---

# MiniReto 6: El reporte que se volvió lento

## Verificación de la función

Con los 12 datos del Día 1, `clientesRecurrentes` devuelve `C01, C02, C03`, que son los clientes con más de una compra (C01 en los ids 1, 4 y 11; C02 en 2 y 7; C03 en 3 y 9).

## Traza con 5 ventas

Clientes de las 5 ventas, por posición: `[C01, C02, C01, C03, C02]`

| i | j | Comparación | ¿Iguales? | Acción |
|---|---|---|---|---|
| 0 | 1 | C01 vs C02 | no | |
| 0 | 2 | C01 vs C01 | sí | no está en `recurrentes`, se agrega C01 |
| 0 | 3 | C01 vs C03 | no | |
| 0 | 4 | C01 vs C02 | no | |
| 1 | 2 | C02 vs C01 | no | |
| 1 | 3 | C02 vs C03 | no | |
| 1 | 4 | C02 vs C02 | sí | no está en `recurrentes`, se agrega C02 |
| 2 | 3 | C01 vs C03 | no | |
| 2 | 4 | C01 vs C02 | no | |
| 3 | 4 | C03 vs C02 | no | |

**Total: 10 comparaciones** con n = 5. Resultado: `[C01, C02]`.

## Generalización

Para cada i, el ciclo interno hace (n - 1 - i) comparaciones: la primera venta se compara con n-1, la segunda con n-2, y así hasta 1.

(n-1) + (n-2) + ... + 1 = **n(n-1)/2 ≈ n²/2** comparaciones.

| n | Comparaciones |
|---|---|
| 5 | 10 |
| 12 | 66 |
| 1.000 | 499.500 |
| 100.000 | ≈ 5.000.000.000 |
| 1.000.000 | ≈ 500.000.000.000 |

Al duplicar n, las comparaciones se multiplican por 4: (2n)²/2 = 4 · n²/2. Es complejidad **O(n²)**.

## Tabla de tiempos

| n | Tiempo (ms) | Veces vs. anterior |
|---|---|---|
| 1.000 | 3.08 | - |
| 2.000 | 12.25 | 3.97 |
| 4.000 | 53.05 | 4.33 |
| 8.000 | 249.59 | 4.71 |
| 16.000 | 894.05 | 3.58 |

## Análisis

Cada vez que n se duplica, el tiempo se multiplica aproximadamente por **4**: los valores medidos fueron 3,97, 4,33, 4,71 y 3,58, con un promedio de unas 4,15 veces. La variación alrededor de 4 se debe al ruido del equipo (otros procesos) y a las optimizaciones de Node mientras corre.

Esto coincide con O(n²): si el trabajo es proporcional a n², al pasar de n a 2n el trabajo es (2n)² = 4n². Si la función fuera lineal, el tiempo se duplicaría (x2); aquí se cuadruplica.

## Estimación

Con la medición de n = 16.000 calculo la constante k = tiempo / n²:

k = 894,05 ms / 16.000² ≈ 3,49 × 10⁻⁶ ms

Luego tiempo(n) ≈ k · n².

| n | Estimación | Medición real |
|---|---|---|
| 100.000 | ≈ 34,9 s | 53,9 s |
| 1.000.000 | ≈ 3.492 s (≈ 58 min) | no se ejecuta |

Pasar de 16.000 a 1.000.000 es multiplicar n por 62,5, y el tiempo por 62,5² ≈ 3.900 (894 ms × 3.900 ≈ 3.492.000 ms).

**Comparación con la medición real:** con n = 100.000 el programa tardó 53,9 s, un 54 % más de lo estimado (34,9 s). La estimación cuadrática se queda corta con datos grandes, probablemente porque los arreglos más grandes aprovechan peor la memoria rápida del procesador y porque `includes` pesa más. Por eso la estimación de 1.000.000 es un **mínimo**: si se corrige con el mismo desvío (k ≈ 5,39 × 10⁻⁶ ms, calculada con la medición de 100.000), saldrían unos 5.390 s, es decir, **cerca de 1,5 horas**.

## Costo oculto: `recurrentes.includes`

`includes` también recorre un arreglo: busca el cliente en `recurrentes` elemento por elemento. Es un ciclo escondido dentro del ciclo doble.

- Solo se ejecuta cuando los dos clientes coinciden, porque `&&` evalúa la segunda condición únicamente si la primera es verdadera.
- Cada ejecución cuesta, como máximo, el tamaño de `recurrentes`, que puede llegar a n/2 clientes.
- **Con datos como los generados** (clientes repartidos al azar), las coincidencias son del orden de n, muy pocas frente a las n²/2 comparaciones. Aun así, `includes` agrega un costo adicional, y puede explicar parte de por qué el tiempo real superó la estimación. La complejidad sigue dominada por el ciclo doble: **O(n²)**.
- **En el peor caso** (muchas coincidencias y `recurrentes` ya grande, por ejemplo unos n/2 clientes que repiten y además muchas ventas de un cliente que se agregó al final), `includes` se ejecuta hasta del orden de n² veces y cada ejecución recorre hasta ~n/2 elementos. El costo podría subir hacia **O(n³)**.

## Conclusión para la gerente

El reporte se pone lento porque, para saber qué clientes repiten, el programa toma cada venta y la compara con **todas las demás** del historial. Con 12 ventas son 66 comparaciones y no se nota.

Pero el trabajo no crece de forma proporcional: **si el historial se duplica, el trabajo se multiplica por cuatro**. En nuestras pruebas, 16.000 ventas tardaron casi un segundo, 100.000 ventas tardaron cerca de 54 segundos y, para un millón de ventas, se estima alrededor de una hora y media. Un historial anual puede estar en esa zona, y por eso el reporte "se quedó pensando".

No es un problema del computador, sino de la forma en que se hace la comparación. Se puede corregir con un método que recorra el historial una sola vez: así el tiempo crecería en proporción al tamaño de los datos, y no al cuadrado.

---

# MiniReto 7: Tiempo, memoria y cadenas de métodos

## Las dos versiones

- `totalCiudadCadena`: `map` (normaliza y copia cada venta) -> `filter` (deja la ciudad pedida) -> `map` (calcula el valor) -> `reduce` (suma).
- `totalCiudadUnaPasada`: un solo `for...of` con un acumulador.

**Verificación:** `node src/comparar-ciudad.js` mostró `OK` en los 8 casos probados: muestra del Día 1 (356.000 para "Medellín", que incluye "medellín "; 276.000 para "  BOGOTÁ "; 0 para "Cartagena"), arreglo vacío (0) y 10.000 ventas generadas con las cuatro ciudades. Además, las dos versiones coinciden con `ventasPorCiudad` del MiniReto 2.

## Recorridos y arreglos nuevos

n = número de ventas; m = ventas de la ciudad pedida (m ≤ n; con 4 ciudades, m ≈ n/4).

| Paso de la cadena | Recorre | Arreglo nuevo |
|---|---|---|
| `map` (normaliza) | n elementos | sí, de n elementos (y n objetos copiados con `...venta`) |
| `filter` | n elementos | sí, de m elementos |
| `map` (valor) | m elementos | sí, de m elementos |
| `reduce` | m elementos | no, devuelve un número |

| Versión | Recorridos | Arreglos nuevos | Tiempo | Espacio extra |
|---|---|---|---|---|
| `totalCiudadCadena` | 4 (los dos últimos sobre m ≤ n elementos) | 3 | O(n) | O(n) |
| `totalCiudadUnaPasada` | 1 | 0 | O(n) | O(1) |

Con n = 10.000 y "Medellín", los arreglos intermedios de la cadena tuvieron 10.000, 2.553 y 2.553 elementos.

## Por qué O(4n) se simplifica a O(n)

La notación Big O describe **cómo crece** el trabajo cuando crece n, no cuánto tarda exactamente. Se aplican dos reglas de simplificación:

1. Se eliminan las **constantes multiplicativas**: 4n -> n.
2. Se conserva el **término dominante** y se descartan los de menor orden.

La cadena hace n + n + m + m pasos, que como máximo son 4n (cuando todas las ventas son de la ciudad pedida). En mi medición fueron 10.000 + 10.000 + 2.553 + 2.553 = 25.106 pasos (≈ 2,5n). La versión de una pasada hace n.

Si n se multiplica por 10, ambas se multiplican por 10: con n = 10.000 la cadena hace como máximo 40.000 pasos y la de una pasada 10.000; con n = 100.000 hacen como máximo 400.000 y 100.000. La relación entre las dos siempre es una constante (como máximo 4) que no depende de n. Por eso las dos crecen igual: **O(n)**.

Que sean del mismo orden no significa que tarden lo mismo. Con n = 1.000.000:

| Versión | Tiempo medido |
|---|---|
| `totalCiudadCadena` | 221,75 ms |
| `totalCiudadUnaPasada` | 85,59 ms |

La cadena fue unas 2,6 veces más lenta. Esa diferencia es la constante oculta: copiar un millón de objetos, crear tres arreglos y hacer más recorridos. El crecimiento es el mismo, pero la cadena cuesta más en cada paso.

## Complejidad espacial de todas las funciones del motor

Se cuenta solo la memoria **extra** (el arreglo de entrada no cuenta). g = número de grupos distintos (ciudades o productos), r = clientes recurrentes, m = ventas que cumplen un filtro.

| Función | Espacio | Justificación |
|---|---|---|
| `valorVenta` | O(1) | Solo multiplica dos números. |
| `totalVendido` | O(1) | Un acumulador. |
| `unidadesVendidas` | O(1) | Un acumulador. |
| `ventaMayor` | O(1) | Guarda una referencia a una venta existente, no una copia. |
| `ticketPromedio` | O(1) | Dos números (total y contador). |
| `ventasPorCiudad` | O(1) | Un acumulador y el texto normalizado. |
| `totalVendidoM` | O(n) | `map` crea un arreglo con un valor por venta. |
| `unidadesVendidasM` | O(1) | Solo `reduce`: no crea arreglos. |
| `ventasPorCiudadM` | O(n) en el peor caso | `filter` crea un arreglo de m ventas (m ≤ n). |
| `totalPorCiudad` | O(g) | El objeto tiene una clave por ciudad distinta, no por venta. |
| `unidadesPorProducto` | O(g) | El objeto tiene una clave por producto distinto. |
| `topProductosPorValor` | O(g) | Crea el diccionario (g claves), el arreglo de `Object.entries` (g), su copia `[...ranking]` (g) y el recorte con `slice` (k). Todos dependen de g, no de n. |
| `ventasDelDia` | O(m) ≤ O(n) | `filter` crea un arreglo con las ventas del día (referencias, no copias de los objetos). |
| `clientesRecurrentes` | O(r) ≤ O(n) | `recurrentes` puede llegar a tener n/2 clientes. |
| `totalCiudadCadena` | O(n) | Tres arreglos nuevos y n objetos copiados. |
| `totalCiudadUnaPasada` | O(1) | Solo un acumulador. |
| `generarVentas` | O(n) | Su resultado es el arreglo de n ventas, así que no se puede evitar. |
| `totalVendidoContado`, `ventaMayorContado`, `primeraVenta` | O(1) | Solo el contador. |
| `totalPorCiudadContado` | O(g) | Un objeto con una clave por ciudad. |

**Sobre `totalPorCiudad` y `topProductosPorValor`:** su memoria crece con el número de **grupos**, no con el número de ventas. En este negocio hay 4 ciudades y 5 productos, así que con 100.000 o con 1.000.000 de ventas la memoria extra es la misma: en la práctica es constante. Formalmente son O(g), porque si cada venta tuviera una ciudad o un producto distinto, g llegaría a n y serían O(n).

En `topProductosPorValor` hay además un detalle: la copia `[...ranking]` duplica el arreglo antes de ordenarlo. Es un costo pequeño (g) que se paga para no alterar el original, y sigue siendo O(g).

## Decisión: qué versión queda en el motor

**Queda `totalCiudadUnaPasada`.**

- **Recursos:** hace un solo recorrido y no crea arreglos, así que su memoria extra es constante. La cadena, con 1.000.000 de ventas, copia 1.000.000 de objetos y crea tres arreglos, y en un servidor con memoria limitada eso se paga. Además, en mi medición fue unas 2,6 veces más rápida.
- **Legibilidad:** la cadena se lee como una receta (normaliza, filtra, calcula, suma) y para datos pequeños es razonable. Pero la versión con ciclo tiene solo 6 líneas y se entiende igual de bien, así que la ventaja de legibilidad es pequeña y no compensa el costo en recursos.
- **Observación:** `totalCiudadUnaPasada` hace lo mismo que `ventasPorCiudad` (MiniReto 2); la diferencia es que usa `normalizarCiudad` para comparar.
- La cadena se conserva en `analitica.js` como referencia para esta comparación y no se usa en el reporte.