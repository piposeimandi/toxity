#!/bin/bash
# ============================================
# Toxity RPG — Instalador y Servidor de Desarrollo
# ============================================
set -e

echo "🎮 Toxity RPG — Setup"
echo "===================="

# Check Node.js
if ! command -v node &> /dev/null; then
  echo "❌ Node.js no encontrado. Instalá Node.js >= 18:"
  echo "   https://nodejs.org/"
  exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "❌ Node.js >= 18 requerido. Versión actual: $(node -v)"
  exit 1
fi

echo "✅ Node.js $(node -v)"

# Install dependencies
if [ ! -d "node_modules" ]; then
  echo ""
  echo "📦 Instalando dependencias..."
  npm install
  echo "✅ Dependencias instaladas"
else
  echo "✅ Dependencias ya instaladas"
fi

echo ""
echo "🚀 Iniciando servidor de desarrollo..."
echo "   Abrí http://localhost:5173/ en tu navegador"
echo "   Presioná Ctrl+C para parar"
echo ""

npm run dev
