import React, { useState, useEffect } from 'react';
import baseURL from '../../url';
import './NewPedido.css';
import { ToastContainer, toast } from 'react-toastify';
import moneda from '../../moneda';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
export default function NewPedido() {
    const [mensaje, setMensaje] = useState('');
    const [nombre, setNombre] = useState('');
    const [telefono, setTelefono] = useState('');
    const [estado, setEstado] = useState('');
    const [pagado, setPagado] = useState('');
    const [entrega, setEntrega] = useState('Sucursal');
    const [pago, setPago] = useState('');
    const [productos, setProductos] = useState([]);
    const [productosSeleccionados, setProductosSeleccionados] = useState([]);
    const [filtroTitulo, setFiltroTitulo] = useState('');
    const [total, setTotal] = useState(0);
    const [nota, setNota] = useState('');
    const [codigo, setCodigo] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [modalOpen2, setModalOpen2] = useState(false);
    const [mostrar, setMostrar] = useState(false);
    const [metodos, setMetodos] = useState([]);
    let now = new Date();
    let offset = -3 * 60; // Argentina está a GMT-3
    let argentinaTime = new Date(now.getTime() + offset * 60 * 1000);
    let createdAt = argentinaTime.toISOString().slice(0, 19).replace('T', ' ');

    const toggleModal = () => {
        setMensaje('');
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
                const metodosActivos = (data.metodos || [])?.filter(metodo => metodo.estado === 'Activo');
                setMetodos(metodosActivos);
                console.log(metodosActivos);
            })
            .catch(error => console.error('Error al cargar datos bancarios:', error));
    };
    const obtenerImagen = (item) => {
        return item.imagen1 || item.imagen2 || item.imagen3 || item.imagen4 || null;
    };

    const seleccionarProducto = (producto) => {
        const existe = productosSeleccionados?.some(p => p.idProducto === producto.idProducto);

        let nuevosProductosSeleccionados;
        if (existe) {
            nuevosProductosSeleccionados = productosSeleccionados?.filter(p => p.idProducto !== producto.idProducto);
        } else {
            nuevosProductosSeleccionados = [...productosSeleccionados, { ...producto, cantidad: 1 }];
        }

        setProductosSeleccionados(nuevosProductosSeleccionados);

        const nuevoTotal = nuevosProductosSeleccionados?.reduce((acc, item) => acc + item.cantidad * parseFloat(item.precio), 0);
        setTotal(nuevoTotal);

    };

    const actualizarCantidad = (idProducto, incremento) => {
        const nuevosProductosSeleccionados = productosSeleccionados?.map(producto => {
            if (producto?.idProducto === idProducto) {
                const nuevaCantidad = Math.max(1, producto.cantidad + incremento);
                return { ...producto, cantidad: nuevaCantidad };
            }
            return producto;
        });

        setProductosSeleccionados(nuevosProductosSeleccionados);

        const nuevoTotal = nuevosProductosSeleccionados?.reduce((acc, item) => acc + item.cantidad * parseFloat(item.precio), 0);
        setTotal(nuevoTotal);

    };




    const crear = async () => {
        // Recalcular el total antes de hacer el POST
        const nuevoTotal = productosSeleccionados?.reduce((acc, item) => acc + item.cantidad * parseFloat(item.precio), 0);

        const productosPedido = productosSeleccionados?.map(item => ({
            idProducto: item.idProducto,
            idCategoria: item.idCategoria,
            titulo: item.titulo,
            cantidad: item.cantidad,
            items: item?.items,
            precio: item.precio,
            imagen: obtenerImagen(item),
        }));

        const productosPedidoJSON = JSON.stringify(productosPedido);
        let estadoFinal = (estado === "Entregado" || estado === "Solicitado") && (pagado === "Si")
            ? "Finalizado"
            : estado;

        const formData = new FormData();
        formData.append('nombre', nombre);
        formData.append('telefono', telefono);
        formData.append('estado', estadoFinal);
        formData.append('entrega', entrega);
        formData.append('pago', pago);
        formData.append('createdAt', createdAt);
        formData.append('total', nuevoTotal?.toFixed(2));
        formData.append('codigo', codigo);
        formData.append('nota', nota);
        formData.append('pagado', pagado);
        formData.append('productos', productosPedidoJSON);

        setMensaje('Procesando...');

        try {
            const response = await fetch(`${baseURL}/pedidoPostAdmin.php`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            if (data.mensaje) {
                setMensaje('');
                toast.success(data.mensaje);
                toggleModal();
                window.location.reload();
            } else if (data.error) {
                setMensaje('');
                toast.error(data.error);
            }
        } catch (error) {
            console.error('Error:', error);
            setMensaje('');
            toast.error('Error de conexión. Por favor, inténtelo de nuevo.');
        }
    };



    const filtrarProductos = (e) => {
        setFiltroTitulo(e.target.value);
    };

    const productosFiltrados = productos.filter(producto =>
        producto.titulo.toLowerCase().includes(filtroTitulo.toLowerCase())
    );
    const handleEstado = (e) => {
        setEstado(e.target.value);
    };
    const handlePago = (e) => {
        setPago(e.target.value);
    };
    const handlePagado = (event) => {
        setPagado(event.target.value);
    };

    return (
        <div className='NewPedido'>
            <ToastContainer />
            <button onClick={toggleModal} className='btnSave'>
                <span>+</span> Agregar
            </button>

            {modalOpen && (
                <div className='modal'>
                    <div className='modal-content'>
                        <div className='deFlexBtnsModal'>
                            <button className='selected'>Agregar Pedido Sucursal</button>
                            <span className="close" onClick={toggleModal}>&times;</span>
                        </div>
                        <legend>(*) Campos obligatorios</legend>
                        <div className='flexGrap'>

                            <fieldset>
                                <legend>Apellido y Nombre </legend>
                                <input
                                    type="text"
                                    id="nombre"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                />
                            </fieldset>
                            <fieldset>
                                <legend>Telefono / WathsApp </legend>
                                <input
                                    type="number"
                                    id="telefono"
                                    value={telefono}
                                    onChange={(e) => setTelefono(e.target.value)}
                                />
                            </fieldset>
                            <fieldset>
                                <legend>Codigo </legend>
                                <input
                                    type="text"
                                    id="codigo"
                                    value={codigo}
                                    onChange={(e) => setCodigo(e.target.value)}
                                />
                            </fieldset>
                            <fieldset>
                                <legend>Nota </legend>
                                <input
                                    type="text"
                                    id="nota"
                                    value={nota}
                                    onChange={(e) => setNota(e.target.value)}
                                />
                            </fieldset>
                            <fieldset>
                                <legend>Estado (*)</legend>
                                <select
                                    id="estado"
                                    name="estado"
                                    value={estado}
                                    onChange={handleEstado}
                                >
                                    <option value="">Selecciona opcion</option>
                                    <option value="Pendiente">Pendiente</option>
                                    <option value="Preparacion">Preparacion</option>
                                    <option value="Terminado">Terminado</option>
                                    <option value="Entregado">Entregado</option>
                                    <option value="Rechazado">Rechazado</option>
                                </select>
                            </fieldset>
                            <fieldset>
                                <legend>Pago (*)</legend>
                                <select
                                    id="pago"
                                    name="pago"
                                    value={pago}
                                    onChange={handlePago}
                                >
                                    <option value="">Selecciona opcion</option>
                                    {
                                        metodos?.map(metod => (
                                            <option value={metod.tipo}>{metod.tipo}</option>
                                        ))}
                                </select>
                            </fieldset>
                            <fieldset>
                                <legend>Productos (*)</legend>
                                <button onClick={toggleModal2} className='btnSelect'>
                                    Seleccionar productos
                                </button>
                            </fieldset>
                            <fieldset>
                                <legend>Pagado (*)</legend>
                                <select
                                    id="pagado"
                                    name="pagado"
                                    value={pagado}
                                    onChange={handlePagado}
                                >
                                    <option value="">Selecciona opcion</option>
                                    <option value="Si">Si</option>
                                    <option value="No">No</option>
                                </select>
                            </fieldset>
                            <fieldset>
                                <legend>Total</legend>
                                <input type="text" value={total?.toFixed(2)} readOnly />
                            </fieldset>
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
                        <form >
                            <fieldset className='deNonefieldset'>
                                <legend>Productos Seleccionados</legend>
                                <textarea
                                    name='productos'
                                    value={productosSeleccionados?.map(p => `${p.titulo}, $${p.precio} x ${p.cantidad}`).join('\n')}
                                    readOnly
                                />
                            </fieldset>

                            {mensaje ? (
                                <button type='button' className='btnLoading' disabled>
                                    {mensaje}
                                </button>
                            ) : (
                                <button type='button' onClick={crear} className='btnPost'>
                                    Agregar
                                </button>
                            )}
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
