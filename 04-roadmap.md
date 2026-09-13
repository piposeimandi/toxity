# 🗺️ Toxity (Reina Falsa) — Roadmap

Guía de evolución del proyecto. Cada etapa se construye sobre la anterior.
Última actualización: 2026-09-13.

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

## ✅ Etapa 0.5 — Teléfono como centro (COMPLETADA)

- [x] App de Citas sale del mapa → vive dentro del teléfono (pestaña App)
- [x] Mapa con 9 lugares físicos + selector desde la app
- [x] warnings de infidelidad en feed, contactos, y picker de invitaciones

---

## ✅ Etapa 0.6 — Arte y Sonido (COMPLETADA)

- [x] Tema visual púrpura/rosa vibrante (CSS variables)
- [x] Retrato SVG de la Reina (queenPortrait)
- [x] Reina integrada en resumen semanal, mensajes, y game over

---

## ✅ Etapa 1 — RPG Rewrite (COMPLETADA)

Reescritura completa del juego usando **Phaser 3 + Vite + TypeScript**.

**Stack:**
- Phaser 3.85 — motor de juego 2D
- Vite 6 — bundler y dev server
- TypeScript 5 — type safety

**Escenas (10):**
- Boot → Preload → Menu → World ⇄ Phone
- World → Location → Date
- WeekEnd → GameOver
- HUD (overlay paralelo)

**Estética visual:**
- Menú/Mapa: "That's Not My Neighbor" — escritorio retro, papeles, sticky notes
- Citas: Tinder — swipe cards con foto, like/nope
- Teléfono: Smartphone moderno con pestañas
- Resumen semanal: Papeles apilados en escritorio

**Cómo correrlo:**
```bash
./run.sh
# o
npm install && npm run dev
```
Abrir http://localhost:5173/

---

## 🔨 En curso

- [ ] Probar el juego completo y reportar bugs
- [ ] Keyboard navigation (flechas/WASD)
- [ ] Arte real: reemplazar placeholders con pixel art

---

## 💡 Ideas en backlog

- [ ] **Balance fino**: la subida a 70 lleva varias semanas — vigilar si se siente lento o justo
- [ ] **Economía**: +$80/sem alcanza para ~2 citas caras; vigilar si el jugador activo se funde
- [ ] **Reina más expresiva**: que sus sabotajes se sientan personales (mensajes con nombre, escenas)
- [ ] **Más lugares con identidad**: cada lugar con evento propio
- [ ] **Finales narrativos**: textos de victoria/derrota más largos, epílogo según con quién formaste familia
- [ ] **Sonido**: efectos de audio para acciones, música ambiental

---

## 🔒 Etapa 2 — Cuentas y Nube (PLANIFICADO)

Sin esto no hay progresión ni multiplayer. Incluye: registro/login, saves en servidor, múltiples ranuras. Decidir: backend propio vs Supabase/Firebase.

## 🌐 Etapa 3 — Multiplayer (PLANIFICADO)

"La Reina de Carne y Hueso": 1v1 online (Salado vs Reina humanos), matchmaking anónimo, WebSockets, timer de turnos. La Reina IA queda como modo práctica.

## 🏆 Etapa 4 — Progresión (PLANIFICADO)

Desbloqueables, stats de carrera, logros, ranking, animación de victoria kármica.

## 📱 Etapa 5 — Distribución (PLANIFICADO)

Host definitivo, dominio propio, analítica, anti-trampas, PWA instalable.

---

## 📊 Resumen

```
Etapa 0: Prototipo Mecánico      ██████████ COMPLETO (jugable, en Pages)
Etapa 0.5: Teléfono centro       ██████████ COMPLETO
Etapa 0.6: Arte y Sonido         ██████████ COMPLETO
Etapa 1: RPG Rewrite             ██████████ COMPLETO (Phaser + Vite + TS)
En curso: Testing + Polish       ████░░░░░░ EN PROGRESO
Etapa 2: Cuentas y Nube          ░░░░░░░░░░ PLANIFICADO
Etapa 3: Multiplayer Online      ░░░░░░░░░░ PLANIFICADO
Etapa 4: Progresión y Premios    ░░░░░░░░░░ PLANIFICADO
Etapa 5: Distribución y Escala   ░░░░░░░░░░ PLANIFICADO
```
