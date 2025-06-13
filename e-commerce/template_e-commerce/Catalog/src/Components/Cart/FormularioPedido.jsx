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
import Banners from '../Banners/Banners';
import InfoCarroPedido from './InfoCarroPedido';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from 'primereact/button';
import 'primeflex/primeflex.css';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { Dialog } from 'primereact/dialog';

import { useEffect } from 'react';


import { ScrollPanel } from 'primereact/scrollpanel';



import { Card } from 'primereact/card';




const medioPagoLista = [
  'Nequi', 'Bancolombia', 'Bold (Tarjeta)', 'Daviplata',
  'Mercadopago', 'Addi', 'Sistecredito', 'Otro'
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

  clienteNombre: z.string().min(1, "Nombre del cliente requerido"),
  clienteDocumento: z.string().min(1, "Documento requerida"),
  clienteCelular: z.string().min(7, "Celular inválido"),
  clienteTransportadora: z.string().min(7, "Celular transportadora inválido"),

  fechaDespacho: z.date({ required_error: "Fecha requerida" }),
  franjaEntrega: z.string().min(1, "Franja requerida"),
  departamento: z.string().min(1, "Departamento requerido"),
  ciudad: z.string().min(1, "Ciudad requerida"),
  direccion: z.string().min(1, "Dirección requerida"),
  barrio: z.string().min(1, "Barrio requerido"),

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



export default function FormularioAsesorZod() {
  const [activeIndex, setActiveIndex] = useState(0);
  const { control, setValue, register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      documento: '', email: '', nombre: '', telefono: '', valor: '',
      incluyeEnvio: 'No', medioComision: '', otroMedio: '',
      clienteNombre: '', clienteDocumento: '', clienteCelular: '', clienteTransportadora: '',
      fechaDespacho: null, franjaEntrega: '', departamento: '', ciudad: '', direccion: '', barrio: '',
      contraentrega: 'Sí', metodoPago: '', otroMetodoPago: '', transferencia: 'No',

    }
  });
  const contraentrega = watch('contraentrega');
  const metodoPago = watch('metodoPago');
  const transferencia = watch('transferencia');

  const booleanFlag = true;
  const medioComisionSeleccionado = watch('medioComision');



  const onSubmit = (data) => {
    const resumenPedido = {
      asesor: {
        documento: data.documento,
        email: data.email,
        nombre: data.nombre,
        telefono: data.telefono,
        valor: data.valor,
        incluyeEnvio: data.incluyeEnvio,
        medioComision: data.medioComision,
        otroMedio: data.otroMedio || null,
      },
      cliente: {
        nombre: data.clienteNombre,
        documento: data.clienteDocumento,
        celular: data.clienteCelular,
        transportadora: data.clienteTransportadora,
      },
      entrega: {
        fecha: data.fechaDespacho?.toISOString().split('T')[0] || null,
        franja: data.franjaEntrega,
        departamento: data.departamento,
        ciudad: data.ciudad,
        direccion: data.direccion,
        barrio: data.barrio,
      },
      pago: {
        transferencia: data.transferencia,
        contraentrega: data.contraentrega,
        metodoPago: data.metodoPago || null,
        otroMetodoPago: data.otroMetodoPago || null,
      }
    };

    console.log("Objeto listo para enviar:", resumenPedido);

    // Aquí puedes hacer un POST o lo que necesites
    // await fetch('/endpoint', { method: 'POST', body: JSON.stringify(resumenPedido), headers: { 'Content-Type': 'application/json' } })
  };


  const header = (
    <></>
    // <img alt="Card" src="https://primefaces.org/cdn/primereact/images/usercard.png" />
  );
  const footer = (
    <>
      <h5>OJO: estamos en plena temporada, pedidos a nivel nacional se
        enviarán hasta el 15 de diciembre de 2024 debido al alto flujo de las
        transportadoras, asegúrate de hacer tus pedidos con tiempo </h5>
      {/* <Button label="Save" icon="pi pi-check" />
            <Button label="Cancel" severity="secondary" icon="pi pi-times" style={{ marginLeft: '0.5em' }} /> */}
    </>
  );


  // Dentro de tu componente FormularioAsesorZod:
  const documento = watch('documento');
  const tipoAsesor = "dropshipper"
  const pinAsesor = "4896ABCD";


  useEffect(() => {
    const consultarAsesor = async () => {
      if (documento && tipoAsesor) {
        const formData = new FormData();
        formData.append('doc_asesor', documento);
        formData.append('tipo_asesor', tipoAsesor);
        formData.append('pin_asesor', pinAsesor);

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

  const [submitted, setSubmitted] = useState(false);
  const [showErrorsDialog, setShowErrorsDialog] = useState(false);
  const franjasHorarias = [
  { label: "Mañana (8am - 11am)", value: "Mañana" },
  { label: "Medio día (11am - 2pm)", value: "Medio día" },
  { label: "Tarde-Noche (2pm - 7pm)", value: "Tarde-Noche" },
];



  useEffect(() => {
    if (submitted && Object.keys(errors).length > 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [submitted, errors]);

  const onError = (formErrors) => {
    setSubmitted(true); // Mostrar errores
    setShowErrorsDialog(true);

  };



  return (

    // <div className="card p-4 surface-50" style={{ maxWidth: '900px', margin: 'auto' }}>
    <div className="card flex justify-content-center" style={{ backgroundColor: '#f9f9f9', borderLeft: '5px solid #0c6efd' }}>




      <InfoCarroPedido pedido={null} />

      <ScrollPanel style={{ width: '100%', height: '80px' }}>
        <Dialog
          header="⚠️ Errores en el formulario⚠️ "
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
                  <li key={fieldName}>{errorObj.message}</li>
                ))}
              </ul>
            </div>
          )}
        </Dialog>




      </ScrollPanel>




      <form onSubmit={handleSubmit(onSubmit, onError)}>

        <Stepper orientation="vertical" headerPosition="left" activeStep={activeIndex} onStepChange={(e) => setActiveIndex(e.index)} linear>
          {booleanFlag ? <StepperPanel header="Datos del Asesor">
            <div className="formgrid grid">

              {/* Campos generales */}
              {[
                ['documento', 'Documento'],
                ['email', 'Email'],
                ['nombre', 'Nombre'],
                ['telefono', 'Teléfono']
              ].map(([field, label]) => (
                <div key={field} className="col-12 md:col-6">
                  <label>{label}</label>
                  <InputText {...register(field)} className="w-full" />
                  {errors[field] && <small className="p-error">{errors[field]?.message}</small>}
                </div>
              ))}



              <div className="col-12 flex justify-content-end">
                <Button label="Siguiente" onClick={() => setActiveIndex(1)} />
              </div>
            </div>

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
          </StepperPanel>
            :
            <></>
          }
          


          <StepperPanel header="Cliente">
            <Card title="Pedido" className="w-full border border-gray-400 shadow-md rounded-xl">
              <div className="formgrid grid">
                {[
                  ['clienteNombre', 'Nombre'],
                  ['clienteDocumento', 'Documento'],
                  ['clienteCelular', 'Celular Llamadas'],
                  ['clienteTransportadora', 'Celular WhatsApp']
                ].map(([field, label]) => (
                  <div key={field} className="col-12 md:col-6">
                    <label>{label}</label>
                    <InputText {...register(field)} className="w-full" />
                    {errors[field] && <small className="p-error">{errors[field]?.message}</small>}
                  </div>
                ))}
                <div className="col-12 flex justify-content-between">
                  <Button label="Atrás" onClick={() => setActiveIndex(0)} />
                  <Button label="Siguiente" onClick={() => setActiveIndex(2)} />
                </div>
              </div>
            </Card>
          </StepperPanel>

          <StepperPanel header="Entrega">

            <Card title="Pedido" className="w-full">
              <div className="formgrid grid">
                <div className="col-12 md:col-6">
                  <label>Fecha Despacho</label>
                  <Controller name="fechaDespacho" control={control} render={({ field }) => (
                    <Calendar {...field} showIcon dateFormat="dd/mm/yy" className="w-full" />
                  )} />
                  {errors.fechaDespacho && <small className="p-error">{errors.fechaDespacho.message}</small>}
                </div>

                {/* {[
                  ['franjaEntrega', 'Franja'],
                  // ['departamento', 'Departamento'],
                  // ['ciudad', 'Ciudad'],
                  // ['direccion', 'Dirección'],
                  // ['barrio', 'Barrio']
                ].map(([field, label]) => (
                  <div key={field} className="col-12 md:col-6">
                    <label>{label}</label>
                    <InputText {...register(field)} className="w-full" />
                    {errors[field] && <small className="p-error">{errors[field]?.message}</small>}
                  </div>
                ))} */}

<div className="col-12 md:col-6">
  <label>Franja de Entrega</label>
  <Controller
    name="franjaEntrega"
    control={control}
    render={({ field }) => (
      <Dropdown
        {...field}
        options={franjasHorarias}
        placeholder="Seleccione una franja"
        className="w-full"
      />
    )}
  />
  {errors.franjaEntrega && <small className="p-error">{errors.franjaEntrega.message}</small>}
</div>



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


                <div className="col-12 flex justify-content-between">
                  <Button label="Atrás" onClick={() => setActiveIndex(1)} />
                  <Button label="Siguiente" onClick={() => setActiveIndex(3)} />
                </div>
              </div>
            </Card>
          </StepperPanel>

          <StepperPanel header="Forma de pago">

            <Card title="Pedido" className="w-full">




              {/* Campo valor, con lógica de habilitación/deshabilitación */}
              <div className="col-12 md:col-6">
                <label>Valor a cobrar al cliente</label>
                <InputText
                  {...register("valor")}
                  className="w-full"
                  disabled={watch("incluyeEnvio") !== 'Sí'}
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
                  <Button label="Atrás" onClick={() => setActiveIndex(2)} />
                  <Button label="Siguiente" onClick={() => setActiveIndex(4)} />
                </div>

              </div>
            </Card>
          </StepperPanel>
          <StepperPanel header="Resumen del pedido">
            <div className="formgrid grid">
              <div className="col-12">


                <Card title="Pedido" className="w-full">

                  <ScrollPanel style={{ width: '100%', height: '400px' }}>

                    <div className="p-3">
                      <h3 className="mb-3">Datos del Asesor</h3>
                      <div className="mb-2"><strong>Documento:</strong> {watch('documento')}</div>
                      <div className="mb-2"><strong>Email:</strong> {watch('email')}</div>
                      <div className="mb-2"><strong>Nombre:</strong> {watch('nombre')}</div>
                      <div className="mb-2"><strong>Teléfono:</strong> {watch('telefono')}</div>
                      <div className="mb-2"><strong>Valor:</strong> {watch('valor')}</div>
                      <div className="mb-2"><strong>Incluye Envío:</strong> {watch('incluyeEnvio')}</div>
                      <div className="mb-2"><strong>Medio Comisión:</strong> {watch('medioComision')}</div>
                      {watch('otroMedio') && <div className="mb-2"><strong>Otro Medio:</strong> {watch('otroMedio')}</div>}



                      <h3 className="mt-4 mb-3">Datos del Cliente</h3>
                      <div className="mb-2"><strong>Nombre:</strong> {watch('clienteNombre')}</div>
                      <div className="mb-2"><strong>Documento:</strong> {watch('clienteDocumento')}</div>
                      <div className="mb-2"><strong>Celular:</strong> {watch('clienteCelular')}</div>
                      <div className="mb-2"><strong>Cel. Transportadora:</strong> {watch('clienteTransportadora')}</div>

                      <h3 className="mt-4 mb-3">Datos de Entrega</h3>
                      <div className="mb-2"><strong>Fecha:</strong> {watch('fechaDespacho')?.toLocaleDateString()}</div>
                      <div className="mb-2"><strong>Franja:</strong> {watch('franjaEntrega')}</div>
                      <div className="mb-2"><strong>Departamento:</strong> {watch('departamento')}</div>
                      <div className="mb-2"><strong>Ciudad:</strong> {watch('ciudad')}</div>
                      <div className="mb-2"><strong>Dirección:</strong> {watch('direccion')}</div>
                      <div className="mb-2"><strong>Barrio:</strong> {watch('barrio')}</div>

                      <h3 className="mt-4 mb-3">Forma de Pago</h3>
                      <div className="mb-2"><strong>Transferencia:</strong> {watch('transferencia')}</div>
                      {watch('transferencia') === 'No' && (
                        <>
                          <div className="mb-2"><strong>Contraentrega:</strong> {watch('contraentrega')}</div>
                          {watch('contraentrega') === 'No' && (
                            <>
                              <div className="mb-2"><strong>Medio:</strong> {watch('metodoPago')}</div>
                              {watch('metodoPago') === 'Otro' && (
                                <div className="mb-2"><strong>Otro Método:</strong> {watch('otroMetodoPago')}</div>
                              )}
                            </>
                          )}
                        </>
                      )}
                    </div>



                  </ScrollPanel>

                </Card>
              </div>
            </div>
            <div className="col-12 flex justify-content-between">
              <Button label="Atrás" onClick={() => setActiveIndex(3)} />
              <Button type="submit" label="Guardar" className="p-button-success" />
            </div>
          </StepperPanel>
        </Stepper>

      </form>
    </div>
  );
}
