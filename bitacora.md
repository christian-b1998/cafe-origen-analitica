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

---

# MiniReto 8: Analítica v0.2, el informe de rendimiento

## Qué se hizo

- Se creó `RENDIMIENTO.md` con la clasificación de todas las funciones del motor (tiempo, espacio, justificación y operaciones con 10.000 ventas), la proyección para 1.000.000 de ventas, los riesgos ordenados y el plan de optimización.
- Se creó `src/medir-todo.js`, que mide el tiempo de cada función con 10.000 y con 1.000.000 de ventas y imprime la tabla en Markdown.

## Decisiones

- **Operaciones y tiempos por separado:** la tabla de clasificación usa operaciones, que son iguales en cualquier computador, y los tiempos van en una tabla aparte porque dependen del equipo.
- **Proyección de `clientesRecurrentes`:** se usó la medición real de 100.000 ventas (53,9 s) y no la de 16.000, porque la estimación hecha con 16.000 quedó corta (34,9 s estimados frente a 53,9 s reales). El resultado es ≈ 1,5 horas para 1.000.000.
- **Criterio de riesgo:** primero el crecimiento del tiempo, luego la memoria, luego la proyección medida y, por último, los peores casos ocultos. Por eso `clientesRecurrentes` es el mayor riesgo y `totalCiudadCadena` queda segunda.
- **Plan de optimización:** el trabajo que se repite es buscar a cada cliente entre todas las ventas, y la información que se guardaría es un diccionario cliente -> compras. No se implementa todavía (MiniReto 9).

## Revisión de un compañero

Se le pidió a un compañero que revisara `RENDIMIENTO.md`. Preguntas que se le hicieron:

1. ¿Se entiende la tabla sin abrir el código?
2. ¿La justificación de cada complejidad se apoya en el código y no solo en el resultado?
3. ¿La proyección de 1.000.000 está calculada y no supuesta?
4. ¿El plan de optimización explica qué se repite y qué se guardaría?

**Revisor:** Ramael Gonzalez Florez.

**Lo que me dijo:**

1. En la tabla, `clientesRecurrentes` figura como O(n²), pero por el `includes` en un caso extremo podría llegar a O(n³). Eso lo explico en la sección de riesgos, pero en la tabla no se veía.
2. Puse `calcularReporte` como O(n), pero dentro se ordenan productos y días, así que eso solo es cierto mientras haya pocos.
3. Las complejidades de `clientesRecurrentesMap`, `totalCiudadCadena`, `topProductosPorValor`, `mejorSemana` y `parMasCercano` están bien y se explican con lo que hace el código.
4. Las proyecciones sí salen de mediciones, pero conviene mostrar un ejemplo completo del cálculo y dejar claro que el dato de 1.000.000 para `clientesRecurrentes` es una estimación.
5. En la tabla usé `c`, `p`, `d` y `k` sin explicarlas, y el plan de optimización decía que no estaba implementado cuando `clientesRecurrentesMap` ya existe.

**Mi respuesta:** tenía razón en casi todo y corregí el informe:

- En la fila de `clientesRecurrentes` agregué que con datos como los generados manda el ciclo doble (O(n²)), pero que en un caso extremo `includes` podría llevarla hacia O(n³).
- Corregí `calcularReporte`: ahora dice O(n + d log d + p log p), que equivale a O(n) cuando hay pocos días y productos, como en mis pruebas. Acepto que decir solo O(n) no era del todo justo.
- Definí todas las variables que usa la tabla (n, m, g, r, c, p, d y k).
- Aclaré en el plan de optimización que se escribió en el MiniReto 8 y se implementó en el 9 con `clientesRecurrentesMap`.
- Agregué un ejemplo completo del cálculo de la proyección y escribí que el dato de 1.000.000 es una estimación y no una medición.

En el punto 3 no había nada que cambiar.

## Conclusiones del Día 2

- Contar operaciones permite ver el crecimiento sin depender del computador: las funciones lineales se multiplican por 10 cuando n se multiplica por 10, y la constante no crece.
- Un ciclo dentro de otro es lo que vuelve lento un reporte: `clientesRecurrentes` pasa de 66 comparaciones con 12 ventas a casi 50 millones con 10.000.
- Dos funciones del mismo orden (O(n)) pueden costar distinto: la cadena de métodos fue unas 2,6 veces más lenta que el recorrido único y usa memoria proporcional a n.
- El siguiente paso es optimizar `clientesRecurrentes` a O(n) (MiniReto 9).

---

# MiniReto 9: Clientes recurrentes en tiempo lineal

## Método de resolución (seis fases)

### 1. Entender el problema

