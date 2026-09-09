# 🎭 Reina Falsa: La Trampa Kármica de los Exmaridos
**Documento de Diseño de Juego (GDD) - Versión Consolidada**

---

## 📖 Concepto General
**Reina Falsa** es un juego de cartas y estrategia psicológica de roles asimétricos para 2 jugadores. La premisa narra una guerra fría entre dos exmaridos obsesionados con el control y el acecho mutuo (*stalkeo*). 

El núcleo del diseño es una **paradoja kármica**: La Reina tiene un enorme poder inicial para bloquear y destruir la vida amorosa del Salado. Sin embargo, el abuso tóxico de este poder recarga el recurso secreto del Salado (**Puntos Gay**), lo que termina desbloqueando la *Ruta del Rey*, la única condición de derrota que destronará a la Reina para siempre.

---

## 👥 Roles y Condiciones de Victoria

### 👑 La Reina (El Exmarido Acechador)
* **Estilo de juego:** Control agresivo, sabotaje directo y gestión del riesgo.
* **Mundo Inicial:** Domina la mesa, pero debe evitar darle Puntos Gay al Salado.
* **Condiciones de Victoria:**
  1. **Victoria Directa:** Acumular **3 Puntos de Conquista** en su área mediante pretendientes hombres (♂️).
  2. **Victoria por Asfixia (Táctica):** Dejar al Salado en 0 Puntos de Conquista y sin cartas en mano al agotarse el mazo central, sin que este haya alcanzado los 5 Puntos Gay.

### 💔 El Salado (El Exmarido Bloqueado)
* **Estilo de juego:** Defensa, colocar trampas de paranoia y provocación kármica.
* **Mundo Inicial:** Inicia con la "Ruta del Novio" bloqueada (solo puede pretender mujeres ♀️).
* **Condiciones de Victoria:**
  1. **Ruta Hetero (Estándar):** Acumular **3 Puntos de Conquista** en su área con pretendientes mujeres (♀️).
  2. **Ruta del Rey (Giro Kármico):** Acumular **5 Puntos Gay** en su Marcador de Karma y jugar la carta *El Rey Prometido* para coronarse como la Verdadera Reina al instante.

---

## ⚙️ Mecánicas Principales

1. **Marcador de Conquista:** Espacio en mesa donde los jugadores bajan pretendientes para sumar puntos hacia la victoria.
2. **Marcador de Karma (Puntos Gay):** Marcador exclusivo del Salado. No puede obtener estos puntos por iniciativa propia; solo se generan cuando la Reina abusa de su poder (sabotajes directos) o cae en las trampas del Salado.
3. **Puntos de Acción (PA):** En cada turno, el jugador activo dispone de **2 PA** para realizar sus jugadas.

---

## ⏱️ Estructura del Turno (Modo Duelo 2 Jugadores)

Cada turno dura entre 30 y 45 segundos y se divide en 3 fases:

1. **Fase de Robo:** Robar 2 cartas del mazo central.
2. **Fase de Acción (Gastas 2 PA):**
   * **Bajar Pretendiente (1 PA):** Coloca un pretendiente en tu Zona de Conquista.
   * **Jugar Sabotaje / Espionaje (1 PA):** Ejecuta el efecto de una carta de tu mano.
   * **Colocar Trampa (1 PA - Salado):** Juega una *Cita Señuelo* boca abajo en tu área.
   * **Descartar y Robar (1 PA):** Descarta 1 carta para robar 1 nueva del mazo.
3. **Fase de Reacción (Fuera de Turno):** El rival puede responder a tus acciones con cartas de *Defensa* o *Sabotaje Directo* desde su mano.

---

## 🃏 Mazo Base Consolidado (60 Cartas)

### 💘 Pretendientes (20 Cartas)
* **Mujer Estándar (8x):** Pretendiente ♀. Otorga **+1 Pt de Conquista** al Salado. Muy susceptible a sabotajes.
* **Mujer Ideal (4x):** Pretendiente ♀. Otorga **+2 Pts de Conquista** al Salado. Si la Reina la destruye con un *Bloqueo Directo*, el Salado recibe **+2 Puntos Gay** por devastación emocional.
* **Galán Estándar (6x):** Pretendiente ♂. Otorga **+1 Pt de Conquista** a la Reina (o al Salado si ya desbloqueó la Ruta del Rey).
* **Hombre Cotizado (2x):** Pretendiente ♂. Requiere descartar 1 carta adicional de la mano para jugarlo. Otorga **+2 Pts de Conquista** a la Reina.

### 👑 Cartas de la Reina (16 Cartas)
* **Bloqueo Directo (6x) - Sabotaje:** Destruye a 1 pretendiente mujer del Salado en mesa. **Efecto Kármico:** Otorgas **+1 Punto Gay** al Salado.
* **Chivo Expiatorio (4x) - Sabotaje Limpio:** Destruye a 1 pretendiente mujer del Salado usando un perfil falso. **Efecto Kármico:** La cita se arruina, pero el Salado **NO** gana Puntos Gay.
* **Gaslighting en Redes (3x) - Control:** Congela el Marcador de Karma. El Salado no podrá ganar Puntos Gay por ninguna razón durante este turno ni el siguiente.
* **Cuenta Falsa de IG (3x) - Espionaje:** Obliga al Salado a mostrarte 2 cartas al azar de su mano. Si tiene defensas, puedes elegir descartarle una.
* **Visto en Visto (4x) - Defensa:** Cancela inmediatamente cualquier carta de Espionaje o Trampa jugada por el Salado.

### 💔 Cartas del Salado y Compartidas (24 Cartas)
* **Cita Señuelo (5x) - Trampa Oculta:** Se juega boca abajo. Si la Reina la destruye con un *Bloqueo Directo*, se revela vacía, la carta se descarta en vano y la paranoia de la Reina le otorga **+1 Punto Gay** automático al Salado.
* **"Solo Somos Amigos" (6x) - Defensa:** Cancela cualquier *Bloqueo Directo* o *Chivo Expiatorio* de la Reina, protegiendo a tu pretendiente.
* **Amigo Chismoso (3x) - Espionaje:** Mira la mano de la Reina. Si tiene cartas de *Bloqueo Directo*, descártale una.
* **Stalkeo Nocturno (4x) - Espionaje Compartido:** Mira las primeras 3 cartas del mazo central. Puedes reordenarlas a tu gusto o descartar una de ellas.
* **👑 El Rey Prometido (2x) - Victoria Kármica ♂:** Requiere **5 Puntos Gay** en el Marcador de Karma. Otorga **+3 Pts de Conquista** instantáneos para coronar al Salado como la *Verdadera Reina*.

---

## 🌐 Adaptación para Videojuego Online

* **Matchmaking Anónimo:** Partidas rápidas 1v1 sin revelar la identidad real del oponente para maximizar la tensión psicológica.
* **Fases Rápidas con Temporizador:** Límite de 30 a 45 segundos por turno para partidas ágiles de 10 a 12 minutos.
* **Emotes Contextuales:** Comunicación reducida a frases y reacciones breves (*"¿En serio me vas a bloquear?"*, *"Te estoy viendo"*, *"Karma is a bitch"*) para mantener el faroleo sin dar lugar a toxicidad directa.
* **Progreso y Recompensas:** Desbloqueo de cosméticos (diseños de cartas, marcos de perfil, avatares y animaciones especiales al invocar a *El Rey Prometido*).