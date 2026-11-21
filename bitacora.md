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