- **Entrada:** un arreglo de ventas; cada venta tiene una propiedad `cliente` (texto, por ejemplo `"C01"`).
- **Salida:** un arreglo con los códigos de los clientes que aparecen en **más de una venta**, cada uno una sola vez.
- **Restricciones:**
  - Con 100.000 ventas debe responder en menos de un segundo.
  - No debe modificar el arreglo de ventas.
  - El orden del resultado no importa (las versiones se comparan ordenadas).
- **Pregunta de fondo:** para cada cliente, ¿ya lo había visto antes?

### 2. Ejemplos y casos borde

| Clientes por venta | Resultado esperado | Qué comprueba |
|---|---|---|
| `[]` | `[]` | Arreglo vacío: no hay error. |
| `[A]` | `[]` | Una sola compra no es recurrente. |
| `[A, B, C]` | `[]` | Todos distintos. |
| `[A, A, A, A]` | `[A]` | Un cliente con muchas compras aparece una sola vez. |
| `[A, B, B, A]` | `[A, B]` (en cualquier orden) | El orden puede cambiar entre versiones. |
| Datos del Día 1 | `[C01, C02, C03]` | Caso real: C01 (3 compras), C02 (2) y C03 (2). |

**Decisión sobre la venta con cantidad 0 (id 8):** cada registro cuenta como una compra, igual que en la versión original, para que las tres versiones den el mismo resultado. Queda como pregunta pendiente para el negocio si una venta con cantidad 0 debería contar.

### 3. Fuerza bruta

Es la versión actual, `clientesRecurrentes`: un ciclo doble que compara cada venta con todas las siguientes y usa `includes` para no repetir clientes.

- **Tiempo:** O(n²): n(n-1)/2 comparaciones (≈ 5.000.000.000 con 100.000 ventas).
- **Espacio:** O(r), con r clientes recurrentes.
- **Evidencia del MiniReto 6:** 53,9 s con 100.000 ventas, muy lejos del segundo exigido.

### 4. Idea de optimización

El trabajo que se repite es buscar al mismo cliente una y otra vez entre todas las ventas. La solución es **recordar a quién ya vimos**, con una estructura donde preguntar "¿ya está?" sea una operación directa (`Set` y `Map` usan una tabla hash, con consulta de costo constante en promedio):

```
Con Set:                              Con Map:
vistos = Set vacío                    compras = Map vacío (cliente -> compras)
recurrentes = Set vacío               para cada venta: sumar 1 a compras[cliente]
para cada venta:                      recurrentes = clientes con compras > 1
    si cliente está en vistos:
        agregar a recurrentes
    si no: agregar a vistos
```

Se recorren las ventas una sola vez.

### 5. Implementación

- `clientesRecurrentesSet(ventas)`: usa `vistos.has`, `vistos.add` y `recurrentes.add`. Devuelve `[...recurrentes]`.
- `comprasPorCliente(ventas)`: usa `compras.get` y `compras.set` y devuelve el `Map` cliente -> compras.
- `clientesRecurrentesMap(ventas)`: recorre ese `Map` y se queda con los clientes con más de una compra.

Complejidad de las dos versiones:

| | Set | Map |
|---|---|---|
| Tiempo | O(n): por cada venta, una consulta y una inserción | O(n + c): un recorrido de n ventas y otro de c clientes distintos (c ≤ n) |
| Espacio extra | O(c + r) | O(c) |

Por venta se hacen apenas 2 o 3 operaciones, es decir, unas 300.000 con 100.000 ventas, frente a ≈ 5.000.000.000 comparaciones de la versión original.

### 6. Probar

`node src/verificar-recurrentes.js` mostró `OK` en las siete comparaciones: datos del Día 1 (C01, C02 y C03 en las tres versiones), 5.000 ventas generadas, arreglo vacío, una venta, clientes todos distintos, un cliente con muchas compras y el caso `[A, B, B, A]`.

**Sobre el orden:** en `[A, B, B, A]` la original y el `Map` devuelven `[A, B]` (orden de la primera aparición) y el `Set` devuelve `[B, A]` (orden de la segunda compra). Por eso los resultados se comparan ordenados (`sort`) sobre una copia.

## Tabla comparativa de tiempos

`node src/medir-recurrentes.js`:

| n | Original (ms) | Set (ms) | Map (ms) | Clientes distintos | Recurrentes |
|---|---|---|---|---|---|
| 1.000 | 4,072 | 0,066 | 0,059 | 315 | 270 |
| 10.000 | 349,427 | 0,537 | 0,429 | 3.148 | 2.664 |
| 100.000 | no se ejecuta | 12,059 | 6,639 | 31.661 | 26.700 |
| 1.000.000 | no se ejecuta | 218,871 | 151,225 | 316.847 | 267.005 |

Cómo leerla:

Cómo leerla:

