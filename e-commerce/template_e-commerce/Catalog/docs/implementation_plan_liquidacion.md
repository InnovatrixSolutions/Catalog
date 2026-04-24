# Implementation Plan - Formatting Monetary Values in LiquidacionData

The goal is to apply the same green text and currency formatting ($) to the monetary columns in `LiquidacionData.jsx` as was done for `PedidosData.jsx`.

## User Review Required
> [!NOTE]
> This change affects the visual presentation of the "Liquidacion" tables (Details and Summary).

## Proposed Changes

### Liquidacion Component

#### [MODIFY] [LiquidacionData.jsx](file:///wsl.localhost/Ubuntu/home/byepesg/innovatrix/Catalog/e-commerce/template_e-commerce/Catalog/src/Pages/LiquidacionDropshipper/LiquidacionData.jsx)

- Add `formatCOP` helper function:
    ```javascript
    const formatCOP = (v) => {
      const n = toNumber(v);
      return `${moneda} ${String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
    };
    ```
- Define `moneyFields` arrays for both tables:
    - `moneyFieldsPedidos`: `['pedido_total', 'costo_envio', 'total_cupon', 'base_calculo', 'comision_valor', 'valor_a_pagar_asesor', 'utilidad_bruta', 'utilidad_neta']`
    - `moneyFieldsResumen`: `['total_comision', 'total_a_pagar', 'total_utilidad_bruta', 'total_utilidad_neta']`
- Create `priceBodyTemplate` function.
- Update `DataTable` (Pedidos) loop to apply `priceBodyTemplate`.
- Update `DataTable` (Resumen) loop to apply `priceBodyTemplate`.

## Verification Plan

### Manual Verification
1.  Start the development server (`npm start`).
2.  Navigate to Dashboard > Liquidacion (or dropshipper view).
3.  Check the "Detalle de pedidos" tab. Verify columns like `Total Pedido`, `Valor Envío`, `Valor comisión` appear in green with `$`.
4.  Check the "Resumen por asesor" tab. Verify columns like `Total Comisión`, `Total a Pagar` appear in green with `$`.
