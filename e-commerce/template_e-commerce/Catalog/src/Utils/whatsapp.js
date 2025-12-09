// utils/whatsapp.js
import moneda from '../Components/moneda';

const defaultPhone = process.env.REACT_APP_MOBILE_PHONE || '3166402868';

export const handleWhatsappMessage = (data, tiendaTelefono = defaultPhone) => {
  console.log("Enviando mensaje por WhatsApp...");

  const {
    idPedido,
    nombre,
    telefono,
    entrega,
    pago,
    codigo,
    total,
    nota,
    productos,
    pagoRecibir
  } = data;

  const formattedTotalPrice = total?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  const productosDetails = productos.map(item => {
    return `\n✅ *${item.titulo}* \n      Precio: ${moneda} ${item.precio?.toString()?.replace(/\B(?=(\d{3})+(?!\d))/g, ".")} x ${item.cantidad}\n      ${item.items?.join(', ') || ''}\n`;
  }).join('');

  const message = `¡Hola! 🌟 Mi pedido es el N°${idPedido}
${productosDetails}

👤 Nombre: ${nombre}
📱 Teléfono: ${telefono}
📦 Entrega: ${entrega}
💵 Forma de pago: ${pago}
📌 Pago al recibirlo: ${pagoRecibir}
🏷 Código de descuento: ${codigo}
✏️ Nota: ${nota}

*Total: ${moneda} ${formattedTotalPrice}*`;

  const whatsappUrl = `https://api.whatsapp.com/send?phone=${tiendaTelefono}&text=${encodeURIComponent(message)}`;

  window.open(whatsappUrl, '_blank');
};