- **Original:** al pasar de 1.000 a 10.000 ventas (n x10) el tiempo se multiplicó por unas 86 (4,07 ms -> 349,43 ms), cerca del x100 que corresponde a O(n²). Por eso solo se mide hasta 10.000: con 100.000 ya había tardado 53,9 s (MiniReto 6).
- **Set y Map:** al multiplicar n por 10, el tiempo se multiplica entre 7 y 23 veces (Set: 0,066 -> 0,537 -> 12,059 -> 218,871 ms; Map: 0,059 -> 0,429 -> 6,639 -> 151,225 ms), muy lejos del x100 de la original. Las razones no son exactamente 10 por el calentamiento de Node y porque las tablas grandes aprovechan peor la memoria caché, pero el crecimiento es lineal y no cuadrático. Incluso con 1.000.000 de ventas tardan unos 150 a 220 ms, mucho menos que la original con solo 10.000.
- **Requisito del marketplace:** con 100.000 ventas, `Set` tardó 12,06 ms y `Map` 6,64 ms en la tabla (promedio de varias ejecuciones). En la prueba con `console.time` de una sola ejecución, sin calentamiento, `Set` tardó 63,98 ms y `Map` 6,9 ms. Todas están muy por debajo del segundo exigido. La original tardaba 53,9 s.

## Intercambio entre tiempo y memoria

La optimización **gasta memoria para ahorrar trabajo**:

| Versión | Tiempo | Memoria extra |
|---|---|---|
| Original | O(n²) | O(r), solo la lista de recurrentes |
| Set | O(n) | O(c + r): un Set con todos los clientes distintos y otro con los recurrentes |
| Map | O(n + c) | O(c): una entrada por cliente distinto |

- c = clientes distintos y r = clientes recurrentes, con r ≤ c ≤ n. La tabla de tiempos muestra ambos valores: con los datos generados, c es cerca de n/3 y la mayoría de esos clientes son recurrentes.
- En el **peor caso** (cada venta de un cliente distinto) c = n, y la memoria extra es O(n).
- **Vale la pena:** a cambio de guardar unos pocos miles de claves por cada 100.000 ventas, el reporte pasa de casi un minuto a decenas de milisegundos. Es el mismo principio de una agenda o un índice: se paga espacio por no volver a buscar.
- El costo de memoria de `Map` es menor que el de `Set` (una estructura en lugar de dos) y además guarda **cuántas** compras hizo cada cliente, información que se puede reutilizar en otros análisis.

## Decisión

Para el motor queda **`clientesRecurrentesMap`**:

- Respeta el orden de la versión original (primera aparición del cliente).
- Usa una sola estructura.
- `comprasPorCliente` se puede reutilizar en otros reportes.

`clientesRecurrentes` (la original) se conserva solo como referencia para verificar y para la comparación de tiempos.

---

# MiniReto 10: Combos de regalo y frecuencias

## Catálogo

`src/catalogo.js` representa el catálogo como un arreglo de 8 objetos `{ nombre, precio }` (de 18.000 a 120.000).

## Combo de regalo

**Problema:** dado un valor (la tarjeta regalo), encontrar dos productos **distintos** cuyo precio sume exactamente ese valor. Devuelve los dos productos o `null` si no hay combinación.

### Fuerza bruta: `comboRegalo`

Dos ciclos que prueban todos los pares (i, j) con i < j.

- **Tiempo:** O(n²), con n = productos del catálogo: n(n-1)/2 pares (28 pares con 8 productos).
- **Espacio:** O(1).

### Optimizada: `comboRegaloMap`

Idea: para el producto actual, el compañero que necesita es el **complemento** (valor - precio). Se guarda en un `Map` precio -> producto lo que ya se vio, y para cada producto se pregunta si su complemento ya apareció. Se pregunta **antes** de guardar, para que un producto no se combine consigo mismo.

- **Tiempo:** O(n): un solo recorrido del catálogo, con una consulta (`has`) y una inserción (`set`) de costo constante por producto.
- **Espacio:** O(n): el `Map` puede llegar a guardar todos los precios.

### Pruebas

| Entrada | Resultado | Por qué |
|---|---|---|
| 87.000 | Origen Huila 500 g + Origen Sierra 500 g | 42.000 + 45.000 |
| 61.000 | Origen Nariño 250 g + Taza de cerámica | 26.000 + 35.000 |
| 50.000 | `null` | Ningún par suma 50.000. |
| 52.000 | `null` | Solo 26.000 + 26.000 daría 52.000, y habría que usar dos veces el mismo producto. |
| 0 | `null` | Los precios son positivos. |
| Catálogo vacío | `null` | No hay productos. |
| Un solo producto | `null` | Se necesitan dos productos distintos. |
| Dos productos distintos de 40.000, valor 80.000 | Los dos productos | Dos productos con el mismo precio sí pueden formar el combo. |

