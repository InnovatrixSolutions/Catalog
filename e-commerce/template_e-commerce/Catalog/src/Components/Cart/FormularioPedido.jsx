import { useState, useMemo, useEffect } from 'react';
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
import { Card } from 'primereact/card';
import { handleWhatsappMessage } from '../../Utils/whatsapp';

const medioPagoLista = [
  'Nequi',
  'Bancolombia',
  'Bold (Tarjeta)',
  'Daviplata',
  'Mercadopago',
  'Addi',
  'Sistecredito',
  'Otro',
];

const franjasHorarias = [
  { label: '08:00-08:00 PM', value: '08:00-08:00 PM' },
];

function resolveMode() {
  const envModeRaw = (process.env.REACT_APP_MODE || '').toLowerCase().trim();
  if (envModeRaw === 'catalog' || envModeRaw === 'dropshipper') {
    return envModeRaw;
  }

  const host = typeof window !== 'undefined' ? window.location.hostname : '';
  const isDropshipperDomain =
    /^drop\./i.test(host) || host === 'drop.mercadoyepes.co';
  let mode = isDropshipperDomain ? 'dropshipper' : 'catalog';

  try {
    const params = new URLSearchParams(window.location.search);
    const override = (params.get('mode') || '').toLowerCase().trim();
    if (override === 'dropshipper' || override === 'catalog') {
      mode = override;
    }
  } catch {
    /* noop */
  }

  return mode;
}

export default function MiPedido({ onPedidoSuccess, cartItems, totalPrice }) {
  const mode = useMemo(resolveMode, []);
  const isCatalog = mode === 'catalog';
  const isDropshipper = mode === 'dropshipper';
  const tipoAsesor = mode;

  console.log('MODE =>', mode);
  console.log('isCatalog =>', isCatalog);
  console.log('isDropshipper =>', isDropshipper);
  console.log('Productos seleccionados:', cartItems);
  console.log('Valor total:', totalPrice);

  const [telefonoTienda, setTelefonoTienda] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const dropshipperSchema = z
    .object({
      documento: z.string().min(1, 'Documento requerido'),
      email: z.string().email('Email inválido'),
      nombre: z.string().min(1, 'Nombre requerido'),
      telefono: z.string().min(7, 'Teléfono inválido'),
      medioComision: z.string().min(1, 'Seleccione un medio'),
      pin_asesor: z.string().optional(),
      valor: z.coerce.number().min(1, 'Debe ingresar un valor válido'),
    })
    .refine(
      (data) => data.valor >= totalPrice,
      {
        message: `El valor debe ser igual o mayor al total: $${totalPrice}`,
        path: ['valor'],
      }
    );

  const baseSchema = z
    .object({
      otroMedio: z.string().optional(),

      clienteNombre: z.string().min(1, 'Nombre del cliente requerido'),
      clienteDocumento: z.string().min(1, 'Documento requerida'),
      clienteCelular: z.string().min(7, 'Celular inválido'),
      clienteTransportadora: z
        .string()
        .min(7, 'Celular transportadora inválido'),

      fechaDespacho: z.date({ required_error: 'Fecha requerida' }),
      franjaEntrega: z
        .array(z.string())
        .min(1, 'Seleccione al menos una franja'),

      departamento: z.number().min(1, 'Departamento requerido'),
      ciudad: z.number().min(1, 'Ciudad requerida'),
      direccion: z.string().min(1, 'Dirección requerida'),
      barrio: z.string().min(1, 'Barrio requerido'),
      notas: z.string().max(1000).optional(),

      contraentrega: z.enum(['Sí', 'No']),
      metodoPago: z.string().optional(),
      otroMetodoPago: z.string().optional(),
      transferencia: z.enum(['Sí', 'No']),
    })
    .refine(
      (data) => {
        if (data.transferencia === 'Sí') return true;
        if (data.contraentrega === 'No' && !data.metodoPago) return false;
        if (data.metodoPago === 'Otro' && !data.otroMetodoPago) return false;
        return true;
      },
      {
        message: 'Debe seleccionar el medio de pago',
        path: ['metodoPago'],
      }
    );

  const schema = isCatalog
    ? baseSchema
    : z.intersection(baseSchema, dropshipperSchema);

  const {
    control,
    setValue,
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      documento: '',
      email: '',
      nombre: '',
      telefono: '',
      valor: isCatalog ? undefined : '',
      incluyeEnvio: isCatalog ? 'Sí' : 'No',
      medioComision: '',
      otroMedio: '',
      clienteNombre: '',
      clienteDocumento: '',
      clienteCelular: '',
      clienteTransportadora: '',
      fechaDespacho: new Date(),
      franjaEntrega: ['08:00-08:00 PM'],
      departamento: '',
      ciudad: '',
      direccion: '',
      barrio: '',
      contraentrega: 'Sí',
      metodoPago: '',
      otroMetodoPago: '',
      transferencia: 'Sí',
      notas: '',
      pin_asesor: '',
    },
  });

  const contraentrega = watch('contraentrega');
  const metodoPago = watch('metodoPago');
  const transferencia = watch('transferencia');
  const medioComisionSeleccionado = watch('medioComision');
  const documento = watch('documento');

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorsDialog, setShowErrorsDialog] = useState(false);
  const [isFinalSubmit, setIsFinalSubmit] = useState(false);

  useEffect(() => {
    fetch(`${baseURL}/tiendaGet.php`)
      .then((res) => res.json())
      .then((data) => {
        const telefono = data.tienda?.[0]?.telefono || '';
        setTelefonoTienda(telefono);
      })
      .catch((error) => console.error('Error al cargar la tienda:', error));
  }, []);

    const [departamentos, setDepartamentos] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const departamentoSeleccionado = watch('departamento');

