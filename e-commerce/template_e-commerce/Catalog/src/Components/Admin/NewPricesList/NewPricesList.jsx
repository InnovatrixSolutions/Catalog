import React, { useState, useEffect } from 'react';
import './NewPricesList.css'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import baseURL from '../../url';
import Nologo from '../../../images/Nologo.jpeg';
import { fetchUsuario, getUsuario } from '../../user';
import Swal from 'sweetalert2';
import planes from '../../planes';
export default function NewPricesList() {
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

    const [stock, setStock] = useState('');
    
    const [subcategorias, setSubCategorias] = useState([]);
    const [subcategoria, setSubCategoria] = useState([]);
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
    const [categoriasConSubcategorias, setCategoriasConSubcategorias] = useState([]);
    const [idCategoria, setIdCategoria] = useState('');
    const [idSubCategoria, setIdSubCategoria] = useState('');
    const [mostrarItems, setMostrarItems] = useState(false);
    const [verItems, setVerItems] = useState('No');
    const [customStock, setCustomStock] = useState('');
    const [estado, setEstado] = useState(''); // Nuevo estado para el campo de estado
    const [sku, setSku] = useState('');
    const [autoFill, setAutoFill] = useState(false); // controls disabled state

    const [tipoLista, setTipoLista] = useState('');

    //Producto seleccionado
    const [productoSeleccionado, setProductoSeleccionado] = useState('');

    const [cantidadStock, setCantidadStock] = useState(''); // Nuevo estado para cantidad de stock manual
    
    const [addingProduct, setAddingProduct] = useState(false);


    const [searchTerm, setSearchTerm] = useState('');
    const [filteredProductos, setFilteredProductos] = useState([]);
    const [productos, setProductos] = useState([]);

    useEffect(() => {
        const term = searchTerm.toLowerCase();
        const filtered = productos.filter((producto) =>
            producto.id?.toString().includes(term) ||
            producto.sku?.toLowerCase().includes(term) ||
            producto.titulo?.toLowerCase().includes(term)
        );
        setFilteredProductos(filtered);
    }, [searchTerm, productos]);
    
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
        // if (!formData.get('titulo') || !idCategoria || !formData.get('precio')) {
        //     toast.error('Por favor, complete todos los campos obligatorios.');
        //     return;
        // }

    // Validar que los campos obligatorios estén completos antes de crear FormData
    if (!formData.get('titulo') || !idCategoria || !formData.get('precio') || !formData.get('sku')) {
        toast.error('Por favor, complete todos los campos obligatorios.');
        setAddingProduct(false); // 👈 Para no dejar el botón en "Agregando..."
        return;
    }
    
        setAddingProduct(true); // Start loading

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



        formData.append('sku', sku);
        formData.append('productoSeleccionado', productoSeleccionado);
        
        formData.append('tipoLista', tipoLista);




        try {
            const response = await fetch(`${baseURL}/productosPost.php`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            console.log(data);

            if (data.mensaje) {
                toast.success(data.mensaje);
                window.location.reload();
            } else {
                toast.error(data.error);
                setAddingProduct(false); // 👈 Agregado aquí también
            }
        } catch (error) {
            console.error('Error al crear producto:', error);
            toast.error('Error de conexión. Inténtelo de nuevo.');
            setAddingProduct(false); // 👈 Agregado aquí
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

    useEffect(() => {
        if (productoSeleccionado) {
            
            //const producto = productos.find(p => p.titulo === parseInt(productoSeleccionado));
            const producto = productos.find(p => p.titulo === productoSeleccionado);
            console.log("PRODUCTO SELECCIONADO:", producto); // 👈
            if (producto) {
                setSku(producto.sku || ''); // <-- Update these based on log
                setTitulo(producto.titulo || '');
                setIdCategoria(producto.idCategoria || '');
                setIdSubCategoria(producto.idSubCategoria || '');
                setAutoFill(true);
            }
        } else {
            setSku('');
            setTitulo('');
            setIdCategoria('');
            setIdSubCategoria('');
            setAutoFill(false);
        }
    }, [productoSeleccionado, productos]);
    
    
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
            {/* <ToastContainer /> */}
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
                            <button className='selected'>Agregar Lista de precio por producto</button>
                            <span className="close" onClick={toggleModal}>&times;</span>
                        </div>
                        <form id="crearForm">

                            <div className='flexGrap'>
                                
                            <fieldset>
                                <legend>Buscar Producto (ID, SKU o Nombre)</legend>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Buscar por ID, SKU o nombre"
                                />
                            </fieldset>

                                
                                <fieldset>
                                    <legend>Seleccionar Producto</legend>
                                    <select
                                        id="productoSeleccionado"
                                        name="productoSeleccionado"
                                        value={productoSeleccionado}
                                        onChange={(e) => 
                                            
                                            setProductoSeleccionado(e.target.value)}
                                    >
                                        <option value="">Selecciona un producto</option>
                                        
                                        {filteredProductos.map((producto) => (
                                            <option key={producto.id} value={producto.id}>
                                                {producto.titulo} 
                                            </option>
                                            
                                        ))}
                                    </select>

                                    {filteredProductos && (
                                        <div style={{ marginTop: '10px' }}>
                                            <img
                                                src={productos.find(p => 
                                                    
                                                    //  p.titulo === productoSeleccionado)?.imagen1 || Nologo}
                                                     p.titulo === productoSeleccionado)?.imagen1 || productoSeleccionado.imagen1}
                                                   
                                                alt="Vista previa"
                                                style={{ width: '40px', height: '40px', objectFit: 'cover', marginTop: '10px', borderRadius: '8px' }}
                                            />
                                        </div>
                                    )}
                                </fieldset>



                                <fieldset>
                                    <legend>Categoría / Subcategoría (*)</legend>
                                    {autoFill ? (
                                        <label style={{ padding: '8px', display: 'block' }}>
                                            {
                                                categoriasConSubcategorias.find(cat => cat.idCategoria === parseInt(idCategoria))?.categoria
                                            }
                                            {idSubCategoria && (
                                                <>
                                                    {' > '}
                                                    {
                                                        subcategorias.find(sub => sub.idSubCategoria === parseInt(idSubCategoria))?.subcategoria
                                                    }
                                                </>
                                            )}
                                        </label>
                                    ) : (
                                        <select
                                            id="categoriaSeleccionada"
                                            name="categoriaSeleccionada"
                                            onChange={handleCategoriaSeleccion}
                                            required
                                            value={idSubCategoria ? `${idCategoria}-${idSubCategoria}` : idCategoria}
                                        >
                                            <option value="">Categoría / subcategoría</option>
                                            {categoriasConSubcategorias.map(categoria => (
                                                <optgroup key={categoria.idCategoria} label={categoria.categoria}>
                                                    <option value={`${categoria.idCategoria}`}>{categoria.categoria}</option>
                                                    {categoria.subcategorias.map(subcategoria => (
                                                        <option key={subcategoria.idSubCategoria} value={`${categoria.idCategoria}-${subcategoria.idSubCategoria}`}>
                                                            {categoria.categoria} &gt; {subcategoria.subcategoria}
                                                        </option>
                                                    ))}
                                                </optgroup>
                                            ))}
                                        </select>
                                    )}
                                </fieldset>


                                <fieldset>
                                <legend>Tipo de lista (*)</legend>
                                <select
                                    id="tipoLista"
                                    name="tipoLista"
                                    value={tipoLista}
                                    onChange={(e) => setTipoLista(e.target.value)}
                                    required
                                >
                                    <option value="">Seleccione tipo</option>
                                    <option value="Catalogo">catalogo</option>
                                    <option value="Dropshipper">dropshipper</option>
                                </select>
                                </fieldset>

                                <fieldset>
                                    <legend>SKU (*)</legend>
                                    {autoFill ? (
                                        <label style={{ padding: '8px', display: 'block' }}>{sku}</label>
                                    ) : (
                                        <input
                                            type="text"
                                            id="sku"
                                            name="sku"
                                            required
                                            value={sku}
                                            onChange={(e) => setSku(e.target.value)}
                                            disabled={true} // Deshabilitar el campo si se selecciona un producto
                                        />
                                    )}
                                </fieldset>


                                <fieldset>
                                    <legend>Precio (*)</legend>
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
                                    <legend>Estado (*)</legend>
                                    <select
                                        id="stock"
                                        name="stock"
                                        value={stock}
                                        onChange={handleStock}
                                    >
                                        <option value="">Selecciona opción</option>
                                        <option value={1}>Anterior</option>
                                        <option value={0}>Actual</option>
                                        
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


                                {autoFill && (
                                    <button
                                        type="button"
                                        className="btnReset"
                                        style={{ marginTop: '10px' }}
                                        onClick={() => {
                                            setProductoSeleccionado('');
                                            setSku('');
                                            setIdCategoria('');
                                            setIdSubCategoria('');
                                            setAutoFill(false);
                                        }}
                                    >
                                        Limpiar selección
                                    </button>
                                )}




                            </div>

                            <button
                                type="button"
                                onClick={crear}
                                className={addingProduct ? 'btnLoading' : 'btnPost'}
                                disabled={addingProduct}
                            >
                                {addingProduct ? 'Agregando...' : 'Agregar'}
                            </button>

                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