La versión de fuerza bruta y la optimizada dieron el mismo resultado en todos los casos. Si hubiera varias combinaciones posibles, cada versión podría devolver un par distinto (se devuelve la primera que encuentra), y ambos serían válidos.

### Traza de `comboRegaloMap` con 87.000

| Paso | Producto | Precio | Complemento (87.000 - precio) | ¿Está en el Map? | Map antes de guardar |
|---|---|---|---|---|---|
| 1 | Origen Nariño 250 g | 26.000 | 61.000 | No | (vacío) |
| 2 | Origen Huila 500 g | 42.000 | 45.000 | No | 26.000 |
| 3 | Origen Sierra 500 g | 45.000 | 42.000 | **Sí** (Origen Huila 500 g) | 26.000, 42.000 |

En el paso 3 devuelve `[Origen Huila 500 g, Origen Sierra 500 g]`. Se detuvo con 3 de los 8 productos recorridos y sin probar ningún par.

## Producto estrella por ciudad: `productoEstrellaPorCiudad`

**Idea (conteo de frecuencias):** un `Map` externo ciudad -> `Map` interno producto -> veces. Un primer recorrido llena los conteos y después se elige el más frecuente de cada ciudad.

**Decisiones:**

- **"Más veces" = apariciones:** se cuentan los registros de venta en que aparece el producto, no las unidades vendidas.
- **Normalización de ciudad:** se usa `normalizarCiudad`, así `"medellín "` (id 5) cuenta como Medellín. Sin eso saldría una quinta ciudad.
- **Regla de desempate:** gana el producto que apareció primero en las ventas de esa ciudad. Se logra porque un `Map` conserva el orden de inserción y se reemplaza al mejor solo si el nuevo es estrictamente mayor (`>`).
- **Venta con cantidad 0 (id 8):** cuenta como una aparición, igual que en el MiniReto 9. Con los datos del Día 1 no cambia el resultado: en Cali hay un empate y gana el mismo producto aunque se excluyera.
- **Arreglo vacío:** devuelve `{}`.

**Resultado con los datos del Día 1:**

| Ciudad | Producto estrella | Veces | Observación |
|---|---|---|---|
| Medellín | Origen Huila 500 g | 2 | ids 1 y 4; Sierra y Prensa tienen 1 |
| Bogotá | Origen Nariño 250 g | 3 | ids 2, 6 y 12 |
| Cali | Prensa francesa | 1 | Empate de tres productos con 1; gana la primera en aparecer (id 3) |
| Pereira | Origen Huila 500 g | 1 | Un solo registro |

Comprobación del desempate: con las ventas `B, A, A, B` en una ciudad, el resultado es `B`. Con 5.000 ventas generadas devuelve exactamente 4 ciudades y el producto de cada una tiene el conteo máximo, verificado con un conteo independiente.

## Primer cliente único: `primerClienteUnico`

**Idea (dos recorridos y un Map):**

1. Primer recorrido: contar las compras de cada cliente en un `Map` (`comprasPorCliente`, del MiniReto 9).
2. Segundo recorrido, en el orden original de las ventas: devolver el primer cliente cuyo conteo es 1.

Por eso hace falta el segundo recorrido: el `Map` ya sabe cuántas compras hizo cada uno, pero el "primero" lo decide el orden de las ventas.

**Traza con los datos del Día 1:**

| Cliente | Compras | Cliente | Compras |
|---|---|---|---|
| C01 | 3 | C05 | 1 |
| C02 | 2 | C06 | 1 |
| C03 | 2 | C07 | 1 |
| C04 | 1 | C08 | 1 |

Segundo recorrido: id 1 (C01, 3), id 2 (C02, 2), id 3 (C03, 2), id 4 (C01, 3) y id 5 (C04, **1**). Devuelve **C04**. C05, C06, C07 y C08 también compraron una sola vez, pero aparecen después en las ventas.

**Casos borde:** arreglo vacío -> `null`; todos los clientes repetidos (`[A, A]`) -> `null`; un solo cliente (`[A]`) -> `A`; `[A, A, B, C, C]` -> `B`. Con 2.000 ventas generadas coincide con una solución de fuerza bruta.

## Clasificación de complejidad

n = tamaño de la entrada (productos del catálogo o ventas); c = clientes distintos; g = parejas (ciudad, producto) distintas, con g ≤ n.

