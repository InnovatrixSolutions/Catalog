// utils/whatsapp.js
import moneda from '../Components/moneda'; // Adjust this path if needed

export const handleWhatsappMessage = (data, tiendaTelefono = '3166402868') => {
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

  const formattedTotalPrice = total?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  const productosDetails = productos.map(item => {
    return `\n✅ *${item.titulo}* \n      Precio: ${moneda} ${item?.precio?.toString()?.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}  x  ${item.cantidad}\n      ${item.items?.join(', ') || ''}\n`;
  }).join('');

  const message = `¡Hola! 🌟 Mi pedido es el N°${idPedido}\n${productosDetails}\n👤 Nombre: ${nombre}\n\n📱 Teléfono: ${telefono}\n\n📦 Entrega: ${entrega}\n\n💵 Forma de pago: ${pago}\n\n📌 Pago al recibirlo: ${pagoRecibir}\n\n🏷 Código de descuento: ${codigo}\n\n✅ Nota: ${nota}\n\n*Total: ${moneda} ${formattedTotalPrice}*`;

  const whatsappUrl = `https://api.whatsapp.com/send?phone=${tiendaTelefono}&text=${encodeURIComponent(message)}`;

  window.open(whatsappUrl, '_blank');
};
