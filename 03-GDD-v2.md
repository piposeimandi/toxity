# 🎭 Reina Falsa v2 — GDD Consolidado

## 📖 Concepto General

**Reina Falsa** es un simulador de vida/relaciones tipo rol con estado de ánimo. El jugador controla a **El Salado**, un exmarido que intenta reconstruir su vida amorosa después de una relación tóxica. Su ex, **La Reina**, es una IA que intenta sabotear sus citas y mantenerlo solo.

**Tono:** Drama + comedia oscura. Las situaciones son ridículas pero se sienten reales.

---

## 🎮 Formato del Juego

| Aspecto | Decisión |
|---|---|
| **Formato** | Simulador de vida/relaciones con estado de ánimo |
| **Plataforma** | Phaser.js (framework de juegos web) |
| **Estilo visual** | Terminal retro (CMD / typewriter) |
| **Mundo** | Feed tipo timeline con eventos + mapa de 4 lugares |
| **Campaña** | Semanas con guardado manual |
| **Duración** | Largo tipo campaña |

---

## 👥 Personajes

### 💔 El Salado (Jugador)
El exmarido bloqueado que intenta rehacer su vida.

**Atributos (5):**
| Atributo | Función |
|---|---|
| **Labia** | Habilidad para conversar y convencer |
| **Apariencia** | Atractivo físico inicial |
| **Confianza** | Afecta probabilidades de éxito |
| **Estado de Ánimo** | Afecta opciones disponibles y probabilidades |
| **Dinero** | Recurso para pagar citas/lugares |

### 👑 La Reina (IA)
La exmarida acechadora que sabotea y controla.

**Comportamiento:**
- Sabe cuántos Puntos Gay tiene el Salado
- Evita llegar al límite de 7 (juega cauto cuando va alta)
- Intenta conseguir novio antes que el Salado
- Sabotea, bloquea y stalkea al Salado

---

## 🏆 Condiciones de Victoria

### El Salado gana si:
1. **Victoria por conquista:** Acumula 3 puntos de conquista (con mujeres u hombres)
2. **Victoria por Puntos Gay oculto:** Llega a 7 Puntos Gay → victoria sorpresa automática

### La Reina gana si:
1. **Se corona:** Consigue novio antes que el Salado
2. **Aislamiento total:** El Salado se deprime y abandona la vida social
3. **Asfixia:** La Reina bloquea todo por varias semanas sin que el Salado avance

---

## ⚙️ Mecánicas Principales

### 📊 Puntos Gay (Oculto)
- **Solo los ve la Reina** (el jugador no sabe que existen)
- Se ganan cuando la Reina abusa de su poder:
  - Sabotear citas con mujeres
  - Bloquear constantemente
  - Stalkear al Salado
- **Límite:** 7 puntos → victoria sorpresa automática del Salado

### 🚫 Evento "Hombre Gay"
- **Cuándo aparece:** Cuando la Reina se dedica solo a molestar y el Salado empieza a salir con hombres para estar más tranquilo
- **Riesgo:** Si el Salado no sale con mujeres seguido, pueden aparecer hombres gay
- **Consecuencia:** Pierde la cita + puntos de acción gastados
- **Feedback:** Aviso enigmático (el jugador ve algo ambiguo)

### 📍 Mapa y Lugares (4 lugares básicos)
| Lugar | Perfil de citas | Riesgo de sabotaje |
|---|---|---|
| **Café** | Citas relajadas, más probabilidades de mujeres | Medio |
| **Bar** | Citas nocturnas, más movimiento, más dinero necesario | Alto |
| **Gimnasio** | Citas de actividad física, más apariencia | Bajo |
| **App de Citas** | Digital, más opciones pero más exposición | Muy alto |

### 📱 Feed Tipo Timeline
- Las oportunidades aparecen como eventos en un feed
- Estilo Instagram: podés scrollear y ver eventos disponibles
- Elegís cuáles tomar o ignorar
- Ignorar = avance de la Reina + depresión del Salado

---

## ⏱️ Estructura Temporal

### Campaña por Semanas
- Cada semana tiene eventos/días
- Las oportunidades aparecen orgánicamente (como la vida real)
- No hay número fijo de acciones por semana
- Guardado manual al final de cada semana

### Flujo de un "Día"
1. **Feed:** Aparecen eventos/disponibles en el timeline
2. **Elegir:** Ir a un lugar, ignorar, o hacer otra cosa
3. **Resolver:** Si vas a un lugar, aparecen candidatos
4. **Decidir:** Interactuar o no con cada candidato
5. **Consecuencias:** Éxito/fracaso + posibles sabotajes de la Reina

---

## 🤖 Comportamiento de la IA (La Reina)

### Estrategia
- **Sabe** cuántos Puntos Gay tiene el Salado
- **Evita** llegar al límite de 7
- **Juega cauto** cuando va alta en ellos
- **Prioridades:**
  1. Conseguir novio antes que el Salado
  2. Bloquear citas con mujeres sin pasarse de 7 Puntos Gay
  3. Stalkear al Salado para descubrir sus planes

### Acciones de la IA
| Acción | Efecto | Puntos Gay |
|---|---|---|
| **Sabotaje directo** | Destruye una cita con mujer | +1 PG |
| **Bloqueo constante** | Impide que el Salado salga | +1 PG por semana |
| **Stalkeo** | Descubre planes del Salado | +1 PG si es descubierta |
| **Gaslighting** | Confunde al Salado sobre sus opciones | +1 PG |

---

## 🎭 Tono y Narrativa

### Drama + Comedia Oscura
- Las situaciones son ridículas pero se sienten reales
- El sabotaje de la Reina es tóxico pero cómico
- Los candidatos tienen personalidades exageradas
- Los avisos enigmáticos dan tensión sin ser directos

### Ejemplos de Situaciones
- **Café:** "Una chica te sonríe. Pero tu ex está en la mesa de al lado mirándote fijamente."
- **App de Citas:** "Le diste like a alguien. Tu ex te escribió: '¿Ya estás en Tinder? Qué triste.'"
- **Gimnasio:** "Una chica te pide ayuda con una máquina. Tu ex aparece y se pone a hacer sentadillas junto a vos, mirándote por el espejo."

---

## 🛠️ Tecnología

- **Framework:** Phaser.js
- **Estilo visual:** Terminal retro (CMD / typewriter)
- **Plataforma:** Web (se sube a host estático)
- **Desarrollo:** Mecánica primero, arte después

---

## 📋 Resumen de Decisiones

| Aspecto | Decisión |
|---|---|
| Formato | Simulador de vida/relaciones con estado de ánimo |
| Tecnología | Phaser.js |
| Estilo visual | Terminal retro (CMD / typewriter) |
| Mundo | Feed tipo timeline + mapa de 4 lugares |
| Campaña | Semanas con guardado manual |
| Atributos | Labia, Apariencia, Confianza, Ánimo, Dinero |
| Victoria Salado | 3 conquistas O 7 Puntos Gay oculto |
| Victoria Reina | Se corona primero / aislamiento / asfixia |
| Tono | Drama + comedia oscura |
| Desarrollo | Mecánica primero, arte después |
