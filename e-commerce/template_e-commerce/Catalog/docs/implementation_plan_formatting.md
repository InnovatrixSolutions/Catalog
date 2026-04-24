# Implementation Plan - Formatting Monetary Values in Orders Table

The goal is to format monetary columns in the `PedidosData.jsx` table (Orders) to display with a peso sign ($) and green text, matching the style in `ProductosData.jsx`.

## User Review Required
> [!NOTE]
> This change affects the visual presentation of the "Pedidos" table in the Dashboard.

## Proposed Changes

### Dashboard Component

#### [MODIFY] [PedidosData.jsx](file:///wsl.localhost/Ubuntu/home/byepesg/innovatrix/Catalog/e-commerce/template_e-commerce/Catalog/src/Components/Admin/PedidosData/PedidosData.jsx)

- Import `moneda` (already imported).
- Create a `priceBodyTemplate` function that takes `rowData` and the column `field`.
    - It should return a `span` with `style={{ color: '#008000' }}`.
    - It should format the number using the regex replacement pattern found in `ProductosData.jsx` or the existing `formatCOP` helper (though `formatCOP` rounds, so I might need to check if that's desired, but the user said "like products table"). The products table usages `${item?.precio ?? 0}`.
    - `PedidosData.jsx` already has `formatCOP` which does `toNumber` and adds `moneda`. I can reuse or adapt this.
- Update `dynamicColumns` to mark monetary columns:
    - `pagoRecibir`
    - `valor_cupon`
    - `total_cupon`
    - `costo_envio`
    - `total`
- Update the `DataTable` rendering loop to check if a column needs the `priceBodyTemplate`.

## Verification Plan

### Manual Verification
1.  Start the development server (`npm start`).
2.  Navigate to the Dashboard > Pedidos.
3.  Verify that columns `Pago al Recibir`, `Valor Cupón`, `Total Cupón`, `Costo Envío`, and `Total` are displayed in green and with the `$` sign.
4.  Check that sorting and filtering still works (PrimeReact `body` templates sometimes affect filtering if not handled, but usually `field` handles the data underlying).