const onSubmit = async (data) => {
  setIsFinalSubmit(false);
  setShowErrorsDialog(false);

  const resumenPedido = {
    tipo_pedido: isDropshipper ? 'dropshipper' : 'catalogo',

    ...(isDropshipper && {
      doc_asesor: data.documento,
      pin_asesor: data.pin_asesor,
      nombre_asesor: data.nombre,
      telefono_asesor: data.telefono,
      telefono_whatsapp: data.telefono,
      medio_pago_asesor: data.medioComision,
      email: data.email,
    }),

    productos: cartItems.map((item) => ({
      idProducto: item.idProducto,
      idCategoria: item.idCategoria,
      titulo: item.titulo,
      cantidad: item.cantidad,
      items: item.items || [],
      precio: item.precio,
      imagen:
        item.imagen1 ||
        item.imagen2 ||
        item.imagen3 ||
        item.imagen4 ||
        '',
    })),

    total_pedido: isCatalog ? totalPrice : data.valor,
    nombre_cliente: data.clienteNombre,
    telefono_cliente: data.clienteCelular,
    telefono_tran: data.clienteTransportadora,
    direccion_entrega: data.direccion,
    country_id: 48,
    state_id: data.departamento,
    city_id: data.ciudad,

    fecha_despacho: isDropshipper
      ? data.fechaDespacho?.toISOString().replace('T', ' ').substring(0, 19)
      : null,

    franja_horario: isDropshipper
      ? (data.franjaEntrega || []).join(',')
      : '08:00-08:00 PM',

    nota: data.notas || 'Esta es una nota automatizada del pedido',
    pago_recibir: isCatalog ? totalPrice : data.valor,
    medio_pago: 'efectivo',
    forma_pago: 'Nequi',
  };

  console.log('Objeto listo para enviar:', resumenPedido);

  try {
    const formData = new FormData();

    for (const key in resumenPedido) {
      const value = resumenPedido[key];
      if (key === 'productos') {
        formData.append(key, JSON.stringify(value));
      } else if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    }

    for (const pair of formData.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`);
    }

    const response = await fetch(`${baseURL}/pedidosPost.php`, {
      method: 'POST',
      body: formData,
    });

    // 👇 Leemos siempre como texto primero
    const rawText = await response.text();
    console.log('Respuesta RAW del servidor:', rawText);

    let result;
    try {
      result = rawText ? JSON.parse(rawText) : null;
    } catch (e) {
      console.error('La respuesta NO es JSON válido:', e);
      toast.error('Error en el servidor. La respuesta no es JSON.');
      return;
    }

    if (!response.ok) {
      console.error('Respuesta HTTP no OK:', response.status, result);
      toast.error('Error en el envío del pedido. Revisa todos los campos');
      toast.error('Error: ' + (result?.error || 'Error desconocido'));
      return;
    }

    console.log('Respuesta JSON del servidor:', result);

    if (result.success) {
      console.log('Pedido enviado exitosamente:', result);

      const datosWhatsapp = {
        idPedido: result?.data?.id || result?.data?.idPedido,
        nombre: data?.clienteNombre,
        telefono: data?.clienteCelular,
        entrega: data?.direccion,
        pago: data?.metodoPago,
        codigo: '',
        total: totalPrice,
        nota: data?.notas,
        productos: cartItems,
        pagoRecibir: isCatalog ? totalPrice : data.valor,
      };

      handleWhatsappMessage(datosWhatsapp, telefonoTienda);
      setShowSuccessModal(true);
    } else {
      toast.error('Error en el envío del pedido. Revisa todos los campos');
      toast.error('Error: ' + (result.error || 'Error desconocido'));
    }
  } catch (error) {
    console.error('Error en la petición:', error);
    toast.error('Error de conexión con el servidor.');
  }
};


  const onError = (formErrors) => {
    if (isFinalSubmit && Object.keys(formErrors).length > 0) {
      setShowErrorsDialog(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

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
    setValue('departamento', 1);
    setValue('ciudad', 10);
    setValue('direccion', 'Cra 123 #45-67');
    setValue('barrio', 'El Prado');
    setValue('contraentrega', 'No');
    setValue('transferencia', 'Sí');
    setValue('notas', 'Esto es una prueba automatizada');
  };

  useEffect(() => {
    const isDev = process.env.NODE_ENV !== 'production';
    if (isDev) {
      // Puedes descomentar si quieres precargar datos
      // inicializarFormularioDePrueba();
    }
  }, []);

  useEffect(() => {
    const consultarAsesor = async () => {
      if (documento && tipoAsesor) {
        const formData = new FormData();
        formData.append('doc_asesor', documento);
        formData.append('tipo_asesor', tipoAsesor);
        formData.append('pin_asesor', watch('pin_asesor'));

        console.log('Consultando asesor con datos:', {
          documento,
          tipoAsesor,
          pin_asesor: watch('pin_asesor'),
        });

        try {
          const response = await fetch(`${baseURL}/asesorDocGet.php`, {
            method: 'POST',
            body: formData,
          });
          console.log('Respuesta del servidor:', response);

          const data = await response.json();

          if (data.success) {
            console.log('Datos recibidos:', data.data);

            setValue('nombre', data.data.nombre_completo || '');
            setValue('telefono', data.data.telefono || '');
            setValue('email', data.data.email || '');

            console.log('Datos del asesor asignados:', {
              nombre: data.nombre_completo,
              telefono: data.telefono,
              email: data.email,
            });
          } else {
            console.log('Asesor no encontrado, será registrado al guardar.');
          }
        } catch (error) {
          console.error('Error al consultar asesor:', error);
        }
      }
    };

    consultarAsesor();
  }, [documento, tipoAsesor, setValue, watch]);

  const resumenPedido = [
    { campo: 'Documento Asesor', valor: watch('documento') },
    { campo: 'PIN Asesor', valor: watch('pin_asesor') },
    { campo: 'Email', valor: watch('email') },
    { campo: 'Nombre Asesor', valor: watch('nombre') },
    { campo: 'Teléfono Asesor', valor: watch('telefono') },
    { campo: 'Medio Comisión', valor: watch('medioComision') },
    { campo: 'Otro Medio', valor: watch('otroMedio') },
    { campo: 'Valor', valor: watch('valor') },
    { campo: 'Incluye Envío', valor: watch('incluyeEnvio') },

    { campo: 'Nombre Cliente', valor: watch('clienteNombre') },
    { campo: 'Documento Cliente', valor: watch('clienteDocumento') },
    { campo: 'Celular Cliente', valor: watch('clienteCelular') },
    { campo: 'Cel. Transportadora', valor: watch('clienteTransportadora') },

    {
      campo: 'Fecha de despacho',
      valor: watch('fechaDespacho')?.toLocaleDateString(),
    },
    {
      campo: 'Franja de entrega',
      valor: (watch('franjaEntrega') || []).join(', '),
    },
    {
      campo: 'Departamento',
      valor:
        departamentos.find((d) => d.value === watch('departamento'))?.label ||
        watch('departamento'),
    },
    {
      campo: 'Ciudad',
      valor:
        ciudades.find((c) => c.value === watch('ciudad'))?.label ||
        watch('ciudad'),
    },
    { campo: 'Dirección', valor: watch('direccion') },
    { campo: 'Barrio', valor: watch('barrio') },
    { campo: 'Notas', valor: watch('notas') },

    { campo: 'Transferencia', valor: watch('transferencia') },
    { campo: 'Contraentrega', valor: watch('contraentrega') },
    { campo: 'Medio de Pago', valor: watch('metodoPago') },
    { campo: 'Otro Método de Pago', valor: watch('otroMetodoPago') },
  ];



  useEffect(() => {
    const obtenerDepartamentos = async () => {
      try {
        const formData = new FormData();
        formData.append('country_id', '48');

        const response = await fetch(`${baseURL}/statesGet.php`, {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        const opciones = data.data.states.map((dep) => ({
          label: dep.name,
          value: dep.id,
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

          const response = await fetch(
            `${baseURL}/citiesGet.php?country_id=48&state_id=${departamentoSeleccionado}`,
            {
              method: 'POST',
              body: formData,
            }
          );
          const data = await response.json();
          const opciones = data.data.states.map((ciudad) => ({
            label: ciudad.name,
            value: ciudad.id,
          }));
          setCiudades(opciones);
          setValue('ciudad', '');
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

  const color1 =
    getComputedStyle(document.documentElement).getPropertyValue('--color1') ||
    '#2ea74e';

  const numericFields = [
    'documento',
    'telefono',
    'clienteDocumento',
    'clienteCelular',
    'clienteTransportadora',
  ];

  return (
    <div
      className="card flex justify-content-center"
      style={{
        backgroundColor: '#f9f9f9',
        borderLeft: `5px solid ${color1}`,
      }}
    >
      <div
        style={{
          height: 'calc(100vh - 50px)',
          overflowY: 'auto',
          padding: '1rem',
        }}
      >
        <div className="hide-on-mobile">
          <InfoCarroPedido pedido={null} />
        </div>

        <Dialog
          header="⚠️ Errores en el formulario⚠️ "
          visible={showErrorsDialog}
          onHide={() => setShowErrorsDialog(false)}
          style={{ width: '50vw' }}
          modal
        >
          {Object.keys(errors).length > 0 && (
            <div className="p-3">
              <h5 className="text-red-600">
                {' '}
                Por favor corrige los siguientes errores:
              </h5>
              <ul className="text-red-500 ml-4 list-disc">
                {Object.entries(errors).map(([fieldName, errorObj]) => (
                  <li key={fieldName}>:{errorObj.message}</li>
                ))}
              </ul>
            </div>
          )}
        </Dialog>

        <Dialog
          header="¡Éxito!"
          visible={showSuccessModal}
          onHide={() => {
            if (typeof onPedidoSuccess === 'function') {
              onPedidoSuccess();
            }
          }}
          style={{ width: '350px' }}
          modal
        >
          <p>Pedido enviado correctamente.</p>
        </Dialog>

        <form onSubmit={handleSubmit(onSubmit, onError)}>
          <Stepper
            orientation="vertical"
            headerPosition="left"
            activeStep={activeIndex}
            onStepChange={(e) => setActiveIndex(e.index)}
          >
            {isDropshipper && (
              <StepperPanel header="Datos del Asesor">
                <Card
                  title="Datos del asesor"
                  className="w-full border border-gray-400 shadow-md rounded-xl"
                >
                  <div className="formgrid grid">
                    {[
                      ['documento', 'Tu Documento'],
                      ['pin_asesor', 'Tu PIN (* alfanumérico)'],
                    ].map(([field, label]) => {
                      const onlyNumbers = numericFields.includes(field);
                      return (
                        <div key={field} className="col-12 md:col-6">
                          <label>{label}</label>
                          <InputText
                            {...register(field)}
                            className="w-full"
                            onKeyPress={
                              onlyNumbers
                                ? (e) => {
                                    if (!/[0-9]/.test(e.key)) {
                                      e.preventDefault();
                                    }
                                  }
                                : undefined
                            }
                          />
                          {errors[field] && (
                            <small className="p-error">
                              {errors[field]?.message}
                            </small>
                          )}
                        </div>
                      );
                    })}

                    {[
                      ['email', 'Tu email'],
                      ['nombre', 'Tu Nombre'],
                      ['telefono', 'Tu Teléfono'],
                    ].map(([field, label]) => {
                      const onlyNumbers = numericFields.includes(field);
                      return (
                        <div key={field} className="col-12 md:col-6">
                          <label>{label}</label>
                          <InputText
                            {...register(field)}
                            className="w-full"
                            onKeyPress={
                              onlyNumbers
                                ? (e) => {
                                    if (!/[0-9]/.test(e.key)) e.preventDefault();
                                  }
                                : undefined
                            }
                          />
                          {errors[field] && (
                            <small className="p-error">
                              {errors[field]?.message}
                            </small>
                          )}
                        </div>
                      );
                    })}

                    <div className="col-12 md:col-6">
                      <label>¿Dónde recibes comisiones?</label>
                      <Controller
                        name="medioComision"
                        control={control}
                        render={({ field }) => (
                          <Dropdown
                            {...field}
                            options={medioPagoLista}
                            placeholder="Seleccione"
                            className="w-full"
                          />
                        )}
                      />
                      {errors.medioComision && (
                        <small className="p-error">
                          {errors.medioComision.message}
                        </small>
                      )}
                    </div>
                  </div>
                </Card>
              </StepperPanel>
            )}

            <StepperPanel header="Datos del Cliente">
              <Card
                title="Datos del cliente"
                className="w-full border border-gray-400 shadow-md rounded-xl"
              >
                <div className="formgrid grid">
                  {[
                    ['clienteNombre', 'Nombrel del cliente'],
                    ['clienteDocumento', 'Documento del cliente'],
                    ['clienteCelular', 'Celular Llamadas del cliente'],
                    ['clienteTransportadora', 'WhatsApp del cliente'],
                  ].map(([field, label]) => {
                    const onlyNumbers = numericFields.includes(field);
                    return (
                      <div key={field} className="col-12 md:col-6">
                        <label>{label}</label>
                        <InputText
                          {...register(field)}
                          className="w-full"
                          onKeyPress={
                            onlyNumbers
                              ? (e) => {
                                  if (!/[0-9]/.test(e.key)) {
                                    e.preventDefault();
                                  }
                                }
                              : undefined
                          }
                        />
                        {errors[field] && (
                          <small className="p-error">
                            {errors[field]?.message}
                          </small>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            </StepperPanel>

            <StepperPanel header="Datos de Entrega">
              <Card title="Datos de la entrega" className="w-full">
                <div className="formgrid grid">
                  {isDropshipper && (
                    <div className="col-12 md:col-6">
                      <label>Fecha Despacho</label>
                      <Controller
                        name="fechaDespacho"
                        control={control}
                        render={({ field }) => (
                          <Calendar
                            {...field}
                            showIcon
                            dateFormat="dd/mm/yy"
                            className="w-full"
                          />
                        )}
                      />
                      {errors.fechaDespacho && (
                        <small className="p-error">
                          {errors.fechaDespacho.message}
                        </small>
                      )}
                    </div>
                  )}

                  {isDropshipper && (
                    <div className="col-12 md:col-6">
                      <label>Franja de Entrega</label>
                      <Controller
                        name="franjaEntrega"
                        control={control}
                        render={({ field }) => (
                          <InputText
                            value={(field.value || []).join(', ')}
                            readOnly
                            className="w-full"
                          />
                        )}
                      />
                      {errors.franjaEntrega && (
                        <small className="p-error">
                          {errors.franjaEntrega.message}
                        </small>
                      )}
                    </div>
                  )}

                  <div className="col-12 md:col-6">
                    <label>Dpto. de entrega</label>
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
                    {errors.departamento && (
                      <small className="p-error">
                        {errors.departamento.message}
                      </small>
                    )}
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
                    {errors.ciudad && (
                      <small className="p-error">
                        {errors.ciudad.message}
                      </small>
                    )}
                  </div>

                  <div className="col-12 md:col-6">
                    <label>Dirección de tu cliente</label>
                    <InputText {...register('direccion')} className="w-full" />
                    {errors.direccion && (
                      <small className="p-error">
                        {errors.direccion.message}
                      </small>
                    )}
                  </div>

                  <div className="col-12 md:col-6">
                    <label>Barrio</label>
                    <InputText {...register('barrio')} className="w-full" />
                    {errors.barrio && (
                      <small className="p-error">
                        {errors.barrio.message}
                      </small>
                    )}
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
                    {errors.notas && (
                      <small className="p-error">{errors.notas.message}</small>
                    )}
                  </div>
                </div>
              </Card>
            </StepperPanel>

            <StepperPanel header="Forma de pago">
              <Card title="Forma de pago" className="w-full">
                {!isCatalog && (
                  <div className="col-12 md:col-6">
                    <label>Valor a cobrar al cliente</label>
                    <InputText {...register('valor')} className="w-full" />
                    {errors.valor && (
                      <small className="p-error">{errors.valor.message}</small>
                    )}
                  </div>
                )}

                {!isCatalog && (
                  <div className="col-12">
                    <label>¿Incluye Envío?</label>
                    <Controller
                      name="incluyeEnvio"
                      control={control}
                      render={({ field }) => (
                        <div className="flex gap-3">
                          <RadioButton
                            inputId="si"
                            value="Sí"
                            checked={field.value === 'Sí'}
                            onChange={(e) => field.onChange(e.value)}
                          />
                          <label htmlFor="si">Sí</label>
                          <RadioButton
                            inputId="no"
                            value="No"
                            checked={field.value === 'No'}
                            onChange={(e) => field.onChange(e.value)}
                          />
                          <label htmlFor="no">No</label>
                        </div>
                      )}
                    />
                    {errors.incluyeEnvio && (
                      <small className="p-error">
                        {errors.incluyeEnvio.message}
                      </small>
                    )}
                  </div>
                )}

                <div className="col-12">
                  <label>¿Pago Contraentrega?</label>
                  <Controller
                    name="contraentrega"
                    control={control}
                    render={({ field }) => (
                      <div className="flex gap-3">
                        <RadioButton
                          inputId="contra_si"
                          value="Sí"
                          checked={field.value === 'Sí'}
                          onChange={(e) => field.onChange(e.value)}
                        />
                        <label htmlFor="contra_si">Sí</label>
                        <RadioButton
                          inputId="contra_no"
                          value="No"
                          checked={field.value === 'No'}
                          onChange={(e) => field.onChange(e.value)}
                        />
                        <label htmlFor="contra_no">No</label>
                      </div>
                    )}
                  />
                  {errors.contraentrega && (
                    <small className="p-error">
                      {errors.contraentrega.message}
                    </small>
                  )}
                </div>

                <div className="formgrid grid">
                  <div className="col-12">
                    <label>¿Pago por transferencia?</label>
                    <Controller
                      name="transferencia"
                      control={control}
                      render={({ field }) => (
                        <div className="flex gap-3">
                          <RadioButton
                            disabled={true}
                            inputId="transfer_si"
                            value="Sí"
                            checked={field.value === 'Sí'}
                            onChange={(e) => field.onChange(e.value)}
                          />
                          <label htmlFor="transfer_si">Sí</label>
                        </div>
                      )}
                    />
                  </div>

                  {medioComisionSeleccionado === 'Otro' && (
                    <div className="col-12 md:col-6">
                      <label>¿Cuál?</label>
                      <InputText {...register('otroMedio')} className="w-full" />
                    </div>
                  )}

                  {transferencia === 'Sí' && contraentrega === 'No' && (
                    <>
                      <div className="col-12 md:col-6">
                        <label>Medio de pago</label>
                        <Controller
                          name="metodoPago"
                          control={control}
                          render={({ field }) => (
                            <Dropdown
                              {...field}
                              options={medioPagoLista}
                              placeholder="Seleccione"
                              className="w-full"
                            />
                          )}
                        />
                        {errors.metodoPago && (
                          <small className="p-error">
                            {errors.metodoPago.message}
                          </small>
                        )}
                      </div>

                      {metodoPago === 'Otro' && (
                        <div className="col-12 md:col-6">
                          <label>¿Cuál?</label>
                          <InputText
                            {...register('otroMetodoPago')}
                            className="w-full"
                          />
                          {errors.otroMetodoPago && (
                            <small className="p-error">
                              {errors.otroMetodoPago.message}
                            </small>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </Card>
            </StepperPanel>

            <StepperPanel header="Resumen">
              <div className="formgrid grid">
                <div className="col-12">
                  <Card
                    title="Resumen del pedido"
                    className="w-full"
                    style={{ maxWidth: 600, margin: '0 auto' }}
                  >
                    <div
                      style={{
                        padding: '1rem',
                        backgroundColor: '#fff',
                        border: '1px solid #ccc',
                        borderRadius: '8px',
                      }}
                    >
                      <h3
                        style={{
                          marginBottom: '1rem',
                          textAlign: 'center',
                          fontWeight: 'bold',
                        }}
                      >
                        🧾 Resumen del Pedido
                      </h3>

                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.5rem',
                          marginBottom: '1.5rem',
                        }}
                      >
                        {resumenPedido
                          .filter((item) => item.valor && item.valor !== '')
                          .map((item, index) => (
                            <div
                              key={index}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                              }}
                            >
                              <span style={{ fontWeight: 'bold' }}>
                                {item.campo}
                              </span>
                              <span>{item.valor}</span>
                            </div>
                          ))}
                      </div>

                      <h4
                        style={{
                          marginBottom: '1rem',
                          borderTop: '1px dashed #aaa',
                          paddingTop: '1rem',
                        }}
                      >
                        🛒 Productos Seleccionados
                      </h4>
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '1rem',
                        }}
                      >
                        {cartItems.map((item, index) => (
                          <div
                            key={index}
                            style={{
                              borderBottom: '1px solid #eee',
                              paddingBottom: '0.5rem',
                            }}
                          >
                            <strong>{item.titulo}</strong>
                            <br />
                            Cantidad: {item.cantidad}
                            <br />
                            Precio Unitario: $
                            {Number(item.precio).toLocaleString()}
                            <br />
                            Subtotal:{' '}
                            <strong>
                              $
                              {Number(
                                item.precio * item.cantidad
                              ).toLocaleString()}
                            </strong>
                          </div>
                        ))}
                      </div>

                      <div
                        style={{
                          textAlign: 'right',
                          fontWeight: 'bold',
                          fontSize: '1.1rem',
                          marginTop: '1.5rem',
                        }}
                      >
                        Total: ${Number(totalPrice).toLocaleString()}
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </StepperPanel>
          </Stepper>

          <Button
            type="submit"
            label="Guardar"
            className="btn"
            onClick={() => setIsFinalSubmit(true)}
          />
        </form>
      </div>
    </div>
  );
}
