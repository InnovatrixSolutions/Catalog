#!/bin/bash

# Este script construye y sube el proyecto de Dropshipper al servidor usando rsync.

echo "=============== 🚀 CONSTRUYENDO DROPSHIPPER ==============="
npm run build:dropshipper

echo "=============== 📤 SUBIENDO AL SERVIDOR ==============="
# 1. Sincronizamos la subcarpeta 'static' con --delete.
# Esto elimina los archivos JS/CSS viejos que ya no sirven y mantiene solo los del nuevo build.
rsync -avz --delete ./build_dropshipper/static/ mercadoyepes:~/drop.mercadoyepes.co/static/

# 2. Subimos el resto de archivos construidos a la raíz (index.html, asset-manifest.json, etc.).
# Al NO usar --delete aquí, rsync respeta tus archivos propios del backend que ya existan.
rsync -avz --exclude 'static' ./build_dropshipper/ mercadoyepes:~/drop.mercadoyepes.co/

echo "=============== ✅ DEPLOY DE DROPSHIPPER COMPLETADO ==============="
