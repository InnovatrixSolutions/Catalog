import React from 'react';
import { Card } from 'primereact/card';

export default function InfoCarroPedido({ pedido }) {
  const footer = (
    <div className="text-sm text-red-600 font-medium">
      ⚠️ Los pedidos nacionales se enviarán hasta el <strong>15 de diciembre de 2024</strong> por alta demanda de transportadoras.
    </div>
  );

  return (
    <div className="infoCarroPedido px-3 py-2">
      <div className="card w-full surface-50 border-1 border-300 shadow-2 border-round-xl">
        <Card
          title={<span className="text-xl text-primary font-bold">Pedidos Mercado Yepes</span>}
          subTitle="Información esencial para asesores"
          footer={footer}
          className="w-full"
        >
          <ul className="m-0 pl-3 list-disc text-sm leading-6">
            <li>Verifica que toda la información del pedido esté completa y correcta.</li>
            <li>Confirma con tu cliente que recibirá el producto para evitar devoluciones.</li>
            <li>Evita errores en nombres, direcciones y números de contacto.</li>
            <li>Escribe con calma, ya que errores implican costos adicionales.</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
