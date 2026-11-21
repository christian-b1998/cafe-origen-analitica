# Café Origen: Analítica de ventas

Proyecto de análisis del historial de ventas de Café Origen con JavaScript y Node.js.

## Estructura

- `src/datos.js`: arreglo `ventas` con 12 registros (sin limpiar).
- `src/explorar.js`: script de exploración de los datos.
- `src/analitica.js`: indicadores con ciclos (MiniReto 2), versiones con métodos de arreglo, agrupaciones y ranking (MiniReto 3).
- `bitacora.md`: diccionario de datos y casos borde detectados.
- `src/probar.js`: pruebas de los indicadores con ciclos (MiniReto 2).
- `src/verificar.js`: compara cada versión con ciclo contra su versión con métodos (MiniReto 3).
- `src/probar-agrupaciones.js`: pruebas de agrupaciones y ranking (MiniReto 3).

## Cómo ejecutar

    node src/explorar.js
    node src/probar.js
    node src/verificar.js
    node src/probar-agrupaciones.js

## Requisitos

- Node.js (versión LTS)
- Git