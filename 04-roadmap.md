# 🗺️ Toxity (Reina Falsa) — Roadmap

Guía de evolución del proyecto. Cada etapa se construye sobre la anterior.
Última actualización: 2026-09-11.

---

## ✅ Etapa 0 — Prototipo Mecánico (COMPLETADA)

Juego modular en `game/` (HTML+CSS+JSON+JS planos), publicado en GitHub Pages: https://piposeimandi.github.io/toxity/game/

**Sistemas implementados:**
- Victoria por **familia** (profundizar con UNA persona, no acumular conquistas)
- **Puntos de salud** de relación (empieza en 5/100; +10 cita exitosa, −3 fallo; ≥40 novios, ≥70 familia)
- **Infidelidad**: salir con otra con salud ≥40 → 40% de que se entere (−15 o te deja)
- **Reina con trade-off**: 60% avanza lo suyo / 40% te sabotea (y esa semana no avanza)
- Victorias V1 (familia) / V2 (7 PG sorpresa kármica) · Derrotas D1 (ella familia) / D2 (salud 0, aislamiento) / D3 (8 semanas sin progreso)
- **Flujo de citas v2**: App puerta de entrada (4 perfiles), casuales 15% solo bar/café/parque, contacto tras concretar cita, **ella te escribe y propone plan** (aceptar/rechazar)
- **Teléfono simulado**: pestañas Contactos (invitar) / Mensajes (invites + historial) / App (matches)
- Gym refugio total (safe, sin sabotaje) con cooldown anti-farm · PG ocultos · debug tecla D · save localStorage con migración
- Caras randomuser + iconos emoji + contraste legible + footer que no tapa contenido

**Estructura del código:**
```
game/
  index.html          → pantallas, botones (Nueva Partida, Mapa, Teléfono, Pasar el día)
  css/style.css       → terminal retro (fondo negro, texto claro, acentos)
  data/data.json      → TODO el contenido (candidatos, lugares, textos, umbrales, iconos)
  js/data.js          → cargador del JSON
  js/game.js          → lógica: estado, Reina, victorias/derrotas (el "cerebro")
  js/ui.js            → render: feed, mapa, teléfono, citas, debug
```

**Cómo correrlo:** `python -m http.server 8090` en `game/` → http://localhost:8090

---

## 🔨 En curso — El teléfono como centro

- [ ] **App de Citas sale del mapa** → vive solo dentro del teléfono (pestaña App). El mapa queda con 9 lugares físicos.
- [ ] Revisar textos que mencionen "ir a la app desde el mapa".
- [ ] Playtesting del flujo completo: app → cita → contacto → invitar desde teléfono → mensaje de ella.

---

## 💡 Ideas en backlog (del diseñador, sin implementar)

- [ ] **Balance fino**: la subida a 70 lleva varias semanas — vigilar si se siente lento o justo; gym-solo vs D3 (nerfear si se farmea).
- [ ] **Economía**: +$80/sem alcanza para ~2 citas caras; vigilar si el jugador activo se funde.
- [ ] **Gate de ánimo**: éxito +10 siempre (+15 con ánimo alto); vigilar que no sea ni trivial ni imposible.
- [ ] **Reina más expresiva**: que sus sabotajes se sientan personales (mensajes con nombre, escenas).
- [ ] **Más lugares con identidad**: cada lugar con evento propio (hoy solo gym y app tienen mecánica única).
- [ ] **Finales narrativos**: textos de victoria/derrota más largos, epílogo según con quién formaste familia.
- [ ] **Fotos propias**: reemplazar randomuser por arte generado cuando haya estilo definido (Etapa 3).

---

## 🔒 Etapa 1 — Cuentas y Nube (PLANIFICADO)

Sin esto no hay progresión ni multiplayer. Incluye: registro/login, saves en servidor, múltiples ranuras. Decidir: backend propio vs Supabase/Firebase.

## 🌐 Etapa 2 — Multiplayer (PLANIFICADO)

"La Reina de Carne y Hueso": 1v1 online (Salado vs Reina humanos), matchmaking anónimo, WebSockets, timer de turnos. La Reina IA queda como modo práctica.

## 🎨 Etapa 3 — Arte y Sonido (PLANIFICADO)

Estilo final (pixel art, visual novel, etc.), sprites de candidatos/lugares/Reina, animaciones, música. Acá se reemplazan las fotos randomuser.

## 🏆 Etapa 4 — Progresión (PLANIFICADO)

Desbloqueables, stats de carrera, logros, ranking, animación de victoria kármica.

## 📱 Etapa 5 — Distribución (PLANIFICADO)

Host definitivo, dominio propio, analítica, anti-trampas, PWA instalable.

---

## 📊 Resumen

```
Etapa 0: Prototipo Mecánico      ████████░░ COMPLETO (jugable, en Pages)
En curso: Teléfono como centro   ██████░░░░ (falta: app sale del mapa)
Ideas backlog                    ░░░░░░░░░░ (7 ideas del diseñador)
Etapa 1: Cuentas y Nube          ░░░░░░░░░░ PLANIFICADO (siguiente grande)
Etapa 2: Multiplayer Online      ░░░░░░░░░░ PLANIFICADO
Etapa 3: Arte, Sonido y Look     ░░░░░░░░░░ PLANIFICADO
Etapa 4: Progresión y Premios    ░░░░░░░░░░ PLANIFICADO
Etapa 5: Distribución y Escala   ░░░░░░░░░░ PLANIFICADO
```
