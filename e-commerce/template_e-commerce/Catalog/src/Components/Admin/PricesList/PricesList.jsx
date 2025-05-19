import UnderConstruction from '../../Construction/UnderConstruction'

// export default function PricesList() {
//     return (
//         <div>
            
//             <UnderConstruction />
//         </div>
//     );
// }

import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEdit, faArrowUp, faArrowDown, faSync, faEye, faInfo, faFile, faMoneyBill } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import Nologo from '../../../images/Nologo.jpeg';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import baseURL from '../../url';
import NewProduct from '../NewProduct/NewProduct';
import NewPricesListt from '../NewPricesList/NewPricesList';
import moneda from '../../moneda';
import { Link as Anchor } from "react-router-dom";
import imageIcon from '../../../images/imageIcon.png';
import { fetchUsuario, getUsuario } from '../../user';
export default function PricesList(idProducto =null) {
    const [pricesList, setPricesList] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [nuevoTitulo, setNuevoTitulo] = useState('');
    const [nuevaDescripcion, setNuevaDescripcion] = useState('');
    const [nuevoPrecio, setNuevoPrecio] = useState('');
    const [nuevoPrecioAnterior, setNuevoPrecioAnterior] = useState(0);

    const [priceList, setPriceList] = useState({});
    
    const [modalImagenVisible, setModalImagenVisible] = useState(false);
    const [modalPriceListVisible, setModalPriceListVisible] = useState(false);

    const [imagenSeleccionada, setImagenSeleccionada] = useState('');
    const [filtroId, setFiltroId] = useState('');
    const [filtroTitulo, setFiltroTitulo] = useState('');
    const [filtroCategoria, setFiltroCategoria] = useState('');
    const [filtroCategoria2, setFiltroCategoria2] = useState('');
    const [filtroMasVendido, setFiltroMasVendido] = useState('');
    const [ordenInvertido, setOrdenInvertido] = useState(false);
    
    const [imagenPreview2, setImagenPreview2] = useState(null);
    const [imagenPreview3, setImagenPreview3] = useState(null);
    const [imagenPreview4, setImagenPreview4] = useState(null);
    const [nuevaImagen, setNuevaImagen] = useState(null);
    const [nuevaImagen2, setNuevaImagen2] = useState(null);
    const [nuevaImagen3, setNuevaImagen3] = useState(null);
    const [nuevaImagen4, setNuevaImagen4] = useState(null);
    const [selectedSection, setSelectedSection] = useState('texto');
    const [nuevoMasVendido, setNuevoMasVendido] = useState('');
    
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
    const [nuevoStock, setNuevoStock] = useState('');
    
    const [visibleCount, setVisibleCount] = useState(20);
    
    
    






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

        //Producto seleccionado
    const [productoSeleccionado, setProductoSeleccionado] = useState('');
    
    const [cantidadStock, setCantidadStock] = useState(''); // Nuevo estado para cantidad de stock manual
        
    const [addingProduct, setAddingProduct] = useState(false);



    const [productos, setProductos] = useState([]);
    
    const handleShowMore = () => {
        setVisibleCount(prevCount => prevCount + 20);
    };

    useEffect(() => {
        cargarCategoriasYSubcategorias();
    }, []);


    const openModalPriceList = (item) => {
        setModalPriceListVisible(true);
        }
    const closeModalPriceList = () => {
        setModalPriceListVisible(false);
         }
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
    const cerrarModalImagen = () => {
        setModalImagenVisible(false);
    };
    const abrirModalImagenSeleccionada = (imagen) => {
        setImagenSeleccionada(imagen);
        setModalImagenVisible(true);
    };


    // useEffect(() => {
    //     cargarListaPrecios();

    // }, []);

    useEffect(() => {
        cargarListaPrecios();
    }, [idProducto]);

    useEffect(() => {
        // Actualiza el valor del select cuando cambia el estado nuevoEstado
        setNuevoTitulo(priceList.titulo);
        setNuevaDescripcion(priceList.descripcion);
        setNuevoPrecio(priceList.precio);
        setNuevoMasVendido(priceList.masVendido)
        setIdCategoria(priceList.idCategoria)
        setIdSubCategoria(priceList.idSubCategoria)
        setItem1(priceList.item1);
        setItem2(priceList.item2);
        setItem3(priceList.item3);
        setItem4(priceList.item4);
        setItem5(priceList.item5);
        setItem6(priceList.item6);
        setItem7(priceList.item7);
        setItem8(priceList.item8);
        setItem9(priceList.item9);
        setItem10(priceList.item10);
        setNuevoPrecioAnterior(priceList.precioAnterior)
        setNuevoStock(priceList.stock)
        setVerItems(priceList.verItems)
    }, [priceList]);

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


    const cargarListaPrecios = () => {
        const url = idProducto
    ? `${baseURL}/listaPreciosGet.php?idProducto=${idProducto}`
    : `${baseURL}/listaPreciosGet.php`;
        fetch(url, {
            method: 'GET',
        })
            .then(response => response.json())
            .then(data => {
                setPricesList(data.listaprecios || []);
                console.log(data.listaprecios)
            })
            .catch(error => console.error('Error al cargar lista de precios:', error));
    };

    const eliminarProducto = (idProducto) => {
        // Reemplaza el window.confirm con SweetAlert2
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
                fetch(`${baseURL}/productDelete.php?idProducto=${idProducto}`, {
                    method: 'DELETE',
                })
                    .then(response => response.json())
                    .then(data => {
                        Swal.fire(
                            '¡Eliminado!',
                            data.mensaje,
                            'success'
                        );
                        window.location.reload();
                        cargarListaPrecios();
                    })
                    .catch(error => {
                        console.error('Error al eliminar la Producto:', error);
                        toast.error(error);
                    });
            }
        });
    };

    const abrirModal = (item) => {
        setPriceList(item);
        setNuevoTitulo(item.titulo);
        setNuevaDescripcion(item.descripcion);
        setNuevoPrecio(item.precio);
        setModalVisible(true);
    };

    const cerrarModal = () => {
        setModalVisible(false);
        setMostrarItems(false)
    };

    const pricesListFiltered = pricesList.filter(item => {
        const idMatch = item.idProducto.toString().includes(filtroId);
        const tituloMatch = !filtroTitulo || item.titulo.toLowerCase().includes(filtroTitulo.toLowerCase());
        const categoriaMatch = item.idCategoria.toString().includes(filtroCategoria);
        const categoriasMatch = !filtroCategoria2 || item.categoria.includes(filtroCategoria2);
        return idMatch && tituloMatch && categoriaMatch && categoriasMatch;
    });

    const descargarExcel = () => {
        const data = pricesListFiltered.map(item => ({
            IdListaPrecio: item.idListaPrecio,
            Titulo: item.titulo,
            Categoria: item.categoria,
            Subcategoria: item.subcategoria,
            Imagen1: item.imagen1,
            Precio: item.precio,
            TipoLista: item.tipoLista,
            Estado: item.estado,

        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'PricesList');
        XLSX.writeFile(wb, 'pricesList.xlsx');
    };

    const descargarPDF = (pricesList) => {
        const pdf = new jsPDF();
        pdf.text('Lista de precios detallada', 10, 10);
    
        const columns = [
            { title: 'Id Lista', dataKey: 'idListaPrecio' },
            { title: 'Título', dataKey: 'titulo' },
            { title: 'Categoría', dataKey: 'categoria' },
            { title: 'Subcategoría', dataKey: 'subcategoria' },
            { title: 'Imagen', dataKey: 'imagen1' },
            { title: 'Precio', dataKey: 'precio' },
            { title: 'Tipo Lista', dataKey: 'tipoLista' },
            { title: 'Estado', dataKey: 'estado' },
        ];
    
        const data = pricesListFiltered.map(item => ({
            idListaPrecio: item.idListaPrecio,
            titulo: item.titulo,
            categoria: item.categoria,
            subcategoria: item.subcategoria,
            imagen1: item.imagen1,
            precio: item.precio,
            tipoLista: item.tipoLista,
            estado: item.estado,
        }));
    
        pdf.autoTable({
            head: [columns.map(col => col.title)],
            body: data.map(item => columns.map(col => item[col.dataKey])),
            startY: 20,
            styles: { fontSize: 8, cellWidth: 'wrap' },
            columnStyles: {
                4: { cellWidth: 50 }, // for imagen1 URL
            }
        });
    
        pdf.save('lista_precios.pdf');
    };


    const recargarListaPrecios = () => {
        cargarListaPrecios();
    };
    const invertirOrden = () => {
        setPricesList([...pricesList].reverse());
        setOrdenInvertido(!ordenInvertido);
    };


    const handleUpdateText = async (idProducto) => {
        const payload = {

            nuevoTitulo: nuevoTitulo !== '' ? nuevoTitulo : priceList.titulo,
            nuevaDescripcion: nuevaDescripcion !== undefined ? nuevaDescripcion : priceList.descripcion,
            nuevoPrecio: nuevoPrecio !== '' ? nuevoPrecio : priceList.precio,
            nuevaCategoria: idCategoria !== '' ? idCategoria : priceList.idCategoria,
            nuevaSubCategoria: idSubCategoria !== 0 ? idSubCategoria : priceList.idSubCategoria,
            masVendido: nuevoMasVendido !== '' ? nuevoMasVendido : priceList.masVendido,
            item1: item1 !== undefined ? item1 : priceList.item1,
            item2: item2 !== undefined ? item2 : priceList.item2,
            item3: item3 !== undefined ? item3 : priceList.item3,
            item4: item4 !== undefined ? item4 : priceList.item4,
            item5: item5 !== undefined ? item5 : priceList.item5,
            item6: item6 !== undefined ? item6 : priceList.item6,
            item7: item7 !== undefined ? item7 : priceList.item7,
            item8: item8 !== undefined ? item8 : priceList.item8,
            item9: item9 !== undefined ? item9 : priceList.item9,
            item10: item10 !== undefined ? item10 : priceList.item10,
            precioAnterior: nuevoPrecioAnterior !== 0 ? nuevoPrecioAnterior : priceList.precioAnterior,
            stock: nuevoStock === 'elegir' ? cantidadStock : nuevoStock !== '' ? nuevoStock : priceList.stock,
            verItems: verItems !== '' ? verItems : priceList.verItems,
        };

        fetch(`${baseURL}/productoTextPut.php?idProducto=${idProducto}`, {
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
                    cargarListaPrecios();
                    cerrarModal()
                }
            })
            .catch(error => {
                console.log(error.message);
                toast.error(error.message);
            });
    };

    const handleFileChange = (event, setFile, setPreview) => {
        const file = event.target.files[0];

        if (file) {
            // Crear una URL de objeto para la imagen seleccionada
            const previewURL = URL.createObjectURL(file);
            setFile(file);
            setPreview(previewURL);
        }
    };
    const handleEditarImagenBanner = async (idProducto) => {
        const formData = new FormData();
        formData.append('idProducto', idProducto);
        formData.append('updateAction', 'update'); // Campo adicional para indicar que es una actualización

        if (nuevaImagen) {
            formData.append('imagen1', nuevaImagen);
        }
        if (nuevaImagen2) {
            formData.append('imagen2', nuevaImagen2);
        }
        if (nuevaImagen3) {
            formData.append('imagen3', nuevaImagen3);
        }
        if (nuevaImagen4) {
            formData.append('imagen4', nuevaImagen4);
        }

        fetch(`${baseURL}/productoImagePut.php`, {
            method: 'POST',  // Cambiado a POST
            body: formData
        })
            .then(response => {
                // Manejar el caso cuando la respuesta no es un JSON válido o está vacía
                if (!response.ok) {
                    throw new Error('La solicitud no fue exitosa');

                }

                return response.json();
            })
            .then(data => {
                if (data.error) {

                    toast.error(data.error);
                    console.log(formData)
                } else {

                    toast.success(data.mensaje);
                    window.location.reload();
                }
            })
            .catch(error => {
                console.log(error)
                toast.error(error.message);
                console.log(formData)
                console.log(idProducto)
            });
    };

    const handleSectionChange = (section) => {
        setSelectedSection(section);
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
                console.log(data.categorias)
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
    const handleCheckboxChange = (event) => {
        const isChecked = event.target.checked;
        setVerItems(isChecked ? 'Si' : 'No');
        setMostrarItems(isChecked);
    };
    async function guardarCambios(idProducto) {
        try {
            await handleEditarImagenBanner(idProducto);
            await handleUpdateText(idProducto);
        } catch (error) {
            console.error('Error al guardar los cambios:', error);
            toast.error('Error al guardar los cambios');
        }
    }


    const handleStock = (e) => {
        setStock(e.target.value);
        if (e.target.value !== 'elegir') {
            setCustomStock('');
        }
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
    return (
        <div>
            
            <h1 className='titles-text-heading'>Lista de precios</h1>

            <ToastContainer />
            <div className='deFlexContent'>

                <div className='deFlex2'>
                    <NewPricesListt/>
                    <button className='excel' onClick={descargarExcel}><FontAwesomeIcon icon={faArrowDown} /> Excel</button>
                    <button className='pdf' onClick={descargarPDF}><FontAwesomeIcon icon={faArrowDown} /> PDF</button>
                </div>
                <div className='filtrosContain'>
                    <div className='inputsColumn'>
                        <button  >{String(pricesListFiltered?.length)?.replace(/\B(?=(\d{3})+(?!\d))/g, ".")} / {String(pricesList?.length)?.replace(/\B(?=(\d{3})+(?!\d))/g, ".")} </button>
                    </div>
                    <div className='inputsColumn'>
                        <input type="number" value={filtroId} onChange={(e) => setFiltroId(e.target.value)} placeholder='Id Producto' />
                    </div>

                    <div className='inputsColumn'>
                        <input type="text" value={filtroTitulo} onChange={(e) => setFiltroTitulo(e.target.value)} placeholder='Titulo' />
                    </div>

                    <div className='inputsColumn'>
                        <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}>
                            <option value="">Categorias</option>
                            {
                                categorias.map(item => (
                                    <option value={item?.idCategoria}>{item?.categoria}</option>
                                ))
                            }
                        </select>
                    </div>

                    {/* <div className='inputsColumn'>
                        <select value={filtroMasVendido} onChange={(e) => setFiltroMasVendido(e.target.value)}>
                            <option value="">Más vendidos</option>
                            <option value="si">Si</option>
                            <option value="no">No</option>

                        </select>
                    </div> */}

                    <button className='reload' onClick={recargarListaPrecios}><FontAwesomeIcon icon={faSync} /></button>
                    <button className='reverse' onClick={invertirOrden}>
                        {ordenInvertido ? <FontAwesomeIcon icon={faArrowUp} /> : <FontAwesomeIcon icon={faArrowDown} />}
                    </button>

                </div>

            </div>


            {modalImagenVisible && (
                <div className="modalImg">
                    <div className="modal-contentImg">


                        <span className="close2" onClick={cerrarModalImagen}>
                            &times;
                        </span>

                        <img src={imagenSeleccionada} alt="Imagen Seleccionada" />
                    </div>
                </div>
            )}

            {modalVisible && (
                <div className="modal">
                    <div className="modal-content">
                        <div className='deFlexBtnsModal'>

                            <div className='deFlexBtnsModal'>
                                <button
                                    className={selectedSection === 'texto' ? 'selected' : ''}
                                    onClick={() => handleSectionChange('texto')}
                                >
                                    Editar Lista de precios
                                </button>
                            </div>
                            <span className="close" onClick={cerrarModal}>
                                &times;
                            </span>
                        </div>
                        <div className='sectiontext' style={{ display: selectedSection === 'texto' ? 'flex' : 'none' }}>
                            <div className='flexGrap'>


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
                                        
                                        {productos.map((producto) => (
                                            <option key={producto.id} value={producto.id}>
                                                {producto.titulo}
                                            </option>
                                        ))}
                                    </select>

                                    {productoSeleccionado && (
                                        <div style={{ marginTop: '10px' }}>
                                            <img
                                                src={productos.find(p => 
                                                    
                                                     p.titulo === productoSeleccionado)?.imagen1 || Nologo}
                                                   
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

                            <button className='btnPost' onClick={() => guardarCambios(priceList.idProducto)} >Guardar </button>

                        </div>

                        <div className='sectionImg' style={{ display: selectedSection === 'imagenes' ? 'flex' : 'none' }}>

                            <button className='btnPost' onClick={() => handleEditarImagenBanner(priceList.idProducto)}>Guardar </button>

                        </div>



                    </div>
                </div>
            )}
            <div className='table-container'>
                <table className='table'>
                    <thead>
                        <tr>
                            <th>Código Producto</th>
                            <th>Imagen</th>
                            <th>Titulo</th>
                            <th>Precio</th>                   
                            <th>Lista de precio</th>
                            <th>Categoria</th>
                            <th>Subcategoria</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                            
                        </tr>
                    </thead>
                    <tbody>
                        {pricesListFiltered?.slice(0, visibleCount)?.map(item => (
                            <tr key={item.idListaPrecio}>
                                <td>{item.idProducto}</td>
                                <td>
                                    {item.imagen1 ? (
                                        <img src={item.imagen1} alt="imagen1" />
                                    ) : (
                                        <span className='imgNonetd'>
                                            Sin imagen
                                        </span>
                                    )}
                                </td>
                                <td>{item.titulo}</td>

                                <td style={{
                                    color: '#008000',
                                }}>
                                    {moneda} {`${item?.precio}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                                </td>

                                <td>{item.tipoLista}</td>

                                {categorias
                                    ?.filter(categoriaFiltrada => categoriaFiltrada.idCategoria === item.idCategoria)
                                    ?.map(categoriaFiltrada => (
                                        <td
                                            key={categoriaFiltrada.idCategoria}
                                            style={{ color: '#DAA520' }}
                                        >
                                            {categoriaFiltrada.categoria}
                                        </td>
                                    ))
                                }
                                <td>
                                    {item.idSubCategoria === 0
                                        ? 'sin seleccionar'
                                        :
                                        <>
                                            {subcategorias
                                                ?.filter(subcategoriaFiltrada => subcategoriaFiltrada.idSubCategoria === item.idSubCategoria)
                                                ?.map(subcategoriaFiltrada => (
                                                    <>
                                                        {subcategoriaFiltrada?.subcategoria}
                                                    </>
                                                ))
                                            }
                                        </>
                                    }
                                </td>
                                <td>{item.estado}</td>




                                <td>
                                    {loading ? (
                                        <></>
                                    ) : usuarioLegued?.idUsuario ? (
                                        <>
                                            {usuarioLegued?.rol === 'admin' ? (
                                                <>

                                                {/*Button for see the prices List*/}
                                                {/*Class for priceList is ProductosData.css*/}
                                                    {/* <button className='priceList' onClick={() => openModalPriceList(item)}>
                                                        <FontAwesomeIcon icon={faMoneyBill} />
                                                    </button> */}

                                                {/****************************************/}    

                                                    <button className='eliminar' onClick={() => eliminarProducto(item.idProducto)}>
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </button>
                                                    <button className='editar' onClick={() => abrirModal(item)}>
                                                        <FontAwesomeIcon icon={faEdit} />
                                                    </button>
                                                    <Anchor className='editar' to={`/producto/${item?.idProducto}/${item?.titulo?.replace(/\s+/g, '-')}`}>
                                                        <FontAwesomeIcon icon={faEye} />
                                                    </Anchor>
                                                </>
                                            ) : usuarioLegued?.rol === 'colaborador' ? (
                                                <>
                                                    <button className='eliminar' onClick={() => eliminarProducto(item.idProducto)}>
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </button>
                                                    <button className='editar' onClick={() => abrirModal(item)}>
                                                        <FontAwesomeIcon icon={faEdit} />
                                                    </button>
                                                    <Anchor className='editar' to={`/producto/${item?.idProducto}/${item?.titulo?.replace(/\s+/g, '-')}`}>
                                                        <FontAwesomeIcon icon={faEye} />
                                                    </Anchor>
                                                </>
                                            ) : (
                                                <></>
                                            )}
                                        </>
                                    ) : (
                                        <>

                                            <button className='eliminar' onClick={() => eliminarProducto(item.idProducto)}>
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                            <button className='editar' onClick={() => abrirModal(item)}>
                                                <FontAwesomeIcon icon={faEdit} />
                                            </button>
                                            <Anchor className='editar' to={`/producto/${item?.idProducto}/${item?.titulo?.replace(/\s+/g, '-')}`}>
                                                <FontAwesomeIcon icon={faEye} />
                                            </Anchor>
                                        </>
                                    )}

                                </td>


                            </tr>
                        ))}
                    </tbody>

                </table>
            </div>
            {modalPriceListVisible && (

            <div className="modal">
                <div className="modal-content">
                    <span className="close" onClick={closeModalPriceList}>&times;</span>
                    <h2>Lista de precios</h2>
                    <p>Este es un modal vacío por ahora.</p>
                </div>
            </div>
        )}

            {pricesListFiltered?.length > visibleCount && (
                <button onClick={handleShowMore} id="show-more-btn">
                    Mostrar  más </button>
            )}
        </div>
    );
};