| Función | Tiempo | Espacio | Justificación |
|---|---|---|---|
| `comboRegalo` (fuerza bruta) | O(n²) | O(1) | Ciclo doble sobre el catálogo: n(n-1)/2 pares. |
| `comboRegaloMap` | **O(n)** | O(n) | Un solo recorrido del catálogo; `has` y `set` en el `Map` cuestan lo mismo sin importar el tamaño del catálogo. |
| `productoEstrellaPorCiudad` | **O(n)** | O(g) | Un recorrido de las n ventas con consultas y actualizaciones de `Map` de costo constante, más un recorrido de las g entradas de los conteos (g ≤ n). En este negocio g ≤ 4 ciudades × 5 productos = 20, así que en la práctica la memoria es constante. |
| `primerClienteUnico` | **O(n)** | O(c) | Dos recorridos (2n pasos, que se simplifica a n); el `Map` guarda un conteo por cliente distinto (c ≤ n). |

Las tres funciones optimizadas son O(n): al multiplicar los datos por 10, el trabajo se multiplica por 10. Con 100.000 ventas, `productoEstrellaPorCiudad` y `primerClienteUnico` tardaron decenas de milisegundos (`console.time`), muy por debajo de un segundo.

**Intercambio tiempo/memoria:** `comboRegaloMap` pasa de O(n²) a O(n) gastando memoria O(n) en el `Map`. Es el mismo principio del MiniReto 9: se guarda lo ya visto para no volver a buscarlo.

## Conclusiones

- **Patrón del complemento:** en lugar de probar todos los pares, preguntar "¿ya vi el que me falta?" convierte un problema O(n²) en uno O(n).
- **Patrón de frecuencias:** un `Map` contador resuelve "el más frecuente" y "el que aparece una sola vez" en un solo recorrido.
- **Casos borde:** el desempate, el arreglo vacío y la ausencia de solución se definen y se prueban explícitamente.

---

# MiniReto 11: La mejor racha y el presupuesto exacto

## Mejor semana

**Problema:** dados los totales diarios (miles de pesos), encontrar los 7 días consecutivos con mayor total y el día en que empiezan.

### Fuerza bruta: `mejorSemanaBruta`

Para cada posición de inicio suma los k días del bloque **desde cero**.

- **Tiempo:** O((n - k + 1) · k) ≈ **O(n · k)**. Con k fijo y pequeño (7) parece lineal, pero si k crece el trabajo crece con él: con k = 1.000 hace unas mil sumas por cada posición.
- **Espacio:** O(1).

### Ventana deslizante: `mejorSemana`

Idea: dos bloques consecutivos comparten k - 1 días. Por eso no hace falta sumar todo otra vez: se suma la primera ventana y, al avanzar un día, se **suma el día que entra y se resta el que sale**.

- **Tiempo:** O(n): k sumas para la primera ventana y n - k desplazamientos de costo constante, en total n pasos.
- **Espacio:** O(1): solo guarda la suma actual y la mejor.

Devuelve `{ total, inicio }`, donde `inicio` es el índice del primer día (empieza en 0), así que el día de septiembre es `inicio + 1`. **Empate:** gana la primera semana que alcanzó el máximo (se reemplaza solo con `>` estricto).

### Las tres primeras posiciones de la ventana (septiembre, k = 7)

```
Días:   1    2    3    4    5    6    7    8    9   10 ...
Valor: 320  410  280  390  510  620  700  300  290  450 ...

Posición 1: [320  410  280  390  510  620  700]  300  290      total = 3.230
Posición 2:  320 [410  280  390  510  620  700  300]  290      total = 3.230 + 300 - 320 = 3.210
Posición 3:  320  410 [280  390  510  620  700  300  290]     total = 3.210 + 290 - 410 = 3.090
```

| Ventana | Entra | Sale | Total |
|---|---|---|---|
| Días 1 a 7 | (suma inicial) | | 3.230 |
| Días 2 a 8 | 300 (día 8) | 320 (día 1) | 3.210 |
| Días 3 a 9 | 290 (día 9) | 410 (día 2) | 3.090 |

### Resultado de septiembre

**La mejor semana va del día 24 al día 30 de septiembre, con un total de 3.670 (miles de pesos, es decir, $ 3.670.000).** Es la última semana del mes: 440 + 500 + 590 + 650 + 720 + 400 + 370 = 3.670. La versión de fuerza bruta devolvió el mismo resultado.

### Casos borde

| Caso | Resultado | Por qué |
|---|---|---|
| k mayor que el número de días | `null` | No cabe ninguna ventana. |
| k = 0 | `null` | No es una ventana válida. |
| Arreglo vacío | `null` | No hay días. |
| k = número de días | Una sola ventana (la suma de todos) | Es el único bloque posible. |
| Todos los días iguales | La primera semana (`inicio: 0`) | Desempate: gana la primera. |

### Comparación de las dos versiones

Con 100.000 días generados al azar, ambas devolvieron exactamente el mismo `{ total, inicio }` con k = 7, 100 y 1.000. Tiempos medidos con `console.time`:

