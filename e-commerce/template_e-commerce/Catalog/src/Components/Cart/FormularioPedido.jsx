import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { RadioButton } from 'primereact/radiobutton';
import { Calendar } from 'primereact/calendar';
import { Stepper } from 'primereact/stepper';
import { StepperPanel } from 'primereact/stepperpanel';
import { z } from 'zod';
import baseURL from '../url';
import InfoCarroPedido from './InfoCarroPedido';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from 'primereact/button';
import 'primeflex/primeflex.css';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { Dialog } from 'primereact/dialog';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MultiSelect } from 'primereact/multiselect';


import { useEffect } from 'react';


import { ScrollPanel } from 'primereact/scrollpanel';


import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

import { Card } from 'primereact/card';




const medioPagoLista = [
  'Nequi', 'Bancolombia', 'Bold (Tarjeta)', 'Daviplata',
  'Mercadopago', 'Addi', 'Sistecredito', 'Otro'
];
const franjasHorarias = [
  // { label: "05:00-10:00 AM", value: "05:00-10:00 AM" },
  // { label: "10:00-03:00 PM", value: "10:00-03:00 PM" },
  // { label: "03:00-07:00 PM", value: "03:00-07:00 PM" },
  { label: "08:00-20:00 PM", value: "08:00-20:00 PM" },
];





const schema = z.object({
  documento: z.string().min(1, "Documento requerido"),
  email: z.string().email("Email inválido"),
  nombre: z.string().min(1, "Nombre requerido"),
  telefono: z.string().min(7, "Teléfono inválido"),
  valor: z.coerce.number().min(1, "Debe ingresar un valor válido"),
  incluyeEnvio: z.enum(["Sí", "No"]),
  medioComision: z.string().min(1, "Seleccione un medio"),
  otroMedio: z.string().optional(),
  pin_asesor: z.string().optional(),


  clienteNombre: z.string().min(1, "Nombre del cliente requerido"),
  clienteDocumento: z.string().min(1, "Documento requerida"),
  clienteCelular: z.string().min(7, "Celular inválido"),
  clienteTransportadora: z.string().min(7, "Celular transportadora inválido"),

  fechaDespacho: z.date({ required_error: "Fecha requerida" }),
  // franjaEntrega: z.string().min(1, "Franja requerida"),
  franjaEntrega: z.array(z.string()).min(1, "Seleccione al menos una franja"),

  departamento: z.number().min(1, "Departamento requerido"),
  ciudad: z.number().min(1, "Ciudad requerida"),
  direccion: z.string().min(1, "Dirección requerida"),
  barrio: z.string().min(1, "Barrio requerido"),
  notas: z.string().max(1000).optional(),

  contraentrega: z.enum(["Sí", "No"]),
  metodoPago: z.string().optional(),
  otroMetodoPago: z.string().optional(),
  transferencia: z.enum(["Sí", "No"]),



}).refine((data) => {
  if (data.transferencia === "Sí") return true;
  if (data.contraentrega === "No" && !data.metodoPago) return false;
  if (data.metodoPago === 'Otro' && !data.otroMetodoPago) return false;
  return true;
}, {
  message: "Debe seleccionar el medio de pago",
  path: ["metodoPago"]
})



