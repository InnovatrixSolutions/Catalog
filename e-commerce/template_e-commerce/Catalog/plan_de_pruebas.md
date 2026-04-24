# Plan de Pruebas Integral - E-commerce

Este documento detalla el flujo de pruebas para verificar el funcionamiento correcto de la plataforma, desde la creación de productos hasta la liquidación de comisiones.

## 1. Gestión de Productos (Administrador / Dropshipper)

**Objetivo:** Verificar que se pueden crear productos y que estos aparecen correctamente en la tienda.

### Escenario: Agregar Nuevo Producto
1.  **Navegar a:** Sección de "Nuevo Producto" (`NewProduct.jsx`).
2.  **Acción:** Diligenciar el formulario del producto.
    *   Nombre, Precio Global (Público), Precio Dropshipper.
    *   Cargar imágenes del producto.
    *   Asignar categoría y descripción.
3.  **Verificación:**
    *   [ ] El sistema confirma "Producto guardado exitosamente".
    *   [ ] El producto aparece en la lista de "Mis Productos".
    *   [ ] **Critico:** El producto aparece visible en la tienda (Catálogo) con el precio correcto.

---

## 2. Flujo de Compra (Cliente Final)

**Objetivo:** Simular la experiencia de compra de un cliente real.

### Escenario: Realizar un Pedido
1.  **Navegar a:** URL de la Tienda (Build Catálogo).
2.  **Acción:**
    *   Buscar el producto creado en el paso anterior.
    *   Agregar al carrito de compras.
    *   Proceder al Checkout.
    *   Diligenciar datos de envío (Nombre, Dirección, Teléfono, Ciudad).
    *   Confirmar el pedido.
3.  **Verificación:**
    *   [ ] El cliente recibe mensaje de confirmación / número de pedido.
    *   [ ] El carrito se vacía.

---

## 3. Gestión de Pedidos (Administrador / Operaciones)

**Objetivo:** Procesar el pedido entrante y actualizar su estado logístico.

### Escenario: Verificar Recepción
1.  **Navegar a:** Panel Administrativo -> "Pedidos" (`PedidosData.jsx`).
2.  **Acción:** Buscar el nuevo pedido (por ID o nombre del cliente).
3.  **Verificación:**
    *   [ ] El pedido aparece en estado "Pendiente" (o estado inicial).
    *   [ ] Los datos del cliente y productos coinciden con lo comprado.

### Escenario: Actualizar Valores de Logística
**Nota:** Este paso es crucial para el cálculo de liquidaciones.
1.  **Acción:** Abrir opción "Actualizar Pedido" (Icono de lápiz/editar).
2.  **Diligenciar:**
    *   **Transportadora:** Seleccionar (ej. Interrapidisimo, Envía).
    *   **Número de Guía:** Ingresar número de rastreo real o prueba.
    *   **Valor Flete:** Ingresar el costo real del envío (ej. $15,000).
    *   **Estado:** Cambiar a "Enviado" o "Entregado".
3.  **Guardar Cambios.**
4.  **Verificación:**
    *   [ ] El sistema actualiza los datos sin errores.
    *   [ ] El estado del pedido cambia en la tabla visual.

---

## 4. Verificación de Liquidación y Financiera

**Objetivo:** Confirmar que los cálculos de utilidad y comisiones se generaron correctamente tras actualizar los costos logísticos.

### Escenario: Revisar Liquidación
1.  **Navegar a:** Panel Administrativo -> "Liquidación" (`LiquidacionData.jsx`).
2.  **Acción:** Buscar la liquidación correspondiente al pedido o periodo actual.
3.  **Verificación de Cálculos:**
    *   [ ] **Costo Envío:** Debe coincidir con el "Valor Flete" ingresado en el paso anterior.
    *   [ ] **Valor Recaudo:** Debe ser el valor total cobrado al cliente.
    *   [ ] **Utilidad Bruta:** `(Precio Venta - Precio Proveedor - Costo Envío)`. *Verificar fórmula específica del negocio*.
    *   [ ] **Comisión Dropshipper:** Verificar si se calculó el porcentaje o valor fijo acordado.
    *   [ ] **Estado de Pago:** Verificar si aparece como "Pendiente de Pago" o "Disponible".

---

## 5. Pruebas de Regresión (Opcional pero Recomendado)

*   [ ] **Edición de Producto:** Intentar editar el precio o imagen del producto creado y verificar que se actualice en la tienda.
*   [ ] **Móvil:** Realizar el flujo de compra desde un dispositivo móvil (o simulador) para verificar la responsividad.
*   [ ] **Sincronización:** Si tienes entornos separados (Dropshipper vs Catálogo), verificar que el pedido hecho en Catálogo aparezca en el panel del Dropshipper (si aplica esa lógica).
