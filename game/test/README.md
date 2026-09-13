# Verificaciones de datos y balance

Desde la raíz del repositorio, ejecutá:

```bash
node game/test/balance-check.js
```

No instala paquetes ni abre el navegador. Comprueba que los perfiles tengan
IDs globalmente únicos (los nombres pueden repetirse), que el mapa y sus
riesgos/costos sean válidos, y ejecuta 2.000 simulaciones deterministas de la
ruta segura para detectar regresiones graves de alcanzabilidad.

El simulador reproduce las reglas semanales documentadas en `game.js`; no es
un test de la interfaz. Si se cambian reglas de salud o sabotaje, actualizá el
modelo y sus umbrales junto con la lógica del juego.
