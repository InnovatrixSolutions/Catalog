import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faSync, faEye, faArrowUp, faArrowDown, faPrint } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import './PedidosData.css'
import './PedidosDataViev.css'
import 'jspdf-autotable';
import baseURL from '../../url';
import moneda from '../../moneda';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useLocation } from 'react-router-dom';
import { Link as Anchor } from 'react-router-dom';
import NewPedido from '../NewPedido/NewPedido';
import contador from '../../contador'

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column'
import { Button } from 'primereact/button';

import { Card } from 'primereact/card';
import { FilterMatchMode, FilterOperator } from 'primereact/api';


export default function PedidosData() {
    const userType = process.env.REACT_APP_USER_TYPE;
    const [filters, setFilters] = useState(null);
    const [loading, setLoading] = useState(false);
    const [globalFilterValue, setGlobalFilterValue] = useState('');


    const [pedidos, setPedidos] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [nuevoEstado, setNuevoEstado] = useState('');
    const [pagado, setPagado] = useState('');
    const [pedido, setPedido] = useState({});
    const [selectedSection, setSelectedSection] = useState('texto');
    const [tienda, setTienda] = useState([]);
    const [filtroId, setFiltroId] = useState('');
    const [filtroNombre, setFiltrNombre] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('');
    const [filtroDesde, setFiltroDesde] = useState('');
    const [filtroHasta, setFiltroHasta] = useState('');
    const [filtroPago, setFiltroPago] = useState('');
    const [filtroPagado, setFiltroPagado] = useState('');
    const [filtroEntrega, setFiltroEntrega] = useState('');
    const [ordenInvertido, setOrdenInvertido] = useState(false);
    const [detallesVisibles, setDetallesVisibles] = useState({});
    const [metodos, setMetodos] = useState([]);
    const location = useLocation();
    const [visibleCount, setVisibleCount] = useState(20);
    //const [filtroListaPrecio, setFiltroListaPrecio] = useState('');
    const [filtroTipoPedido, setFiltroTipoPedido] = useState('');
    const [transportadora, setTransportadora] = useState(pedido.transportadora || '');
    const [numeroGuia, setNumeroGuia] = useState(pedido.numeroGuia || '');
    const [valorFlete, setValorFlete] = useState(pedido.valorFlete || '');

    
 const dynamicColumns = [
  { field: 'idPedido', header: 'ID Pedido', minWidth: '8rem' },
  { field: 'tipo_pedido', header: 'Tipo Pedido', minWidth: '8rem' },
  { field: 'estado', header: 'Estado', minWidth: '8rem' },
  { field: 'createdAt', header: 'Fecha Creación', minWidth: '12rem' },
  { field: 'fecha_despacho', header: 'Fecha Despacho', minWidth: '12rem' },
  { field: 'pagado', header: 'Pagado', minWidth: '8rem' },
  { field: 'pagoRecibir', header: 'Pago al Recibir', minWidth: '10rem' },
  
  { field: 'nombre', header: 'Nombre', minWidth: '12rem' },
  { field: 'telefono', header: 'Teléfono', minWidth: '10rem' },
  { field: 'telefono_tran', header: 'Tel. Transportador', minWidth: '10rem' },
  { field: 'entrega', header: 'Entrega', minWidth: '15rem' },
  { field: 'country_id', header: 'País', minWidth: '8rem' },
  { field: 'state_id', header: 'Departamento', minWidth: '8rem' },
  { field: 'city_id', header: 'Ciudad', minWidth: '8rem' },
  { field: 'franja_horario', header: 'Franja Horaria', minWidth: '10rem' },
  { field: 'nota', header: 'Nota', minWidth: '15rem' },

  
  { field: 'pago', header: 'Pago', minWidth: '10rem' },
  { field: 'forma_pago', header: 'Forma de Pago', minWidth: '10rem' },
  { field: 'valor_cupon', header: 'Valor Cupón', minWidth: '10rem' },
  { field: 'tipo_cupon', header: 'Tipo Cupón', minWidth: '10rem' },
  { field: 'total_cupon', header: 'Total Cupón', minWidth: '10rem' },
//   { field: 'comision', header: 'Comisión', minWidth: '10rem' },
//   { field: 'envio', header: 'Envío', minWidth: '8rem' },
//   { field: 'valorEnvio', header: 'Valor Envío', minWidth: '10rem' },
  { field: 'total', header: 'Total', minWidth: '10rem' },
  { field: 'total_productos', header: 'Total Productos', minWidth: '10rem' }
];

    const handleShowMore = () => {
        setVisibleCount(prevCount => prevCount + 20);
    };
    useEffect(() => {
        cargarPedidos();
        cargarTienda();
        cargarMetodos()
    }, []);


    const cargarPedidos = () => {
        fetch(`${baseURL}/pedidoGet.php`, {
            method: 'GET',
        })
            .then(response => response.json())
            .then(data => {
                setPedidos(data.pedidos.reverse() || []);
                console.log(data.pedidos)
            })
            .catch(error => console.error('Error al cargar pedidos:', error));
    };


    const cargarTienda = () => {
        fetch(`${baseURL}/tiendaGet.php`, {
            method: 'GET',
        })
            .then(response => response.json())
            .then(data => {
                setTienda(data.tienda.reverse()[0] || []);
            })
            .catch(error => console.error('Error al cargar contactos:', error));
    };

    const cargarMetodos = () => {
        fetch(`${baseURL}/metodoGet.php`, {
            method: 'GET',
        })
            .then(response => response.json())
            .then(data => {
                // Filtra solo los métodos con estado "Activo"
                const metodosActivos = (data.metodos || [])?.filter(metodo => metodo.estado === 'Activo');
                setMetodos(metodosActivos);
                console.log(metodosActivos);
            })
            .catch(error => console.error('Error al cargar datos bancarios:', error));
    };

    const eliminar = (idPedido) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: '¡No podrás revertir esto!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`${baseURL}/pedidoDelete.php?idPedido=${idPedido}`, {
                    method: 'DELETE',
                })
                    .then(response => response.json())
                    .then(data => {
                        Swal.fire(
                            '¡Eliminado!',
                            data.mensaje,
                            'success'
                        );
                        cargarPedidos();
                    })
                    .catch(error => {
                        console.error('Error al eliminar :', error);
                        toast.error(error);
                    });
            }
        });
    };
    useEffect(() => {
        setNuevoEstado(pedido.estado)
        setPagado(pedido.pagado)
    }, [pedido]);

    const abrirModal = (item) => {
        setPedido(item);
        setNuevoEstado(item.estado)
        setPagado(item.pagado)
        setModalVisible(true);
    };

    const cerrarModal = () => {
        setModalVisible(false);
    };

    const handleUpdateText = (idPedido) => {
        // Definimos el estado en función de las condiciones
        let estadoFinal = (nuevoEstado === "Entregado" || nuevoEstado === "Solicitado" || pedido.estado === "Entregado" || pedido.estado === "Solicitado") &&
            (pagado === "Si" || pedido.pagado === "Si")
            ? "Finalizado"
            : (nuevoEstado !== '' ? nuevoEstado : pedido.estado);

        const payload = {
            estado: estadoFinal,
            pagado: pagado !== '' ? pagado : pedido.pagado,
             transportadora,
            numeroGuia,
            valorFlete,
            nota: pedido.nota, // 🔄 Asegúrate de enviar la nota
            };
        fetch(`${baseURL}/pedidoPut.php?idPedido=${idPedido}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    Swal.fire(
                        'Error!',
                        data.error,
                        'error'
                    );
                } else {
                    Swal.fire(
                        'Editado!',
                        data.mensaje,
                        'success'
                    );
                    cargarPedidos();
                    cerrarModal();
                }
            })
            .catch(error => {
                console.log(error.message);
                toast.error(error.message);
            });
    };



    const handleSectionChange = (section) => {
        setSelectedSection(section);
    };

    const filtrados = pedidos.filter(item => {
        const idMatch = item.idPedido?.toString().includes(filtroId);
        const estadoMatch = !filtroEstado || item.estado?.includes(filtroEstado);
        const nombreMatch = !filtroNombre || item.nombre?.toLowerCase().includes(filtroNombre.toLowerCase());
        const desdeMatch = !filtroDesde || new Date(item.createdAt) >= new Date(filtroDesde);
        const pagoMatch = !filtroPago || item.pago?.includes(filtroPago);
        const pagadoMatch = !filtroPagado || item.pagado?.includes(filtroPagado);
        // Incrementamos la fecha "hasta" en un día para que incluya la fecha seleccionada
        const adjustedHasta = new Date(filtroHasta);
        adjustedHasta.setDate(adjustedHasta.getDate() + 1);
        const hastaMatch = !filtroHasta || new Date(item.createdAt) < adjustedHasta;

        // Ajustar el filtro de entrega
        const entregaMatch = !filtroEntrega ||
            (filtroEntrega === "Domicilio"
                ? item?.entrega !== "Sucursal" && item?.entrega !== "Retiro en Sucursal"
                : item.entrega?.includes(filtroEntrega));

        //const listaPrecioMatch = !filtroListaPrecio || item.listaPrecio?.toLowerCase().includes(filtroListaPrecio.toLowerCase());
        const tipoPedidoMatch = !filtroTipoPedido || item.tipo_pedido?.toLowerCase().includes(filtroTipoPedido.toLowerCase());



        //return idMatch && estadoMatch && desdeMatch && hastaMatch && nombreMatch && pagoMatch && entregaMatch && pagadoMatch;
        return idMatch && estadoMatch && desdeMatch && hastaMatch && nombreMatch && pagoMatch && entregaMatch && pagadoMatch && tipoPedidoMatch;
    });


    
    const recargar = () => {
        cargarPedidos();
    };
    const invertirOrden = () => {
        setPedidos([...pedidos].reverse());
        setOrdenInvertido(!ordenInvertido);
    };
    const descargarExcel = () => {
        let totalGeneral = 0;
        let totalComision = 0;
        let totalValorEnvio = 0;
        
        const data = filtrados.map(item => {
            const total = parseFloat(item.total);
            const comision = parseFloat(item.comision) || 0;
            const valorEnvio = parseFloat(item.valorEnvio) || 0;
        
            totalGeneral += total;
            totalComision += comision;
            totalValorEnvio += valorEnvio;
        
            const productos = JSON.parse(item.productos);
            const infoProductos = productos.map(producto => `${producto.titulo} - ${moneda}${producto.precio} - x${producto.cantidad}`);
        
            return {
                'ID Pedido': item.idPedido,
                'Estado': item.estado,
                'Pagado': item.pagado,
                'Nombre': item.nombre,
                'Telefono': item.telefono,
                'Pago': item.pago,
                'Nota': item.nota,
                'Pago al recibirlo': item.pagoRecibir || '',
                'Entrega': item.entrega,
                'Lista Precio': item.listaPrecio,
                'Comisión': comision.toFixed(2),
                'Método de Pago': item.metodoPago,
                'Envio': item.envio,
                'Valor Envío': valorEnvio.toFixed(2),
                'Productos': infoProductos.join('\n'),
                'Código': item.codigo,
                'Total': `${moneda} ${total.toFixed(2)}`,
                'Fecha': item.createdAt,
            };
        });
        
        

        // Formatear el total general
        const formattedTotal = `${moneda} ${totalGeneral.toFixed(2)}`;

        // Agregar fila con el total general
        const totalRow = {
            'ID Pedido': '',
            'Estado': '',
            'Pagado': '',
            'Nombre': '',
            'Telefono': '',
            'Pago': '',
            'Nota': '',
            'Pago al recibirlo': '',
            'Entrega': '',
            'Lista Precio': '',
            'Comisión': totalComision.toFixed(2),
            'Método de Pago': '',
            'Envio': '',
            'Valor Envío': totalValorEnvio.toFixed(2),
            'Productos': '',
            'Código': 'Total General:',
            'Total': `${moneda} ${totalGeneral.toFixed(2)}`,
            'Fecha': '',
        };
        

        data.push(totalRow);

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'pedidos');
        XLSX.writeFile(wb, 'pedidos.xlsx');
    };


    const descargarPDF = () => {
        const pdf = new jsPDF('landscape'); // Orientación horizontal
        pdf.text('Lista de Pedidos', 10, 10);

        const columns = [
            { title: 'ID Pedido', dataKey: 'idPedido' },
            { title: 'Estado', dataKey: 'estado' },
            { title: 'Pagado', dataKey: 'pagado' },
            { title: 'Nombre', dataKey: 'nombre' },
            { title: 'Telefono', dataKey: 'telefono' },
            { title: 'Pago', dataKey: 'pago' },
            { title: 'Entrega', dataKey: 'entrega' },
            { title: 'Lista Precio', dataKey: 'listaPrecio' },
            { title: 'Comisión', dataKey: 'comision' },
            { title: 'Envío', dataKey: 'envio' },
            { title: 'Valor Envío', dataKey: 'valorEnvio' },
            { title: 'Productos', dataKey: 'productos' },
            { title: 'Código', dataKey: 'codigo' },
            { title: 'Total', dataKey: 'total' },
            { title: 'Fecha', dataKey: 'createdAt' },
        ];
        
        

        let totalGeneral = 0;

        const data = filtrados.map(item => {
            const total = parseFloat(item.total); // Convertir a número
            totalGeneral += total;
            const productos = JSON.parse(item.productos);
            const infoProductos = productos.map(producto => `${producto.titulo} - ${moneda}${producto.precio} - x${producto.cantidad}  `);
            return {
                idPedido: item.idPedido,
                estado: item.estado,
                pagado: item.pagado,
                nombre: item.nombre,
                telefono: item.telefono,
                pago: item.pago,
                entrega: item.entrega,
                listaPrecio: item.listaPrecio,
                comision: item.comision,
                envio: item.envio,
                valorEnvio: item.valorEnvio,
                productos: infoProductos.join('\n'),
                codigo: item.codigo,
                total: `${moneda} ${total.toFixed(2)}`,
                createdAt: item.createdAt,
            };
            
        });

        // Formatear el total general
        const formattedTotal = `${moneda} ${totalGeneral.toFixed(2)}`;

        // Agregar fila con el total general
        const totalRow = {
            idPedido: '',
            estado: '',
            nombre: '',
            telefono: '',
            pago: '',
            entrega: '',
            nota: '',
            productos: '',
            codigo: 'Total General:',
            total: formattedTotal,
            createdAt: '',
        };

        data.push(totalRow);

        pdf.autoTable({
            head: [columns.map(col => col.title)],
            body: data.map(item => Object.values(item)),
        });

        pdf.save('pedidos.pdf');
    };
    const handleDownloadPDF = () => {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        let y = 10;

        // Agregar título
        pdf.setFontSize(10);


        // Obtener los detalles del pedido actualmente mostrado en el modal
        const pedidoActual = pedido;


        // Agregar detalles del pedido al PDF
        const pedidoData = [
            [`ID Pedido:`, `${pedidoActual.idPedido}`],
            [`Estado:`, `${pedidoActual.estado}`],
            [`Pagado:`, `${pedidoActual.pagado}`],
            [`Nombre:`, `${pedidoActual.nombre}`],
            [`Telefono:`, `${pedidoActual.telefono}`],
            [`Pago:`, `${pedidoActual.pago}`],
            [`Entrega:`, `${pedidoActual.entrega}`],
            [`Nota:`, `${pedidoActual.nota}`],
            [`Código:`, `${pedidoActual.codigo}`],
            [`Total:`, `${moneda} ${pedidoActual.total}`],
            [`Fecha:`, `${pedidoActual.createdAt}`]
        ];
        pdf.autoTable({
            startY: y,
            head: [['Detalle del pedido', 'Valor']],
            body: pedidoData,
        });
        y = pdf.autoTableEndPosY() + 5;

        y += 5;

        // Obtener los productos del pedido actual
        const productosPedido = JSON.parse(pedidoActual.productos);

        // Generar sección de productos con imágenes y contenido
        for (let i = 0; i < productosPedido.length; i++) {
            if (y + 30 > pdf.internal.pageSize.getHeight()) {
                pdf.addPage();
                y = 10;
            }

            const producto = productosPedido[i];

            pdf.setFontSize(8);

            // Muestra la imagen a la izquierda de los datos del producto
            if (producto.imagen) {
                pdf.addImage(producto.imagen, 'JPEG', 15, y, 20, 20); // Ajusta el tamaño de la imagen aquí
            } else {
                // Si no hay URL de imagen, simplemente dejar un espacio en blanco
                pdf.text("Imagen no disponible", 5, y + 15);
            }

            if (producto) {
                pdf.text(`Producto: ${producto.titulo}`, 39, y + 3);
                pdf.text(`Precio: ${moneda} ${producto.precio}`, 39, y + 11);
                pdf.text(`Cantidad: ${producto.cantidad}`, 39, y + 15);
                pdf.text(`${producto.items}`, 39, y + 19);
            }

            y += 25; // Incrementar y para la siguiente posición
        }

        // Guardar el PDF
        pdf.save('pedido.pdf');
    };

    const imprimirTicket = () => {
        let totalGeneral = 0;

        const pdf = new jsPDF({
            unit: 'mm',
            format: [80, 150], // Tamaño de ticket estándar
        });

        // Recorrer los pedidos filtrados y sumar los totales
        filtrados.forEach((item, index) => {
            // Si no es el primer pedido, agregar una nueva página
            if (index > 0) {
                pdf.addPage();
            }

            const total = parseFloat(item.total); // Convertir a número
            totalGeneral += total;

            // Extraer productos y formatearlos
            const productos = JSON.parse(item.productos);

            // Encabezado del ticket
            pdf.setFontSize(11);
            pdf.text(`${tienda?.nombre}`, 40, 10, { align: 'center' });
            pdf.setFontSize(10);
            pdf.text(`Tel: ${tienda?.telefono}`, 40, 16, { align: 'center' });
            const fechaFormateada = `${new Date(item?.createdAt)?.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            })} ${new Date(item?.createdAt)?.toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
            })}`;

            pdf.text(`Fecha: ${fechaFormateada}`, 40, 22, { align: 'center' });

            let y = 35; // Posición inicial para los datos de los pedidos

            // Añadir información del pedido al PDF
            pdf.setFontSize(9);
            pdf.text(`ID Pedido: ${item.idPedido}`, 5, y);
            pdf.text(`Cliente: ${item.nombre}`, 5, y + 5);
            pdf.text(`Teléfono: ${item.telefono}`, 5, y + 10);
            pdf.text(`Entrega: ${item.entrega}`, 5, y + 15);
            pdf.text(`Pago: ${item.pago}`, 5, y + 20);
            pdf.text(`Pago al recibirlo: ${item.pagoRecibir || ''}`, 5, y + 25);
            pdf.text(`Estado: ${item.estado}`, 5, y + 30);
            pdf.text(`Pagado: ${item.pagado}`, 5, y + 35);
            pdf.text(`Código descuento: ${item.codigo}`, 5, y + 40);
            pdf.text(`Nota: ${item.nota}`, 5, y + 45);
            pdf.text(`------------------------------------------------------------------`, 5, y + 50);
            pdf.text(`Productos:`, 5, y + 54);

            // Añadir productos del pedido
            let yProductos = y + 59;
            productos.forEach((producto) => {
                // Unir los items en una sola línea, separados por comas
                const itemsTexto = producto.items && producto.items.length > 0
                    ? producto.items.join(', ')
                    : ''; // Si no hay items, mostrar una cadena vacía

                // Agregar título, precio, cantidad
                pdf.setFontSize(9); // Mantener el tamaño de fuente de 10 para el producto
                const tituloTexto = `- ${producto.titulo} x${producto.cantidad} - ${moneda}${producto.precio}`;
                pdf.text(tituloTexto, 5, yProductos);
                yProductos += 5;

                // Cambiar a un tamaño de fuente de 8 para los items
                if (itemsTexto) {
                    pdf.setFontSize(8); // Cambiar el tamaño de fuente a 8
                    // Ajustar el texto de items para que se respete el ancho del ticket
                    const itemsArray = pdf.splitTextToSize(`${itemsTexto}`, 75); // 75 es el ancho del ticket - márgenes
                    itemsArray.forEach(line => {
                        pdf.text(line, 5, yProductos);
                        yProductos += 5;
                    });
                }

                // Verificar si se necesita agregar nueva página
                if (yProductos > 145) { // Ajusta este número si es necesario, 145 es el límite de altura de la página
                    pdf.addPage();
                    yProductos = 10; // Reiniciar la posición vertical
                }
            });

            // Total del pedido
            y = yProductos + 5;
            pdf.text(`-----------------------------------------------------`, 5, y - 5);
            pdf.setFontSize(10);
            pdf.text(`Total: ${moneda}${total.toFixed(2)}`, 5, y);

            // Mensaje de agradecimiento
            y += 10;
            pdf.text("¡Gracias por su compra!", 40, y, { align: 'center' });
        });

        // Imprimir el ticket
        window.open(pdf.output('bloburl'), '_blank'); // Abre el ticket en una nueva pestaña para imprimir
    };


    


    const imprimirTicket2 = (pedido) => {
        const pdf = new jsPDF({
            unit: 'mm',
            format: [80, 150], // Tamaño de ticket estándar
        });

        const total = parseFloat(pedido.total); // Convertir a número
        let productos = [];

        // Verificar si "productos" existe y es un JSON válido antes de intentar parsearlo
        if (pedido.productos) {
            try {
                productos = JSON.parse(pedido.productos);
            } catch (error) {
                console.error("Error al parsear productos:", error);
            }
        }

        // Encabezado del ticket
        pdf.setFontSize(11);
        pdf.text(`${tienda?.nombre}`, 40, 10, { align: 'center' });
        pdf.setFontSize(10);
        pdf.text(`Tel: ${tienda?.telefono}`, 40, 16, { align: 'center' });
        const fechaFormateada = `${new Date(pedido?.createdAt)?.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        })} ${new Date(pedido?.createdAt)?.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        })}`;

        pdf.text(`Fecha: ${fechaFormateada}`, 40, 22, { align: 'center' });

        let y = 35; // Posición inicial para los datos del pedido

        // Añadir información del pedido al PDF
        pdf.setFontSize(9);
        pdf.text(`ID Pedido: ${pedido.idPedido}`, 5, y);
        pdf.text(`Cliente: ${pedido.nombre}`, 5, y + 5);
        pdf.text(`Teléfono: ${pedido.telefono}`, 5, y + 10);
        pdf.text(`Entrega: ${pedido.entrega}`, 5, y + 15);
        pdf.text(`Pago: ${pedido.pago}`, 5, y + 20);
        pdf.text(`Pago a recibirlo: ${pedido.pagoRecibir || ''}`, 5, y + 25); // Mostrar solo el texto si no hay valor
        pdf.text(`Estado: ${pedido.estado}`, 5, y + 30);
        pdf.text(`Pagado: ${pedido.pagado}`, 5, y + 35);
        pdf.text(`Código descuento: ${pedido.codigo}`, 5, y + 40);
        pdf.text(`Nota: ${pedido.nota}`, 5, y + 45);
        pdf.text(`------------------------------------------------------------------`, 5, y + 50);
        pdf.text(`Productos:`, 5, y + 54);

        // Añadir productos del pedido si existen
        let yProductos = y + 59;
        if (productos.length > 0) {
            productos.forEach((producto) => {
                const itemsTexto = producto.items && producto.items.length > 0
                    ? producto.items.join(', ')
                    : '';

                const tituloTexto = `- ${producto.titulo} x${producto.cantidad} - ${moneda}${producto.precio}`;
                pdf.setFontSize(9);
                pdf.text(tituloTexto, 5, yProductos);
                yProductos += 5;

                if (itemsTexto) {
                    pdf.setFontSize(8);
                    const itemsArray = pdf.splitTextToSize(`${itemsTexto}`, 75);
                    itemsArray.forEach(line => {
                        pdf.text(line, 5, yProductos);
                        yProductos += 5;
                    });
                }

                if (yProductos > 145) {
                    pdf.addPage();
                    yProductos = 10;
                }
            });
        } else {
            pdf.text('No hay productos.', 5, yProductos);
        }

        y = yProductos + 5;
        pdf.text(`-----------------------------------------------------`, 5, y - 5);
        pdf.setFontSize(10);
        pdf.text(`Total: ${moneda}${total.toFixed(2)}`, 5, y);

        y += 10;
        pdf.text("¡Gracias por su compra!", 40, y, { align: 'center' });

        // Imprimir el ticket
        window.open(pdf.output('bloburl'), '_blank');
    };




    const pedidosAgrupados = filtrados?.reduce((acc, item) => {
        acc[item.estado] = acc[item.estado] || [];
        acc[item.estado].push(item);
        return acc;
    }, {});

    // Filtramos los estados que deseas mostrar
    const estados = ['Pendiente', 'Preparacion', 'Terminado', 'Entregado'];
    const toggleDetalles = (idPedido) => {
        setDetallesVisibles((prev) => ({
            ...prev,
            [idPedido]: !prev[idPedido], // Alterna la visibilidad para este idPedido
        }));
    };
    const fechaActual = new Date();
    const diaActual = fechaActual.getDate();
    const mesActual = fechaActual.getMonth() + 1; // Los meses son indexados desde 0
    const anioActual = fechaActual.getFullYear();
    const pedidosFiltrados = Object.keys(pedidosAgrupados)?.reduce((acc, estado) => {
        const pedidosDelEstado = pedidosAgrupados[estado]?.filter(item => {
            const fechaPedido = new Date(item.createdAt);
            return (
                fechaPedido.getDate() === diaActual &&
                fechaPedido.getMonth() + 1 === mesActual &&
                fechaPedido.getFullYear() === anioActual
            );
        });
        if (pedidosDelEstado?.length > 0) {
            acc[estado] = pedidosDelEstado;
        }
        return acc;
    }, {});

    //Contador de recarga de pedidos
    const [counter, setCounter] = useState(contador);
    const [isPaused, setIsPaused] = useState(false);
    useEffect(() => {
        const interval = setInterval(() => {
            if (!isPaused) {
                setCounter((prevCounter) => {
                    if (prevCounter === 1) {
                        recargar();
                        return contador;
                    }
                    return prevCounter - 1;
                });
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [isPaused]);

        const clearFilter = () => {
        initFilters();
    };

    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        let _filters = { ...filters };

        _filters['global'].value = value;

        setFilters(_filters);
        setGlobalFilterValue(value);
    };

    useEffect(() => {
  initFilters();
}, []);


const initFilters = () => {
    setFilters({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        idPedido: { value: null, matchMode: FilterMatchMode.EQUALS },
        tipo_pedido: { value: null, matchMode: FilterMatchMode.CONTAINS },
        estado: { value: null, matchMode: FilterMatchMode.CONTAINS },
        pagado: { value: null, matchMode: FilterMatchMode.EQUALS },
        nombre: { value: null, matchMode: FilterMatchMode.CONTAINS },
        telefono: { value: null, matchMode: FilterMatchMode.CONTAINS },
        entrega: { value: null, matchMode: FilterMatchMode.CONTAINS },
        pago: { value: null, matchMode: FilterMatchMode.CONTAINS },
        // ...add more fields as needed
    });
};

const renderHeader = () => (
    <div className="flex justify-content-between">
        <Button type="button" icon="pi pi-filter-slash" label="Limpiar filtros" outlined onClick={clearFilter} />
        <span className="p-input-icon-left">
            <i className="pi pi-search" />
            <input type="text" value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Buscar..." className="p-inputtext p-component" />
        </span>
    </div>
);

const header = renderHeader();

    return (
        <div>

            <ToastContainer />
            <h1 className='titles-text-heading'>Pedidos</h1>
            <div className='deFlexContent2'>
                <div className='deFlex2'>
                    <NewPedido />
                    <button className='pdf' onClick={() => imprimirTicket(pedido)}>  <FontAwesomeIcon icon={faPrint} /> Tickets</button>
                    <button className='excel' onClick={descargarExcel}><FontAwesomeIcon icon={faArrowDown} /> Excel</button>
                    <button className='pdf' onClick={descargarPDF}><FontAwesomeIcon icon={faArrowDown} /> PDF</button>
                </div>
                <div className='filtrosContain'>
                    <div className='deFlexLink'>
                        <Anchor to={`/dashboard/pedidos`} className={location.pathname === '/dashboard/pedidos' ? 'activeLin' : ''}> Cuadrícula</Anchor>

                        <Anchor to={`/dashboard/pedidos/view`} className={location.pathname === '/dashboard/pedidos/view' ? 'activeLin' : ''}> Lista</Anchor>
                    </div>
                    <div className='inputsColumn'>
                        <button className='length'>{String(filtrados?.length)?.replace(/\B(?=(\d{3})+(?!\d))/g, ".")} / {String(pedidos?.length)?.replace(/\B(?=(\d{3})+(?!\d))/g, ".")} </button>
                    </div>
                    <div className='inputsColumn'>
                        <input type="number" value={filtroId} onChange={(e) => setFiltroId(e.target.value)} placeholder='Id Pedido' />
                    </div>
                    <div className='inputsColumn'>
                        <input type="text" value={filtroNombre} onChange={(e) => setFiltrNombre(e.target.value)} placeholder='Nombre' />
                    </div>
                    <div className='inputsColumn'>
                        <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
                            <option value="">Estado</option>
                            <option value="Pendiente">Pendiente</option>
                            <option value="Preparacion">Preparacion</option>
                            <option value="Terminado">Terminado</option>
                            <option value="Entregado">Entregado</option>
                            <option value="Finalizado">Finalizado</option>
                            <option value="Rechazado">Rechazado</option>
                        </select>
                    </div>
                    <div className='inputsColumn'>
                    <select value={filtroTipoPedido} onChange={(e) => setFiltroTipoPedido(e.target.value)}>
                        
                            <option value="">Tipo Pedido</option>
                            {userType !== 'catalogo' && <option value="Catalogo">catalogo</option>}

                            <option value="dropshipper">dropshipper</option>
                        </select>

                        </div>

                    <div className='inputsColumn'>
                        <select value={filtroPagado} onChange={(e) => setFiltroPagado(e.target.value)}>
                            <option value="">Pagado</option>
                            <option value="Si">Si</option>
                            <option value="No">No</option>
                        </select>
                    </div>
                    <div className='inputsColumn'>
                        <select value={filtroPago} onChange={(e) => setFiltroPago(e.target.value)}>
                            <option value="">Pago</option>
                            {
                                metodos?.map(metod => (
                                    <option value={metod.tipo}>{metod.tipo}</option>
                                ))}
                        </select>

                    </div>
                    <div className='inputsColumn'>
                        <select value={filtroEntrega} onChange={(e) => setFiltroEntrega(e.target.value)}>
                            <option value="">Entrega</option>
                            <option value="Sucursal">Sucursal</option>
                            <option value="Retiro en Sucursal">Retiro en Sucursal</option>
                            <option value="Domicilio">Domicilio</option>
                        </select>
                    </div>
                    <button className='reload' onClick={recargar}><FontAwesomeIcon icon={faSync} /></button>
                    <button className='reverse' onClick={invertirOrden}>
                        {ordenInvertido ? <FontAwesomeIcon icon={faArrowUp} /> : <FontAwesomeIcon icon={faArrowDown} />}
                    </button>

                </div>

            </div>
            {location?.pathname === '/dashboard/pedidos' ? (
                <div className='cards-container'>
                    {estados?.map(estado => (
                        <div key={estado} className='estado-container'>
                            <h2>{estado} ({pedidosFiltrados[estado]?.length || 0})</h2>

                            <div className='cards-row'>
                                {pedidosFiltrados[estado]?.map(item => (
                                    <div key={item.idPedido} className='card'>
                                        <h3>Id Pedido: {item.idPedido}</h3>
                                        <span style={{
                                            color: item.estado === 'Pendiente' ? '#DAA520' :
                                                item.estado === 'Preparacion' ? '#0000FF' :
                                                    item.estado === 'Rechazado' ? '#FF0000' :
                                                        item.estado === 'Entregado' ? '#008000' :
                                                            '#3366FF '
                                        }}>
                                            {item.estado}
                                            
                                        </span>
                                        <span style={{ color: '#008000' }}> {item.tipo_pedido}</span>

                                        <div className='card-actions'>
                                            <span style={{ color: '#008000' }}>{moneda} {item.total}</span>
                                            <span>{new Date(item?.createdAt)?.toLocaleString('es-ES', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric'
                                            })}</span>
                                            <span style={{ color: '#008000' }}>{moneda} {item.total}</span>
                                        </div>
                                        <span>Entrega:  {item?.entrega}</span>
                                        <span>Pagado:  {item?.pagado}</span>
                                        {detallesVisibles[item.idPedido] && (
                                            <>
                                                <span>Nombre: {item.nombre}</span>
                                                <span>Teléfono: {item.telefono}</span>
                                                <span>Pago: {item.pago}</span>
                                            </>
                                        )}
                                        <button onClick={() => toggleDetalles(item.idPedido)} className='moreBtn'>
                                            {detallesVisibles[item.idPedido] ? 'Mostrar menos' : `Mostrar más`}
                                        </button>
                                        <div className='card-actions'>
                                            <button className='eliminar' onClick={() => eliminar(item.idPedido)}>
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                            <button className='editar' onClick={() => abrirModal(item)}>
                                                <FontAwesomeIcon icon={faEye} />
                                            </button>
                                            <button onClick={() => imprimirTicket2(item)} className='editar'>
                                                <FontAwesomeIcon icon={faPrint} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className='table-container'>
                    <table className='table'>
                        <thead>
                            <tr>
                                <th>Id Pedido</th>
                                <th>Tipo Pedido</th>
                                <th>Pagado</th>
                                <th>Estado</th>
                                <th>Fecha</th>
                                <th>Fecha de despacho</th>
                                <th>Franaja Horaria</th>
                                <th>Nombre</th>
                                <th>Telefono</th>
                                <th>Entrega</th>
                                
                                <th>Estado</th>
                                <th>Pago</th>
                                <th>Forma de pago</th>
                                {/* <th>Comisión</th>
                                <th>Envio</th>
                                <th>Valor envío</th> */}
                                <th>Total</th>
                                <th>Total de productos</th>
                                <th>Pago al Recibir</th>
                                <th>Valor Cupón</th>
                                <th>Tipo Cupón</th>
                                <th>Total Cupón</th>
                                <th>Tel. Transportador</th> 
                                <th>Pais</th>
                                <th>Departamento</th>
                                <th>Ciudad</th>
                                <th>Notas</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtrados?.slice(0, visibleCount)?.map(item => (
                                <tr key={item.idPedido}>
                                    <td>{item.idPedido}</td>
                                    <td>{item.tipo_pedido}</td>



                                    <td style={{
                                        color: item?.pagado === 'Si' ? '#008000' : item?.pagado === 'No' ? '#FF0000' : ''
                                    }}>
                                        {item?.pagado}
                                    </td>

                                    <td>{item.estado}</td>
                                    <td> {new Date(item?.createdAt)?.toLocaleString('es-ES', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric'
                                    })}</td>


                                    <td> {new Date(item?.fecha_despacho)?.toLocaleString('es-ES', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric'
                                    })}</td>


                                                                        <td> {new Date(item?.franja_horario)?.toLocaleString('es-ES', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric'
                                    })}</td>

                                    <td>{item.nombre}</td>
                                    <td>{item.telefono}</td>
                                    <td>{item.entrega}</td>
                                    
                                    <td style={{
                                        color: item.estado === 'Pendiente' ? '#DAA520' :
                                            item.estado === 'Preparacion' ? '#0000FF' :
                                                item.estado === 'Rechazado' ? '#FF0000' :
                                                    item.estado === 'Entregado' ? '#008000' :
                                                        '#3366FF'
                                    }}>
                                        {item?.estado}
                                    </td>
                                    <td>{item.pago}</td>
                                    <td>{item.forma_pago}</td>
                                    {/* <td>{item.comision}</td>
                                    <td>{item.envio}</td>
                                    <td>{item.valorEnvio}</td> */}
                                    <td style={{ color: '#008000', }}>{moneda} {item.total}</td>
                                    <td>{item.total_productos}</td>

                                    <td>{item.pagoRecibir}</td>
                                    <td>{item.valor_cupon || '—'}</td>
                                    <td>{item.tipo_cupon || '—'}</td>

                                    <td>{item.total_cupon}</td>
                                    <td>{item.telefono_tran}</td> {/* Mostrar solo si tiene valor */}

                                    <td>{item.country_id}</td>
                                    <td>{item.state_id}</td>
                                    <td>{item.city_id}</td>
                                    <td>{item.nota}</td>

                                    <td>
                                        <button className='eliminar' onClick={() => eliminar(item.idPedido)}>
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                        <button className='editar' onClick={() => abrirModal(item)}>

                                            <FontAwesomeIcon icon={faEye} />
                                        </button>
                                        <button onClick={() => imprimirTicket2(item)} className='editar' >
                                            <FontAwesomeIcon icon={faPrint} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>

                    </table>
<br></br>
                                        <DataTable 
                                            value={pedidos}
                                            filters={filters}
                                            filterDisplay="row"
                                            globalFilterFields={[
                                            'idPedido',
                                            'tipo_pedido',
                                            'estado',
                                            'pagado',
                                            'nombre',
                                            'telefono',
                                            'entrega',
                                            'pago',
                                            // ...add more as needed
                                            ]}
                                            header={header}
                                            onFilter={(e) => setFilters(e.filters)}
                                            
                                            scrollable
                                            scrollHeight="400px"
                                            paginator rows={10} rowsPerPageOptions={[5, 10, 25, 50]}
                                            stripedRows
                                            sortable
                                            tableStyle={{ minWidth: '50rem'}}
                                        
                                        >
  {dynamicColumns.map((col) => (
    <Column
    
    frozen={col.frozen}
      key={col.field}
      field={col.field}
      header={col.header}
      style={{ minWidth: col.minWidth }}
      
      
    />
  ))}

  {/* Columna estática para Acciones */}
<Column
  header="Acciones"
  frozenRight
  sortMode="multiple"
  body={(rowData) => (
    <div className="flex gap-2">
      <Button
        className='editar'
        onClick={() => abrirModal(rowData)}
        icon="pi pi-eye"
        aria-label="Ver"
      />
      <Button
        className='eliminar'
        onClick={() => eliminar(rowData.idPedido)}
        icon="pi pi-trash"
        aria-label="Eliminar"
      />
      <Button
        className='imprimir'
        onClick={() => imprimirTicket2(rowData)}
        icon="pi pi-print"
        aria-label="Imprimir"
      />
    </div>
  )}
  style={{ minWidth: '12rem' }}
/>

</DataTable>

                </div>
            )}




            {modalVisible && (
                <div className="modal">
                    <div className="modal-content" id='modal-content'>
                        <div className='deFlexBtnsModal'>
                            <div className='deFlexBtnsModal'>
                                <button
                                    className={selectedSection === 'texto' ? 'selected' : ''}
                                    onClick={() => handleSectionChange('texto')}
                                >
                                    Pedido
                                </button>
                                <button onClick={() => imprimirTicket2(pedido)} className='texto'>
                                    Imprimir Ticket
                                </button>
                                <button onClick={handleDownloadPDF} className='texto'>Descargar PDF</button>
                            </div>

                            <span className="close" onClick={cerrarModal}>
                                &times;
                            </span>
                        </div>
                        <div className='sectiontext' style={{ display: selectedSection === 'texto' ? 'flex' : 'none' }}>

                            <div id='cardsProductData'>
                                {JSON.parse(pedido.productos).map(producto => (
                                    <div key={producto.titulo} className='cardProductData'>
                                        <img src={producto.imagen} alt="imagen" />
                                        <div className='cardProductDataText'>
                                            <h3>{producto.titulo}</h3>
                                            <strong>{moneda} {producto.precio} <span>x{producto.cantidad}</span></strong>
                                            <span>
                                                {producto?.items?.map((sabor, index) => (
                                                    <span key={index}>{sabor}, </span>
                                                ))}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className='recibirAbsolute'>
                                {
                                    (pedido?.entrega === 'Sucursal' || pedido?.entrega === 'Retiro en Sucursal') ? (
                                        <span>Retira Personalmente</span>
                                    ) : (
                                        <span >Delivery</span>
                                    )

                                }

                                {
                                    pedido?.pagoRecibir === 'Si' ? (
                                        <span>Pago al recibirlo</span>
                                    ) : pedido?.pagado === 'No' || (!pedido?.pagoRecibir && pedido?.pagado === 'No') ? (
                                        <span>Falta Comprobante</span>
                                    ) : pedido?.pagado === 'Si' ? (
                                        <></>
                                    ) : (
                                        <></>
                                    )
                                }

                            </div>
                            <div className='flexGrap'>
                                <fieldset>
                                    <legend>ID Pedido</legend>
                                    <input
                                        value={pedido.idPedido}
                                        disabled

                                    />
                                </fieldset>
                                <fieldset>
                                    <legend>Fecha </legend>
                                    <input
                                        value={new Date(pedido?.createdAt)?.toLocaleString('es-ES', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric'
                                        })}
                                        disabled

                                    />
                                </fieldset>
                                <fieldset>
                                    <legend>Nombre</legend>
                                    <input
                                        value={pedido.nombre}
                                        disabled

                                    />
                                </fieldset>
                                <fieldset>
                                    <legend>Telefono</legend>
                                    <input
                                        value={pedido.telefono}
                                        disabled

                                    />
                                </fieldset>
                                <fieldset>
                                    <legend>Pago</legend>
                                    <input
                                        value={pedido.pago}
                                        disabled

                                    />
                                </fieldset>
                                <fieldset>
                                    <legend>Entrega</legend>
                                    <input
                                        value={pedido.entrega}
                                        disabled

                                    />
                                </fieldset>

                                <fieldset>
                                    <legend>Codigo</legend>
                                    <input
                                        value={pedido.codigo}
                                        disabled

                                    />
                                </fieldset>
                                <fieldset>
                                    <legend>Nota</legend>
                                    <input
                                        value={pedido.nota}
                                        disabled

                                    />
                                </fieldset>

                                <fieldset>
                                    <legend>Total </legend>
                                    <input
                                        value={pedido.total}
                                        disabled

                                    />
                                </fieldset>


                                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
    <fieldset style={{ flex: 1, minWidth: '200px' }}>
        <legend>Transportadora</legend>
        <input
            value={transportadora}
            onChange={(e) => setTransportadora(e.target.value)}
        />
    </fieldset>

    <fieldset style={{ flex: 1, minWidth: '200px' }}>
        <legend>Número de Guía</legend>
        <input
            value={numeroGuia}
            onChange={(e) => setNumeroGuia(e.target.value)}
        />
    </fieldset>

    <fieldset style={{ flex: 1, minWidth: '200px' }}>
        <legend>Valor del Flete</legend>
        <input
            value={valorFlete}
            onChange={(e) => setValorFlete(e.target.value)}
        />
    </fieldset>
</div>

         




<fieldset>
  <legend>Estado</legend>
  <div className='deFlexBtnsFilset'>
    {['Pendiente', 'Entregado', 'Devolución', 'Cancelado'].map((estado) => (
      <button
        key={estado}
        type="button"
        className={
          nuevoEstado === estado ||
          (nuevoEstado === '' && pedido.estado === estado)
            ? 'activo'
            : 'Noactivo'
        }
        onClick={() => setNuevoEstado(estado)}
      >
        {estado}
      </button>
    ))}
  </div>
</fieldset>

{(nuevoEstado === 'Devolución' || nuevoEstado === 'Cancelado') && (
  <fieldset>
    <legend>Motivo</legend>
    <input
      type="text"
      value={pedido.notaPedidoInterna || ''}
      onChange={(e) =>
        setPedido((prev) => ({ ...prev, notaPedidoInterna: e.target.value }))
      }
      placeholder="Especifique el motivo de la devolución o cancelación"
    />
  </fieldset>
)}




                                <fieldset id="fieldsetAuto">
                                    <legend>Pagado</legend>
                                    <div className='deFlexBtnsFilset'>
                                        <button
                                            type="button"
                                            className={pagado === 'Si' || (pagado === '' && pedido.pagado === 'Si') ? 'activo' : 'Noactivo'}
                                            onClick={() => setPagado('Si')}
                                        >
                                            Sí
                                        </button>
                                        <button
                                            type="button"
                                            className={pagado === 'No' || (pagado === '' && pedido.pagado === 'No') ? 'activo' : 'Noactivo'}
                                            onClick={() => setPagado('No')}
                                        >
                                            No
                                        </button>
                                    </div>
                                </fieldset>




                            </div>


                            <button className='btnPost' onClick={() => handleUpdateText(pedido.idPedido)} >Guardar </button>
                        </div>
                    </div>
                </div>
            )}

            {







            }
        </div>
    );
};
