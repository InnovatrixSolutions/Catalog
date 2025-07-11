import React, { useState, useEffect } from 'react';
import baseURL from '../../url';
import './NewPedido.css';
import { ToastContainer, toast } from 'react-toastify';
import moneda from '../../moneda';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

import { TabView, TabPanel } from 'primereact/tabview';
import { Button } from 'primereact/button';

import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';
import { InputTextarea } from 'primereact/inputtextarea';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { ScrollPanel } from 'primereact/scrollpanel';

import 'primereact/resources/themes/saga-blue/theme.css';  // or another theme
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { Card } from 'primereact/card';










const medioPagoLista = [
  { label: "Nequi", value: "Nequi" },
  { label: "Bancolombia", value: "Bancolombia" },
  { label: "Bold (Tarjeta)", value: "Bold (Tarjeta)" },
  { label: "Daviplata", value: "Daviplata" },
  { label: "Mercadopago", value: "Mercadopago" },
  { label: "Addi", value: "Addi" },
  { label: "Sistecredito", value: "Sistecredito" },
  { label: "Otro", value: "Otro" },
];

const franjasHorarias = [
  // { label: "05:00-10:00 AM", value: "05:00-10:00 AM" },
  // { label: "10:00-03:00 PM", value: "10:00-03:00 PM" },
  // { label: "03:00-07:00 PM", value: "03:00-07:00 PM" },
  { label: "08:00-20:00 PM", value: "08:00-20:00 PM" },
];





