import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { RadioButton } from 'primereact/radiobutton';
import { Calendar } from 'primereact/calendar';
import { Stepper } from 'primereact/stepper';
import { StepperPanel } from 'primereact/stepperpanel';
import { z } from 'zod';
import Banners from '../Banners/Banners';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from 'primereact/button';
import 'primeflex/primeflex.css';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';


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
}).refine((data) => {
  if (data.contraentrega === "No" && !data.metodoPago) return false;
  return true;
}, {
  message: "Debe seleccionar el medio de pago",
  path: ["metodoPago"]
});

export default function FormularioAsesorZod( ) {
  const [activeIndex, setActiveIndex] = useState(0);
  const { control, register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      documento: '', email: '', nombre: '', telefono: '', valor: '',
      incluyeEnvio: 'No', medioComision: '', otroMedio: '',
      clienteNombre: '', clienteDocumento: '', clienteCelular: '', clienteTransportadora: '',
      fechaDespacho: null, franjaEntrega: '', departamento: '', ciudad: '', direccion: '', barrio: '',
      contraentrega: 'Sí', metodoPago: '', otroMetodoPago: ''
    }
  });
const booleanFlag= true;
  const medioComisionSeleccionado = watch('medioComision');

  const onSubmit = (data) => {
    console.log("Formulario válido:", data);
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


  return (
    
    // <div className="card p-4 surface-50" style={{ maxWidth: '900px', margin: 'auto' }}>
    <div className="card p-4 surface-50" style={{ maxWidth: '900px' }}>

{/* <Banners/> */}

        <div className="card flex justify-content-center">
            <Card title="Pedidos Mercado Yepes" subTitle="Card subtitle" footer={footer} header={header} className="md:w-25rem">
                <p className="m-0">
                    Asegúrate de tener toda la información, buen cierre de ventas,
tener certeza absoluta de que va a recibir el producto TU CLIENTE,
de esa manera no tendrás que pagar los envíos por pedidos devueltos.

Escribe Con Calma, Asegúrate de que los datos estén
correctos para evitar devoluciones 


                </p>
            </Card>
        </div>
 
         
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stepper orientation="vertical"  headerPosition="left" activeStep={activeIndex} onStepChange={(e) => setActiveIndex(e.index)} linear>
{booleanFlag? <StepperPanel header="Datos del Asesor">
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

    {/* Campo valor, con lógica de habilitación/deshabilitación */}
    <div className="col-12 md:col-6">
      <label>Valor</label>
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

    {/* Medio comisión */}
    <div className="col-12 md:col-6">
      <label>Medio Comisión</label>
      <Controller
        name="medioComision"
        control={control}
        render={({ field }) => (
          <Dropdown {...field} options={medioPagoLista} placeholder="Seleccione" className="w-full" />
        )}
      />
      {errors.medioComision && <small className="p-error">{errors.medioComision.message}</small>}
    </div>

    {/* ¿Otro medio? */}
    {medioComisionSeleccionado === 'Otro' && (
      <div className="col-12 md:col-6">
        <label>¿Cuál?</label>
        <InputText {...register("otroMedio")} className="w-full" />
      </div>
    )}

    <div className="col-12 flex justify-content-end">
      <Button label="Siguiente" onClick={() => setActiveIndex(1)} />
    </div>
  </div>
</StepperPanel>
:
<></>
}


          <StepperPanel header="Cliente">
            <div className="formgrid grid">
              {[
                ['clienteNombre', 'Nombre'],
                ['clienteDocumento', 'Documento'],
                ['clienteCelular', 'Celular'],
                ['clienteTransportadora', 'Cel. Transportadora']
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
          </StepperPanel>

          <StepperPanel header="Entrega">
            <div className="formgrid grid">
              <div className="col-12 md:col-6">
                <label>Fecha Despacho</label>
                <Controller name="fechaDespacho" control={control} render={({ field }) => (
                  <Calendar {...field} showIcon dateFormat="dd/mm/yy" className="w-full" />
                )} />
                {errors.fechaDespacho && <small className="p-error">{errors.fechaDespacho.message}</small>}
              </div>

              {[
                ['franjaEntrega', 'Franja'],
                ['departamento', 'Departamento'],
                ['ciudad', 'Ciudad'],
                ['direccion', 'Dirección'],
                ['barrio', 'Barrio']
              ].map(([field, label]) => (
                <div key={field} className="col-12 md:col-6">
                  <label>{label}</label>
                  <InputText {...register(field)} className="w-full" />
                  {errors[field] && <small className="p-error">{errors[field]?.message}</small>}
                </div>
              ))}

              <div className="col-12 flex justify-content-between">
                <Button label="Atrás" onClick={() => setActiveIndex(1)} />
                <Button type="submit" label="Guardar" className="p-button-success" />
              </div>
            </div>
          </StepperPanel>

          <StepperPanel header="Formas de Pago">
  <div className="formgrid grid">
    <div className="col-12 md:col-6">
      <label>Pago Contraentrega</label>
      <Controller name="contraentrega" control={control} render={({ field }) => (
        <div className="flex gap-3">
          <RadioButton inputId="contraentregaSi" value="Sí" checked={field.value === 'Sí'} onChange={(e) => field.onChange(e.value)} />
          <label htmlFor="contraentregaSi">Sí</label>
          <RadioButton inputId="contraentregaNo" value="No" checked={field.value === 'No'} onChange={(e) => field.onChange(e.value)} />
          <label htmlFor="contraentregaNo">No</label>
        </div>
      )} />
      {errors.contraentrega && <small className="p-error">{errors.contraentrega.message}</small>}
    </div>

    {watch("contraentrega") === 'No' && (
      <>
        <div className="col-12 md:col-6">
          <label>Medio de pago</label>
          <Controller name="metodoPago" control={control} render={({ field }) => (
            <Dropdown {...field} options={medioPagoLista} placeholder="Seleccione medio" className="w-full" />
          )} />
          {errors.metodoPago && <small className="p-error">{errors.metodoPago.message}</small>}
        </div>

        {watch("metodoPago") === 'Otro' && (
          <div className="col-12 md:col-6">
            <label>Otro medio de pago</label>
            <InputText {...register("otroMetodoPago")} className="w-full" />
          </div>
        )}
      </>
    )}

    <div className="col-12 flex justify-content-between">
      <Button label="Atrás" onClick={() => setActiveIndex(2)} />
      <Button type="submit" label="Guardar" className="p-button-success" />
    </div>
  </div>
</StepperPanel>
        </Stepper>
      </form>
    </div>
  );
}