| k | Fuerza bruta (ms) | Ventana deslizante (ms) | Veces más lenta la bruta |
|---|---|---|---|
| 7 | 1,403 | 0,501 | ≈ 2,8 |
| 100 | 6,926 | 0,222 | ≈ 31 |
| 1.000 | 66,22 | 0,224 | ≈ 296 |

Con k = 7 la bruta hizo unas 7 sumas por posición y tardó 1,4 ms frente a 0,5 ms de la ventana, una diferencia pequeña. A medida que k crece, el tiempo de la bruta crece con él (6,9 ms con k = 100 y 66,2 ms con k = 1.000, aproximadamente proporcional a k), mientras que el de la ventana se mantiene en torno a 0,2 a 0,5 ms sin importar k, porque siempre hace n pasos. Con k = 1.000 la ventana fue unas 300 veces más rápida. Esto es la diferencia entre O(n · k) y O(n).

Nota: los tiempos de tan pocos milisegundos tienen algo de ruido (por ejemplo, el calentamiento de Node en la primera medición), pero la tendencia es clara.

## Par más cercano al presupuesto

**Problema:** dos productos del catálogo cuya suma sea **la mayor posible sin superar** el presupuesto. Si ningún par cabe, `null`.

**Idea (dos punteros):** se ordenan los productos por precio, de menor a mayor, y se ponen un puntero `izq` en el más barato y un puntero `der` en el más caro. Con los precios ordenados, la suma de los dos extremos dice qué hacer:

- **Si la suma se pasa del presupuesto:** `der--`. Ese producto caro ya se pasa incluso acompañado del más barato que queda, así que no puede estar en ningún par válido con los productos restantes; se descarta.
- **Si la suma cabe:** se anota si mejora la mejor y `izq++`. Con este `izq`, `der` es el compañero más caro que cabe, así que ningún otro par que use este `izq` puede ser mejor; se prueba un producto más caro a la izquierda para subir la suma.
- **Si la suma es exactamente el presupuesto:** se devuelve de inmediato (no hay nada más cerca).

El ciclo termina cuando los punteros se cruzan (`izq < der` deja de cumplirse). El `sort` lleva comparador numérico (`a.precio - b.precio`), porque sin él JavaScript ordena como texto. Se ordena una **copia** (`[...catalogo]`) para no alterar el catálogo.

### Catálogo ordenado por precio

| Posición | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
|---|---|---|---|---|---|---|---|---|
| Producto | Filtros de papel | Nariño 250 g | Taza | Huila 500 g | Sierra 500 g | Huila 1 kg | Prensa francesa | Molino manual |
| Precio | 18.000 | 26.000 | 35.000 | 42.000 | 45.000 | 79.000 | 95.000 | 120.000 |

### Pruebas

| Presupuesto | Resultado | Explicación |
|---|---|---|
| 100.000 | Filtros de papel + Origen Huila 1 kg = **97.000** | Es la mayor suma que no pasa de 100.000. |
| 140.000 | Origen Sierra 500 g + Prensa francesa = **140.000** | Suma exacta. |
| 40.000 | `null` | El par más barato posible (18.000 + 26.000 = 44.000) ya supera 40.000: sin solución. |
| 44.000 | Filtros de papel + Origen Nariño 250 g = 44.000 | Justo el par más barato. |
| 43.999 | `null` | Un peso menos y ya no cabe ningún par. |
| Catálogo vacío / un solo producto | `null` | Se necesitan dos productos. |

Además se comparó con una solución de fuerza bruta (todos los pares) para presupuestos de 0 a 260.000, de mil en mil: siempre coincide y la suma **nunca supera el presupuesto**.

### Traza de los punteros con presupuesto 100.000

| Paso | izq | der | Suma | Decisión |
|---|---|---|---|---|
| 1 | 0 (18.000) | 7 (120.000) | 138.000 | Se pasa de 100.000 -> `der--` (el Molino no cabe con nadie) |
| 2 | 0 (18.000) | 6 (95.000) | 113.000 | Se pasa -> `der--` (la Prensa tampoco cabe ni con el más barato) |
| 3 | 0 (18.000) | 5 (79.000) | 97.000 | Cabe y es la mejor hasta ahora -> `izq++` |
| 4 | 1 (26.000) | 5 (79.000) | 105.000 | Se pasa -> `der--` (el Huila 1 kg ya no cabe con 26.000) |
| 5 | 1 (26.000) | 4 (45.000) | 71.000 | Cabe pero no mejora 97.000 -> `izq++` |
| 6 | 2 (35.000) | 4 (45.000) | 80.000 | Cabe, no mejora -> `izq++` |
| 7 | 3 (42.000) | 4 (45.000) | 87.000 | Cabe, no mejora -> `izq++` |

Después del paso 7, `izq` queda en 4 igual que `der`: los punteros se cruzan y termina. Resultado: **97.000**. Se hicieron 7 pasos con 8 productos, sin probar los 28 pares.

