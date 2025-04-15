import React, { useState, useEffect } from 'react';
import './NewCodigo.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import baseURL from '../../url';
import Swal from 'sweetalert2';
import { fetchUsuario, getUsuario } from '../../user';
import moneda from '../../moneda';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import planes from '../../planes';
export default function NewCodigo() {
    const [mensaje, setMensaje] = useState('');

    const [descuento, setDescuento] = useState(0);
    const [tipo, setTipo] = useState('');
    const [desde, setDesde] = useState('');
    const [hasta, setHasta] = useState('');
    const [codigo, setCodigo] = useState('');
    const [limite, setLimite] = useState('');
    const [limiteUso, setLimiteUso] = useState('');
    const [productos, setProductos] = useState([]);
    const [idCategoria, setIdCategoria] = useState(null); // Estado para la categoría seleccionada
    const [productosSeleccionados, setProductosSeleccionados] = useState([]);
    const [filtroTitulo, setFiltroTitulo] = useState('');
    const [categorias, setCategoras] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalOpen2, setModalOpen2] = useState(false);
    const [seleccion, setSeleccion] = useState('');
    const toggleModal = () => {
        setCodigo('');
        setMensaje('');
        setDescuento(0);
        setModalOpen(!modalOpen);
        setLimiteUso('');
    };
    const toggleModal2 = () => {
        setModalOpen2(!modalOpen2);
    };
    useEffect(() => {
        cargarProductos();
        cargarCategoria()
    }, []);


    const cargarProductos = () => {
        fetch(`${baseURL}/productosGet.php`, { method: 'GET' })
            .then(response => response.json())
            .then(data => {
                setProductos(data.productos || []);
            })
            .catch(error => console.error('Error al cargar productos:', error));
    };
    const cargarCategoria = () => {
        fetch(`${baseURL}/categoriasGet.php`, {
            method: 'GET',
        })
            .then(response => response.json())
            .then(data => {
                setCategoras(data.categorias || []);
                console.log(data.categorias);
            })
            .catch(error => console.error('Error al cargar contactos:', error));
    };

    const handleCategoriaChange = (e) => {
        setIdCategoria(e.target.value);
        setProductosSeleccionados([]);
    };
    const obtenerImagen = (item) => {
        return item.imagen1 || item.imagen2 || item.imagen3 || item.imagen4 || null;
    };
    const seleccionarProducto = (producto) => {
        setIdCategoria(null); // Deselecciona la categoría si seleccionas productos

        const existe = productosSeleccionados?.some(p => p.idProducto === producto.idProducto);

        let nuevosProductosSeleccionados;
        if (existe) {
            nuevosProductosSeleccionados = productosSeleccionados?.filter(p => p.idProducto !== producto.idProducto);
        } else {
            nuevosProductosSeleccionados = [...productosSeleccionados, producto];
        }

        setProductosSeleccionados(nuevosProductosSeleccionados);
    };

    const filtrarProductos = (e) => {
        setFiltroTitulo(e.target.value);
    };
    const productosFiltrados = productos.filter(producto =>
        producto.titulo.toLowerCase().includes(filtroTitulo.toLowerCase())
    );
    const generarCodigoAleatorio = () => {
        const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let codigoAleatorio = '';
        for (let i = 0; i < 6; i++) {
            codigoAleatorio += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
        }
        return codigoAleatorio;
    };

    const crear = async () => {
        const productosMap = productosSeleccionados?.map(item => ({
            idProducto: item.idProducto,
            idCategoria: item.idCategoria,
            titulo: item.titulo,
            precio: item.precio,
            imagen: obtenerImagen(item),
        }));
        const productosPedidoJSON = JSON.stringify(productosMap);

        const codigoAleatorio = generarCodigoAleatorio();

        // Validar que el descuento sea mayor que 0
        if (descuento <= 0) {
            toast.error('El descuento debe ser mayor a 0.');
            return; // Detener la ejecución si el descuento no es válido
        }

        // Validar que solo se haya seleccionado una categoría o productos, pero no ambos
        if (!idCategoria && (!productosSeleccionados || productosSeleccionados.length === 0)) {
            toast.error('Debes seleccionar al menos una categoría o productos.');
            return;
        }

        const formData = new FormData();
        formData.append('codigo', codigoAleatorio);
        formData.append('descuento', descuento);
        formData.append('tipo', tipo);
        formData.append('desde', desde);
        formData.append('hasta', hasta);
        formData.append('limite', limite === 'limites' ? limiteUso : limite);
        // Manda solo el que esté seleccionado (categoría o productos)
        if (idCategoria) {
            formData.append('idCategoria', idCategoria);
            formData.append('productos', '[]'); // Vaciar productos si hay categoría seleccionada
        } else if (productosSeleccionados.length > 0) {
            formData.append('productos', productosPedidoJSON);
            formData.append('idCategoria', null); // Vaciar categoría si hay productos seleccionados
        }
        setMensaje('Procesando...');

        try {
            const response = await fetch(`${baseURL}/codigosPost.php`, {
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

    const handleTipo = (e) => {
        setTipo(e.target.value);
    };

    const handleLimite = (e) => {
        setLimite(e.target.value);
        setLimiteUso('');
    };
    const handleSeleccion = (e) => {
        setSeleccion(e.target.value); // Actualiza el estado con la opción seleccionada.
    };
    // Trae usuario logueado
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchData = async () => {
            await fetchUsuario();
            setLoading(false);
        };

        fetchData();
    }, []);

    const usuarioLegued = getUsuario();
    const alertPermiso = () => {
        Swal.fire(
            '¡Error!',
            '¡No tienes permisos!',
            'error'
        );
    };

    //Calcular limite de Plan-----------------------------
    const plan = planes[0]?.plan
    const limitePlan = planes[0]?.limiteCodigos
    const mensagePlan = `¡Alcanzaste el límite del plan ${plan}! <br/>Tu límite son ${limitePlan} promociones`
    const [codigos, setCodigos] = useState([]);
    const alertPlan = () => {
        cargarCodigos();
        Swal.fire(
            '¡Error!',
            mensagePlan,
            'error'
        );
    };
    useEffect(() => {
        cargarCodigos();

    }, []);
    const cargarCodigos = () => {
        fetch(`${baseURL}/codigosGet.php`, {
            method: 'GET',
        })
            .then(response => response.json())
            .then(data => {
                setCodigos(data.codigos || []);
            })
            .catch(error => console.error('Error al cargar códigos:', error));
    };
    return (
        <div className='NewContain'>
            <ToastContainer />
            {loading ? (
                <></>
            ) : usuarioLegued?.idUsuario ? (
                <>
                    {usuarioLegued?.rol === 'admin' ? (
                        <>
                            {
                                codigos?.length < limitePlan ? (
                                    <button onClick={toggleModal} className='btnSave'>
                                        <span>+</span> Agregar
                                    </button>

                                ) : (
                                    <button onClick={alertPlan} className='btnSave'>
                                        <span>+</span> Agregar
                                    </button>
                                )
                            }
                        </>
                    ) : usuarioLegued?.rol === 'colaborador' ? (
                        <>
                            {
                                codigos?.length < limitePlan ? (
                                    <button onClick={toggleModal} className='btnSave'>
                                        <span>+</span> Agregar
                                    </button>

                                ) : (
                                    <button onClick={alertPlan} className='btnSave'>
                                        <span>+</span> Agregar
                                    </button>
                                )
                            }
                        </>
                    ) : (
                        <></>
                    )}
                </>
            ) : (
                <>
                    {
                        codigos?.length < limitePlan ? (
                            <button onClick={toggleModal} className='btnSave'>
                                <span>+</span> Agregar
                            </button>

                        ) : (
                            <button onClick={alertPlan} className='btnSave'>
                                <span>+</span> Agregar
                            </button>
                        )
                    }
                </>
            )}
            {modalOpen && (
                <div className='modal'>
                    <div className='modal-content'>
                        <div className='deFlexBtnsModal'>
                            <button className='selected'>Agregar Codigo</button>
                            <span className="close" onClick={toggleModal}>&times;</span>
                        </div>
                        <form >
                            <div className='flexGrap'>
                                <fieldset>
                                    <legend>Codigo</legend>
                                    <input
                                        type='text'
                                        name='codigo'
                                        value={generarCodigoAleatorio()}
                                        readOnly
                                    />
                                </fieldset>

                                <fieldset>
                                    <legend>Tipo de cupón</legend>
                                    <select
                                        id="tipo"
                                        name="tipo"
                                        value={tipo}
                                        onChange={handleTipo}
                                    >
                                        <option value="">Selecciona opción</option>
                                        <option value='porcentaje'>Porcentaje de descuento</option>
                                        <option value='fijo'>Monto fijo</option>
                                    </select>
                                </fieldset>

                                <fieldset>
                                    <legend>Descuento</legend>
                                    <input
                                        type='number'
                                        name='descuento'
                                        min="0"
                                        step="0.01"
                                        value={descuento}
                                        onChange={(e) => setDescuento(e.target.value)}
                                    />
                                </fieldset>
                                <fieldset>
                                    <legend>Límites de uso</legend>
                                    <select
                                        id="limite"
                                        name="limite"
                                        value={limite}
                                        onChange={handleLimite}
                                    >
                                        <option value="">Selecciona opción</option>
                                        <option value={0}>Sin límite de uso</option>
                                        <option value='limites'>Hasta cierta cantidad de uso total</option>
                                    </select>
                                </fieldset>
                                <fieldset>
                                    <legend>Desde</legend>
                                    <input
                                        type='datetime-local'
                                        name='desde'
                                        value={desde}
                                        onChange={(e) => setDesde(e.target.value)}
                                    />
                                </fieldset>

                                <fieldset>
                                    <legend>Hasta</legend>
                                    <input
                                        type='datetime-local'
                                        name='hasta'
                                        value={hasta}
                                        onChange={(e) => setHasta(e.target.value)}
                                    />
                                </fieldset>

                                {/* Input que se muestra cuando se selecciona "Hasta cierta cantidad de uso total" */}
                                {limite === 'limites' && (
                                    <fieldset>
                                        <legend>Cantidad máxima de usos</legend>
                                        <input
                                            type='number'
                                            name='limiteUso'
                                            min="1"
                                            value={limiteUso}
                                            onChange={(e) => setLimiteUso(e.target.value)}
                                        />
                                    </fieldset>
                                )}

                                <fieldset>
                                    <legend>Aplicar oferta sobre</legend>
                                    <select
                                        id="seleccion"
                                        name="seleccion"
                                        value={seleccion}
                                        onChange={handleSeleccion} // Controla la selección.
                                    >
                                        <option value="">Selecciona opción</option>
                                        <option value="categoria">Una categoría</option>
                                        <option value="productos">Ciertos productos</option>
                                    </select>
                                </fieldset>
                                {seleccion === 'categoria' && (
                                    <fieldset>
                                        <legend>Categoría (*)</legend>
                                        <select
                                            id="idCategoria"
                                            name="idCategoria"
                                            value={idCategoria}
                                            onChange={handleCategoriaChange}
                                        >
                                            <option value="">Selecciona una categoría</option>
                                            {categorias.map(item => (
                                                <option key={item.idCategoria} value={item.idCategoria}>{item.categoria}</option>
                                            ))}
                                        </select>
                                    </fieldset>
                                )}

                                {seleccion === 'productos' && (
                                    <fieldset>
                                        <legend>Productos (*)</legend>
                                        <button onClick={(e) => { e.preventDefault(); toggleModal2(); }} className='btnSelect'>
                                            Seleccionar productos
                                        </button>
                                    </fieldset>
                                )}
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
                                                <button onClick={(e) => { e.preventDefault(); toggleModal2(); }} className='btnSave'>
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
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <fieldset className='deNonefieldset'>
                                    <legend>Productos Seleccionados</legend>
                                    <textarea
                                        name='productos'
                                        value={productosSeleccionados?.map(p => `${p.idProducto} - ${p.titulo} - ${moneda}${p.precio}`).join('\n')}
                                        readOnly
                                    />
                                </fieldset>

                            </div>
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
