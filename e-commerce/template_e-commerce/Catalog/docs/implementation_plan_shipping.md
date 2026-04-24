# Implementation Plan - "Include Shipping" Logic

The goal is to respect the "Incluye Envío" (Include Shipping) flag from the order form.
If "Incluye Envío" is **"No"**, the shipping cost should **NOT** be subtracted from the commission calculation.
This implies `Ingreso Neto = Valor Pedido - Valor Cupón` (ignoring `Costo Envío` as a deduction).

## User Review Required
> [!IMPORTANT]
> **Logic Change**: When `envio_incluido` is 'No', the system will assume the shipping cost is covered externally or should not affect the dropshipper's commission validation. The shipping cost will NOT be subtracted from the `valor_pedido` when calculating the `comision_valor` and `utilidad_neta`.
>
> **Database Change**: A new column `envio_incluido` (ENUM 'Si', 'No', default 'Si') will be added to the `pedidos` table.

## Proposed Changes

### Database
#### [NEW] `update_envio_incluido.php`
- Create a migration script to add `envio_incluido` to the `pedidos` table.
```sql
ALTER TABLE pedidos ADD COLUMN envio_incluido ENUM('Si', 'No') DEFAULT 'Si' AFTER pagoRecibir;
```

### Frontend
#### [MODIFY] [FormularioPedido.jsx](file:///wsl.localhost/Ubuntu/home/byepesg/innovatrix/Catalog/e-commerce/template_e-commerce/Catalog/src/Components/Cart/FormularioPedido.jsx)
- In `onSubmit`, add `incluye_envio` to the `resumenPedido` object (mapped from `data.incluyeEnvio`).
- Ensure it's appended to `formData`.

### Backend
#### [MODIFY] [OrdersManager.php](file:///wsl.localhost/Ubuntu/home/byepesg/innovatrix/Catalog/e-commerce/template_e-commerce/Catalog/public/OrdersManager.php)
- **`crearPedido`**:
    - Receive `incluye_envio` from `$datos`.
    - Insert it into the `pedidos` table.
- **`crearRelacionPedidoAsesor`**:
    - Receive `incluye_envio` (or fetch it if not provided, but better to pass it).
    - Update the commission formula:
        ```php
        $restarEnvio = (isset($datos['incluye_envio']) && $datos['incluye_envio'] === 'No') ? false : true;
        
        $ingresoNetoVenta = $valorPedido - $totalCupon;
        if ($restarEnvio) {
            $ingresoNetoVenta -= $valorEnvio;
        }
        ```
    - Update `utilidad_neta` calculation as well?
        - `utilidad_neta = utilidad_bruta - costo_envio`.
        - If "Include Shipping = No", maybe `utilidad_neta = utilidad_bruta`? 
        - Logic: If I don't pay for shipping, my net utility is higher. Yes.

#### [MODIFY] [pedidoPut.php](file:///wsl.localhost/Ubuntu/home/byepesg/innovatrix/Catalog/e-commerce/template_e-commerce/Catalog/public/pedidoPut.php)
- When recalculating commission (on shipping cost update):
    - Fetch `envio_incluido` from `pedidos`.
    - Apply the same conditional deduction logic as in `OrdersManager`.

## Verification Plan

### Automated/Manual Verification
1.  **Run Migration**: Execute `php public/update_envio_incluido.php` to update DB.
2.  **Test Case 1: Include Shipping = Yes (Default)**
    - Create an order (Dropshipper). Select "Incluye Envío: Si".
    - Price: 20000. Shipping: 5000. Product Cost: 10000.
    - Expected Commission: 20000 - 5000 - 10000 = 5000.
3.  **Test Case 2: Include Shipping = No**
    - Create an order. Select "Incluye Envío: No".
    - Price: 20000. Shipping: 5000. Product Cost: 10000.
    - Expected Commission: 20000 - 10000 = 10000. (Shipping not subtracted).
4.  **Test Case 3: Update Order**
    - Update shipping cost for the "No" case order.
    - Verify commission remains calculated without subtracting shipping.
