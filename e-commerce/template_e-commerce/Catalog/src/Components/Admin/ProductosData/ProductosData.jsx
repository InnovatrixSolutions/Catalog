import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEdit, faArrowUp, faArrowDown, faSync, faEye, faInfo, faFile } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import './ProductosData.css'
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import baseURL from '../../url';
import NewProduct from '../NewProduct/NewProduct';
import moneda from '../../moneda';
import { Link as Anchor } from "react-router-dom";
import imageIcon from '../../../images/imageIcon.png';
import { fetchUsuario, getUsuario } from '../../user';

export default function ProductosData() {
  const [productos, setProductos] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [nuevoTitulo, setNuevoTitulo] = useState('');
  const [nuevaDescripcion, setNuevaDescripcion] = useState('');
  const [nuevoPrecio, setNuevoPrecio] = useState('');
  const [nuevoPrecioAnterior, setNuevoPrecioAnterior] = useState(0);
  const [producto, setProducto] = useState({});
  const [modalImagenVisible, setModalImagenVisible] = useState(false);

  const [imagenSeleccionada, setImagenSeleccionada] = useState('');
  const [filtroId, setFiltroId] = useState('');
  const [filtroTitulo, setFiltroTitulo] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroCategoria2, setFiltroCategoria2] = useState('');
  const [filtroMasVendido, setFiltroMasVendido] = useState('');
  const [filtroSKU, setFiltroSKU] = useState('');

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

  // Selección múltiple para eliminar
  const [selectedProducts, setSelectedProducts] = useState([]);

  const [nuevoSku, setNuevoSku] = useState('');

  const handleSelectProduct = (idProducto) => {
    setSelectedProducts(prev =>
      prev.includes(idProducto)
        ? prev.filter(id => id !== idProducto)
        : [...prev, idProducto]
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === productosFiltrados.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(productosFiltrados.map(p => p.idProducto));
    }
  };

  const handleDeleteSelected = () => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `Vas a eliminar ${selectedProducts.length} productos.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          for (const id of selectedProducts) {
            await fetch(`${baseURL}/productDelete.php?idProducto=${id}`, {
              method: 'DELETE',
            });
          }
          toast.success('Productos eliminados correctamente');
          setSelectedProducts([]);
          cargarProductos();
        } catch (err) {
          console.error(err);
          toast.error('Error eliminando productos');
        }
      }
    });
  };

  const handleShowMore = () => {
    setVisibleCount(prevCount => prevCount + 20);
  };

  useEffect(() => {
    cargarCategoriasYSubcategorias();
  }, []);

  const cargarCategoriasYSubcategorias = async () => {
    try {
      const [categoriasRes, subcategoriasRes] = await Promise.all([
        fetch(`${baseURL}/categoriasGet.php`).then(res => res.json()),
        fetch(`${baseURL}/subCategoriaGet.php`).then(res => res.json()),
      ]);

      const categorias = categoriasRes.categorias || [];
      const subcategorias = subcategoriasRes.subcategorias || [];

      const categoriasConSub = categorias.map(categoria => ({
        ...categoria,
        subcategorias: subcategorias.filter(sub => sub.idCategoria === categoria.idCategoria),
      }));

      setCategoriasConSubcategorias(categoriasConSub);
    } catch (error) {
      console.error('Error al cargar categorías y subcategorías:', error);
    }
  };

  const handleCategoriaSeleccion = (e) => {
    const selectedValue = e.target.value;
    const [categoriaId, subCategoriaId] = selectedValue.split('-');

    setIdCategoria(categoriaId);
    if (subCategoriaId) {
      setIdSubCategoria(subCategoriaId);
    } else {
      setIdSubCategoria('');
    }
  };

  const cerrarModalImagen = () => {
    setModalImagenVisible(false);
  };

  const abrirModalImagenSeleccionada = (imagen) => {
    setImagenSeleccionada(imagen);
    setModalImagenVisible(true);
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  useEffect(() => {
    setNuevoTitulo(producto.titulo);
    setNuevaDescripcion(producto.descripcion);
    setNuevoPrecio(producto.precio);
    setNuevoMasVendido(producto.masVendido)
    setIdCategoria(producto.idCategoria)
    setIdSubCategoria(producto.idSubCategoria)
    setItem1(producto.item1);
    setItem2(producto.item2);
    setItem3(producto.item3);
    setItem4(producto.item4);
    setItem5(producto.item5);
    setItem6(producto.item6);
    setItem7(producto.item7);
    setItem8(producto.item8);
    setItem9(producto.item9);
    setItem10(producto.item10);
    setNuevoPrecioAnterior(producto.precioAnterior)
    setNuevoStock(producto.stock)
    setVerItems(producto.verItems)
    setNuevoSku(producto.sku);
  }, [producto]);

      const mode = process.env.REACT_APP_MODE || "catalogo";

const modeToBackend = {
    dropshipper: "dropshipper",
    catalogo: "catalogo"
};

const tipoLista = modeToBackend[mode] || "catalogo";

  const cargarProductos = () => {
    fetch(`${baseURL}/productosGet.php?tipo_lista=${tipoLista}`, {
      method: 'GET',
    })
      .then(response => response.json())
      .then(data => {
        setProductos(data.productos || []);
        console.log(data.productos)
      })
      .catch(error => console.error('Error al cargar productos:', error));
  };

  const eliminarProducto = (idProducto) => {
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
            Swal.fire('¡Eliminado!', data.mensaje, 'success');
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

  const abrirModal = async (item) => {
    setProducto(item);
    setNuevoTitulo(item.titulo);
    setNuevaDescripcion(item.descripcion);
    setNuevoPrecio(item.precio);
    setModalVisible(true);
     await cargarListasDePrecios(item.idProducto);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setMostrarItems(false)
  };

  const productosFiltrados = productos.filter(item => {
    const idMatch = item.idProducto.toString().includes(filtroId);
    const tituloMatch = !filtroTitulo || item.titulo.toLowerCase().includes(filtroTitulo.toLowerCase());
    const categoriaMatch = item.idCategoria.toString().includes(filtroCategoria);
    const masVendidoMatch = !filtroMasVendido || item.masVendido.includes(filtroMasVendido);
    const categoriasMatch = !filtroCategoria2 || item.categoria.includes(filtroCategoria2);
    const skuMatch = !filtroSKU || (item.sku && item.sku.toLowerCase().includes(filtroSKU.toLowerCase()));
    return idMatch && tituloMatch && categoriaMatch && masVendidoMatch && categoriasMatch && skuMatch;
  });

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;
  const totalPages = Math.ceil(productosFiltrados.length / pageSize);
  const paginatedProducts = productosFiltrados.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const descargarExcel = () => {
    const data = productosFiltrados.map(item => ({
      IdProducto: item.idProducto,
      Titulo: item.titulo,
      Descripcion: item.descripcion,
      Precio: item.precio,
      Fecha: item.createdAt,
      MasVendido: item.masVendido,
      Imagen1: item.imagen1,
      Imagen2: item.imagen2,
      Imagen3: item.imagen3,
      Imagen4: item.imagen4,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Productos');
    XLSX.writeFile(wb, 'productos.xlsx');
  };

  const descargarPDF = () => {
    const pdf = new jsPDF();
    pdf.text('Lista de Productos', 10, 10);

    const columns = [
      { title: 'IdProducto', dataKey: 'idProducto' },
      { title: 'Titulo', dataKey: 'titulo' },
      { title: 'Descripcion', dataKey: 'descripcion' },
      { title: 'Precio', dataKey: 'precio' },
      { title: 'MasVendido', dataKey: 'masVendido' },
      { title: 'Fecha', dataKey: 'createdAt' },
    ];

    const data = productosFiltrados.map(item => ({
      IdProducto: item.idProducto,
      Titulo: item.titulo,
      Descripcion: item.descripcion,
      Precio: item.precio,
      MasVendido: item.masVendido,
      Fecha: item.createdAt,
    }));

    pdf.autoTable({
      head: [columns.map(col => col.title)],
      body: data.map(item => Object.values(item)),
    });

    pdf.save('productos.pdf');
  };

  const recargarProductos = () => {
    cargarProductos();
  };

  const invertirOrden = () => {
    setProductos([...productos].reverse());
    setOrdenInvertido(!ordenInvertido);
  };

  const handleUpdateText = async (idProducto) => {
    const payload = {
      nuevoTitulo: nuevoTitulo !== '' ? nuevoTitulo : producto.titulo,
      nuevaDescripcion: nuevaDescripcion !== undefined ? nuevaDescripcion : producto.descripcion,
      nuevoPrecio: nuevoPrecio !== '' ? nuevoPrecio : producto.precio,
      nuevaCategoria: idCategoria !== '' ? idCategoria : producto.idCategoria,
      nuevaSubCategoria: idSubCategoria !== 0 ? idSubCategoria : producto.idSubCategoria,
      masVendido: nuevoMasVendido !== '' ? nuevoMasVendido : producto.masVendido,
      item1: item1 !== undefined ? item1 : producto.item1,
      item2: item2 !== undefined ? item2 : producto.item2,
      item3: item3 !== undefined ? item3 : producto.item3,
      item4: item4 !== undefined ? item4 : producto.item4,
      item5: item5 !== undefined ? item5 : producto.item5,
      item6: item6 !== undefined ? item6 : producto.item6,
      item7: item7 !== undefined ? item7 : producto.item7,
      item8: item8 !== undefined ? item8 : producto.item8,
      item9: item9 !== undefined ? item9 : producto.item9,
      item10: item10 !== undefined ? item10 : producto.item10,
      precioAnterior: nuevoPrecioAnterior !== 0 ? nuevoPrecioAnterior : producto.precioAnterior,
      stock: nuevoStock === 'elegir' ? cantidadStock : nuevoStock !== '' ? nuevoStock : producto.stock,
      sku: nuevoSku !== '' ? nuevoSku : producto.sku,
      verItems: verItems !== '' ? verItems : producto.verItems,
    };

fetch(`${baseURL}/productoTextPut.php?idProducto=${idProducto}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
})

      .then(response => response.json())
      .then(data => {
        if (data.error) {
          Swal.fire('Error!', data.error, 'error');
        } else {
          Swal.fire('Editado!', data.mensaje, 'success');
          cargarProductos();
          cerrarModal();
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
      const previewURL = URL.createObjectURL(file);
      setFile(file);
      setPreview(previewURL);
    }
  };

  const handleEditarImagenBanner = async (idProducto) => {
    const formData = new FormData();
    formData.append('idProducto', idProducto);
    formData.append('updateAction', 'update');

    if (nuevaImagen) formData.append('imagen1', nuevaImagen);
    if (nuevaImagen2) formData.append('imagen2', nuevaImagen2);
    if (nuevaImagen3) formData.append('imagen3', nuevaImagen3);
    if (nuevaImagen4) formData.append('imagen4', nuevaImagen4);

    fetch(`${baseURL}/productoImagePut.php`, {
      method: 'POST',
      body: formData
    })
      .then(response => {
        if (!response.ok) throw new Error('La solicitud no fue exitosa');
        return response.json();
      })
      .then(data => {
        if (data.error) {
          toast.error(data.error);
        } else {
          toast.success(data.mensaje);
          cargarProductos(); // refresca tabla sin matar el modal

        }
      })
      .catch(error => {
        console.log(error)
        toast.error(error.message);
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
    await guardarPreciosEditados();

    // ✅ refresca lo que acabas de guardar
    await cargarListasDePrecios(idProducto);

    Swal.fire('Listo', 'Producto y listas de precios actualizados', 'success');
    cargarProductos();
    cerrarModal();
  } catch (e) {
    console.error(e);
    Swal.fire('Error', e.message || 'Error al guardar', 'error');
  }
}


  // Usuario logueado
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
    Swal.fire('¡Error!', '¡No tienes permisos!', 'error');
  }

  const actualizarPrecio = async (idListaPrecio, precio) => {
  const fd = new FormData();
  fd.append('idListaPrecio', idListaPrecio);
  fd.append('precio', String(precio));

  const res = await fetch(`${baseURL}/listaPreciosPut.php`, { method: 'POST', body: fd });
  const data = await res.json();

  if (!res.ok || data?.error) throw new Error(data?.error || 'Error actualizando precio');
};

const guardarPreciosEditados = async () => {
  const tasks = [];

  const push = (idLP, val, label) => {
    const n = Number(val);
    if (!idLP) {
      // Si quieres: aquí podrías CREAR la lista en vez de ignorarla
      throw new Error(`No existe idListaPrecio para: ${label}. Debes crear esa lista primero.`);
    }
    if (isNaN(n) || n < 0) {
      throw new Error(`Precio inválido en: ${label}`);
    }
    tasks.push(actualizarPrecio(idLP, n));
  };

  // ojo: solo empuja si el input tiene valor, si no, puedes dejarlo opcional
  if (catPrecioActual !== '') push(idCatActual, catPrecioActual, 'Catálogo Actual');
  if (catPrecioAnterior !== '') push(idCatAnterior, catPrecioAnterior, 'Catálogo Anterior');
  if (dropPrecioActual !== '') push(idDropActual, dropPrecioActual, 'Dropshipper Actual');
  if (dropPrecioAnterior !== '') push(idDropAnterior, dropPrecioAnterior, 'Dropshipper Anterior');

  if (tasks.length === 0) {
    throw new Error('No hay precios para actualizar.');
  }

  await Promise.all(tasks);
};

// =========================
// LISTAS DE PRECIOS (EDICIÓN)
// =========================
const [catPrecioActual, setCatPrecioActual] = useState('');
const [catPrecioAnterior, setCatPrecioAnterior] = useState('');
const [dropPrecioActual, setDropPrecioActual] = useState('');
const [dropPrecioAnterior, setDropPrecioAnterior] = useState('');

const [idCatActual, setIdCatActual] = useState(null);
const [idCatAnterior, setIdCatAnterior] = useState(null);
const [idDropActual, setIdDropActual] = useState(null);
const [idDropAnterior, setIdDropAnterior] = useState(null);

const [loadingPrecios, setLoadingPrecios] = useState(false);


const cargarListasDePrecios = async (idProducto) => {
  setLoadingPrecios(true);
  try {
    const res = await fetch(`${baseURL}/listaPreciosGet.php?idProducto=${idProducto}`, { method: 'GET' });

    const text = await res.text();
    let data = {};
    try { data = JSON.parse(text); } catch {}
    console.log("RESP listaPreciosGet:", data);


    if (!res.ok || data?.error) throw new Error(data?.error || text || 'Error cargando listas de precios');

    const precios = data?.listaprecios || data?.listaPrecios || data?.precios || [];


    const find = (tipoLista, estado) =>
      precios.find(p => String(p.tipoLista).toLowerCase() === tipoLista && String(p.estado).toLowerCase() === estado);

    const catAct = find('catalogo', 'actual');
    const catAnt = find('catalogo', 'anterior');
    const drAct = find('dropshipper', 'actual');
    const drAnt = find('dropshipper', 'anterior');

    setIdCatActual(catAct?.idListaPrecio ?? null);
    setIdCatAnterior(catAnt?.idListaPrecio ?? null);
    setIdDropActual(drAct?.idListaPrecio ?? null);
    setIdDropAnterior(drAnt?.idListaPrecio ?? null);

    setCatPrecioActual(catAct?.precio ?? '');
    setCatPrecioAnterior(catAnt?.precio ?? '');
    setDropPrecioActual(drAct?.precio ?? '');
    setDropPrecioAnterior(drAnt?.precio ?? '');
  } catch (e) {
    console.error(e);
    toast.error(e?.message || 'No se pudieron cargar las listas de precios');
    // Limpio para que no quede basura del producto anterior
    setIdCatActual(null); setIdCatAnterior(null); setIdDropActual(null); setIdDropAnterior(null);
    setCatPrecioActual(''); setCatPrecioAnterior(''); setDropPrecioActual(''); setDropPrecioAnterior('');
  } finally {
    setLoadingPrecios(false);
  }
};



  return (
    <div>
      <h1 className='titles-text-heading'>Productos</h1>
      <ToastContainer />

      <div className='deFlexContent'>
        <div className='deFlex2'>
          <NewProduct
            onCreated={() => {
              cargarProductos();
            }}
          />

          {selectedProducts.length > 0 && (
            <button
              className='btnDanger'
              onClick={handleDeleteSelected}
              style={{ margin: '1px 0' }}
            >
              Eliminar  ({selectedProducts.length})
            </button>
          )}

          <button className='excel' onClick={descargarExcel}><FontAwesomeIcon icon={faArrowDown} /> Excel</button>
          <button className='pdf' onClick={descargarPDF}><FontAwesomeIcon icon={faArrowDown} /> PDF</button>
        </div>

        <div className='filtrosContain'>
          <div className='inputsColumn'>
            <button>{String(productosFiltrados?.length)?.replace(/\B(?=(\d{3})+(?!\d))/g, ".")} / {String(productos?.length)?.replace(/\B(?=(\d{3})+(?!\d))/g, ".")} </button>
          </div>

          <div className='inputsColumn'>
            <input
              type="text"
              value={filtroSKU}
              onChange={(e) => setFiltroSKU(e.target.value)}
              placeholder='SKU'
            />
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
              {categorias.map(item => (
                <option key={item?.idCategoria} value={item?.idCategoria}>{item?.categoria}</option>
              ))}
            </select>
          </div>

          <div className='inputsColumn'>
            <select value={filtroMasVendido} onChange={(e) => setFiltroMasVendido(e.target.value)}>
              <option value="">Más vendidos</option>
              <option value="si">Si</option>
              <option value="no">No</option>
            </select>
          </div>

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
                  Editar Producto
                </button>
              </div>
              <span className="close" onClick={cerrarModal}>
                &times;
              </span>
            </div>

<div className="scrollable-modal-body">
  <div className='sectiontext' style={{ display: selectedSection === 'texto' ? 'flex' : 'none' }}>
    {/* GRID 2 columnas */}
    <div className='edit-grid'>

      {/* Título */}
      <fieldset id='titulo'>
        <legend>Titulo (*)</legend>
        <input
          type="text"
          value={nuevoTitulo}
          onChange={(e) => setNuevoTitulo(e.target.value)}
        />
      </fieldset>

      {/* Categoría / Subcategoría */}
      <fieldset>
        <legend>Categoría (*)</legend>
        <select
          id="categoriaSeleccionada"
          name="categoriaSeleccionada"
          onChange={handleCategoriaSeleccion}
          required
        >
          {/* Opción actual */}
          {categorias
            ?.filter(c => c?.idCategoria === producto?.idCategoria)
            ?.map(c => (
              <option key={`actual-${c?.idCategoria}`} value={`${producto?.idCategoria}-${producto?.idSubCategoria || ''}`}>
                {c?.categoria}
                {subcategorias
                  ?.filter(s => s.idSubCategoria === producto.idSubCategoria)
                  ?.map(s => (
                    <React.Fragment key={s.idSubCategoria}>
                      {producto?.idSubCategoria ? ` > ${s?.subcategoria}` : ''}
                    </React.Fragment>
                  ))
                }
              </option>
            ))
          }
          {/* Todas las opciones */}
          {categoriasConSubcategorias.map(categoria => (
            <optgroup key={`catg-${categoria.idCategoria}`}>
              <option
                key={`cat-${categoria.idCategoria}`}
                value={`${categoria.idCategoria}`}
                id='option'
              >
                {categoria.categoria}
              </option>
              {categoria.subcategorias.map(sub => (
                <option
                  key={`sub-${categoria.idCategoria}-${sub.idSubCategoria}`}
                  value={`${categoria.idCategoria}-${sub.idSubCategoria}`}
                >
                  {categoria.categoria} {`>`} {sub.subcategoria}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </fieldset>

      {/* SKU */}
      <fieldset>
        <legend>SKU (*)</legend>
        <input
          type="text"
          value={nuevoSku}
          onChange={(e) => setNuevoSku(e.target.value)}
        />
      </fieldset>

      {/* Precio */}
      <fieldset>
        <legend>Costo Venta (*)</legend>
        <input
          type="number"
          value={nuevoPrecio}
          onChange={(e) => setNuevoPrecio(e.target.value)}
        />
      </fieldset>

      {/* Precio anterior */}
      <fieldset>
        <legend>Costo de compra</legend>
        <input
          type="number"
          value={nuevoPrecioAnterior}
          onChange={(e) => setNuevoPrecioAnterior(e.target.value)}
        />
      </fieldset>

      {/* Más vendido */}
      <fieldset>
        <legend>Más vendido (*)</legend>
        <select
          value={nuevoMasVendido !== '' ? nuevoMasVendido : producto.masVendido}
          onChange={(e) => setNuevoMasVendido(e.target.value)}
        >
          <option value={producto.masVendido}>{producto.masVendido}</option>
          <option value="si">Si</option>
          <option value="no">No</option>
        </select>
      </fieldset>

      {/* Stock */}
      <fieldset>
        <legend>Disponible (*)</legend>
        <select
          value={nuevoStock}
          onChange={(e) => {
            const value = e.target.value;
            setNuevoStock(value);
            if (value === 'elegir') {
              setCantidadStock(producto.stock);
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
            value={cantidadStock}
            onChange={(e) => setCantidadStock(e.target.value)}
            required
          />
        )}
      </fieldset>

      {/* Descripción (a lo ancho) */}
      <fieldset id='descripcion'>
        <legend>Descripción</legend>
        <textarea
          type="text"
          value={nuevaDescripcion}
          onChange={(e) => setNuevaDescripcion(e.target.value)}
        />
      </fieldset>
    </div>
        <fieldset>
    <legend>Lista de precios (Mercado Yepes)</legend>

    {loadingPrecios ? (
      <small>Cargando precios...</small>
    ) : (
      <div className="two-cols">
        <div>
          <label>Precio Actual</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={catPrecioActual}
            onChange={(e) => setCatPrecioActual(e.target.value)}
            placeholder="Precio Actual"
          />
          {!idCatActual && <small style={{ color: 'red' }}>No existe “catálogo actual” en BD</small>}
        </div>

        <div>
          <label>Precio Anterior</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={catPrecioAnterior}
            onChange={(e) => setCatPrecioAnterior(e.target.value)}
            placeholder="Precio Anterior"
          />
          {!idCatAnterior && <small style={{ color: 'red' }}>No existe “catálogo anterior” en BD</small>}
        </div>
      </div>
    )}
  </fieldset>

  <fieldset>
    <legend>Lista de precios (Dropshipper)</legend>

    {loadingPrecios ? (
      <small>Cargando precios...</small>
    ) : (
      <div className="two-cols">
        <div>
          <label>Precio Actual</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={dropPrecioActual}
            onChange={(e) => setDropPrecioActual(e.target.value)}
            placeholder="Precio Actual dropshipper"
          />
          {!idDropActual && <small style={{ color: 'red' }}>No existe “dropshipper actual” en BD</small>}
        </div>

        <div>
          <label>Precio Anterior</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={dropPrecioAnterior}
            onChange={(e) => setDropPrecioAnterior(e.target.value)}
            placeholder="Precio Anterior dropshipper"
          />
          {!idDropAnterior && <small style={{ color: 'red' }}>No existe “dropshipper anterior” en BD</small>}
        </div>
      </div>
    )}
  </fieldset>
    {/* Variaciones */}
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
      <div className="variaciones-scroll-x">
        <div className='items'>
          {[
            { v: item1, s: setItem1 },
            { v: item2, s: setItem2 },
            { v: item3, s: setItem3 },
            { v: item4, s: setItem4 },
            { v: item5, s: setItem5 },
            { v: item6, s: setItem6 },
            { v: item7, s: setItem7 },
            { v: item8, s: setItem8 },
            { v: item9, s: setItem9 },
            { v: item10, s: setItem10 },
          ].map((it, idx) => (
            <fieldset key={idx}>
              <legend>Variación</legend>
              <input
                type="text"
                required={idx === 0 && verItems === 'Si'}   // solo item1 obligatorio
                value={it.v || ''}
                onChange={(e) => it.s(e.target.value)}
              />
            </fieldset>
          ))}
        </div>
      </div>
    )}

    {/* Imágenes */}
    <label id='textLabel'>Imagenes</label>

    {/* Preview con scroll-x */}
    <div className='previevProduct'>
      {imagenPreview ? (
        <img src={imagenPreview} alt="Vista previa de la imagen" onClick={() => abrirModalImagenSeleccionada(producto.imagen1)} />
      ) : (
        <>
          {producto.imagen1 ? (
            <img src={producto.imagen1} alt="imagen" onClick={() => abrirModalImagenSeleccionada(producto.imagen1)} />
          ) : (
            <span className='imgNone'>No hay imagen</span>
          )}
        </>
      )}

      {imagenPreview2 ? (
        <img src={imagenPreview2} alt="Vista previa de la imagen" onClick={() => abrirModalImagenSeleccionada(producto.imagen2)} />
      ) : (
        <>
          {producto.imagen2 ? (
            <img src={producto.imagen2} alt="imagen" onClick={() => abrirModalImagenSeleccionada(producto.imagen2)} />
          ) : (
            <span className='imgNone'>No hay imagen</span>
          )}
        </>
      )}

      {imagenPreview3 ? (
        <img src={imagenPreview3} alt="Vista previa de la imagen" onClick={() => abrirModalImagenSeleccionada(producto.imagen3)} />
      ) : (
        <>
          {producto.imagen3 ? (
            <img src={producto.imagen3} alt="imagen" onClick={() => abrirModalImagenSeleccionada(producto.imagen3)} />
          ) : (
            <span className='imgNone'>No hay imagen</span>
          )}
        </>
      )}

      {imagenPreview4 ? (
        <img src={imagenPreview4} alt="Vista previa de la imagen" onClick={() => abrirModalImagenSeleccionada(producto.imagen4)} />
      ) : (
        <>
          {producto.imagen4 ? (
            <img src={producto.imagen4} alt="imagen" onClick={() => abrirModalImagenSeleccionada(producto.imagen4)} />
          ) : (
            <span className='imgNone'>No hay imagen</span>
          )}
        </>
      )}


    </div>

    {/* Uploads */}
    <div className='image-container'>
      {[
        { id: 1, setF: setNuevaImagen,  setP: setImagenPreview  },
        { id: 2, setF: setNuevaImagen2, setP: setImagenPreview2 },
        { id: 3, setF: setNuevaImagen3, setP: setImagenPreview3 },
        { id: 4, setF: setNuevaImagen4, setP: setImagenPreview4 },
      ].map(({ id, setF, setP }) => (
        <div className='image-input' key={id}>
          <img
            src={imageIcon}
            alt="Imagen de ejemplo"
            className='image-icon'
            onClick={() => document.getElementById(`fileInput${id}`).click()}
          />
          <input
            id={`fileInput${id}`}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => handleFileChange(e, setF, setP)}
          />
        </div>
      ))}
    </div>

{/* ====================================================================== */}

    {/* Guardar */}
    <button className='btnPost' onClick={() => guardarCambios(producto.idProducto)}>
      Guardar
    </button>
  </div>
</div>

          </div>
        </div>
      )}

      <div className='table-container'>
        <table className='table'>
          <thead>
            <tr>
              {/* Selección múltiple */}
              <th>
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={productosFiltrados.length > 0 && selectedProducts.length === productosFiltrados.length}
                />
              </th>

              <th>Imagen</th>
              <th>Titulo</th>
              <th>Costo Venta</th>
              <th>Costo Compra</th>
              <th>Lista de precio</th>
              <th>Categoria</th>
              <th>Subcategoria</th>
              <th>SKU</th>
              <th>Disponible</th>
              <th>Más vendido</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {paginatedProducts?.map(item => (
              <tr key={item.idProducto}>
                {/* checkbox fila */}
                <td>
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(item.idProducto)}
                    onChange={() => handleSelectProduct(item.idProducto)}
                  />
                </td>

                <td>
                  {item.imagen1 ? (
                    <img src={item.imagen1} alt="imagen1" />
                  ) : (
                    <span className='imgNonetd'>Sin imagen</span>
                  )}
                </td>

                <td>{item.titulo}</td>

                <td style={{ color: '#008000' }}>
                  {moneda} {`${item?.precio}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                </td>

                <td style={{ color: '#008000' }}>
                  {moneda} {`${item?.precioAnterior}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                </td>

                <td>Catalogo o Dropshipper</td>

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
                    : (
                      <>
                        {subcategorias
                          ?.filter(subcategoriaFiltrada => subcategoriaFiltrada.idSubCategoria === item.idSubCategoria)
                          ?.map(subcategoriaFiltrada => (
                            <React.Fragment key={subcategoriaFiltrada.idSubCategoria}>
                              {subcategoriaFiltrada?.subcategoria}
                            </React.Fragment>
                          ))
                        }
                      </>
                    )
                  }
                </td>

                <td>{item.sku}</td>

                {item.stock === 1 ? (
                  <td style={{ color: '#008000' }}>Disponible</td>
                ) : item.stock <= 0 ? (
                  <td style={{ color: 'red' }}>Agotado</td>
                ) : (
                  <td>{item.stock}</td>
                )}

                {item.masVendido === 'si' ? (
                  <td style={{ color: '#008000' }}>Si</td>
                ) : item.masVendido === 'no' ? (
                  <td style={{ color: 'red' }}>No</td>
                ) : (
                  <td></td>
                )}

                <td>
                  {loading ? (
                    <></>
                  ) : usuarioLegued?.idUsuario ? (
                    <>
                      {usuarioLegued?.rol === 'admin' ? (
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

      {/* Paginación */}
      <div className="pagination">
        <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
          Anterior
        </button>

        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => setCurrentPage(i + 1)}
            className={currentPage === i + 1 ? 'active' : ''}
          >
            {i + 1}
          </button>
        ))}

        <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
          Siguiente
        </button>
      </div>
    </div>
  );
};
