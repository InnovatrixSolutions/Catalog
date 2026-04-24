#!/bin/bash

# Este script construye y sube el proyecto de Catalogo al servidor usando rsync.

echo "=============== 🚀 CONSTRUYENDO CATALOGO ==============="
npm run build:catalogo

echo "=============== 📤 SUBIENDO AL SERVIDOR ==============="
# 1. Sincronizamos la subcarpeta 'static' con --delete. 
# Esto elimina los archivos JS/CSS viejos que ya no sirven y mantiene solo los del nuevo build.
rsync -avz --delete ./build_catalogo/static/ mercadoyepes:~/public_html/static/

# 2. Subimos el resto de archivos construidos a la raíz (index.html, asset-manifest.json, etc.).
# Al NO usar --delete aquí, rsync respeta tus archivos PHP y tus carpetas de imágenes.
rsync -avz --exclude 'static' ./build_catalogo/ mercadoyepes:~/public_html/

echo "=============== ✅ DEPLOY DE CATALOGO COMPLETADO ==============="
