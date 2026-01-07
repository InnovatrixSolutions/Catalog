# Verificación de Nueva Comisión Dropshipper

## Cambios Realizados
1.  **`public/OrdersManager.php`**: Se actualizó la función `crearRelacionPedidoAsesor`.
    *   **Antes**: Comisión fija del 10% sobre (Venta - Envío).
    *   **Ahora**: `Ganancia = Venta - Envío - Costo Dropshipper - Cupón`.
    *   **Nota**: Inicialmente, si el pedido se crea con envío 0, la ganancia será mayor.
2.  **`public/pedidoPut.php`**: Se agregó lógica para recalcular la comisión.
    *   **Acción**: Al actualizar el `costo_envio` desde el Admin, se recalcula la ganancia restando el nuevo costo de envío.

## Pasos para Probar

### 1. Crear un Pedido (Modo Dropshipper)
1.  Ingrese a la tienda como **Dropshipper**.
2.  Agregue un producto al carrito (ej. Pesa Rusa).
    *   *Anote el precio de venta que definió*.
    *   *Anote el costo real del dropshipper (si lo conoce de la lista)*.
3.  Complete el pedido (El envío debería ser $0 inicialmente).
4.  **Resultado Esperado**: El pedido se crea. En la base de datos (`pedido_asesores`), la `comision_valor` será:
    *   `Precio Venta - 0 - Costo Dropshipper - Cupón`.

### 2. Actualizar Envío (Desde Admin)
1.  Vaya al panel de Administración -> Pedidos.
2.  Busque el pedido creado.
3.  Haga clic en **Actualizar Pedido** (donde se asigna transportadora y guía).
4.  Ingrese un valor en **Costo Envío** (ej. $15.000).
5.  Guarde los cambios.

### 3. Verificar Liquidación
1.  Revise la sección de **Liquidación Dropshipper** (o la tabla `pedido_asesores` si tiene acceso).
2.  **Resultado Esperado**: La ganancia del asesor debe haber disminuido exactamente por el valor del envío ($15.000).
    *   `Nueva Ganancia = Ganancia Inicial - $15.000`.

## Ejemplo Numérico
| Concepto | Valor | Nota |
| :--- | :--- | :--- |
| Precio Venta Cliente | $100.000 | Definido por Dropshipper |
| Costo Producto | $60.000 | Lista 'Dropshipper' |
| Ganancia Inicial (Envío $0) | **$40.000** | ($100k - $60k) |
| **Actualización Envío** | $12.000 | Costo Flete Real |
| **Ganancia Final** | **$28.000** | ($40k - $12k) |