export default function MiPedido({ onPedidoSuccess, cartItems, totalPrice }) {
  const hostname = window.location.hostname;
  //const tipoAsesor = hostname.includes("catalog") ? "catalog" : "dropshipper";
  const tipoAsesor = hostname.includes("xxxxx") ? "catalog" : "dropshipper";
  console.log('hostname:', hostname);
  console.log("Hostname tipo asesor:", tipoAsesor)
  console.log("Productos seleccionados:", cartItems);
  console.log("Valor total:", totalPrice);

  const [activeIndex, setActiveIndex] = useState(0);
  const { control, setValue, register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      documento: '', email: '', nombre: '', telefono: '', valor: '',
      incluyeEnvio: 'No', medioComision: '', otroMedio: '',
      clienteNombre: '', clienteDocumento: '', clienteCelular: '', clienteTransportadora: '',
      fechaDespacho: null, franjaEntrega: [], departamento: '', ciudad: '', direccion: '', barrio: '',
      contraentrega: 'Sí', metodoPago: '', otroMetodoPago: '', transferencia: 'No', notas: '', pin_asesor: ''


    }
  });
  const contraentrega = watch('contraentrega');
  const metodoPago = watch('metodoPago');
  const transferencia = watch('transferencia');


  const medioComisionSeleccionado = watch('medioComision');



  const onSubmit = async (data) => {
    setIsFinalSubmit(false); // reset state after successful submit
    setShowErrorsDialog(false); // just in case
    const resumenPedido = {
      tipo_pedido: "dropshipper",
      doc_asesor: data.documento,
      pin_asesor: data.pin_asesor,
      nombre_asesor: data.nombre,
      telefono_asesor: data.telefono,
      telefono_whatsapp: data.telefono,
      medio_pago_asesor: data.medioComision,
      email: data.email,

      productos: cartItems.map(item => ({
        idProducto: item.idProducto,
        idCategoria: item.idCategoria,
        titulo: item.titulo,
        cantidad: item.cantidad,
        items: item.items || [],
        precio: item.precio,
        imagen: item.imagen1 || item.imagen2 || item.imagen3 || item.imagen4 || ''
      })),

      // productos: [{ "items": [], "imagen": "", "precio": 99900, "titulo": "Consola Juegos M8 Inalámbrica Game Stick Lite 64gb Ps1 Emuladores", "cantidad": 1, "idProducto": 47, "idCategoria": 17 }, { "items": [], "imagen": "", "precio": 167900, "titulo": "Roku Express Hd Convertidor Tv En Smart A Tv Streaming", "cantidad": 1, "idProducto": 3, "idCategoria": 14 }, { "items": [], "imagen": "", "precio": 119900, "titulo": "Marcadores Doble Punta Set 168 Colores Dibujo Base De Alcohol", "cantidad": 1, "idProducto": 40, "idCategoria": 12 }],
      total_pedido: data.valor,
      nombre_cliente: data.clienteNombre,
      telefono_cliente: data.clienteCelular,
      telefono_tran: data.clienteTransportadora,


      direccion_entrega: data.direccion,
      country_id: 48, // Colombia
      state_id: data.departamento,
      city_id: data.ciudad,
      // fecha_despacho: data.fechaDespacho?.toISOString().split('T')[0] || null,


      fecha_despacho: "2025-06-05 21:01:00",

      //fecha_despacho: new Date().toISOString().replace('T', ' ').substring(0, 19),
      // franja_horario: data.franjaEntrega,
      // franja_horario: "05:00-10:00 AM,03:00-07:00 pm",
      franja_horario: data.franjaEntrega.join(','),


      // nota: `Pedido realizado por el asesor ${data.nombre} con documento ${data.documento}`,
      nota: data.notas || '',
      pago_recibir: data.valor,
      medio_pago: "efectivo",
      forma_pago: "Nequi"




    };

    console.log("Objeto listo para enviar:", resumenPedido);

    try {


      const formData = new FormData();

      for (const key in resumenPedido) {
        const value = resumenPedido[key];

        // ⚠️ Campo productos debe ser enviado como JSON.string
        if (key === 'productos') {
          formData.append(key, JSON.stringify(value));
        } else {
          // ✅ Asegura que todos los valores sean string
          formData.append(key, String(value));
        }
      }


      for (const pair of formData.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
      }

      const response = await fetch(`${baseURL}/pedidosPost.php`, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      console.log("Respuesta del servidor:", result);

      if (result.success) {
        toast.success("Pedido enviado correctamente.");
        if (typeof onPedidoSuccess === 'function') {
          onPedidoSuccess();
        }
      } else {
        toast.error("Error en el envío del pedido.");
      }

    } catch (error) {
      console.error("Error en la peticion:", error);
    }
  };



  // Dentro de tu componente FormularioAsesorZod:
  const documento = watch('documento');
  const [departamentos, setDepartamentos] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const departamentoSeleccionado = watch('departamento');

  useEffect(() => {
    const obtenerDepartamentos = async () => {
      try {
        const formData = new FormData();
        formData.append('country_id', '48');

        const response = await fetch(`${baseURL}/statesGet.php`, {
          method: 'POST',
          body: formData
        });

        console.log("formData", formData);

        const data = await response.json();
        console.log("Departamentos obtenidos:", data.data.states);
        const opciones = data.data.states.map((dep) => ({
          label: dep.name,
          value: dep.id
        }));

        setDepartamentos(opciones);
      } catch (error) {
        console.error('Error al obtener departamentos:', error);
      }
    };

    obtenerDepartamentos();
  }, []);



  useEffect(() => {
    const obtenerCiudades = async () => {
      if (departamentoSeleccionado) {
        try {
          const formData = new FormData();
          formData.append('country_id', '48');
          formData.append('state_id', departamentoSeleccionado);
          //const response = await fetch(`${baseURL}/citiesGet.php?country_id=48&state_id=${departamentoSeleccionado}`);
          const response = await fetch(`${baseURL}/citiesGet.php?country_id=48&state_id=${departamentoSeleccionado}`, {
            method: 'POST',
            body: formData
          });
          const data = await response.json();
          console.log("Respuesta de ciudades:", data.data.states);
          const opciones = data.data.states.map((ciudad) => ({
            label: ciudad.name,
            value: ciudad.id
          }));
          setCiudades(opciones);
          setValue('ciudad', ''); // Reiniciar la ciudad seleccionada
        } catch (error) {
          console.error('Error al obtener ciudades:', error);
        }
      } else {
        setCiudades([]);
        setValue('ciudad', '');
      }
    };

    obtenerCiudades();
  }, [departamentoSeleccionado, setValue]);


  const [showErrorsDialog, setShowErrorsDialog] = useState(false);



  // const onError = (formErrors) => {
  //   if (Object.keys(formErrors).length > 0) {
  //     setShowErrorsDialog(true); // Show the dialog ONLY if there are errors
  //   }
  // };

  // const onError = (formErrors) => {
  //   if (Object.keys(formErrors).length > 0) {
  //     setShowErrorsDialog(true);
  //     window.scrollTo({ top: 0, behavior: 'smooth' });
  //   }
  // };

  const [isFinalSubmit, setIsFinalSubmit] = useState(false);


  const onError = (formErrors) => {
    if (isFinalSubmit && Object.keys(formErrors).length > 0) {
      setShowErrorsDialog(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    // Solo se ejecuta en desarrollo
    const isDev = process.env.NODE_ENV !== 'production';

    if (isDev) {
      inicializarFormularioDePrueba();
    }
  }, []);

  const inicializarFormularioDePrueba = () => {
    setValue('documento', '123456789');
    setValue('pin_asesor', 'ABCD1234');
    setValue('email', 'asesor@correo.com');
    setValue('nombre', 'Juan Pérez');
    setValue('telefono', '3001234567');
    setValue('medioComision', 'Nequi');
    setValue('valor', 100000);
    setValue('incluyeEnvio', 'Sí');
    setValue('clienteNombre', 'Cliente Ejemplo');
    setValue('clienteDocumento', '987654321');
    setValue('clienteCelular', '3107654321');
    setValue('clienteTransportadora', '3107654321');
    setValue('fechaDespacho', new Date());
    setValue('franjaEntrega', ['08:00-20:00 PM']);
    setValue('departamento', 1); // Asegúrate que sea un ID válido en tu sistema
    setValue('ciudad', 10);      // Igual aquí
    setValue('direccion', 'Cra 123 #45-67');
    setValue('barrio', 'El Prado');
    setValue('transferencia', 'Sí');
    setValue('contraentrega', 'No');
    setValue('notas', 'Esto es una prueba automatizada');
  };

  useEffect(() => {
    const consultarAsesor = async () => {
      if (documento && tipoAsesor) {
        const formData = new FormData();
        formData.append('doc_asesor', documento);
        formData.append('tipo_asesor', tipoAsesor);
        //formData.append('pin_asesor', pinAsesor);
        formData.append('pin_asesor', watch('pin_asesor'));
        console.log("Consultando asesor con datos:", {
          documento,
          tipoAsesor,
          pin_asesor: watch('pin_asesor')
        });


        try {
          const response = await fetch(`${baseURL}/asesorDocGet.php`, {
            method: 'POST',
            body: formData
          });
          console.log("Respuesta del servidor:", response);

          const data = await response.json();

          if (data.success) {
            console.log("Datos recibidos:", data.data);

            setValue('nombre', data.data.nombre_completo || '');
            setValue('telefono', data.data.telefono || '');
            setValue('email', data.data.email || '');

            console.log("Datos del asesor asignados:", {
              nombre: data.nombre_completo,
              telefono: data.telefono,
              email: data.email
            });
            // Puedes setear más campos si lo necesitas
            console.log('Asesor encontrado y datos asignados');
          } else {
            console.log('Asesor no encontrado, será registrado al guardar.');
          }
        } catch (error) {
          console.error("Error al consultar asesor:", error);
        }
      }
    };

    consultarAsesor();
  }, [documento, tipoAsesor]); // Se ejecuta al cambiar documento o tipo asesor

  const isCatalog = tipoAsesor === 'catalog';

  const resumenPedido = [
    { campo: "Documento Asesor", valor: watch("documento") },
    { campo: "PIN Asesor", valor: watch("pin_asesor") },
    { campo: "Email", valor: watch("email") },
    { campo: "Nombre Asesor", valor: watch("nombre") },
    { campo: "Teléfono Asesor", valor: watch("telefono") },
    { campo: "Medio Comisión", valor: watch("medioComision") },
    { campo: "Otro Medio", valor: watch("otroMedio") },
    { campo: "Valor", valor: watch("valor") },
    { campo: "Incluye Envío", valor: watch("incluyeEnvio") },

    { campo: "Nombre Cliente", valor: watch("clienteNombre") },
    { campo: "Documento Cliente", valor: watch("clienteDocumento") },
    { campo: "Celular Cliente", valor: watch("clienteCelular") },
    { campo: "Cel. Transportadora", valor: watch("clienteTransportadora") },

    { campo: "Fecha de despacho", valor: watch("fechaDespacho")?.toLocaleDateString() },
    { campo: "Franja de entrega", valor: (watch("franjaEntrega") || []).join(", ") },
    { campo: "Departamento", valor: departamentos.find(d => d.value === watch("departamento"))?.label || watch("departamento") },
    { campo: "Ciudad", valor: ciudades.find(c => c.value === watch("ciudad"))?.label || watch("ciudad") },
    { campo: "Dirección", valor: watch("direccion") },
    { campo: "Barrio", valor: watch("barrio") },
    { campo: "Notas", valor: watch("notas") },

    { campo: "Transferencia", valor: watch("transferencia") },
    { campo: "Contraentrega", valor: watch("contraentrega") },
    { campo: "Medio de Pago", valor: watch("metodoPago") },
    { campo: "Otro Método de Pago", valor: watch("otroMetodoPago") },
  ];
// At the top of your file or in a useEffect/useMemo
const color1 = getComputedStyle(document.documentElement).getPropertyValue('--color1') || '#2ea74e';


  return (

    // <div className="card p-4 surface-50" style={{ maxWidth: '900px', margin: 'auto' }}>
    // <div className="card flex justify-content-center" style={{ backgroundColor: '#f9f9f9', borderLeft: '5px solid #0c6efd' }}>
    <div
  className="card flex justify-content-center"
  style={{
    backgroundColor: '#f9f9f9',
    borderLeft: `5px solid ${color1}`,
  }}
>




      <ScrollPanel style={{ width: '100%', height: 'calc(100vh - 50px)' }}>

        <div className="hide-on-mobile">
          <InfoCarroPedido pedido={null} />
        </div>



        <Dialog
          header="⚠️ Errores en e
          l formulario⚠️ "
          visible={showErrorsDialog}
          onHide={() => setShowErrorsDialog(false)}
          style={{ width: '50vw' }}
          modal
        >
          {Object.keys(errors).length > 0 && (
            <div className="p-3">
              <h5 className="text-red-600"> Por favor corrige los siguientes errores:</h5>
              <ul className="text-red-500 ml-4 list-disc">
                {Object.entries(errors).map(([fieldName, errorObj]) => (
                  <li key={fieldName}>:{errorObj.message}</li>
                ))}
              </ul>
            </div>
          )}
        </Dialog>









        <form onSubmit={handleSubmit(onSubmit, onError)}>

          <Stepper 
          
          headerPosition="left" 
          activeStep={activeIndex} 
          onStepChange={(e) => setActiveIndex(e.index)} 
          >
            {tipoAsesor !== 'catalog' && (
              <StepperPanel header="Datos del Asesor">
                <Card title="Datos del asesor" className="w-full border border-gray-400 shadow-md rounded-xl">
                {/* <StepperPanel header={<span className="font-bold">Forma de pago</span>}> */}

                <div className="formgrid grid">

                  {/* Campos generales */}
                  {[
                    ['documento', 'Tu Documento'],
                    ['pin_asesor', 'Tu PIN (* debe ser alfanumérico)'],


                  ].map(([field, label]) => (
                    <div key={field} className="col-12 md:col-6">
                      <label>{label}</label>
                      <InputText {...register(field)} className="w-full" />
                      {errors[field] && <small className="p-error">{errors[field]?.message}</small>}

                    </div>


                  ))}

                  {[

                    ['email', 'Tu email'],
                    ['nombre', 'Tu Nombre'],
                    ['telefono', 'Tu Teléfono']
                  ].map(([field, label]) => (
                    <div key={field} className="col-12 md:col-6">
                      <label>{label}</label>
                      <InputText {...register(field)} className="w-full" />
                      {errors[field] && <small className="p-error">{errors[field]?.message}</small>}
                    </div>
                  ))}


                  {/* Medio comisión */}
                  <div className="col-12 md:col-6">
                    <label>¿En dónde recibes tus comisiones?</label>
                    <Controller
                      name="medioComision"
                      control={control}
                      render={({ field }) => (
                        <Dropdown {...field} options={medioPagoLista} placeholder="Seleccione" className="w-full" />
                      )}
                    />
                    {errors.medioComision && <small className="p-error">{errors.medioComision.message}</small>}
                  </div>

                  <div className="col-12 flex justify-content-end">
                    {/* <Button label="Siguiente" onClick={() => setActiveIndex(1)} /> */}
                    {/* <Button
                  label="Siguiente"
                  type="button"
                  onClick={() => setActiveIndex(activeIndex + 1)}
                    disabled={activeIndex === totalSteps - 1}
                /> */}

                  </div>
                </div>

</Card>
              </StepperPanel>
            )}



            <StepperPanel header="Datos del Cliente">
              <Card title="Datos de tu cliente" className="w-full border border-gray-400 shadow-md rounded-xl">
                <div className="formgrid grid">
                  {[
                    ['clienteNombre', 'Nombre de tu cliente'],
                    ['clienteDocumento', 'Documento de tu cliente'],
                    ['clienteCelular', 'Celular Llamadas de tu cliente'],
                    ['clienteTransportadora', 'Celular WhatsApp de tu cliente'],
                  ].map(([field, label]) => (
                    <div key={field} className="col-12 md:col-6">
                      <label>{label}</label>
                      <InputText {...register(field)} className="w-full" />
                      {errors[field] && <small className="p-error">{errors[field]?.message}</small>}
                    </div>
                  ))}
                  <div className="col-12 flex justify-content-between">
                    {/* <Button 
                  label="Atrás" 
                  onClick={() => setActiveIndex(activeIndex - 1)}
                    disabled={activeIndex === 0} 
                  /> */}
                    {/* <Button label="Siguiente" onClick={() => setActiveIndex(2)} /> */}
                    {/* <Button
                    label="Siguiente"
                    type="button"
                    onClick={() => setActiveIndex(activeIndex + 1)}
                    disabled={activeIndex === totalSteps - 1}

                  /> */}

                  </div>
                </div>
              </Card>
            </StepperPanel>

            <StepperPanel header="Datos de Entrega">

              <Card title="Datos de la entrega" className="w-full">
                <div className="formgrid grid">
                  <div className="col-12 md:col-6">
                    <label>Fecha Despacho</label>



                    <Controller name="fechaDespacho" control={control} render={({ field }) => (
                      <Calendar {...field} showIcon dateFormat="dd/mm/yy" className="w-full" />

                    )} />
                    {errors.fechaDespacho && <small className="p-error">{errors.fechaDespacho.message}</small>}

                  </div>

                  <div className="col-12 md:col-6">
                    <label>Franja de Entrega</label>
                    <Controller
                      name="franjaEntrega"
                      control={control}
                      render={({ field }) => (
                        <MultiSelect
                          {...field}
                          options={franjasHorarias}
                          placeholder="Seleccione una o varias franjas"
                          className="w-full"
                          display="chip"
                          disabled="true"
                          
                        />
                      )}
                    />
                    {errors.franjaEntrega && <small className="p-error">{errors.franjaEntrega.message}</small>}
                  </div>




                  <div className="col-12 md:col-6">
                    <label>Departamento de entrega</label>
                    <Controller
                      name="departamento"
                      control={control}
                      render={({ field }) => (
                        <Dropdown
                          {...field}
                          options={departamentos}
                          placeholder="Seleccione un departamento"
                          className="w-full"
                        />
                      )}
                    />
                    {errors.departamento && <small className="p-error">{errors.departamento.message}</small>}
                  </div>

                  <div className="col-12 md:col-6">
                    <label>Ciudad de entrega</label>
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

                  <div className="col-12 md:col-6">
                    <label>Dirección de tu cliente</label>
                    <InputText {...register("direccion")} className="w-full" />
                    {errors.direccion && <small className="p-error">{errors.direccion.message}</small>}
                  </div>

                  <div className="col-12 md:col-6">
                    <label>Barrio</label>
                    <InputText {...register("barrio")} className="w-full" />
                    {errors.barrio && <small className="p-error">{errors.barrio.message}</small>}
                  </div>

                  <div className="col-12">
                    <label htmlFor="notas">Notas del pedido</label>
                    <Controller
                      name="notas"
                      control={control}
                      render={({ field }) => (
                        <textarea
                          {...field}
                          id="notas"
                          rows={4}
                          placeholder="Casa, Torre, Apartamento, Conjunto o escriba alguna indicación especial/comentario"
                          className="w-full p-inputtext"
                        />
                      )}
                    />
                    {errors.notas && <small className="p-error">{errors.notas.message}</small>}
                  </div>



                  <div className="col-12 flex justify-content-between">
                    {/* <Button 
                  label="Atrás" 
                    onClick={() => setActiveIndex(activeIndex - 1)}
                      disabled={activeIndex === 0}
                   /> */}
                    {/* <Button label="Siguiente" onClick={() => setActiveIndex(3)} /> */}
                    {/* <Button
                    label="Siguiente"
                    type="button"
                    onClick={() => setActiveIndex(activeIndex + 1)}
                    disabled={activeIndex === totalSteps - 1}

                  /> */}

                  </div>
                </div>
              </Card>
            </StepperPanel>

            <StepperPanel header="Forma de pago">

              <Card title="Forma de pago" className="w-full">




                {/* Campo valor, con lógica de habilitación/deshabilitación */}
                <div className="col-12 md:col-6">
                  <label>Valor a cobrar al cliente</label>
                  <InputText
                    {...register("valor")}
                    className="w-full"
                  // disabled={watch("incluyeEnvio") !== 'Sí'}
                  />
                  {errors.valor && <small className="p-error">{errors.valor.message}</small>}
                </div>

                {/* Radio Buttons: ¿Incluye Envío? */}
                <div className="col-12">
                  <label>¿Incluye Envío?</label>
                  <Controller
                    name="incluyeEnvio"
                    control={control}
                    render={({ field }) => (
                      <div className="flex gap-3">
                        <RadioButton inputId="si" value="Sí" checked={field.value === 'Sí'} onChange={(e) => field.onChange(e.value)} />
                        <label htmlFor="si">Sí</label>
                        <RadioButton inputId="no" value="No" checked={field.value === 'No'} onChange={(e) => field.onChange(e.value)} />
                        <label htmlFor="no">No</label>
                      </div>
                    )}
                  />
                  {errors.incluyeEnvio && <small className="p-error">{errors.incluyeEnvio.message}</small>}
                </div>



                {/* ¿Otro medio? */}
                {medioComisionSeleccionado === 'Otro' && (
                  <div className="col-12 md:col-6">
                    <label>¿Cuál?</label>
                    <InputText {...register("otroMedio")} className="w-full" />
                  </div>
                )}

                <div className="formgrid grid">
                  <div className="col-12">
                    <label>¿Pago por transferencia?</label>
                    <Controller
                      name="transferencia"
                      control={control}
                      render={({ field }) => (
                        <div className="flex gap-3">
                          <RadioButton inputId="transfer_si" value="Sí" checked={field.value === 'Sí'} onChange={(e) => field.onChange(e.value)} />
                          <label htmlFor="transfer_si">Sí</label>
                          <RadioButton inputId="transfer_no" value="No" checked={field.value === 'No'} onChange={(e) => field.onChange(e.value)} />
                          <label htmlFor="transfer_no">No</label>
                        </div>
                      )}
                    />
                  </div>

                  {transferencia === 'No' && (
                    <div className="col-12">
                      <label>¿Pago Contraentrega?</label>
                      <Controller
                        name="contraentrega"
                        control={control}
                        render={({ field }) => (
                          <div className="flex gap-3">
                            <RadioButton inputId="contra_si" value="Sí" checked={field.value === 'Sí'} onChange={(e) => field.onChange(e.value)} />
                            <label htmlFor="contra_si">Sí</label>
                            <RadioButton inputId="contra_no" value="No" checked={field.value === 'No'} onChange={(e) => field.onChange(e.value)} />
                            <label htmlFor="contra_no">No</label>
                          </div>
                        )}
                      />
                      {errors.contraentrega && <small className="p-error">{errors.contraentrega.message}</small>}
                    </div>
                  )}

                  {transferencia === 'No' && contraentrega === 'No' && (
                    <>
                      <div className="col-12 md:col-6">
                        <label>Medio de pago</label>
                        <Controller
                          name="metodoPago"
                          control={control}
                          render={({ field }) => (
                            <Dropdown {...field} options={medioPagoLista} placeholder="Seleccione" className="w-full" />
                          )}
                        />
                        {errors.metodoPago && <small className="p-error">{errors.metodoPago.message}</small>}
                      </div>

                      {metodoPago === 'Otro' && (
                        <div className="col-12 md:col-6">
                          <label>¿Cuál?</label>
                          <InputText {...register("otroMetodoPago")} className="w-full" />
                          {errors.otroMetodoPago && <small className="p-error">{errors.otroMetodoPago.message}</small>}
                        </div>
                      )}
                    </>
                  )}

                  <div className="col-12 flex justify-content-between">
                    {/* <Button label="Atrás" 
                          onClick={() => setActiveIndex(activeIndex - 1)}
        disabled={activeIndex === 0}
                  /> */}
                    {/* <Button label="Siguiente" onClick={() => setActiveIndex(4)} /> */}
                    {/* <Button
                    label="Siguiente"
                    type="button"
                            onClick={() => setActiveIndex(activeIndex + 1)}
        disabled={activeIndex === totalSteps - 1}
                  /> */}

                  </div>

                </div>
              </Card>
            </StepperPanel>
            <StepperPanel header="Resumen">
              
              <div className="formgrid grid">
                <div className="col-12">


                  <Card title="Resumen del pedido" className="w-full">

                    <ScrollPanel style={{ width: '100%', height: '400px' }}>
                      
                      <DataTable
                        value={resumenPedido.filter(item => item.valor && item.valor !== "")}
                        showGridlines
                        size="small"
                        responsiveLayout="scroll"
                        style={{ marginBottom: 20 }}
                      >
                        <Column field="campo" header="Campo" />
                        <Column field="valor" header="Valor" />
                      </DataTable>
                      {/* You can also add the product summary here, if you want */}
                      <h3 className="mt-4 mb-3">Productos Seleccionados</h3>
                      <DataTable
                        value={cartItems}
                        showGridlines
                        size="small"
                        responsiveLayout="scroll"
                        style={{ marginBottom: 20 }}
                      >
                        <Column field="titulo" header="Producto" />
                        <Column field="cantidad" header="Cantidad" style={{ width: 80, textAlign: 'center' }} />
                        <Column
                          field="precio"
                          header="Precio Unitario"
                          body={(row) => `$${Number(row.precio).toLocaleString()}`}
                          style={{ width: 120, textAlign: 'right' }}
                        />
                        <Column
                          header="Subtotal"
                          body={(row) => `$${(row.precio * row.cantidad).toLocaleString()}`}
                          style={{ width: 120, textAlign: 'right', fontWeight: 600 }}
                        />
                      </DataTable>
                      <div style={{ textAlign: 'right', fontWeight: 'bold', fontSize: 18 }}>
                        Total: ${Number(totalPrice).toLocaleString()}
                      </div>
                    </ScrollPanel>


                  </Card>
                </div>
              </div>
              <div className="col-12 flex justify-content-between">
                {/* <Button label="Atrás" 
        onClick={() => setActiveIndex(activeIndex - 1)}
        disabled={activeIndex === 0}
              /> */}
                {/* <Button type="submit" label="Guardar" className="p-button-success" /> */}
                <Button
                  type="submit"
                  label="Guardar"
                  className="p-button-success"
                  onClick={() => setIsFinalSubmit(true)}
                />

              </div>
            </StepperPanel>
          </Stepper>

        </form>

      </ScrollPanel>
    </div>
  );
}
