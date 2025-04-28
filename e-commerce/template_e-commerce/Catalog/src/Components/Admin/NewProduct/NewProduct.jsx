import React, { useState, useEffect } from 'react';
import './NewProduct.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import baseURL from '../../url';
import imageIcon from '../../../images/imageIcon.png';
import { fetchUsuario, getUsuario } from '../../user';
import Swal from 'sweetalert2';
import planes from '../../planes';
export default function NewProduct() {
    const [mensaje, setMensaje] = useState('');
    const [imagenPreview, setImagenPreview] = useState([null, null, null, null]); // Arreglo para imágenes
    const [isImageSelected, setIsImageSelected] = useState([false, false, false, false]); // Arreglo para selección de imágenes
    const [descripcion, setDescripcion] = useState('');
    const [titulo, setTitulo] = useState('');
    const [categoria, setCategoria] = useState('');
    const [masVendido, setMasVendido] = useState('');
    const [precio, setPrecio] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [categorias, setCategoras] = useState([]);
    const [precioAnterior, setPrecioAnterior] = useState('');
    const [stock, setStock] = useState('');
    const [item1, setItem1] = useState('');
    const [item2, setItem2] = useState('');
    const [item3, setItem3] = useState('');
    const [item4, setItem4] = useState('');
    const [item5, setItem5] = useState('');
    const [item6, setItem6] = useState('');
    const [item7, setItem7] = useState('');
    const [item8, setItem8] = useState('');
    const [item9, setItem9] = useState('');
    const [item10, setItem10] = useState('');
    const [subcategorias, setSubCategorias] = useState([]);
    const [subcategoria, setSubCategoria] = useState([]);
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
    const [categoriasConSubcategorias, setCategoriasConSubcategorias] = useState([]);
    const [idCategoria, setIdCategoria] = useState('');
    const [idSubCategoria, setIdSubCategoria] = useState('');
    const [mostrarItems, setMostrarItems] = useState(false);
    const [verItems, setVerItems] = useState('No');
    const [customStock, setCustomStock] = useState('');
    const [cantidadStock, setCantidadStock] = useState(''); // Nuevo estado para cantidad de stock manual

    useEffect(() => {
        cargarCategoriasYSubcategorias();
    }, []);

    const toggleModal = () => {
        setModalOpen(!modalOpen);
    };
    useEffect(() => {
        cargarCategoria();
        cargarSubCategoria();
    }, []);
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
    const cargarSubCategoria = () => {
        fetch(`${baseURL}/subCategoriaGet.php`, {
            method: 'GET',
        })
            .then(response => response.json())
            .then(data => {
                setSubCategorias(data.subcategorias || []);
                console.log(data.subcategorias)
            })
            .catch(error => console.error('Error al cargar contactos:', error));
    };
    const handleImagenChange = (event, index) => {
        const file = event.target.files[0];

        if (file) {
            const previewURL = URL.createObjectURL(file);
            setImagenPreview(prev => {
                const newPreviews = [...prev];
                newPreviews[index] = previewURL;
                return newPreviews;
            });
            setIsImageSelected(prev => {
                const newSelection = [...prev];
                newSelection[index] = true;
                return newSelection;
            });
        }
    };

    const eliminarImagen = (index) => {
        setImagenPreview(prev => {
            const newPreviews = [...prev];
            newPreviews[index] = null;
            return newPreviews;
        });
        setIsImageSelected(prev => {
            const newSelection = [...prev];
            newSelection[index] = false;
            return newSelection;
        });
    };
    const cargarCategoriasYSubcategorias = async () => {
        try {
            const [categoriasRes, subcategoriasRes] = await Promise.all([
                fetch(`${baseURL}/categoriasGet.php`).then(res => res.json()),
                fetch(`${baseURL}/subCategoriaGet.php`).then(res => res.json()),
            ]);

            const categorias = categoriasRes.categorias || [];
            const subcategorias = subcategoriasRes.subcategorias || [];

            const categoriasConSub = categorias.map(categoria => {
                return {
                    ...categoria,
                    subcategorias: subcategorias.filter(sub => sub.idCategoria === categoria.idCategoria),
                };
            });

            setCategoriasConSubcategorias(categoriasConSub);
        } catch (error) {
            console.error('Error al cargar categorías y subcategorías:', error);
        }
    };

    const handleCategoriaSeleccion = (e) => {
        const selectedValue = e.target.value;

        // Separar idCategoria de idSubCategoria si está presente
        const [categoriaId, subCategoriaId] = selectedValue.split('-');

        setIdCategoria(categoriaId);

        if (subCategoriaId) {
            setIdSubCategoria(subCategoriaId);
        } else {
            setIdSubCategoria(''); // No subcategoría seleccionada
        }
    };

    const handleStock = (e) => {
        setStock(e.target.value);
        if (e.target.value !== 'elegir') {
            setCustomStock('');
        }
    };



    const crear = async () => {
        const form = document.getElementById("crearForm");
        const formData = new FormData(form);

        // Validar que los campos obligatorios estén completos
        if (!formData.get('titulo') || !idCategoria || !formData.get('precio')) {
            toast.error('Por favor, complete todos los campos obligatorios.');
            return;
        }

        // Añadir idCategoria al FormData
        formData.append('idCategoria', idCategoria);
        formData.append('verItems', verItems);
        // Verificar si se ha seleccionado una subcategoría, de lo contrario, añadir 0
        if (idSubCategoria) {
            formData.append('idSubCategoria', idSubCategoria);
        } else {
            formData.append('idSubCategoria', '0');
        }

        formData.append('Disponible', stock === 'elegir' ? cantidadStock : stock);

        try {
            const response = await fetch(`${baseURL}/productosPost.php`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.mensaje) {
                toast.success(data.mensaje);
                window.location.reload();
            } else {
                toast.error(data.error);
            }
        } catch (error) {
            console.error('Error al crear producto:', error);
            toast.error('Error de conexión. Inténtelo de nuevo.');
        }
    };





    const handleMasVendidoChange = (e) => {
        setMasVendido(e.target.value);
    };



    const handleCheckboxChange = (event) => {
        setVerItems(event.target.checked ? 'Si' : 'No');
        setMostrarItems(event.target.checked);
    };


    //Trae usuario logueado-----------------------------
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
    }


    //Calcular limite de Plan-----------------------------
    const plan = planes[0]?.plan
    const limitePlan = planes[0]?.limiteProducto
    const mensagePlan = `¡Alcanzaste el límite del plan ${plan}! <br/>Tu límite son ${limitePlan} productos`
    const [productos, setProductos] = useState([]);
    const alertPlan = () => {
        cargarProductos();
        Swal.fire(
            '¡Error!',
            mensagePlan,
            'error'
        );
    };
    useEffect(() => {
        cargarProductos();

    }, []);
    const cargarProductos = () => {
        fetch(`${baseURL}/productosGet.php`, {
            method: 'GET',
        })
            .then(response => response.json())
            .then(data => {
                setProductos(data.productos || []);
                console.log(data.productos)
            })
            .catch(error => console.error('Error al cargar productos:', error));
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
                                productos?.length < limitePlan ? (
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
                                productos?.length < limitePlan ? (
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
                        productos?.length < limitePlan ? (
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
                <div className="modal">
                    <div className="modal-content">
                        <div className='deFlexBtnsModal'>
                            <button className='selected'>Agregar Producto</button>
                            <span className="close" onClick={toggleModal}>&times;</span>
                        </div>
                        <form id="crearForm">

                            <div className='flexGrap'>
                                <fieldset id='titulo'>
                                    <legend>Título (*)</legend>
                                    <input
                                        type="text"
                                        id="titulo"
                                        name="titulo"
                                        required
                                        value={titulo}
                                        onChange={(e) => setTitulo(e.target.value)}
                                    />
                                </fieldset>
                                <fieldset>
                                    <legend>Categoría (*)</legend>
                                    <select
                                        id="categoriaSeleccionada"
                                        name="categoriaSeleccionada"
                                        onChange={handleCategoriaSeleccion}
                                        required
                                    >
                                        <option value="">Categoría / subcategoría</option>
                                        {categoriasConSubcategorias.map(categoria => (
                                            <optgroup key={categoria.idCategoria}>
                                                <option value={`${categoria.idCategoria}`} id='option'>{categoria.categoria}</option>
                                                {categoria.subcategorias.map(subcategoria => (
                                                    <option key={subcategoria.idSubCategoria} value={`${categoria.idCategoria}-${subcategoria.idSubCategoria}`}>
                                                        {categoria.categoria} {`>`} {subcategoria.subcategoria}
                                                    </option>
                                                ))}
                                            </optgroup>
                                        ))}
                                    </select>
                                </fieldset>




                                <fieldset>
                                    <legend>Costo Compra(*)</legend>
                                    <input
                                        type="number"
                                        id="precio"
                                        name="precio"
                                        min="0"
                                        step="0.01"
                                        required
                                        value={precio}
                                        onChange={(e) => setPrecio(e.target.value)}
                                    />
                                </fieldset>
                                <fieldset>
                                    <legend>Costo Venta</legend>
                                    <input
                                        type="number"
                                        id="precioAnterior"
                                        name="precioAnterior"
                                        min="0"
                                        step="0.01"
                                        required
                                        value={precioAnterior}
                                        onChange={(e) => setPrecioAnterior(e.target.value)}
                                    />
                                </fieldset>

                                <fieldset>
                                    <legend>Más vendido (*)</legend>
                                    <select
                                        id="masVendido"
                                        name="masVendido"
                                        value={masVendido}
                                        onChange={handleMasVendidoChange}
                                    >
                                        <option value="">Selecciona opcion</option>
                                        <option value="si">Si</option>
                                        <option value="no">No</option>
                                    </select>
                                </fieldset>
                                <fieldset>
                                    <legend>Disponible (*)</legend>
                                    <select
                                        id="stock"
                                        name="stock"
                                        value={stock}
                                        onChange={handleStock}
                                    >
                                        <option value="">Selecciona opción</option>
                                        <option value={1}>Disponible</option>
                                        <option value={0}>Agotado</option>
                                        <option value="elegir">Ingrese cantidad</option>
                                    </select>
                                    {stock === 'elegir' && (
                                        <input
                                            type="number"
                                            min="0"
                                            placeholder="Ingrese cantidad"
                                            value={cantidadStock}
                                            onChange={(e) => setCantidadStock(e.target.value)}
                                            required
                                        />
                                    )}
                                </fieldset>
                                <fieldset id='descripcion'>
                                    <legend>Descripción  </legend>
                                    <textarea
                                        id="descripcion"
                                        name="descripcion"
                                        required
                                        value={descripcion}
                                        onChange={(e) => setDescripcion(e.target.value)}
                                        placeholder="Descripción"
                                    />
                                </fieldset>

                                <div id='textLabel'>
                                    <label >Variaciones (opcionales) </label>
                                    <div id='flexLabel'> Dar a elegir a los clientes
                                        <input
                                            type="checkbox"
                                            id="verItems"
                                            name="verItems"
                                            checked={mostrarItems}
                                            onChange={handleCheckboxChange}
                                        />
                                    </div>
                                </div>
                                {
                                    mostrarItems && (
                                        <div className='items'>
                                            {[...Array(10)].map((_, index) => (
                                                <fieldset key={index}>
                                                    <legend>Variación</legend>
                                                    <input
                                                        type="text"
                                                        id={`item${index + 1}`}
                                                        name={`item${index + 1}`}
                                                        required
                                                        value={eval(`item${index + 1}`)}
                                                        onChange={(e) => eval(`setItem${index + 1}`)(e.target.value)}
                                                    />
                                                </fieldset>
                                            ))}
                                        </div>
                                    )
                                }

                                <label id='textLabel'>Imagenes</label>
                                {/* Sección de imágenes */}
                                <div className='image-container'>
                                    {[...Array(4)].map((_, index) => (
                                        <div key={index} className='image-input'>
                                            <input
                                                type="file"
                                                id={`imagen${index + 1}`}
                                                name={`imagen${index + 1}`}
                                                accept="image/*"
                                                onChange={(e) => handleImagenChange(e, index)}
                                                style={{ display: 'none' }} // Ocultar input file
                                                required
                                            />
                                            <label htmlFor={`imagen${index + 1}`} className={`image-label ${isImageSelected[index] ? 'selectedImage' : ''}`}>
                                                {isImageSelected[index] ? (
                                                    <img src={imagenPreview[index]} alt={`Vista previa ${index + 1}`} className='preview-image' />
                                                ) : (
                                                    <img src={imageIcon} alt="Seleccionar imagen" className='image-icon' />
                                                )}
                                            </label>
                                            {isImageSelected[index] && (
                                                <button type="button" onClick={() => eliminarImagen(index)} className='eliminar-imagen'>
                                                    Eliminar
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                            </div>
                            {mensaje ? (
                                <button type="button" className='btnLoading' disabled>
                                    {mensaje}
                                </button>
                            ) : (
                                <button type="button" onClick={crear} className='btnPost'>
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