## Clasificación de complejidad

n = número de días o de productos; k = tamaño de la ventana.

| Función | Tiempo | Espacio | Justificación |
|---|---|---|---|
| `mejorSemanaBruta` | O(n · k) | O(1) | Ciclo doble: (n - k + 1) posiciones, y en cada una suma k días. |
| `mejorSemana` | **O(n)** | O(1) | k sumas iniciales más n - k desplazamientos de costo constante: n pasos, sin importar k. |
| `parMasCercano` | **O(n log n)** | O(n) | Ordenar cuesta O(n log n); el recorrido con dos punteros cuesta O(n), porque en cada paso un puntero se mueve y no retrocede (a lo sumo n pasos). Se simplifica al término dominante: O(n log n). La copia ordenada usa O(n) de memoria. |

**Sobre el ordenamiento:** el recorrido con dos punteros por sí solo es O(n), pero solo funciona si los datos están ordenados. Si el catálogo ya estuviera ordenado (y se mantuviera así), el costo baja a O(n). Como aquí se ordena en cada llamada, el costo total es O(n log n).

**Comparación con el MiniReto 10:** `comboRegaloMap` busca una suma **exacta** en O(n) usando un `Map` (sin ordenar). Para "la más cercana sin pasarse" el `Map` ya no alcanza, porque no sabe qué precios están cerca; por eso se ordena y se usan dos punteros.

## Conclusiones

- **Ventana deslizante:** cuando los bloques consecutivos comparten casi todos sus elementos, se actualiza la respuesta en lugar de recalcularla: O(n · k) pasa a O(n).
- **Dos punteros:** con los datos ordenados, cada comparación permite descartar un extremo, y no hace falta probar todos los pares (O(n²)).
- **Casos borde** (k mayor que los días, presupuesto insuficiente, arreglos vacíos) devuelven `null` y no fallan.

---

# MiniReto 12: Analítica Café Origen v1.0 (lanzamiento)

## Qué se hizo

- `src/reporte.js` se reescribió con las versiones optimizadas y se le agregaron cuatro secciones nuevas: clientes recurrentes, producto estrella por ciudad, combos de regalo, cliente para el cupón y mejor semana. Se puede ejecutar con los datos reales (`node src/reporte.js`) o con n ventas generadas (`node src/reporte.js 100000`), leyendo el argumento con `process.argv`.
- El cálculo se separó de la impresión (`calcularReporte`), para poder medir el reporte sin imprimir.
- `src/comparar-versiones.js` mide el tiempo total del reporte v0.1 y del v1.0 con 10.000 y 100.000 ventas. Los resultados están en `RENDIMIENTO.md`.
- Se actualizaron `RENDIMIENTO.md` (tabla de complejidades con todas las funciones nuevas, comparación y riesgos de la v1.0) y el `README.md` (documentación del producto).

## Decisiones

- **La comparación incluye tres filas:** la v0.1 como se entregó no tenía clientes recurrentes, así que para mostrar la mejora real se agregó una fila con la función original (O(n²)) dentro del reporte v0.1, que es lo que la gerente vivió.
- **Mejor semana con los datos reales:** el historial real solo cubre 6 días, no alcanza para una semana de 7. Con los datos reales se usan los totales de septiembre que entregó la gerente; con ventas generadas se calculan desde las ventas (`totalesPorDia`).
- **Día sin ventas:** se usa `2026-10-01`, porque con datos generados cualquier día de septiembre tendría ventas.
- **Limitación conocida:** `totalesPorDia` omite los días sin ventas; si faltara alguno, la semana podría abarcar fechas no consecutivas.

## Mapa de construcción del producto final

