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

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import baseURL from '../../url';
import NewProduct from '../NewProduct/NewProduct';
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
    const [imagenPreview, setImagenPreview] = useState(null);
    const [imagenPreview2, setImagenPreview2] = useState(null);
    const [imagenPreview3, setImagenPreview3] = useState(null);
    const [imagenPreview4, setImagenPreview4] = useState(null);
    const [nuevaImagen, setNuevaImagen] = useState(null);
    const [nuevaImagen2, setNuevaImagen2] = useState(null);
    const [nuevaImagen3, setNuevaImagen3] = useState(null);
    const [nuevaImagen4, setNuevaImagen4] = useState(null);
    const [selectedSection, setSelectedSection] = useState('texto');
    const [nuevoMasVendido, setNuevoMasVendido] = useState('');
    const [categorias, setCategoras] = useState([]);
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
    const [subcategorias, setSubCategorias] = useState([]);
    const [visibleCount, setVisibleCount] = useState(20);
    const [categoriasConSubcategorias, setCategoriasConSubcategorias] = useState([]);
    const [idCategoria, setIdCategoria] = useState('');
    const [idSubCategoria, setIdSubCategoria] = useState('');
    const [mostrarItems, setMostrarItems] = useState(false);
    const [cantidadStock, setCantidadStock] = useState('');
    const [verItems, setVerItems] = useState('No');
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
    //     cargarProductos();

    // }, []);

    useEffect(() => {
        cargarProductos();
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

    const cargarProductos = () => {
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
                        cargarProductos();
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


    const recargarProductos = () => {
        cargarProductos();
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
                    cargarProductos();
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
            
            <h1>Lista de precios</h1>

            <ToastContainer />
            <div className='deFlexContent'>

                <div className='deFlex2'>
                    {/* <NewProduct /> */}
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

                    <button className='reload' onClick={recargarProductos}><FontAwesomeIcon icon={faSync} /></button>
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
                                    Editar Texto
                                </button>
                            </div>
                            <span className="close" onClick={cerrarModal}>
                                &times;
                            </span>
                        </div>
                        <div className='sectiontext' style={{ display: selectedSection === 'texto' ? 'flex' : 'none' }}>
                            <div className='flexGrap'>
                                <fieldset id='titulo'>
                                    <legend>Titulo (*)</legend>
                                    <input
                                        type="text"
                                        value={nuevoTitulo}
                                        onChange={(e) => setNuevoTitulo(e.target.value)}
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
                                        {
                                            categorias
                                                ?.filter(categoriaFiltrada => categoriaFiltrada?.idCategoria === priceList?.idCategoria)
                                                ?.map(categoriaFiltrada => (

                                                    <option value={priceList?.categoria}>{categoriaFiltrada?.categoria}
                                                        {subcategorias
                                                            ?.filter(subcategoriaFiltrada => subcategoriaFiltrada.idSubCategoria === priceList.idSubCategoria)
                                                            ?.map(subcategoriaFiltrada => (
                                                                <>
                                                                    {` >`} {subcategoriaFiltrada?.subcategoria}
                                                                </>
                                                            ))
                                                        }

                                                    </option>
                                                ))
                                        }
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
                                    <legend>Precio (*)</legend>
                                    <input
                                        type="number"
                                        value={nuevoPrecio}
                                        onChange={(e) => setNuevoPrecio(e.target.value)}
                                    />
                                </fieldset>
                                <fieldset>
                                    <legend>Precio anterior </legend>
                                    <input
                                        type="number"
                                        value={nuevoPrecioAnterior}
                                        onChange={(e) => setNuevoPrecioAnterior(e.target.value)}
                                    />
                                </fieldset>

                                <fieldset>
                                    <legend>Más vendido (*)</legend>
                                    <select
                                        value={nuevoMasVendido !== '' ? nuevoMasVendido : priceList.masVendido}
                                        onChange={(e) => setNuevoMasVendido(e.target.value)}
                                    >
                                        <option value={priceList.masVendido}>{priceList.masVendido}</option>
                                        <option value="si">Si</option>
                                        <option value="no">No</option>
                                    </select>
                                </fieldset>
                                <fieldset>
                                    <legend>Stock (*)</legend>
                                    <select
                                        value={nuevoStock}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setNuevoStock(value);
                                            if (value === 'elegir') {
                                                setCantidadStock(priceList.stock); // Asigna el stock actual al campo cantidadStock
                                            }
                                        }}
                                    >
                                        <option value="">Selecciona opcion</option>
                                        <option value={1}>Disponible</option>
                                        <option value={0}>Agotado</option>
                                        <option value="elegir">Ingrese cantidad</option>
                                    </select>
                                    {nuevoStock === 'elegir' && (
                                        <input
                                            type="number"
                                            min="0"
                                            placeholder="Ingrese cantidad"
                                            value={cantidadStock} // Muestra el valor inicial del stock o el nuevo valor ingresado
                                            onChange={(e) => setCantidadStock(e.target.value)}
                                            required
                                        />
                                    )}
                                </fieldset>

                                <fieldset id='descripcion'>
                                    <legend>Descripcion </legend>
                                    <textarea
                                        type="text"
                                        value={nuevaDescripcion}
                                        onChange={(e) => setNuevaDescripcion(e.target.value)}
                                    />
                                </fieldset>
                                <div id='textLabel'>
                                    <label>Variaciones (opcionales)</label>
                                    <div id='flexLabel'>
                                        Dar a elegir a los clientes
                                        <input
                                            type="checkbox"
                                            value={verItems}
                                            checked={verItems === "Si"}
                                            onChange={handleCheckboxChange}
                                        />
                                    </div>
                                </div>


                                {verItems === 'Si' && (
                                    <div className='items'>
                                        <fieldset>
                                            <legend>Variación</legend>
                                            <input
                                                type="text"
                                                id="item1"
                                                name="item1"
                                                required
                                                value={item1}
                                                onChange={(e) => setItem1(e.target.value)}
                                            />
                                        </fieldset>

                                        <fieldset>
                                            <legend>Variación</legend>
                                            <input
                                                type="text"
                                                id="item2"
                                                name="item2"
                                                required
                                                value={item2}
                                                onChange={(e) => setItem2(e.target.value)}
                                            />
                                        </fieldset>

                                        <fieldset>
                                            <legend>Variación</legend>
                                            <input
                                                type="text"
                                                id="item3"
                                                name="item3"
                                                required
                                                value={item3}
                                                onChange={(e) => setItem3(e.target.value)}
                                            />
                                        </fieldset>

                                        <fieldset>
                                            <legend>Variación</legend>
                                            <input
                                                type="text"
                                                id="item4"
                                                name="item4"
                                                required
                                                value={item4}
                                                onChange={(e) => setItem4(e.target.value)}
                                            />
                                        </fieldset>

                                        <fieldset>
                                            <legend>Variación</legend>
                                            <input
                                                type="text"
                                                id="item5"
                                                name="item5"
                                                required
                                                value={item5}
                                                onChange={(e) => setItem5(e.target.value)}
                                            />
                                        </fieldset>

                                        <fieldset>
                                            <legend>Variación</legend>
                                            <input
                                                type="text"
                                                id="item6"
                                                name="item6"
                                                required
                                                value={item6}
                                                onChange={(e) => setItem6(e.target.value)}
                                            />
                                        </fieldset>

                                        <fieldset>
                                            <legend>Variación</legend>
                                            <input
                                                type="text"
                                                id="item7"
                                                name="item7"
                                                required
                                                value={item7}
                                                onChange={(e) => setItem7(e.target.value)}
                                            />
                                        </fieldset>

                                        <fieldset>
                                            <legend>Variación</legend>
                                            <input
                                                type="text"
                                                id="item8"
                                                name="item8"
                                                required
                                                value={item8}
                                                onChange={(e) => setItem8(e.target.value)}
                                            />
                                        </fieldset>

                                        <fieldset>
                                            <legend>Variación</legend>
                                            <input
                                                type="text"
                                                id="item9"
                                                name="item9"
                                                required
                                                value={item9}
                                                onChange={(e) => setItem9(e.target.value)}
                                            />
                                        </fieldset>

                                        <fieldset>
                                            <legend>Variación</legend>
                                            <input
                                                type="text"
                                                id="item10"
                                                name="item10"
                                                required
                                                value={item10}
                                                onChange={(e) => setItem10(e.target.value)}
                                            />
                                        </fieldset>


                                    </div>
                                )}

                            </div>
                            <label id='textLabel'>Imagenes</label>
                            <div className='previevProduct'>

                                {imagenPreview ? (
                                    <img src={imagenPreview} alt="Vista previa de la imagen" onClick={() => abrirModalImagenSeleccionada(priceList.imagen1)} />
                                ) : (
                                    <>
                                        {priceList.imagen1 ? (
                                            <img src={priceList.imagen1} alt="imagen" onClick={() => abrirModalImagenSeleccionada(priceList.imagen1)} />

                                        ) : (
                                            <span className='imgNone'>
                                                No hay imagen

                                            </span>
                                        )}
                                    </>
                                )}

                                {imagenPreview2 ? (
                                    <img src={imagenPreview2} alt="Vista previa de la imagen" />
                                ) : (
                                    <>
                                        {priceList.imagen2 ? (
                                            <img src={priceList.imagen2} alt="imagen" onClick={() => abrirModalImagenSeleccionada(priceList.imagen2)} />

                                        ) : (
                                            <span className='imgNone'>
                                                No hay imagen

                                            </span>
                                        )}
                                    </>
                                )}
                                {imagenPreview3 ? (
                                    <img src={imagenPreview3} alt="Vista previa de la imagen" />
                                ) : (
                                    <>
                                        {priceList.imagen3 ? (
                                            <img src={priceList.imagen3} alt="imagen" onClick={() => abrirModalImagenSeleccionada(priceList.imagen3)} />

                                        ) : (
                                            <span className='imgNone'>
                                                No hay imagen

                                            </span>
                                        )}
                                    </>
                                )}
                                {imagenPreview4 ? (
                                    <img src={imagenPreview4} alt="Vista previa de la imagen" />
                                ) : (
                                    <>
                                        {priceList.imagen4 ? (
                                            <img src={priceList.imagen4} alt="imagen" onClick={() => abrirModalImagenSeleccionada(priceList.imagen4)} />

                                        ) : (
                                            <span className='imgNone'>
                                                No hay imagen

                                            </span>
                                        )}
                                    </>
                                )}
                            </div>

                            <div className='image-container'>
                                <div className='image-input'>
                                    <img
                                        src={imageIcon}
                                        alt="Imagen de ejemplo"
                                        className='image-icon'
                                        onClick={() => document.getElementById('fileInput1').click()} // Al hacer clic, simula un clic en el input
                                    />
                                    <input
                                        id="fileInput1"
                                        type="file"
                                        accept="image/*"
                                        style={{ display: 'none' }} // Oculta el input
                                        onChange={(e) => handleFileChange(e, setNuevaImagen, setImagenPreview)}
                                    />
                                </div>

                                <div className='image-input'>
                                    <img
                                        src={imageIcon}
                                        alt="Imagen de ejemplo"
                                        className='image-icon'
                                        onClick={() => document.getElementById('fileInput2').click()}
                                    />
                                    <input
                                        id="fileInput2"
                                        type="file"
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        onChange={(e) => handleFileChange(e, setNuevaImagen2, setImagenPreview2)}
                                    />
                                </div>

                                <div className='image-input'>
                                    <img
                                        src={imageIcon}
                                        alt="Imagen de ejemplo"
                                        className='image-icon'
                                        onClick={() => document.getElementById('fileInput3').click()}
                                    />
                                    <input
                                        id="fileInput3"
                                        type="file"
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        onChange={(e) => handleFileChange(e, setNuevaImagen3, setImagenPreview3)}
                                    />
                                </div>

                                <div className='image-input'>
                                    <img
                                        src={imageIcon}
                                        alt="Imagen de ejemplo"
                                        className='image-icon'
                                        onClick={() => document.getElementById('fileInput4').click()}

                                    />
                                    <input
                                        id="fileInput4"
                                        type="file"
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        onChange={(e) => handleFileChange(e, setNuevaImagen4, setImagenPreview4)}
                                    />
                                </div>

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