export default function NewPedido() {


  // Opciones de ejemplo. Puedes traerlas de API si prefieres.
  const [esDropshipper, setEsDropshipper] = useState(false);


  const tipoPedido = esDropshipper ? 'dropshipper' : 'catalogo';


const schemaDropshipper = z.object({
  // Asesor
  documento: z.string().min(1, "Documento requerido"),
  pin_asesor: z.string().optional(),
  email: z.string().email("Email inválido"),
  nombre: z.string().min(1, "Nombre requerido"),
  telefono: z.string().min(7, "Teléfono inválido"),
  medioComision: z.string().min(1, "Seleccione comisión"),
  otroMedio: z.string().optional(),
  valor: z.coerce.number().min(1, "Debe ingresar un valor válido"),

  // Cliente
  clienteNombre: z.string().min(1, "Nombre requerido"),
  clienteDocumento: z.string().min(1, "Documento requerido"),
  clienteCelular: z.string().min(7, "Celular inválido"),
  clienteTransportadora: z.string().min(7, "Celular inválido"),
  // Entrega
  fechaDespacho: z.string().min(1, "Fecha requerida"),
  franjaEntrega: z.array(z.string()).min(1, "Seleccione al menos una franja"),
  departamento: z.number().min(1, "Departamento requerido"),
  ciudad: z.number().min(1, "Ciudad requerida"),
  direccion: z.string().min(1, "Dirección requerida"),
  barrio: z.string().min(1, "Barrio requerido"),
  notas: z.string().optional(),
  // Pago
  incluyeEnvio: z.enum(["Sí", "No"]),
  transferencia: z.enum(["Sí", "No"]),
  contraentrega: z.enum(["Sí", "No"]),
  metodoPago: z.string().optional(),
  otroMetodoPago: z.string().optional(),
  // Productos
  productosSeleccionados: z.array(
    z.object({
      idProducto: z.any(),
      titulo: z.string(),
      precio: z.any(),
      cantidad: z.number(),
    })
  ).min(1, "Debes seleccionar al menos un producto"),
});

const schemaCatalogo = z.object({
  // NO asesor
  clienteNombre: z.string().min(1, "Nombre requerido"),
  clienteDocumento: z.string().min(1, "Documento requerido"),
  clienteCelular: z.string().min(7, "Celular inválido"),
  clienteTransportadora: z.string().min(7, "Celular inválido"),
  fechaDespacho: z.string().min(1, "Fecha requerida"),
  franjaEntrega: z.array(z.string()).min(1, "Seleccione al menos una franja"),
  departamento: z.number().min(1, "Departamento requerido"),
  ciudad: z.number().min(1, "Ciudad requerida"),
  direccion: z.string().min(1, "Dirección requerida"),
  barrio: z.string().min(1, "Barrio requerido"),
  notas: z.string().optional(),
  incluyeEnvio: z.enum(["Sí", "No"]),
  transferencia: z.enum(["Sí", "No"]),
  contraentrega: z.enum(["Sí", "No"]),
  metodoPago: z.string().optional(),
  otroMetodoPago: z.string().optional(),
  productosSeleccionados: z.array(
    z.object({
      idProducto: z.any(),
      titulo: z.string(),
      precio: z.any(),
      cantidad: z.number(),
    })
  ).min(1, "Debes seleccionar al menos un producto"),
});

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(esDropshipper ? schemaDropshipper : schemaCatalogo),
    defaultValues: {
      documento: "",
      pin_asesor: "",
      email: "",
      nombre: "",
      telefono: "",
      medioComision: "",
      otroMedio: "",
      valor: "",
      clienteNombre: "",
      clienteDocumento: "",
      clienteCelular: "",
      clienteTransportadora: "",
      fechaDespacho: "",
      franjaEntrega: ["08:00-20:00 PM"], // Valor por defecto
      departamento: "",
      ciudad: "",
      direccion: "",
      barrio: "",
      notas: "",
      incluyeEnvio: "No",
      transferencia: "No",
      contraentrega: "Sí",
      metodoPago: "",
      otroMetodoPago: "",
      productosSeleccionados: [],
    },
  });

  const [departamentos, setDepartamentos] = useState([]);
  const [ciudades, setCiudades] = useState([]);

  // Obtén el país y departamento seleccionados del formulario
  const country_id = "48";
  const departamentoSeleccionado = watch("departamento");

  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorModalMsg, setErrorModalMsg] = useState('');


  // Demo: listado de productos (sustituye esto por tu API)
  const catalogoProductos = [
    { idProducto: 1, titulo: "Camiseta", precio: 25000 },
    { idProducto: 2, titulo: "Gorra", precio: 12000 },
    { idProducto: 3, titulo: "Tenis", precio: 90000 },
  ];

  // Demo: selecciona productos y cantidades
  const productosSeleccionados = watch("productosSeleccionados");
  const actualizarCantidad = (idx, incremento) => {
    const nuevos = [...productosSeleccionados];
    const actual = { ...nuevos[idx] };
    actual.cantidad = Math.max(1, (actual.cantidad || 1) + incremento);
    nuevos[idx] = actual;
    setValue("productosSeleccionados", nuevos);
  };
  const seleccionarProducto = (producto) => {
    const existe = productosSeleccionados.find(
      (p) => p.idProducto === producto.idProducto
    );
    let nuevos;
    if (existe) {
      nuevos = productosSeleccionados.filter(
        (p) => p.idProducto !== producto.idProducto
      );
    } else {
      nuevos = [
        ...productosSeleccionados,
        { ...producto, cantidad: 1 },
      ];
      console.log("Productos seleccionados:", nuevos);

    }
    setValue("productosSeleccionados", nuevos);
  };

  // TOTAL
  const total = productosSeleccionados.reduce(
    (acc, p) => acc + p.precio * p.cantidad,
    0
  );

  // SUBMIT
  // const onSubmit = async (data) => {
  //   console.log("onSubmit fired!", data);

  //   try {
  //     // Prepare products array for backend
  //     const productosPedido = data.productosSeleccionados.map(item => ({
  //         idProducto: item.idProducto,
  //         idCategoria: item.idCategoria,
  //         titulo: item.titulo,
  //         cantidad: item.cantidad,
  //         items: item.items || [],
  //         precio: item.precio,
  //         imagen: item.imagen1 || item.imagen2 || item.imagen3 || item.imagen4 || ''
  //     }));

  //     // Armamos el objeto plano para depuración
  // const pedidoObj = {
  //   tipo_pedido: "dropshipper",

  //   doc_asesor: data.documento,
  //   pin_asesor: data.pin_asesor || '',
  //   nombre_asesor: data.nombre,
  //   telefono_asesor: data.telefono,
  //   telefono_whatsapp:data.telefono,
  //   medio_pago_asesor: data.medioComision,
  //   email: data.email,

  //   productos: productosPedido,
  //   //productos: [{ "items": [], "imagen": "", "precio": 99900, "titulo": "Consola Juegos M8 Inalámbrica Game Stick Lite 64gb Ps1 Emuladores", "cantidad": 1, "idProducto": 47, "idCategoria": 17 }, { "items": [], "imagen": "", "precio": 167900, "titulo": "Roku Express Hd Convertidor Tv En Smart A Tv Streaming", "cantidad": 1, "idProducto": 3, "idCategoria": 14 }, { "items": [], "imagen": "", "precio": 119900, "titulo": "Marcadores Doble Punta Set 168 Colores Dibujo Base De Alcohol", "cantidad": 1, "idProducto": 40, "idCategoria": 12 }],

  //   total_pedido: data.valor,
  //   nombre_cliente: data.clienteNombre,
  //   telefono_cliente: data.clienteCelular,
  //   telefono_tran: data.clienteTransportadora,


  //   direccion_entrega: data.direccion,

  //   country_id: 48, // o data.country_id si fuera editable
  //   state_id: data.departamento,
  //   city_id: data.ciudad,

  //   //fecha_despacho: data.fechaDespacho,
  //   fecha_despacho: "2025-06-05 21:01:00",
  //   franja_horario: data.franjaEntrega.join(','),

  //   nota: data.notas || '',

  //   pago_recibir: data.valor,
  //   medio_pago:'efectivo',
  //   forma_pago:"Nequi",


  //   //otroMedio: data.otroMedio || '',
  //   //clienteDocumento: data.clienteDocumento,
  //   // barrio: data.barrio,
  //   // incluyeEnvio: data.incluyeEnvio,
  //   // transferencia: data.transferencia,
  //   // contraentrega: data.contraentrega,
  //   // metodoPago: data.metodoPago || '',
  //   // otroMetodoPago: data.otroMetodoPago || '',


  // };

  // console.log("Objeto que será enviado al backend:", pedidoObj);

  //     // Build FormData for PHP backend

  //     const formData = new FormData();
  // for (const key in pedidoObj) {
  //   // Si es el campo de productos (un array), mándalo como string
  //   if (key === 'productos') {
  //     formData.append(key, JSON.stringify(pedidoObj[key]));
  //   } else {
  //     formData.append(key, pedidoObj[key] !== null ? String(pedidoObj[key]) : '');
  //   }
  // }


  //    const response = await fetch(`${baseURL}/pedidosPost.php`, {
  //   method: 'POST',
  //   body: formData
  // });
  // const result = await response.json();
  // if (result.success) {
  //   toast.success("Pedido enviado correctamente.");
  // } else {
  //   toast.error(result.error || "Error en el envío del pedido.");
  // }


  //   } catch (error) {
  //     toast.error("Error en la petición. Intenta de nuevo.");
  //         setErrorModalMsg(error.message || JSON.stringify(error));
  //     setErrorModalOpen(true);
  //     console.error("Error enviando pedido:", error);
  //     console.error("Error enviando pedido:", error);
  //   }
  // };


  const onSubmit = async (data) => {
    let pedidoObj;
      if (esDropshipper && data.valor < total) {
    setErrorModalMsg(`El valor debe ser igual o mayor al total de productos: $${total}`);
    setErrorModalOpen(true);
    return;
  }

    if (tipoPedido === 'dropshipper') {
      pedidoObj = {
        tipo_pedido: "dropshipper",
        doc_asesor: data.documento,
        pin_asesor: data.pin_asesor || '',
        nombre_asesor: data.nombre,
        telefono_asesor: data.telefono,
        telefono_whatsapp: data.telefono,
        medio_pago_asesor: data.medioComision,
        email: data.email,
        productos: data.productosSeleccionados.map(item => ({
          idProducto: item.idProducto,
          idCategoria: item.idCategoria,
          titulo: item.titulo,
          cantidad: item.cantidad,
          items: item.items || [],
          precio: item.precio,
          imagen: item.imagen1 || item.imagen2 || item.imagen3 || item.imagen4 || ''
        })),
        total_pedido: data.valor,
        nombre_cliente: data.clienteNombre,
        telefono_cliente: data.clienteCelular,
        telefono_tran: data.clienteTransportadora,
        direccion_entrega: data.direccion,
        country_id: 48,
        state_id: data.departamento,
        city_id: data.ciudad,
        // fecha_despacho: data.fechaDespacho,
        fecha_despacho: "2025-06-05 21:01:00",
        franja_horario: data.franjaEntrega.join(','),
        nota: data.notas || '',
        pago_recibir: data.valor,
        medio_pago: data.metodoPago || 'efectivo',
        forma_pago: "Nequi",
        // ...otros campos según tu lógica
      };
    } else if (tipoPedido === 'catalogo') {
      pedidoObj = {
        tipo_pedido: "catalogo",
        // **NO INCLUYE** datos de asesor
        productos: data.productosSeleccionados.map(item => ({
          idProducto: item.idProducto,
          idCategoria: item.idCategoria,
          titulo: item.titulo,
          cantidad: item.cantidad,
          items: item.items || [],
          precio: item.precio,
          imagen: item.imagen1 || item.imagen2 || item.imagen3 || item.imagen4 || ''
        })),
        total_pedido: data.productosSeleccionados.reduce((acc, p) => acc + p.precio * p.cantidad, 0),
        nombre_cliente: data.clienteNombre,
        telefono_cliente: data.clienteCelular,
        telefono_tran: data.clienteTransportadora,
        direccion_entrega: data.direccion,
        country_id: 48,
        state_id: data.departamento,
        city_id: data.ciudad,
        fecha_despacho: "2025-06-05 21:01:00",
        franja_horario: data.franjaEntrega.join(','),
        nota: data.notas || '',
        pago_recibir: data.productosSeleccionados.reduce((acc, p) => acc + p.precio * p.cantidad, 0),
        medio_pago: data.metodoPago || 'efectivo',
        forma_pago: "Nequi",
        // ...otros campos que necesites
      };
    }

    // ... resto del código: prepara FormData y hace el fetch
    console.log("Objeto que será enviado al backend:", pedidoObj);

    try {
      const formData = new FormData();
      for (const key in pedidoObj) {
        if (key === 'productos') {
          formData.append(key, JSON.stringify(pedidoObj[key]));
        } else {
          formData.append(key, pedidoObj[key] !== null ? String(pedidoObj[key]) : '');
        }
      }

      const response = await fetch(`${baseURL}/pedidosPost.php`, {
        method: 'POST',
        body: formData
      });
      const result = await response.json();
      if (result.success) {
        toast.success("Pedido enviado correctamente.");
      } else {
        toast.error(result.error || "Error en el envío del pedido.");
      }
    } catch (error) {
      toast.error("Error en la petición. Intenta de nuevo.");
      setErrorModalMsg(error.message || JSON.stringify(error));
      setErrorModalOpen(true);
      console.error("Error enviando pedido:", error);
    }
  };


  // const [estado, setEstado] = useState('');
  // const [pagado, setPagado] = useState('');
  // const [entrega, setEntrega] = useState('Sucursal');
  // const [pago, setPago] = useState('');

  const [filtroTitulo, setFiltroTitulo] = useState('');

  // const [nota, setNota] = useState('');
  // const [codigo, setCodigo] = useState('');


  const [modalOpen, setModalOpen] = useState(false);
  const [modalOpen2, setModalOpen2] = useState(false);

  // const [nombre, setNombre] = useState('');
  // const [telefono, setTelefono] = useState('');


  const [productos, setProductos] = useState([]); // [{ idProducto, titulo, precio, cantidad, ... }]

  let now = new Date();
  let offset = -3 * 60; // Argentina está a GMT-3
  let argentinaTime = new Date(now.getTime() + offset * 60 * 1000);
  let createdAt = argentinaTime.toISOString().slice(0, 19).replace('T', ' ');

  const toggleModal = () => {

    setModalOpen(!modalOpen);
  };
  const toggleModal2 = () => {
    setModalOpen2(!modalOpen2);
  };

  useEffect(() => {
    cargarProductos();
    cargarMetodos()
  }, []);


  const cargarProductos = () => {
    fetch(`${baseURL}/productosGet.php`, { method: 'GET' })
      .then(response => response.json())
      .then(data => {
        setProductos(data.productos || []);
      })
      .catch(error => console.error('Error al cargar productos:', error));
  };
  const cargarMetodos = () => {
    fetch(`${baseURL}/metodoGet.php`, {
      method: 'GET',
    })
      .then(response => response.json())
      .then(data => {
        // Filtra solo los métodos con estado "Activo"
        // const metodosActivos = (data.metodos || [])?.filter(metodo => metodo.estado === 'Activo');
        // setMetodos(metodosActivos);
        // console.log(metodosActivos);
      })
      .catch(error => console.error('Error al cargar datos bancarios:', error));
  };
  const obtenerImagen = (item) => {
    return item.imagen1 || item.imagen2 || item.imagen3 || item.imagen4 || null;
  };

  const filtrarProductos = (e) => {
    setFiltroTitulo(e.target.value);
  };

  const productosFiltrados = productos.filter(producto =>
    producto.titulo.toLowerCase().includes(filtroTitulo.toLowerCase())
  );

  useEffect(() => {
    if (country_id) { // This will always be true!
      const obtenerDepartamentos = async () => {
        try {
          const formData = new FormData();
          formData.append('country_id', country_id);
          const response = await fetch(`${baseURL}/statesGet.php`, {
            method: 'POST',
            body: formData
          });
          const data = await response.json();
          setDepartamentos((data.data.states || []).map(dep => ({
            label: dep.name,
            value: dep.id
          })));
          setValue('departamento', '');
          setValue('ciudad', '');
          setCiudades([]);
        } catch (error) {
          setDepartamentos([]);
          setCiudades([]);
        }
      };
      obtenerDepartamentos();
    }
  }, [country_id, setValue]);


  useEffect(() => {
    // Al cambiar departamento, cargar ciudades
    if (departamentoSeleccionado) {
      const obtenerCiudades = async () => {
        try {
          const formData = new FormData();
          formData.append('country_id', country_id);
          formData.append('state_id', departamentoSeleccionado);
          const response = await fetch(`${baseURL}/citiesGet.php?country_id=${country_id}&state_id=${departamentoSeleccionado}`, {
            method: 'POST',
            body: formData
          });
          const data = await response.json();
          setCiudades((data.data.states || []).map(c => ({
            label: c.name,
            value: c.id
          })));
          setValue('ciudad', '');
        } catch (error) {
          setCiudades([]);
        }
      };
      obtenerCiudades();
    }
  }, [departamentoSeleccionado, country_id, setValue]);



  const resumenPedido = [
    { campo: "Documento Asesor", valor: watch("documento") },
    { campo: "Nombre Asesor", valor: watch("nombre") },
    { campo: "Teléfono Asesor", valor: watch("telefono") },
    { campo: "Email Asesor", valor: watch("email") },
    { campo: "Comisión", valor: watch("medioComision") },
    { campo: "Valor Comisión", valor: watch("valor") },
    { campo: "Nombre Cliente", valor: watch("clienteNombre") },
    { campo: "Documento Cliente", valor: watch("clienteDocumento") },
    { campo: "Celular Cliente", valor: watch("clienteCelular") },
    { campo: "Celular Transportadora", valor: watch("clienteTransportadora") },
    { campo: "Fecha Despacho", valor: watch("fechaDespacho") },
    { campo: "Franja Entrega", valor: (watch("franjaEntrega") || []).join(', ') },
    { campo: "Departamento", valor: departamentos.find(d => d.value === watch("departamento"))?.label },
    { campo: "Ciudad", valor: ciudades.find(c => c.value === watch("ciudad"))?.label },
    { campo: "Dirección", valor: watch("direccion") },
    { campo: "Barrio", valor: watch("barrio") },
    { campo: "Notas", valor: watch("notas") },
    { campo: "Incluye Envío", valor: watch("incluyeEnvio") },
    { campo: "Transferencia", valor: watch("transferencia") },
    { campo: "Contraentrega", valor: watch("contraentrega") },
    { campo: "Método de Pago", valor: watch("metodoPago") },
    { campo: "Otro Método de Pago", valor: watch("otroMetodoPago") },
  ];

  const onFormError = (formErrors) => {
    console.log('FORM ERROR', formErrors);
    const errorMsgs = Object.values(formErrors)
      .map(err => err?.message || (err?.types && Object.values(err.types).join(", ")))
      .filter(Boolean)
      .join("\n");

    setErrorModalMsg(errorMsgs || "Hay errores en el formulario. Revisa los campos obligatorios.");
    setErrorModalOpen(true);
  };



  return (
    <div className='NewPedido'>
      <ToastContainer />
      <button onClick={toggleModal} className='btnSave'>
        <span>+</span> Agregar
      </button>

      {errorModalOpen && (
        <div className="modal" style={{ zIndex: 9999 }}>
          <div className="modal-content" style={{ maxWidth: 420, margin: "10vh auto", padding: 30 }}>
            <h3 style={{ color: "#d32f2f", marginBottom: 18 }}>¡Error!</h3>
            <div style={{ color: "#111", marginBottom: 18, wordBreak: "break-all" }}>
              {errorModalMsg}
            </div>
            <Button onClick={() => setErrorModalOpen(false)} className="p-button-danger">
              Cerrar
            </Button>
          </div>
        </div>
      )}


      {modalOpen && (
        <div className='modal'>
          <div className='modal-content'>
            <div className='deFlexBtnsModal'>
              <button className='selected'>Agregar Pedido Sucursal</button>
              <span className="close" onClick={toggleModal}>&times;</span>
            </div>
            <legend>(*) Campos obligatorios</legend>

            <div style={{ margin: '12px 0' }}>
              <label>
                <input
                  type="checkbox"
                  checked={esDropshipper}
                  onChange={e => setEsDropshipper(e.target.checked)}
                />{" "}
                ¿El Pedido es de Dropshipper? Marca la casilla si es así.
              </label>
            </div>


            <ToastContainer />
            <form onSubmit={handleSubmit(onSubmit, onFormError)}>
              <TabView>

                {esDropshipper && (


                  <TabPanel header="Asesor" >

                  <Card title="Datos de tu asesor" style={{ marginBottom: 20 }}>
                    <label>Documento</label>
                    <InputText {...register("documento")} />
                    {errors.documento && <small className="p-error">{errors.documento.message}</small>}

                    <label>PIN Asesor</label>
                    <InputText {...register("pin_asesor")} />

                    <label>Email</label>
                    <InputText {...register("email")} />
                    {errors.email && <small className="p-error">{errors.email.message}</small>}

                    <label>Nombre</label>
                    <InputText {...register("nombre")} />
                    {errors.nombre && <small className="p-error">{errors.nombre.message}</small>}

                    <label>Teléfono</label>
                    <InputText {...register("telefono")} />
                    {errors.telefono && <small className="p-error">{errors.telefono.message}</small>}

                    <label>¿Dónde recibe el dropshipper la comisión?</label>
                    <Controller
                      name="medioComision"
                      control={control}
                      render={({ field }) => (
                        <Dropdown {...field} options={medioPagoLista} placeholder="Seleccione comisión" />
                      )}
                    />
                    {errors.medioComision && <small className="p-error">{errors.medioComision.message}</small>}
                    {watch("medioComision") === "Otro" && (
                      <>
                        <label>¿Cuál?</label>
                        <InputText {...register("otroMedio")} />
                      </>
                    )}

                  </Card>

                  </TabPanel>
                )}
                {/* 2. Cliente */}

                <TabPanel header="Cliente">
                  <Card title="Datos de tu cliente" style={{ marginBottom: 20 }}>
                  <label>Nombre de tu cliente</label>
                  <InputText {...register("clienteNombre")} />
                  {errors.clienteNombre && <small className="p-error">{errors.clienteNombre.message}</small>}

                  <label>Documento de tu cliente</label>
                  <InputText {...register("clienteDocumento")} />
                  {errors.clienteDocumento && <small className="p-error">{errors.clienteDocumento.message}</small>}

                  <label>Celular Whatsapp de tu cliente</label>
                  <InputText {...register("clienteCelular")} />
                  {errors.clienteCelular && <small className="p-error">{errors.clienteCelular.message}</small>}

                  <label>Celular Llamadas de tu cliente</label>
                  <InputText {...register("clienteTransportadora")} />
                  {errors.clienteTransportadora && <small className="p-error">{errors.clienteTransportadora.message}</small>}
                  </Card>
                </TabPanel>
                {/* 3. Entrega */}
                <TabPanel header="Entrega">

                  <Card title="Datos de la entrega" style={{ marginBottom: 20 }}>
                  <label>Fecha Despacho</label>
                  <InputText type="date" {...register("fechaDespacho")} />
                  {errors.fechaDespacho && <small className="p-error">{errors.fechaDespacho.message}</small>}

                  <label>Franja Horaria</label>
                  <Controller
                    name="franjaEntrega"
                    control={control}
                    render={({ field }) => (
                      <MultiSelect {...field} options={franjasHorarias} disabled="true" placeholder="Selecciona una o más" display="chip" />
                    )}
                  />
                  {errors.franjaEntrega && <small className="p-error">{errors.franjaEntrega.message}</small>}

                  <div className="formgrid grid">




                    <div className="col-12 md:col-6">
                      <label>Departamento</label>
                      <Controller
                        name="departamento"
                        control={control}
                        render={({ field }) => (
                          <Dropdown
                            {...field}
                            options={departamentos}
                            placeholder="Seleccione un departamento"
                            className="w-full"
                            disabled={!country_id}
                          />
                        )}
                      />
                      {errors.departamento && <small className="p-error">{errors.departamento.message}</small>}
                    </div>

                    <div className="col-12 md:col-6">
                      <label>Ciudad</label>
                      <Controller
                        name="ciudad"
                        control={control}
                        render={({ field }) => (
                          <Dropdown
                            {...field}
                            options={ciudades}
                            placeholder="Seleccione una ciudad"
                            className="w-full"
                            disabled={!departamentoSeleccionado}
                          />
                        )}
                      />
                      {errors.ciudad && <small className="p-error">{errors.ciudad.message}</small>}
                    </div>


                  </div>

                  <label>Dirección</label>
                  <InputText {...register("direccion")} />
                  {errors.direccion && <small className="p-error">{errors.direccion.message}</small>}

                  <label>Barrio</label>
                  <InputText {...register("barrio")} />
                  {errors.barrio && <small className="p-error">{errors.barrio.message}</small>}

                  <label>Notas</label>
                  <InputTextarea {...register("notas")} rows={3} autoResize />
                  </Card>

                </TabPanel>
                {/* 4. Pago */}
                <TabPanel header="Pago">
                  <div className="field">
                    <label>Valor a cobrar al cliente</label>
                    <Controller
                      name="valor"
                      control={control}
                      render={({ field }) => (
                        <InputNumber
                          inputRef={field.ref}
                          value={field.value}
                          onValueChange={e => field.onChange(e.value)}
                          onBlur={field.onBlur}
                          mode="decimal"
                          min={0}
                          useGrouping={false}
                        />
                      )}
                    />
                    {errors.valor && <small className="p-error">{errors.valor.message}</small>}
                  </div>

                  <div className="field">
                    <label>Incluye Envío</label>
                    <Controller
                      name="incluyeEnvio"
                      control={control}
                      render={({ field }) => (
                        <Dropdown {...field} options={[
                          { label: "Sí", value: "Sí" },
                          { label: "No", value: "No" }
                        ]} placeholder="Seleccione" />
                      )}
                    />
                    {errors.incluyeEnvio && <small className="p-error">{errors.incluyeEnvio.message}</small>}
                  </div>

                  <div className="field">
                    <label>Transferencia</label>
                    <Controller
                      name="transferencia"
                      control={control}
                      render={({ field }) => (
                        <Dropdown {...field} options={[
                          { label: "Sí", value: "Sí" },
                          { label: "No", value: "No" }
                        ]} placeholder="Seleccione" />
                      )}
                    />
                    {errors.transferencia && <small className="p-error">{errors.transferencia.message}</small>}
                  </div>

                  {watch("transferencia") === "No" && (
                    <div className="field">
                      <label>Contraentrega</label>
                      <Controller
                        name="contraentrega"
                        control={control}
                        render={({ field }) => (
                          <Dropdown {...field} options={[
                            { label: "Sí", value: "Sí" },
                            { label: "No", value: "No" }
                          ]} placeholder="Seleccione" />
                        )}
                      />
                      {errors.contraentrega && <small className="p-error">{errors.contraentrega.message}</small>}

                      {watch("contraentrega") === "No" && (
                        <>
                          <div className="field">
                            <label>Método de Pago</label>
                            <Controller
                              name="metodoPago"
                              control={control}
                              render={({ field }) => (
                                <Dropdown {...field} options={medioPagoLista} placeholder="Seleccione" />
                              )}
                            />
                            {errors.metodoPago && <small className="p-error">{errors.metodoPago.message}</small>}
                          </div>

                          {watch("metodoPago") === "Otro" && (
                            <div className="field">
                              <label>¿Cuál?</label>
                              <InputText {...register("otroMetodoPago")} />
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                  
                </TabPanel>

                {/* 5. Productos */}
                <TabPanel header="Productos">
                  <Card title="Lista de productos" style={{ marginBottom: 20 }}>
                  {/* Filtro de búsqueda de PrimeReact */}
                  <div style={{ marginBottom: 12 }}>
                    <InputText
                      value={filtroTitulo}
                      onChange={filtrarProductos}
                      placeholder="Buscar producto..."
                      className="w-full"
                    />
                  </div>
                  {/* Lista con scroll */}
                  <div style={{ maxHeight: 350, overflowY: 'auto', marginBottom: 12, paddingRight: 8 }}>
                    {productosFiltrados.length === 0 && (
                      <div style={{ padding: 16, color: '#888' }}>No se encontraron productos</div>
                    )}
                    {productosFiltrados.map((producto) => {
                      const checked = productosSeleccionados.some((p) => p.idProducto === producto.idProducto);
                      const selectedProd = productosSeleccionados.find((p) => p.idProducto === producto.idProducto);
                      return (

                        <div
                          key={producto.idProducto}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            marginBottom: 8,
                            borderBottom: "1px solid #e0e0e0",
                            paddingBottom: 6,
                          }}
                        >

                          <img src={producto.imagen} alt="imagen" />

                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => seleccionarProducto(producto)}
                          />

                          <span style={{ minWidth: 120, flex: 1 }}> {producto.titulo}</span>
                          <span style={{ minWidth: 120, flex: 1 }}>  (${producto.precio})</span>
                          {checked && (
                            <>
                              <Button
                                type="button"
                                icon="pi pi-minus"
                                onClick={() => {
                                  const idx = productosSeleccionados.findIndex((p) => p.idProducto === producto.idProducto);
                                  if (idx !== -1) actualizarCantidad(idx, -1);
                                }}
                                disabled={selectedProd?.cantidad <= 1}
                                size="small"
                                severity="secondary"
                                rounded
                                text
                              />
                              <span style={{ margin: "0 8px" }}>{selectedProd?.cantidad || 1}</span>
                              <Button
                                type="button"
                                icon="pi pi-plus"
                                onClick={() => {
                                  const idx = productosSeleccionados.findIndex((p) => p.idProducto === producto.idProducto);
                                  if (idx !== -1) actualizarCantidad(idx, 1);
                                }}
                                size="small"
                                severity="success"
                                rounded
                                text
                              />
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ marginTop: 12, fontWeight: 600 }}>
                    Total: ${total}
                  </div>
                  {errors.productosSeleccionados && (
                    <small className="p-error">{errors.productosSeleccionados.message}</small>
                  )}
               </Card>
                </TabPanel>


                {/* 6. Resumen */}
                <TabPanel header="Resumen">

                  <Card title="Resumen del Pedido" style={{ marginBottom: 20 }}>
                    <div style={{ height: 350, overflow: 'auto' }}>
                      <h3 style={{ marginBottom: 12 }}>Resumen del Pedido</h3>
                      <DataTable value={resumenPedido.filter(item => item.valor && item.valor !== "")} showGridlines size="small" style={{ marginBottom: 20 }}>
                        <Column field="campo" header="Campo" />
                        <Column field="valor" header="Valor" />
                      </DataTable>


                      <h3 style={{ margin: "18px 0 12px" }}>Productos Seleccionados</h3>
                      <DataTable value={productosSeleccionados} showGridlines responsiveLayout="scroll" size="small" style={{ marginBottom: 20 }}>
                        <Column field="titulo" header="Producto" />
                        <Column field="cantidad" header="Cantidad" style={{ width: 80, textAlign: 'center' }} />
                        <Column field="precio" header="Precio Unitario" body={(row) => `$${Number(row.precio).toLocaleString()}`} style={{ width: 120, textAlign: 'right' }} />
                        <Column header="Subtotal" body={(row) => `$${(row.precio * row.cantidad).toLocaleString()}`} style={{ width: 120, textAlign: 'right', fontWeight: 600 }} />
                      </DataTable>
                      <div style={{ textAlign: 'right', fontWeight: 'bold', fontSize: 18 }}>
                        Total: ${total.toLocaleString()}
                      </div>

                    </div>
                  </Card>
                  <Button type="submit" className="p-button-success">
                    Guardar Pedido
                  </Button>
                </TabPanel>
              </TabView>
              <h1>Total: ${total}</h1>
            </form>



            {modalOpen2 && (
              <div className='modal'>
                <div className='modal-content'>
                  <div className='deFlexBtnsModal'>
                    <button className='selected'>Seleccionar Productos</button>
                    <span className="close" onClick={toggleModal2}>&times;</span>
                  </div>
                  <div id='deFlexInputs'>
                    <div className='search'>
                      <FontAwesomeIcon icon={faSearch} className="search-icon" />
                      <input
                        type="text"
                        placeholder="Buscar.."
                        value={filtroTitulo}
                        onChange={filtrarProductos}
                        className="input"
                      />
                    </div>
                    <button onClick={toggleModal2} className='btnSave'>
                      Aceptar
                    </button>
                  </div>
                  <div className='productsGrap'>
                    {productosFiltrados?.map(producto => (
                      <div key={producto.idProducto} className='cardProductData' >
                        <input
                          type="checkbox"
                          checked={productosSeleccionados?.some(p => p.idProducto === producto.idProducto)}
                          onChange={() => seleccionarProducto(producto)}
                        />
                        <img src={obtenerImagen(producto)} alt="imagen" />
                        <div className='cardProductDataText'>
                          <h3>
                            {producto.titulo}
                          </h3>
                          <strong> {moneda} {producto.precio}</strong>
                          {productosSeleccionados?.some(p => p.idProducto === producto.idProducto) && (
                            <div className='deFlexCart'>
                              <button onClick={() => actualizarCantidad(producto.idProducto, -1)}>-</button>
                              <span>{productosSeleccionados?.find(p => p.idProducto === producto.idProducto)?.cantidad || 1}</span>
                              <button onClick={() => actualizarCantidad(producto.idProducto, 1)}>+</button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}



          </div>
        </div>
      )}
    </div>
  );
}
