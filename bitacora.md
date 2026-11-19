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
| 1 | **Ciudad con mayúsculas inconsistentes**: `"medellín"` en minúscula frente a `"Medellín"`. Un conteo por ciudad la trataría como una ciudad distinta. | id 5 | Normalizar las ciudades antes de agrupar (capitalizar la primera letra, o comparar en minúsculas). No se modifica el dato original en `datos.js`, la limpieza se hace al analizar. |
| 2 | **Cantidad igual a 0**: una venta sin unidades no genera ingreso y distorsiona conteos y promedios. | id 8 | Excluirla de los cálculos de ingresos y unidades. Se conserva en los datos y se registra como posible venta cancelada o error de captura, pendiente de confirmar con el negocio. |
| 3 | **Clientes repetidos**: C01 aparece 3 veces, C02 y C03 aparecen 2 veces. El número de registros (12) no es el número de clientes (8). | ids 1, 4, 11 (C01); 2, 7 (C02); 3, 9 (C03) | Para contar clientes, usar valores únicos y no `ventas.length`. Los registros repetidos no se eliminan: son compras reales distintas. |
| 4 | **`precio` es unitario**: sumar `precio` directamente daría un ingreso incorrecto. | Todos | Calcular el ingreso siempre como `cantidad * precio`. |
| 5 | **Mezcla de tipos de producto**: cafés (250 g y 500 g) se venden junto a accesorios (prensa, molino). Comparar unidades entre ellos no es equivalente. | Varios | Mantenerlos juntos por ahora; en el análisis, considerar separar categorías si hace falta. |
| 6 | **`fecha` es texto**, no un objeto `Date`. | Todos | El formato `AAAA-MM-DD` permite ordenar alfabéticamente. Convertir a `Date` solo si se necesitan cálculos de fechas. |