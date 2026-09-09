# 🗺️ Reina Falsa — Roadmap de Etapas

Guía de evolución del proyecto. Cada etapa es independiente y se construye sobre la anterior.

---

## ✅ Etapa 0 — Prototipo Mecánico (ACTUAL)
> **Estado:** COMPLETO — en fase de playtesting

**Entrega:** Juego modular en `game/`, listo para abrir con servidor local o subir a host.
**Logro:** Validar que la mecánica sea divertida y balanceada.
**Incluye:**
- Lógica completa del Salado (atributos, conquistas, Puntos Gay ocultos)
- IA de la Reina (sabotajes, stalkeo, gaslighting, cauto con PG)
- 3 victorias del Salado / 3 derrotas
- Evento hombre gay
- Panel DEBUG (tecla D) para testear mecánicas ocultas
- Guardado local en el navegador (localStorage)

**Estructura modular del código:**
```
game/
  index.html          → estructura HTML (pantallas, botones)
  css/style.css       → estilos (terminal retro)
  data/data.json      → TODOS los datos de contenido (candidatos, lugares, diálogos, mensajes)
  js/data.js          → cargador del JSON (fetch a data/data.json)
  js/game.js          → lógica: estado, IA de la Reina, victorias/derrotas (el "cerebro")
  js/ui.js            → renderizado: feed, pantallas, citas, debug (cómo se muestra)
```

**Cómo correrlo:** necesita servidor local (los datos se cargan con fetch):
```
python -m http.server 8090   # en la carpeta game/
# abrir http://localhost:8090
```

**Criterio de salida:** alguien juega 5+ partidas y las mecánicas se sienten justas y divertidas (o se ajustan).

---

## 🔒 Etapa 1 — Cuentas, Login y Persistencia Real
> **Estado:** PLANIFICADO — siguiente etapa grande

**Título:** "Cuentas y Nube"
**Problema que resuelve:** hoy los datos viven solo en el navegador del jugador (se pierden si cambia de equipo/borra cache).

**Incluye:**
- Creación de cuenta (email/usuario + contraseña)
- Login / logout
- Guardado de partidas en servidor (no localStorage)
- Recuperar partida desde cualquier dispositivo
- Múltiples partidas por usuario (ranuras de guardado)

**Decisiones técnicas a tomar:**
- ¿Backend propio (Node/Express, Django) o Backend-as-a-Service (Supabase, Firebase)?
- ¿Base de datos (Postgres, SQLite, MongoDB)?
- ¿Autenticación con JWT / sesiones / OAuth?

---

## 🌐 Etapa 2 — Multiplayer en Tiempo Real
> **Estado:** PLANIFICADO

**Título:** "La Reina de Carne y Hueso"
**Problema que resuelve:** jugar contra otra persona real (hotseat hoy, online después).

**Incluye:**
- Partidas 2 jugadores online (un Salado y una Reina humanos)
- Matchmaking anónimo (sin revelar identidad real)
- WebSockets para sincronización en vivo
- Temporizador de turnos (30-45s)
- Emotes contextuales (sin toxicidad directa)

**Nota:** En esta etapa la Reina IA de la Etapa 0 se convierte en un "modo práctica / off-line".

---

## 🎨 Etapa 3 — Arte, Sonido y Estilo Visual
> **Estado:** PLANIFICADO

**Título:** "El Look Final"
**Problema que resuelve:** pasar del prototipo terminal retro a una experiencia visual atractiva.

**Incluye:**
- Elección del estilo final (pixel art, ilustraciones, visual novel, top-down RPG, etc.)
- Sprites/ilustraciones de candidatos, lugares y la Reina
- Animaciones (efectos de carta, transiciones, celebración de victoria)
- Música y efectos de sonido
- Estilo responsive para móvil/tablet

---

## 🏆 Etapa 4 — Progresión y Recompensas
> **Estado:** PLANIFICADO

**Título:** "Seguir Jugando"
**Problema que resuelve:** retención a largo plazo (por qué volver a jugar).

**Incluye:**
- Desbloqueables cosméticos (diseños de cartas, marcos de perfil, avatares)
- Stats de carrera (partidas ganadas, K/D kármico, rachas)
- Logros / trofeos
- Ranking (si hay multiplayer)
- Animación especial al invocar victoria kármica

---

## 📱 Etapa 5 — Distribución y Escala
> **Estado:** PLANIFICADO

**Título:** "Salir al Mundo"
**Problema que resuelve:** llegar a más jugadores y escalar técnicamente.

**Incluye:**
- Deploy a host definitivo (Netlify/Vercel/front + backend en la nube)
- Dominio propio
- Analítica (qué decisiones eligen más, dónde abandonan)
- Anti-trampas (si hay ranking)
- Modo PWA (instalable en el teléfono como app)

---

## 📊 Resumen Visual de Etapas

```
Etapa 0: Prototipo Mecánico      ████████░░ COMPLETO (jugando ahora)
Etapa 1: Cuentas y Nube          ░░░░░░░░░░ PLANIFICADO (siguiente)
Etapa 2: Multiplayer Online      ░░░░░░░░░░ PLANIFICADO
Etapa 3: Arte, Sonido y Look     ░░░░░░░░░░ PLANIFICADO
Etapa 4: Progresión y Premios    ░░░░░░░░░░ PLANIFICADO
Etapa 5: Distribución y Escala   ░░░░░░░░░░ PLANIFICADO
```

---

## 🧭 Orden recomendado

1. **Etapa 0** (playtesting) → ajustar balance
2. **Etapa 1** (cuentas) → sin esto no hay progresión ni multiplayer
3. **Etapa 2** (multiplayer) → el juego es 1v1 por diseño
4. **Etapa 3** (arte) → ya con usuarios se justifica invertir en look
5. **Etapa 4** (progresión) → retención cuando hay base de jugadores
6. **Etapa 5** (escala) → pulido final

> ⚠️ Nota: Las etapas 3 y 4 pueden intercambiarse según prioridad comercial (arte antes que retención si el juego "se ve pobre").