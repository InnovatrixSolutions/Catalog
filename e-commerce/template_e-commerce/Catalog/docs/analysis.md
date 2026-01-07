# Análisis de la Plataforma E-commerce

Este documento detalla el análisis técnico y de negocio de la plataforma actual.

## 1. Arquitectura General

El sistema es una aplicación **Monolítica Híbrida**.
- **Frontend**: Single Page Application (SPA) construida con **React** (Create React App).
- **Backend**: Scripts de **PHP puro** que actúan como API REST.
- **Base de Datos**: MySQL.

### Flujo de Despliegue (Inferred)
Parece que el frontend se compila (build) y los archivos estáticos resultantes (`index.html`, `js`, `css`) se colocan en el directorio `public`, junto con los scripts PHP. El servidor web (Apache/Nginx) sirve `public` como raíz.

## 2. Estructura de Directorios

### `src` (Frontend - React)
Contiene la lógica de la interfaz de usuario.
- **`App.jsx`**: Punto de entrada principal. Maneja la detección del "Modo" (Dropshipper vs Catálogo) mediante variables de entorno (`REACT_APP_MODE`) o parámetros de URL. Define los colores principales según el modo.
- **`Components/Cart/FormularioPedido.jsx`**: Componente crítico. Construye el objeto del pedido. Decide qué precio enviar al backend:
    - **Catálogo**: Envía el precio total calculado (`totalPrice`).
    - **Dropshipper**: Envía el precio que el dropshipper decide cobrar (`data.valor`), siempre que sea mayor o igual al precio base.
- **`Components`**: Librería de componentes UI (muchos componentes de PrimeReact).

### `public` (Backend + Assets)
Actúa como servidor de archivos estáticos Y como API Backend.
- **`login.php`**: Autenticación básica. Devuelve roles (`admin`, `colaborador`, `mesero-chef`).
- **`OrdersManager.php`**: "Cerebro" del negocio.
    - `calcularTotalesDesdeBD`: Recalcula precios basándose en la lista de precios (`catalogo` o `dropshipper`).
    - `crearRelacionPedidoAsesor`: Calcula la comisión del dropshipper (10% fijo) y guarda la relación.
- **`newTables.php` / `crearTablas.php`**: Scripts de migración de base de datos "ad-hoc". Crean tablas si no existen.
- **`composer.json`**: Dependencias de PHP (principalmente `vlucas/phpdotenv` para leer `.env`).

## 3. Modelo de Negocio: Dropshipper vs Cliente Final

La diferenciación es el núcleo del sistema y se maneja en tres capas:

| Capa | Cliente Final (Catálogo) | Dropshipper |
|------|--------------------------|-------------|
| **Visual (Frontend)** | Tema de color estándar. | Tema diferenciado (verde oscuro). URL/Env específico. |
| **Precios (BD)** | Usa `lista_precios` con `tipoLista='catalogo'`. | Usa `lista_precios` con `tipoLista='dropshipper'`. |
| **Pedidos (Lógica)** | Paga el precio de lista. Compra directa. | Vende a un precio mayor (markup). Se le asigna una comisión. Requiere `doc_asesor` y `pin_asesor`. |

### Flujo Dropshipper
1. El usuario entra en modo dropshipper.
2. Selecciona productos.
3. En el checkout, ingresa:
   - Datos del Cliente Final (quien recibe).
   - Sus propios datos (Documento y PIN de Asesor).
   - El precio de venta al cliente (que incluye su ganancia).
4. El sistema valida que `Precio Venta >= Precio Base`.
5. El backend registra el pedido y calcula la comisión automáticamente en `pedido_asesores`.

## 4. Áreas de Mejora Detectadas

1. **Seguridad**:
   - Exponer scripts PHP directamente en `public` aumenta la superficie de ataque.
   - Validación de precios confiada parcialmente al frontend (aunque el backend recalcula, la lógica está dispersa).

2. **Mantenimiento**:
   - Lógica de negocio mezclada en archivos dispersos (`OrdersManager.php` es bueno, pero hay muchos `*Post.php`).
   - Hardcoding de IDs (ej. `country_id: 48` en frontend).

3. **Arquitectura**:
   - Mezclar código fuente frontend y backend en la misma estructura de carpetas de despliegue dificulta la escalabilidad.
   - Las migraciones de BD se ejecutan en endpoints accesibles vía web (`newTables.php`), lo cual es riesgoso.

4. **Calidad de Código**:
   - Frontend usa mezcla de español e inglés.
   - Backend usa `echo json_encode` manualmente en cada archivo en lugar de un middleware de respuesta estandarizado.
