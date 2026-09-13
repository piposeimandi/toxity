# 🎮 Toxity — La Trampa Kármica de los Exmaridos

Un dating sim / RPG donde sobrevivís al sabotaje de tu ex (La Reina) mientras intentás formar una nueva relación.

## Cómo correr

### Requisitos
- **Node.js >= 18** — [nodejs.org](https://nodejs.org/)

### Instalación y ejecución

```bash
# Clonar el repo
git clone <url-del-repo>
cd toxity

# Ejecutar el script (instala dependencias + inicia servidor)
./run.sh
```

Abrí **http://localhost:5173/** en tu navegador.

### Sin el script

```bash
npm install
npm run dev
```

## El juego

### Premisa
Después de una relación tóxica con La Reina, tenés que intentarlo de nuevo. Pero ella no te va a dejar en paz.

### Mecánicas

| Sistema | Descripción |
|---------|-------------|
| **Mapa** | Elegí dónde ir: Café, Bar, Gym, Parque |
| **Citas** | Estilo Tinder: swipe para aceptar o rechazar |
| **Teléfono** | Smartphone con contactos, app de citas, mensajes |
| **La Reina** | Cada semana avanza o sabotea tu relación |
| **Relación** | Tu pareja tiene salud — si llega a 0, te dejan |
| **Victoria** | Formar familia antes que La Reina |
| **Derrota** | La Reina forma familia, te aislan, te dejan, o asfixia |

### Controles
- **Mouse / Touch**: clickeá para elegir opciones
- **Swipe**: en citas, deslizá para aceptar/rechazar

### Ending
- **Victoria**: formás una familia
- **Victoria Oculta**: llegás a 100 Puntos Gay
- **Derrota**: La Reina gana por familia, aislamiento, asfixia, o te dejan

## Stack técnico

- **Phaser 3.85** — motor de juego 2D
- **Vite 6** — bundler y dev server
- **TypeScript 5** — type safety
- **10 escenas** — Boot, Preload, Menu, World, Location, Date, Phone, WeekEnd, GameOver, HUD

## Estructura

```
toxity/
├── src/
│   ├── main.ts              # Bootstrap de Phaser
│   ├── scenes/              # 10 escenas del juego
│   ├── models/              # Lógica del juego (12 módulos)
│   ├── components/          # UI reutilizable
│   ├── data/                # Import de data.json
│   ├── types/               # Interfaces TypeScript
│   └── utils/               # Helpers
├── game/
│   └── data/data.json       # 49 candidatos con stats
├── index.html               # Entry point
├── run.sh                   # Script de instalación
└── package.json
```

## Desarrollo

```bash
# Dev server con hot reload
npm run dev

# Build producción
npm run build

# Preview build
npm run preview
```

## Licencia

Proyecto personal — todos los derechos reservados.
