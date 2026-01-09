import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faSync, faEye, faArrowUp, faArrowDown, faPrint } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import './LiquidacionData.css'
import './LiquidacionDataView.css'
import 'jspdf-autotable';
import baseURL from '../../Components/url';
import moneda from '../../Components/moneda';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useLocation } from 'react-router-dom';
import { Link as Anchor } from 'react-router-dom';
import contador from '../../Components/contador'
import 'primereact/resources/themes/lara-light-blue/theme.css';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column'
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';
import { Divider } from 'primereact/divider';
import { TabView, TabPanel } from 'primereact/tabview';
import { Calendar } from 'primereact/calendar';

const formatDateParam = (date) => {
  if (!date) return null;
  // la Calendar de PrimeReact devuelve un Date
  const iso = date.toISOString();
  return iso.slice(0, 10); // 'YYYY-MM-DD'
};


export default function LiquidacionData() {
  const userType = process.env.REACT_APP_USER_TYPE;

  // === Filtros TABLA PEDIDOS ===
  const [filtersPedidos, setFiltersPedidos] = useState(null);
  const [globalFilterPedidos, setGlobalFilterPedidos] = useState('');

  // === Filtros TABLA RESUMEN ===
  const [filtersResumen, setFiltersResumen] = useState(null);
  const [globalFilterResumen, setGlobalFilterResumen] = useState('');

  const [periodoDesde, setPeriodoDesde] = useState(null);
  const [periodoHasta, setPeriodoHasta] = useState(null);


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

  const [resumenAsesores, setResumenAsesores] = useState([]);



  const scaleFactor = 2; // rems to add
  const dynamicColumns = [
    // Identificadores
    { field: 'idPedido', header: 'Pedido', minWidth: '7rem' },
    { field: 'idAsesor', header: 'ID Asesor', minWidth: '7rem' },

    // Asesor
    { field: 'asesor_nombre', header: 'Asesor', minWidth: '14rem' },
    { field: 'asesor_whatsapp', header: 'WhatsApp', minWidth: '12rem' },

    // Cliente / pedido
    { field: 'pedido_cliente_nombre', header: 'Cliente', minWidth: '14rem' },
    { field: 'pedido_total', header: 'Total Pedido', minWidth: '10rem' },
    { field: 'costo_envio', header: 'Valor Envío', minWidth: '10rem' },
    { field: 'total_cupon', header: 'Valor Cupón', minWidth: '10rem' },

    // Liquidación
    { field: 'base_calculo', header: 'Base cálculo', minWidth: '10rem' },
    { field: 'porcentaje_comision', header: '% Comisión', minWidth: '8rem' },
    { field: 'comision_valor', header: 'Valor comisión', minWidth: '10rem' },
    { field: 'valor_a_pagar_asesor', header: 'A pagar asesor', minWidth: '12rem' },

    // Estado de pago
    { field: 'medio_pago_comision', header: 'Medio pago comisión', minWidth: '14rem' },
    { field: 'estado_comision', header: 'Estado comisión', minWidth: '10rem' },
    { field: 'fecha_pago_comision', header: 'Fecha pago', minWidth: '10rem' },
    { field: 'utilidad_bruta', header: 'Utilidad Bruta', minWidth: '10rem' },
    { field: 'utilidad_neta', header: 'Utilidad Neta', minWidth: '10rem' },
  ];



  const handleShowMore = () => {
    setVisibleCount(prevCount => prevCount + 20);
  };
  useEffect(() => {
    cargarPedidos();
    cargarTienda();
    cargarMetodos()
  }, []);


  useEffect(() => {
    // Agrupa los registros por idAsesor
    const mapa = {};

    pedidos.forEach(item => {
      if (!item.idAsesor) return;

      const id = item.idAsesor;

      if (!mapa[id]) {
        mapa[id] = {
          idAsesor: id,
          asesor_nombre: item.asesor_nombre || '',
          asesor_whatsapp: item.asesor_whatsapp || '',
          asesor_medio_pago: item.asesor_medio_pago || '',
          total_pedidos: 0,
          total_comision: 0,
          total_a_pagar: 0,
          total_utilidad_bruta: 0,
          total_utilidad_neta: 0,
        };
      }



      const comision = parseFloat(item.comision_valor || 0);
      const aPagar = parseFloat(item.valor_a_pagar_asesor || 0);
      const uBruta = parseFloat(item.utilidad_bruta || 0);
      const uNeta = parseFloat(item.utilidad_neta || 0);

      mapa[id].total_pedidos += 1;
      mapa[id].total_comision += isNaN(comision) ? 0 : comision;
      mapa[id].total_a_pagar += isNaN(aPagar) ? 0 : aPagar;
      mapa[id].total_utilidad_bruta += isNaN(uBruta) ? 0 : uBruta;
      mapa[id].total_utilidad_neta += isNaN(uNeta) ? 0 : uNeta;
    });

    setResumenAsesores(Object.values(mapa));
  }, [pedidos]);

  const resumenColumns = [
    { field: 'idAsesor', header: 'ID Asesor', minWidth: '7rem' },
    { field: 'asesor_nombre', header: 'Asesor', minWidth: '14rem' },
    { field: 'asesor_whatsapp', header: 'WhatsApp', minWidth: '12rem' },
    { field: 'asesor_medio_pago', header: 'Medio de Pago', minWidth: '12rem' },

    { field: 'total_pedidos', header: '# Pedidos', minWidth: '8rem' },
    { field: 'total_comision', header: 'Total Comisión', minWidth: '10rem' },
    { field: 'total_a_pagar', header: 'Total a Pagar', minWidth: '10rem' },
    { field: 'total_utilidad_bruta', header: 'Total U. Bruta', minWidth: '10rem' },
    { field: 'total_utilidad_neta', header: 'Total U. Neta', minWidth: '10rem' },
  ];


  const cargarPedidos = (opciones = {}) => {
    const params = new URLSearchParams();

    if (opciones.fecha_desde) {
      params.append('fecha_desde', opciones.fecha_desde);
    }
    if (opciones.fecha_hasta) {
      params.append('fecha_hasta', opciones.fecha_hasta);
    }
    if (opciones.idAsesor) {
      params.append('idAsesor', opciones.idAsesor);
    }
    if (opciones.estado_comision) {
      params.append('estado_comision', opciones.estado_comision);
    }

    const qs = params.toString();
    const url = `${baseURL}/pedidoAsesoresGet.php${qs ? `?${qs}` : ''}`;

    fetch(url, { method: 'GET' })
      .then((response) => response.json())
      .then((data) => {
        setPedidos((data.pedidos_asesores || []).reverse());
        console.log(data.pedidos_asesores);
      })
      .catch((error) =>
        console.error('Error al cargar pedidos:', error)
      );
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

  const aplicarPeriodo = () => {
    const desde = formatDateParam(periodoDesde);
    const hasta = formatDateParam(periodoHasta);

    cargarPedidos({
      fecha_desde: desde,
      fecha_hasta: hasta,
      // si luego quieres añadir filtros:
      // idAsesor: algunId,
      // estado_comision: 'Pendiente',
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


  const schemaPedidoEdit = z.object({
    estado: z.string().min(1, "Estado requerido"),
    pagado: z.enum(["Si", "No"]),
    transportadora: z.string().optional(),
    numeroGuia: z.string().optional(),
    valorFlete: z.string().optional(),
    notaPedidoInterna: z.string().optional(),
    // Add more fields as necessary
  });


  const toNumber = (v) => {
    if (v === null || v === undefined) return 0;
    const s = String(v).replace(/\./g, "").replace(",", ".");
    const n = Number(s);
    return isNaN(n) ? 0 : n;
  };

  // Edit handler
  const onSubmitEdit = (data) => {
    const estadoFinal =
      (
        data.estado === 'Entregado' ||
        data.estado === 'Solicitado' ||
        pedido.estado === 'Entregado' ||
        pedido.estado === 'Solicitado'
      ) &&
        (data.pagado === 'Si' || pedido.pagado === 'Si')
        ? 'Finalizado'
        : (data.estado || pedido.estado);

    const transportadoraFinal =
      (data.transportadora || "");

    const payload = {
      estado: estadoFinal,
      pagado: data.pagado || pedido.pagado,

      transportadora: transportadoraFinal,
      numero_guia: data.numeroGuia || "",
      costo_envio: data.valorFlete ? toNumber(data.valorFlete) : 0, // Correctly mapped to costo_envio

      nota: pedido.nota,
      notaPedidoInterna: data.notaPedidoInterna || "",
    };

    fetch(`${baseURL}/pedidoPut.php?idPedido=${pedido.idPedido}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(r => r.json())
      .then(resp => {
        if (resp.error) Swal.fire('Error!', resp.error, 'error');
        else {
          Swal.fire('Editado!', resp.mensaje, 'success');
          cargarPedidos();
          cerrarModal();
        }
      })
      .catch(err => toast.error(err.message));
  };


  const { control, handleSubmit, formState: { errors }, reset, watch } = useForm({
    resolver: zodResolver(schemaPedidoEdit),
    defaultValues: {
      estado: pedido?.estado || "",
      pagado: pedido?.pagado || "",
      transportadora: pedido?.transportadora || "",
      numeroGuia: pedido?.numeroGuia || "",
      valorFlete: pedido?.costo_envio || "",
      notaPedidoInterna: pedido?.notaPedidoInterna || "",
    }
  });

  // Sync form with pedido when modal opens
  useEffect(() => {
    if (modalVisible) {
      reset({
        estado: pedido?.estado || "",
        pagado: pedido?.pagado || "",
        transportadora: pedido?.transportadora || "",
        numeroGuia: pedido?.numeroGuia || "",
        valorFlete: pedido?.costo_envio || "",
        notaPedidoInterna: pedido?.notaPedidoInterna || "",
      });
    }
  }, [modalVisible, pedido, reset]);


  const pedidoPrettyHeaders = {
    idPedido: 'ID Pedido',
    tipo_pedido: 'Tipo Pedido',
    estado: 'Estado',
    createdAt: 'Fecha Creación',
    fecha_despacho: 'Fecha Despacho',
    pagado: 'Pagado',
    pagoRecibir: 'Pago al Recibir',
    nombre: 'Nombre',
    telefono: 'Teléfono',
    telefono_tran: 'Tel. Transportador',
    entrega: 'Entrega',
    country_id: 'País (ID)',
    state_id: 'Departamento (ID)',
    city_id: 'Ciudad (ID)',
    franja_horario: 'Franja Horaria',
    nota: 'Nota',
    pago: 'Pago',
    forma_pago: 'Forma de Pago',
    valor_cupon: 'Valor Cupón',
    tipo_cupon: 'Tipo Cupón',
    total_cupon: 'Total Cupón',
    total: 'Total',
    total_productos: 'Total Productos',
    codigo: 'Código Descuento',
    productos: 'Productos',
    // Add any new fields here if you want pretty names
  };
  const getPrettyHeader = (key) => pedidoPrettyHeaders[key] || key;

  function descargarExcel() {
    if (!pedidos.length && !resumenAsesores.length) {
      toast.warn("No hay datos para exportar");
      return;
    }

    const wb = XLSX.utils.book_new();


    // -------- Hoja 1: Detalle de pedidos --------
    if (pedidos.length) {
      const rowsDetalle = pedidos.map((p) => {
        const row = {};
        dynamicColumns.forEach((col) => {
          row[col.header] = p[col.field] ?? "";
        });
        return row;
      });

      const wsDetalle = XLSX.utils.json_to_sheet(rowsDetalle);
      XLSX.utils.book_append_sheet(wb, wsDetalle, "DetallePedidos");
    }

    // -------- Hoja 2: Resumen por asesor --------
    if (resumenAsesores.length) {
      const rowsResumen = resumenAsesores.map((r) => {
        const row = {};
        resumenColumns.forEach((col) => {
          row[col.header] = r[col.field] ?? "";
        });
        return row;
      });

      const wsResumen = XLSX.utils.json_to_sheet(rowsResumen);
      XLSX.utils.book_append_sheet(wb, wsResumen, "ResumenAsesores");
    }

    XLSX.writeFile(wb, "liquidacion_pedidos.xlsx");
  }

  function descargarPDF() {
    if (!pedidos.length && !resumenAsesores.length) {
      toast.warn("No hay datos para exportar");
      return;
    }

    const pdf = new jsPDF("landscape", "pt", "a4");

    // -------- Tabla 1: Detalle de pedidos --------
    pdf.setFontSize(14);
    pdf.text("Detalle de pedidos", 40, 30);

    if (pedidos.length) {
      const headDetalle = [dynamicColumns.map((c) => c.header)];
      const bodyDetalle = pedidos.map((p) =>
        dynamicColumns.map((col) => p[col.field] ?? "")
      );

      pdf.autoTable({
        startY: 40,
        head: headDetalle,
        body: bodyDetalle,
        styles: { fontSize: 8, cellWidth: "wrap" },
        theme: "grid",
      });
    }

    // -------- Tabla 2: Resumen por asesor --------
    if (resumenAsesores.length) {
      const startYResumen =
        (pdf.lastAutoTable && pdf.lastAutoTable.finalY + 30) || 40;

      pdf.setFontSize(14);
      pdf.text("Resumen por asesor", 40, startYResumen - 10);

      const headResumen = [resumenColumns.map((c) => c.header)];
      const bodyResumen = resumenAsesores.map((r) =>
        resumenColumns.map((col) => r[col.field] ?? "")
      );

      pdf.autoTable({
        startY: startYResumen,
        head: headResumen,
        body: bodyResumen,
        styles: { fontSize: 8, cellWidth: "wrap" },
        theme: "grid",
      });
    }

    pdf.save("liquidacion_pedidos.pdf");
  }


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

  const pedidosFiltrados = Object.keys(pedidosAgrupados || {}).reduce(
    (acc, estado) => {
      const pedidosDelEstado = (pedidosAgrupados[estado] || []).filter((item) => {
        const fechaPedido = new Date(item.createdAt);

        // 🔹 Si NO hay periodo definido → NO filtramos por fecha
        if (!periodoDesde && !periodoHasta) {
          return true;
        }

        // 🔹 Si hay "desde", normalizamos a comienzo de día
        if (periodoDesde) {
          const desde = new Date(periodoDesde);
          desde.setHours(0, 0, 0, 0);
          if (fechaPedido < desde) return false;
        }

        // 🔹 Si hay "hasta", normalizamos a final del día
        if (periodoHasta) {
          const hasta = new Date(periodoHasta);
          hasta.setHours(23, 59, 59, 999);
          if (fechaPedido > hasta) return false;
        }

        return true;
      });

      acc[estado] = pedidosDelEstado;
      return acc;
    },
    {}
  );

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


  // Inicializar filtros de la tabla de PEDIDOS
  const initFiltersPedidos = () => {
    const baseFilters = {
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    };

    dynamicColumns.forEach((col) => {
      baseFilters[col.field] = {
        value: null,
        matchMode: FilterMatchMode.CONTAINS, // o EQUALS según el caso
      };
    });

    setFiltersPedidos(baseFilters);
  };


  // Inicializar filtros de la tabla RESUMEN
  const initFiltersResumen = () => {
    setFiltersResumen({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
      idAsesor: { value: null, matchMode: FilterMatchMode.EQUALS },
      asesor_nombre: { value: null, matchMode: FilterMatchMode.CONTAINS },
      asesor_whatsapp: { value: null, matchMode: FilterMatchMode.CONTAINS },
      asesor_medio_pago: { value: null, matchMode: FilterMatchMode.CONTAINS },
    });
  };

  // Lanzar inicialización una sola vez
  useEffect(() => {
    initFiltersPedidos();
    initFiltersResumen();
  }, []);


  const renderHeader = (onClear, value, onChange) => (
    <div className="flex justify-content-between">
      <Button
        type="button"
        icon="pi pi-filter-slash"
        label="Limpiar filtros"
        onClick={onClear}
      />
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder="  Buscar..."
          className="p-inputtext p-component"
        />
      </span>
    </div>
  );

  // Handlers PEDIDOS
  const clearFilterPedidos = () => initFiltersPedidos();

  const onGlobalFilterChangePedidos = (e) => {
    const value = e.target.value;
    let _filters = { ...filtersPedidos };
    _filters['global'].value = value;
    setFiltersPedidos(_filters);
    setGlobalFilterPedidos(value);
  };

  // Handlers RESUMEN
  const clearFilterResumen = () => initFiltersResumen();

  const onGlobalFilterChangeResumen = (e) => {
    const value = e.target.value;
    let _filters = { ...filtersResumen };
    _filters['global'].value = value;
    setFiltersResumen(_filters);
    setGlobalFilterResumen(value);
  };

  // Headers finales
  const headerPedidos = renderHeader(
    clearFilterPedidos,
    globalFilterPedidos,
    onGlobalFilterChangePedidos
  );

  const headerResumen = renderHeader(
    clearFilterResumen,
    globalFilterResumen,
    onGlobalFilterChangeResumen
  );

  useEffect(() => {
    // Agrupa los registros por idAsesor
    const mapa = {};

    pedidos.forEach(item => {
      if (!item.idAsesor) return;

      const id = item.idAsesor;

      if (!mapa[id]) {
        mapa[id] = {
          idAsesor: id,
          asesor_nombre: item.asesor_nombre || '',
          asesor_whatsapp: item.asesor_whatsapp || '',
          asesor_medio_pago: item.asesor_medio_pago || '',
          total_pedidos: 0,
          total_comision: 0,
          total_a_pagar: 0,
        };
      }

      const comision = parseFloat(item.comision_valor || 0);
      const aPagar = parseFloat(item.valor_a_pagar_asesor || 0);

      mapa[id].total_pedidos += 1;
      mapa[id].total_comision += isNaN(comision) ? 0 : comision;
      mapa[id].total_a_pagar += isNaN(aPagar) ? 0 : aPagar;
    });

    setResumenAsesores(Object.values(mapa));
  }, [pedidos]);



  return (
    <div>
      <ToastContainer />

      <h1 className="titles-text-heading">Liquidacion Dropshipper</h1>

      {/* Barra superior: botones y links */}
      <div className="deFlexContent2">
        <div className="deFlex2">


          <button className="excel" onClick={descargarExcel}>
            <FontAwesomeIcon icon={faArrowDown} /> Excel
          </button>

          <button className="pdf" onClick={descargarPDF}>
            <FontAwesomeIcon icon={faArrowDown} /> PDF
          </button>
        </div>


      </div>

      {/* Vista de tarjetas o tabla principal */}
      {location?.pathname === "/dashboard/pedidos" ? (
        // === Vista de tarjetas (kanban por estado) ===
        <div className="cards-container">
          {estados?.map((estado) => (
            <div key={estado} className="estado-container">
              <h2>
                {estado} ({pedidosFiltrados[estado]?.length || 0})
              </h2>

              <div className="cards-row">
                {pedidosFiltrados[estado]?.map((item) => (
                  <div key={item.idPedido} className="card">
                    <h3>Id Pedido: {item.idPedido}</h3>

                    <span
                      style={{
                        color:
                          item.estado === "Pendiente"
                            ? "#DAA520"
                            : item.estado === "Preparacion"
                              ? "#0000FF"
                              : item.estado === "Rechazado"
                                ? "#FF0000"
                                : item.estado === "Entregado"
                                  ? "#008000"
                                  : "#3366FF ",
                      }}
                    >
                      {item.estado}
                    </span>

                    <span style={{ color: "#008000" }}> {item.tipo_pedido}</span>

                    <div className="card-actions">
                      <span style={{ color: "#008000" }}>
                        {moneda} {item.total}
                      </span>
                      <span>
                        {new Date(item?.createdAt)?.toLocaleString("es-ES", {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </span>
                      <span style={{ color: "#008000" }}>
                        {moneda} {item.total}
                      </span>
                    </div>

                    <span>Entrega: {item?.entrega}</span>
                    <span>Pagado: {item?.pagado}</span>

                    {detallesVisibles[item.idPedido] && (
                      <>
                        <span>Nombre: {item.nombre}</span>
                        <span>Teléfono: {item.telefono}</span>
                        <span>Pago: {item.pago}</span>
                      </>
                    )}

                    <button
                      onClick={() => toggleDetalles(item.idPedido)}
                      className="moreBtn"
                    >
                      {detallesVisibles[item.idPedido]
                        ? "Mostrar menos"
                        : "Mostrar más"}
                    </button>

                    <div className="card-actions">
                      <button
                        className="eliminar"
                        onClick={() => eliminar(item.idPedido)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>

                      <button
                        className="editar"
                        onClick={() => abrirModal(item)}
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </button>

                      <button
                        onClick={() => imprimirTicket2(item)}
                        className="editar"
                      >
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
        <TabView scrollable className="mt-4">

          {/* TABLA 1 — DETALLE DE PEDIDOS */}
          <TabPanel header="Detalle de pedidos">
            <div className="table-container">
              <DataTable
                className="tabla-pedidos"
                value={pedidos}
                filters={filtersPedidos}
                filterDisplay="row"
                globalFilterFields={[
                  "idPedido",
                  "idAsesor",
                  "asesor_nombre",
                  "pedido_cliente_nombre",
                  "medio_pago_comision",
                  "estado_comision",
                ]}
                header={headerPedidos}
                onFilter={(e) => setFiltersPedidos(e.filters)}
                scrollable
                scrollHeight="400px"
                stripedRows
                paginator
                rows={25}
                tableStyle={{ minWidth: "50rem" }}
              >
                {dynamicColumns.map((col) => (
                  <Column
                    key={col.field}
                    field={col.field}
                    header={col.header}
                    style={{ minWidth: col.minWidth }}
                    frozen={col.frozen}
                    sortable
                    filter
                    filterPlaceholder="Search by column"
                  />
                ))}
              </DataTable>
            </div>
          </TabPanel>

          {/* TABLA 2 — RESUMEN POR ASESOR */}
          <TabPanel header="Resumen por asesor">
            <div className="table-container">

              {/* Filtros de periodo para la liquidación */}
              <div className="flex gap-2 mb-3 align-items-center">
                <span>Periodo de liquidación:</span>

                <Calendar
                  value={periodoDesde}
                  onChange={(e) => setPeriodoDesde(e.value)}
                  dateFormat="dd/mm/yy"
                  placeholder="Desde"
                  showIcon
                />

                <Calendar
                  value={periodoHasta}
                  onChange={(e) => setPeriodoHasta(e.value)}
                  dateFormat="dd/mm/yy"
                  placeholder="Hasta"
                  showIcon
                />

                <Button
                  type="button"
                  label="Semana actual"
                  onClick={() => {
                    const hoy = new Date();
                    const diaSemana = hoy.getDay(); // 0 = domingo, 1 = lunes...
                    const lunes = new Date(hoy);
                    lunes.setDate(hoy.getDate() - (diaSemana === 0 ? 6 : diaSemana - 1));
                    const domingo = new Date(lunes);
                    domingo.setDate(lunes.getDate() + 6);
                    setPeriodoDesde(lunes);
                    setPeriodoHasta(domingo);
                  }}
                  className="p-button-sm p-button-outlined"
                />

                <Button
                  type="button"
                  label="Quitar periodo"
                  onClick={() => {
                    setPeriodoDesde(null);
                    setPeriodoHasta(null);
                    cargarPedidos(); // volvemos a traer todo sin filtro
                  }}
                  className="p-button-sm p-button-text"
                />

                {/* 👇 NUEVO: aplica las fechas actuales contra el backend */}
                <Button
                  type="button"
                  label="Aplicar periodo"
                  onClick={aplicarPeriodo}
                  className="p-button-sm p-button-help"
                />
              </div>


              <DataTable
                className="tabla-resumen"
                value={resumenAsesores}
                filters={filtersResumen}
                filterDisplay="row"
                globalFilterFields={[
                  "idAsesor",
                  "asesor_nombre",
                  "asesor_whatsapp",
                  "asesor_medio_pago",
                ]}
                header={headerResumen}
                onFilter={(e) => setFiltersResumen(e.filters)}
                scrollable
                scrollHeight="400px"
                stripedRows
                paginator
                rows={5}
                tableStyle={{ minWidth: "50rem" }}
              >
                {resumenColumns.map((col) => (
                  <Column
                    key={col.field}
                    field={col.field}
                    header={col.header}
                    style={{ minWidth: col.minWidth }}
                    sortable
                    filter
                    filterPlaceholder="Search by column"
                  />
                ))}
              </DataTable>
            </div>
          </TabPanel>


        </TabView>

      )}



      {/* ==== MODAL DETALLE PEDIDO ==== */}
      {modalVisible && (
        <Dialog
          header="Detalle del Pedido"
          visible={modalVisible}
          onHide={cerrarModal}
          style={{ width: "95vw", maxWidth: "920px" }}
          contentStyle={{ padding: 0 }}
          modal
          draggable={false}
          dismissableMask
        >
          {/* Top meta */}
          <div className="modal-topbar">
            <div className="modal-topbar__left">
              <h3># {pedido?.idPedido ?? "—"}</h3>
              <span className="badge">{pedido?.estado ?? "—"}</span>
              <span
                className={`badge ${pedido?.pagado === "Si" ? "ok" : "warn"
                  }`}
              >
                Pagado: {pedido?.pagado ?? "—"}
              </span>
              {pedido?.tipo_pedido && (
                <span className="badge subtle">{pedido.tipo_pedido}</span>
              )}
            </div>
            <div className="modal-topbar__right">
              <small className="muted">
                Creado: {pedido?.createdAt ?? "—"}
              </small>
              {pedido?.fecha_despacho && (
                <small className="muted">
                  {" "}
                  • Despacho: {pedido.fecha_despacho}
                </small>
              )}
            </div>
          </div>

          {/* Productos */}
          <div className="section">
            <h4 className="section-title">Productos del pedido</h4>
            <div className="products-grid">
              {Array.isArray(JSON.parse(pedido?.productos || "[]")) &&
                JSON.parse(pedido.productos).map((producto, i) => (
                  <div className="product-card" key={`${producto.titulo}-${i}`}>
                    <img
                      src={producto?.imagen1 || producto?.imagen}
                      alt={producto?.titulo}
                    />
                    <div className="body">
                      <div className="title" title={producto?.titulo}>
                        {producto?.titulo}
                      </div>
                      {!!producto?.items?.length && (
                        <div className="items">
                          {producto.items.join(", ")}
                        </div>
                      )}
                      <div className="footer">
                        <span className="price">
                          {moneda} {producto?.precio}
                        </span>
                        <span className="qty">x{producto?.cantidad}</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Información completa */}
          <div className="section">
            <h4 className="section-title">Información completa del pedido</h4>
            <div className="info-grid">
              {[
                ["ID Pedido", pedido.idPedido],
                ["Fecha de creación", pedido.createdAt],
                ["Nombre", pedido.nombre],
                ["Teléfono", pedido.telefono],
                ["Entrega", pedido.entrega],
                ["Estado", pedido.estado],
                ["Tipo de Pedido", pedido.tipo_pedido],
                ["Pago", pedido.pago],
                ["¿Pagado?", pedido.pagado],
                ["Pago al Recibir", pedido.pagoRecibir],
                ["Total", pedido.total],
                ["Total Productos", pedido.total_productos],
                ["Código Descuento", pedido.codigo],
                ["Forma de Pago", pedido.forma_pago],
                ["Tipo de Cupón", pedido.tipo_cupon],
                ["Valor del Cupón", pedido.valor_cupon],
                ["Total Cupón", pedido.total_cupon],
                ["Franja Horaria", pedido.franja_horario],
                ["Fecha Despacho", pedido.fecha_despacho],
                ["País (ID)", pedido.country_id],
                ["Departamento (ID)", pedido.state_id],
                ["Ciudad (ID)", pedido.city_id],
                ["Teléfono Transportador", pedido.telefono_tran],
              ].map(([label, val], idx) => (
                <div key={idx} className="info-row">
                  <label>{label}</label>
                  <span>{val ?? "—"}</span>
                </div>
              ))}

              <div className="info-row span-2">
                <label>Nota</label>
                <span>{pedido.nota ?? "—"}</span>
              </div>
            </div>
          </div>

          {/* Form de edición */}
          <div className="section">
            <h4 className="section-title">Actualizar pedido</h4>
            <form
              onSubmit={handleSubmit(onSubmitEdit)}
              className="form-grid"
            >
              <div>
                <Controller
                  name="transportadora"
                  control={control}
                  render={({ field }) => (
                    <InputText
                      {...field}
                      placeholder="Transportadora"
                      className="w-full"
                    />
                  )}
                />
              </div>

              <div>
                <Controller
                  name="numeroGuia"
                  control={control}
                  render={({ field }) => (
                    <InputText
                      {...field}
                      placeholder="Número de Guía"
                      className="w-full"
                    />
                  )}
                />
              </div>

              <div>
                <Controller
                  name="valorFlete"
                  control={control}
                  render={({ field }) => (
                    <InputText
                      {...field}
                      placeholder="Valor del Flete"
                      className="w-full"
                    />
                  )}
                />
              </div>

              <div>
                <Controller
                  name="estado"
                  control={control}
                  render={({ field }) => (
                    <Dropdown
                      {...field}
                      className="w-full"
                      placeholder="Estado"
                      options={[
                        { label: "Pendiente", value: "Pendiente" },
                        { label: "Entregado", value: "Entregado" },
                        { label: "Devolución", value: "Devolución" },
                        { label: "Cancelado", value: "Cancelado" },
                      ]}
                    />
                  )}
                />
                {errors.estado && (
                  <small className="p-error">{errors.estado.message}</small>
                )}
              </div>

              <div>
                <Controller
                  name="pagado"
                  control={control}
                  render={({ field }) => (
                    <Dropdown
                      {...field}
                      className="w-full"
                      placeholder="¿Pagado?"
                      options={[
                        { label: "Sí", value: "Si" },
                        { label: "No", value: "No" },
                      ]}
                    />
                  )}
                />
                {errors.pagado && (
                  <small className="p-error">{errors.pagado.message}</small>
                )}
              </div>

              {(watch("estado") === "Devolución" ||
                watch("estado") === "Cancelado") && (
                  <div className="span-2">
                    <Controller
                      name="notaPedidoInterna"
                      control={control}
                      render={({ field }) => (
                        <InputText
                          {...field}
                          placeholder="Motivo"
                          className="w-full"
                        />
                      )}
                    />
                    {errors.notaPedidoInterna && (
                      <small className="p-error">
                        {errors.notaPedidoInterna.message}
                      </small>
                    )}
                  </div>
                )}

              <div className="actions span-2">
                <Button
                  type="button"
                  label="Imprimir Ticket"
                  icon="pi pi-print"
                  className="p-button-text"
                  onClick={() => imprimirTicket2(pedido)}
                />
                <Button
                  type="button"
                  label="Descargar PDF"
                  icon="pi pi-download"
                  className="p-button-text"
                  onClick={handleDownloadPDF}
                />

                <span className="spacer" />

                <Button
                  type="submit"
                  label="Guardar"
                  className="p-button-success"
                />
              </div>
            </form>
          </div>
        </Dialog>
      )}
    </div>
  );

};
