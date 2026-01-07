# Plan de Implementación: Corrección de Cálculo de Comisiones

## Objetivo
Cambiar la lógica de cálculo de comisiones para los dropshippers.
**Actual**: 10% fijo sobre el valor de la venta.
**Nuevo**: `Ganancia = Valor Cobrado - Envío - Costo Dropshipper - Cupón`.
Donde:
1. `Costo Dropshipper` viene de la lista de precios 'dropshipper'.
2. `Envío` se actualiza posteriormente desde el Admin. **El recalculo debe ocurrir en ese momento.**

## User Review Required
> [!IMPORTANT]
> **Cambio en el Modelo de Negocio**
> Este cambio eliminará el 10% de comisión fija. Los dropshippers ganarán exactamente la diferencia (Markup) que configuren. Si venden al mismo precio que el costo, su comisión será 0. Asegúrese de que esto es lo deseado.

## Proposed Changes

### Backend (PHP)

#### [MODIFY] [OrdersManager.php](file:///wsl.localhost/Ubuntu/home/byepesg/innovatrix/Catalog/e-commerce/template_e-commerce/Catalog/public/OrdersManager.php)

1.  **En `crearRelacionPedidoAsesor`**:
    *   Recuperar el JSON de productos de `$datos['productos']`.
    *   Llamar a `self::calcularTotalesDesdeBD($conexion, $productosJson, 'dropshipper')` para obtener el costo real que la plataforma cobra al dropshipper (`total_productos` del resultado).
    *   Implementar la nueva fórmula confirmada:
        ```php
        // 1. Costo Base (Lista Dropshipper)
        $costoBaseDropshipper = $totalesCalculados['total_productos'];
        
        // 2. Ingresos y Deducciones
        $totalCobrarCliente = $valorPedido; // Lo que paga el cliente final
        
        // Si el dropshipper cobró envío aparte, se descuenta. Si dio envío gratis, $valorEnvio será 0 o el costo que asume él.
        // La lógica asume que $valorEnvio es el costo logístico que se resta del total cobrado.
        $deduccionEnvio = $valorEnvio; 
        
        $deduccionCupon = $totalCupon; // Opcional por ahora, pero se dejará restando si viene > 0
        
        // 3. Cálculo Final
        // Ganancia = Total Cobrado - Envío - Costo Producto - Cupón
        $comisionValor = max(0, $totalCobrarCliente - $deduccionEnvio - $costoBaseDropshipper - $deduccionCupon);
        ```
    *   Actualizar los campos insertados en la base de datos para reflejar este cálculo.
    *   **Nota**: Dado que el envío puede ser 0 inicialmente, se guardará una comisión provisional. La real se calculará cuando se actualice el envío.

#### [MODIFY] [pedidoPut.php](file:///wsl.localhost/Ubuntu/home/byepesg/innovatrix/Catalog/e-commerce/template_e-commerce/Catalog/public/pedidoPut.php)

1.  **Detección de Cambio en Envío**:
    *   Detectar si `$costoEnvio` está presente y es diferente de null.
2.  **Recálculo de Comisión**:
    *   Si hay cambio en el envío, verificar si existe relación en `pedido_asesores` para ese `idPedido`.
    *   Si existe, obtener los valores actuales del pedido (`total`, `total_cupon`) y el `base_calculo` (costo dropshipper) de la tabla `pedido_asesores`.
    *   Aplicar la fórmula nuevamente con el NUEVO costo de envío:
        `Ganancia = Valor Cliente - Nuevo Envío - Costo Dropshipper - Cupón`
    *   Actualizar `comision_valor` y `valor_envio` en la tabla `pedido_asesores`.

## Verification Plan

### Manual Verification
1.  **Simular Pedido Dropshipper**:
    *   Modo Dropshipper activado.
    *   Seleccionar producto con **Precio Lista Dropshipper** conocido (ej. $50.000).
    *   En Checkout, poner **Precio Venta** superior (ej. $80.000). Envío $0.
    *   Enviar pedido.
2.  **Verificar Base de Datos**:
    *   Consultar la tabla `pedido_asesores` para el ID del pedido generado.
    *   Verificar que `comision_valor` sea $30.000 (80k - 50k).
    *   **Antes**: Hubiera sido $8.000 (10% de 80k).

### Automated Tests
*   No existen tests automatizados en el proyecto actual. Se procederá con verificación manual y logs.