| MiniReto | Qué construí | Parte del producto final | Estrategia o evidencia clave |
|---|---|---|---|
| 1. Primer tueste | Repositorio, arreglo `ventas`, exploración y diccionario de datos | Base de datos del motor (`datos.js`) | Mirar los datos antes de calcular: se detectaron ciudad mal escrita, cantidad 0 y clientes repetidos. |
| 2. Los números del día | Indicadores con ciclos y manejo de vacíos | Indicadores básicos | Patrones contador, acumulador y máximo; trazas a mano contra el programa; decisión explícita para el arreglo vacío. |
| 3. Del ciclo al método | Versiones con `map`/`filter`/`reduce`, agrupaciones y ranking | Reportes por ciudad y producto | Cada método se verificó contra el ciclo que reemplaza (12 pares en `OK`). |
| 4. Analítica v0.1 | Reporte por consola y depuración | Primera versión entregable | Reproducir los errores reportados (grupos duplicados y `NaN`) con hipótesis y prueba antes de corregir. |
| 5. ¿Cuánto cuesta cada reporte? | Generador de datos y contador de operaciones | Herramientas de medición | Predecir antes de medir: lineales x10 al multiplicar n por 10, constante x1. |
| 6. El reporte que se volvió lento | Diagnóstico de clientes recurrentes O(n²) | Cuello de botella identificado | Traza con 5 ventas, fórmula n(n-1)/2 y tiempos que se cuadruplican al duplicar n. |
| 7. Tiempo, memoria y cadenas | Cadena de métodos frente a recorrido único; espacio de todas las funciones | Versión final de `totalCiudad` | Contar recorridos y arreglos nuevos: mismo O(n) en tiempo, distinto O(n) frente a O(1) en memoria. |
| 8. Analítica v0.2 | Informe de rendimiento | `RENDIMIENTO.md` | Clasificar cada función con evidencia, proyectar a 1.000.000 y priorizar riesgos. |
| 9. Clientes recurrentes en tiempo lineal | `Set` y `Map` en lugar de ciclos anidados | Reporte de recurrentes optimizado | Método de seis fases; "recordar lo ya visto" para no buscar de nuevo. |
| 10. Combos de regalo y frecuencias | Complementos y conteo de frecuencias con `Map` | Análisis comerciales nuevos | Patrón del complemento y patrón de frecuencias, con regla de desempate documentada. |
| 11. La mejor racha y el presupuesto | Ventana deslizante y dos punteros | Análisis temporal y de presupuesto | Actualizar la respuesta en lugar de recalcularla; descartar un extremo con datos ordenados. |
| 12. Analítica v1.0 | Reporte final, comparación y documentación | Producto final | Integrar, medir con datos reales y documentar para que otra persona lo ejecute sin ayuda. |

**Cómo se integran:** los retos 1 a 4 construyen la base funcional (datos, indicadores, agrupaciones y primer reporte). Los retos 5 a 8 no agregan funcionalidades sino evidencia: miden el motor, encuentran su punto débil y lo documentan. Los retos 9 a 11 usan esa evidencia para aplicar la estrategia adecuada a cada problema, y el 12 lo integra en un producto que se demuestra con datos reales y con números que prueban la mejora.

## Estrategia de resolución aplicada en cada optimización

| Problema | Qué trabajo se repetía o sobraba | Estrategia | Resultado medido |
|---|---|---|---|
| Clientes recurrentes (MiniReto 9) | Buscar a cada cliente entre todas las ventas, una y otra vez, y `includes` recorriendo el resultado | Recordar lo ya visto con `Set`/`Map` (consulta de costo constante) | De 53,9 s con 100.000 ventas a decenas de milisegundos: O(n²) pasa a O(n). |
| Total por ciudad con cadena (MiniReto 7) | Cuatro recorridos y tres arreglos nuevos (con n copias) | Un solo recorrido con un acumulador | Mismo O(n) en tiempo, pero la cadena fue entre 2,6 y 3,2 veces más lenta y usa memoria O(n) frente a O(1). |
| Combo de regalo (MiniReto 10) | Probar todos los pares del catálogo | Patrón del complemento: preguntar a un `Map` si ya apareció `valor - precio` | O(p²) pasa a O(p): 3 pasos en lugar de 28 pares. |
| Mejor semana (MiniReto 11) | Sumar de nuevo k días en cada posición | Ventana deslizante: sumar el día que entra y restar el que sale | O(d · k) pasa a O(d): con k = 1.000, de 66 ms a 0,2 ms. |
| Par más cercano (MiniReto 11) | Probar todos los pares | Ordenar y usar dos punteros desde los extremos, descartando uno en cada paso | O(p²) pasa a O(p log p), y el recorrido por sí solo es O(p). |

**Método común** (el de las seis fases del MiniReto 9): entender el problema, probar ejemplos y casos borde, escribir la solución de fuerza bruta y su complejidad, identificar qué trabajo se repite, implementar la versión optimizada y probar que da el mismo resultado que la original. Todas las optimizaciones se verificaron contra la versión sencilla antes de adoptarse.

## Conclusión de la semana

- Los errores de un reporte casi nunca están en la fórmula, sino en los datos y en cuánto trabajo hace el código cuando los datos crecen.
- Medir antes de optimizar permitió encontrar el único cuello de botella real (clientes recurrentes) y no tocar lo que ya era rápido.
- El patrón que se repite en todas las optimizaciones es el mismo: **guardar información para no volver a buscarla o recalcularla**, a cambio de algo de memoria.
- La v1.0 calcula las diez secciones del reporte con 100.000 ventas en 50,5 ms (0,16 s con todo el comando); la v0.1 con la función original de recurrentes tardaba unos 44 s con esa misma cantidad de datos. La mejora fue de 75,6 veces con 10.000 ventas y de 879,1 veces con 100.000 (ver `RENDIMIENTO.md`).