import React, { useState, useEffect } from 'react';
import './NewProduct.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import baseURL from '../../url';
import imageIcon from '../../../images/imageIcon.png';
import { fetchUsuario, getUsuario } from '../../user';
import Swal from 'sweetalert2';
import planes from '../../planes';

export default function NewProduct({ onCreated }) {
  const [mensaje, setMensaje] = useState('');
  const [imagenPreview, setImagenPreview] = useState([null, null, null, null]);
  const [isImageSelected, setIsImageSelected] = useState([false, false, false, false]);

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
  const [sku, setSku] = useState('');
  const [cantidadStock, setCantidadStock] = useState('');
  const [addingProduct, setAddingProduct] = useState(false);

  // --------- NUEVOS CAMPOS: Lista de precios ----------
  const [catPrecio1, setCatPrecio1] = useState('');
  const [catPrecio2, setCatPrecio2] = useState('');
  const [dropPrecio1, setDropPrecio1] = useState('');
  const [dropPrecio2, setDropPrecio2] = useState('');
  // -----------------------------------------------------

  useEffect(() => {
    cargarCategoriasYSubcategorias();
  }, []);

  const toggleModal = () => setModalOpen(!modalOpen);

  useEffect(() => {
    cargarCategoria();
    cargarSubCategoria();
  }, []);

  const cargarCategoria = () => {
    fetch(`${baseURL}/categoriasGet.php`, { method: 'GET' })
      .then(response => response.json())
      .then(data => setCategoras(data.categorias || []))
      .catch(error => console.error('Error al cargar contactos:', error));
  };

  const cargarSubCategoria = () => {
    fetch(`${baseURL}/subCategoriaGet.php`, { method: 'GET' })
      .then(response => response.json())
      .then(data => setSubCategorias(data.subcategorias || []))
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
    setIdSubCategoria(subCategoriaId ? subCategoriaId : '');
  };

  const handleStock = (e) => {
    setStock(e.target.value);
    if (e.target.value !== 'elegir') setCustomStock('');
  };

  // devuelve true si hay al menos un precio > 0
  // devuelve true si hay al menos un precio > 0
  const tieneAlMenosUnPrecio = () => {
    const vals = [catPrecio1, catPrecio2, dropPrecio1, dropPrecio2]
      .map(v => (v === '' || v === null ? 0 : Number(v)));
    return vals.some(n => !isNaN(n) && n > 0);
  };

  // ----- Guardado de Listas de Precios (después de crear producto) -----
  const crearListaDePrecios = async ({ idProducto, tipoLista, precio, vigenciaDesde, estado }) => {
    const fd = new FormData();
    fd.append('idProducto', idProducto);
    fd.append('precio', String(precio));
    fd.append('tipoLista', tipoLista);         // 'catalogo' | 'dropshipper'
    fd.append('vigenciaDesde', vigenciaDesde); // 'YYYY-MM-DD'
    fd.append('estado', estado);               // 'actual' | 'anterior'

    const res = await fetch(`${baseURL}/listaPreciosPost.php`, { method: 'POST', body: fd });

    const text = await res.text();
    let data = {};
    try { data = JSON.parse(text); } catch { }

    if (!res.ok || data?.error) {
      const msg = data?.error || text || 'Error creando precio';
      throw new Error(msg);
    }
    return data;
  };

  const guardarListasDePrecios = async (idProducto) => {
    const hoy = new Date().toISOString().slice(0, 10);
    const tareas = [];

    const pushSiHayValor = (precio, tipoLista, estado) => {
      const n = Number(precio);
      if (!isNaN(n) && n > 0) {
        tareas.push(
          crearListaDePrecios({
            idProducto,
            tipoLista,            // 'catalogo' | 'dropshipper'
            precio: n,
            vigenciaDesde: hoy,   // si luego necesitas otra fecha, cámbiala aquí
            estado,               // 'actual' | 'anterior'
          })
        );
      }
    };

    // Catálogo
    pushSiHayValor(catPrecio1, 'catalogo', 'actual');    // Precio 1 = actual
    pushSiHayValor(catPrecio2, 'catalogo', 'anterior');  // Precio 2 = anterior

    // Dropshipper
    pushSiHayValor(dropPrecio1, 'dropshipper', 'actual');    // Precio 1 = actual
    pushSiHayValor(dropPrecio2, 'dropshipper', 'anterior');  // Precio 2 = anterior

    await Promise.all(tareas);
  };


  // ---------------------------------------------------------------------

  const crear = async () => {
    const form = document.getElementById("crearForm");
    const formData = new FormData(form);

    // ✅ primero, validación de campos obligatorios del producto
    if (!formData.get('titulo') || !idCategoria || !formData.get('precio') || !formData.get('sku')) {
      toast.error('Por favor, complete todos los campos obligatorios.');
      setAddingProduct(false);
      return;
    }

    // ✅ exige “al menos 1 precio” ANTES de crear el producto
    if (!tieneAlMenosUnPrecio()) {
      toast.error('Debes ingresar al menos un precio (catálogo o dropshipper).');
      return;
    }

    // (Opcional) exige al menos 1 imagen si quitaste "required" en los inputs
    // const hayAlMenosUnaImagen = isImageSelected.some(Boolean);
    // if (!hayAlMenosUnaImagen) {
    //   toast.error('Debes seleccionar al menos una imagen.');
    //   return;
    // }

    setAddingProduct(true);

    // completa formData con tus campos
    formData.append('idCategoria', idCategoria);
    formData.append('verItems', verItems);
    formData.append('idSubCategoria', idSubCategoria ? idSubCategoria : '0');
    formData.append('Disponible', stock === 'elegir' ? cantidadStock : stock);
    formData.append('sku', sku);
    formData.append('descripcion', descripcion);
    formData.append('masVendido', masVendido);
    formData.append('precioAnterior', precioAnterior);
    formData.append('verItems', verItems);

    if (verItems === 'Si') {
      formData.append('item1', item1);
      formData.append('item2', item2);
      formData.append('item3', item3);
      formData.append('item4', item4);
      formData.append('item5', item5);
      formData.append('item6', item6);
      formData.append('item7', item7);
      formData.append('item8', item8);
      formData.append('item9', item9);
      formData.append('item10', item10);
    }

    try {
      // 1) crear producto
      const response = await fetch(`${baseURL}/productosPost.php`, { method: 'POST', body: formData });
      const data = await response.json();

      if (data?.error) {
        toast.error(data.error);
        setAddingProduct(false);
        return;
      }
      if (!data?.mensaje) {
        toast.error('Ocurrió un error al crear el producto.');
        setAddingProduct(false);
        return;
      }

      toast.success(data.mensaje);

      // 2) obtener idProducto
      const createdId = data?.idProducto ?? data?.id ?? data?.producto?.idProducto ?? null;
      if (!createdId) {
        toast.warn('Producto creado, pero no se recibió idProducto.');
        setAddingProduct(false);
        return;
      }

      // 3) guardar listas de precios
      try {
        await guardarListasDePrecios(createdId);
        toast.success('Lista(s) de precios guardada(s).');
      } catch (e) {
        console.error(e);
        toast.error(`El producto se creó, pero falló guardar una o más listas de precios. ${e?.message ? '(' + e.message + ')' : ''}`);
      }


      setModalOpen(false);
      setAddingProduct(false);
      if (typeof onCreated === 'function') onCreated({ idProducto: createdId });

    } catch (error) {
      console.error('Error al crear producto:', error);
      toast.error('Error de conexión. Inténtelo de nuevo.');
      setAddingProduct(false);
    }
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    crear();
  };

  const handleMasVendidoChange = (e) => setMasVendido(e.target.value);

  const handleCheckboxChange = (event) => {
    setVerItems(event.target.checked ? 'Si' : 'No');
    setMostrarItems(event.target.checked);
  };

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
  const alertPermiso = () => Swal.fire('¡Error!', '¡No tienes permisos!', 'error');

  // Plan
  const plan = planes[0]?.plan;
  const limitePlan = planes[0]?.limiteProducto;
  const mensagePlan = `¡Alcanzaste el límite del plan ${plan}! <br/>Tu límite son ${limitePlan} productos`;
  const [productos, setProductos] = useState([]);
  const alertPlan = () => {
    cargarProductos();
    Swal.fire('¡Error!', mensagePlan, 'error');
  };

  useEffect(() => {
    cargarProductos();
  }, []);
  const mode = process.env.REACT_APP_MODE || "catalogo";

  const modeToBackend = {
    dropshipper: "dropshipper",
    catalogo: "catalogo"
  };

  const tipoLista = modeToBackend[mode] || "catalogo";

  const cargarProductos = () => {
    fetch(`${baseURL}/productosGet.php?tipo_lista=${tipoLista}`, { method: 'GET' })
      .then(response => response.json())
      .then(data => setProductos(data.productos || []))
      .catch(error => console.error('Error al cargar productos:', error));
  };

  return (
    <div className='NewContain'>
      {/* <ToastContainer /> */}
      {loading ? (
        <></>
      ) : usuarioLegued?.idUsuario ? (
        <>
          {(usuarioLegued?.rol === 'admin' || usuarioLegued?.rol === 'colaborador') ? (
            productos?.length < limitePlan ? (
              <button onClick={toggleModal} className='btnSave'><span>+</span> Agregar</button>
            ) : (
              <button onClick={alertPlan} className='btnSave'><span>+</span> Agregar</button>
            )
          ) : (
            <></>
          )}
        </>
      ) : (
        <>
          {productos?.length < limitePlan ? (
            <button onClick={toggleModal} className='btnSave'><span>+</span> Agregar</button>
          ) : (
            <button onClick={alertPlan} className='btnSave'><span>+</span> Agregar</button>
          )}
        </>
      )}

      {modalOpen && (
        <div className="modal">
          <div className="modal-content custom-modal-width">
            <div className='deFlexBtnsModal'>
              <button className='selected'>Agregar Producto</button>
              <span className="close" onClick={toggleModal}>&times;</span>
            </div>

            <div className="modal-scroll">
              <form id="crearForm" onSubmit={handleSubmit}>
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
                    <legend>SKU (*)</legend>
                    <input
                      type="text"
                      id="sku"
                      name="sku"
                      required
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
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
                    <legend>Descripción</legend>
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
                    <label>Variaciones (opcionales, mínimo una)</label>
                    <div id='flexLabel'>
                      Dar a elegir a los clientes
                      <input
                        type="checkbox"
                        id="verItems"
                        name="verItems"
                        checked={mostrarItems}
                        onChange={handleCheckboxChange}
                      />
                    </div>
                  </div>

                  {mostrarItems && (
                    <div className='items'>
                      {[...Array(10)].map((_, index) => (
                        <fieldset key={index}>
                          <legend>Variación</legend>
                          <input
                            type="text"
                            id={`item${index + 1}`}
                            name={`item${index + 1}`}
                            required={index === 0 && verItems === 'Si'}  // ✅ solo item1 obligatorio
                            value={[
                              item1, item2, item3, item4, item5,
                              item6, item7, item8, item9, item10
                            ][index] || ''}
                            onChange={(e) => [
                              setItem1, setItem2, setItem3, setItem4, setItem5,
                              setItem6, setItem7, setItem8, setItem9, setItem10
                            ][index](e.target.value)}
                          />
                        </fieldset>
                      ))}
                    </div>
                  )}

                  <label id='textLabel'>Imagenes</label>
                  <div className='image-container'>
                    {[...Array(4)].map((_, index) => (
                      <div key={index} className='image-input'>
                        <input
                          type="file"
                          id={`imagen${index + 1}`}
                          name={`imagen${index + 1}`}
                          accept="image/*"
                          onChange={(e) => handleImagenChange(e, index)}
                          style={{ display: 'none' }}
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

                  {/* ============ NUEVA SECCIÓN: Lista de Precios ============ */}
                  <div className="price-lists-grid">
                    <fieldset>
                      <legend>Lista de precios (Mercado Yepes)</legend>
                      <div className="two-cols">
                        <div>
                          <label>Precio Actual</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={catPrecio1}
                            onChange={(e) => setCatPrecio1(e.target.value)}
                            placeholder="Precio Actual"
                          />
                        </div>
                        <div>
                          <label>Precio Anterior</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={catPrecio2}
                            onChange={(e) => setCatPrecio2(e.target.value)}
                            placeholder="Precio Anterior"
                          />
                        </div>
                      </div>
                      <small>Se guardan automáticamente después de crear el producto.</small>
                    </fieldset>

                    <fieldset>
                      <legend>Lista de precios (Dropshipper)</legend>
                      <div className="two-cols">
                        <div>
                          <label>Precio Actual</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={dropPrecio1}
                            onChange={(e) => setDropPrecio1(e.target.value)}
                            placeholder="Precio Actual dropshipper"
                          />
                        </div>
                        <div>
                          <label>Precio Anterior</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={dropPrecio2}
                            onChange={(e) => setDropPrecio2(e.target.value)}
                            placeholder="Precio Anterior dropshipper"
                          />
                        </div>
                      </div>
                      <small>Se guardan automáticamente después de crear el producto.</small>
                    </fieldset>
                  </div>

                  <fieldset>
                    <legend>Costo de compra a proveedor (*)</legend>
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
                  <p>Estos costos pueden corresponder con la lista de precios de cliente final</p>
                  <fieldset>
                    <legend>Costo de venta MCY (*)</legend>
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
                  {/* ========================================================= */}
                </div>

                <button type="submit" className={addingProduct ? 'btnLoading' : 'btnPost'} disabled={addingProduct}>
                  {addingProduct ? 'Agregando...' : 'Agregar'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
