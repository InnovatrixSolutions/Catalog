import React, { useEffect, useState } from 'react';
import baseURL from '../url';
import './ProductsPage.css';
import 'react-toastify/dist/ReactToastify.css';
import ProductosLoading from '../ProductosLoading/ProductosLoading';
import { Link as Anchor } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import Cart from '../Cart/Cart';
import moneda from '../moneda';


export default function ProductsPage() {
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState('');
    const [searchText, setSearchText] = useState('');
    const [precioMinimo, setPrecioMinimo] = useState(0);
    const [precioMaximo, setPrecioMaximo] = useState(0);
    const [precioActual, setPrecioActual] = useState(0);
    const [selectedItems, setSelectedItems] = useState([]);

    useEffect(() => {
        cargarProductos();
        cargarCategorias();
    }, []);


    const mode = process.env.REACT_APP_MODE || "catalogo";

const modeToBackend = {
    dropshipper: "dropshipper",
    catalogo: "catalogo"
};

const tipoLista = modeToBackend[mode] || "catalogo";

const cargarProductos = () => {
    console.log("Dentro de products page:"+tipoLista)
    fetch(`${baseURL}/productosGet.php?tipo_lista=${tipoLista}`, {
        method: 'GET',
    })
        .then(response => response.json())
        .then(data => {
            console.log(`Productos cargados para modo ${tipoLista}:`, data.productos);
            setProductos(data.productos);
            const maxPrecio = calcularPrecioMaximo(data.productos);
            setPrecioMaximo(maxPrecio);
            setPrecioActual(maxPrecio);
            setLoading(false);
        })
        .catch(error => console.error('Error al cargar productos:', error));
};


    const cargarCategorias = () => {
        fetch(`${baseURL}/categoriasGet.php`, {
            method: 'GET',
        })
            .then(response => response.json())
            .then(data => {
                console.log('Categorías cargadas:', data.categorias); // Debug
                setCategorias(data.categorias || []);
            })
            .catch(error => console.error('Error al cargar categorías:', error));
    };

    const calcularPrecioMaximo = (productos) => {
        return Math.max(...productos.map(producto => producto.precio));
    };

    const obtenerImagen = (item) => {
        if (item.imagen1) {
            return item.imagen1;
        } else if (item.imagen2) {
            return item.imagen2;
        } else if (item.imagen3) {
            return item.imagen3;
        } else if (item.imagen4) {
            return item.imagen4;
        }
        return null;
    };

    const handleSearchInputChange = (event) => {
        setSearchText(event.target.value);
    };

    const handlePrecioChange = (event) => {
        const precio = parseFloat(event.target.value);
        setPrecioActual(precio);
    };

    const handleItemSelect = (item) => {
        if (item === "") {
            setSelectedItems([]);
        } else {
            setSelectedItems([item]);
        }
    };

    const handleCategoriaSelect = (event) => {
        setCategoriasSeleccionadas(event.target.value);
    };

    const filterProductos = (producto) => {
        console.log('Filtrando producto:', producto); // Debug
        const categoriaMatch = categoriasSeleccionadas === '' || producto.idCategoria.toString().includes(categoriasSeleccionadas);
        const searchTextMatch = searchText === '' || producto.titulo.toLowerCase().includes(searchText.toLowerCase());
        const precioMatch = producto.precio >= precioMinimo && producto.precio <= precioActual;
        const itemMatches = selectedItems?.length === 0 || selectedItems.some(item => {
            return producto.item1 === item ||
                producto.item2 === item ||
                producto.item3 === item ||
                producto.item4 === item ||
                producto.item5 === item ||
                producto.item6 === item ||
                producto.item7 === item ||
                producto.item8 === item ||
                producto.item9 === item ||
                producto.item10 === item;
        });
        return categoriaMatch && searchTextMatch && precioMatch && itemMatches;
    };

    return (
        <div className='ProductsContainPage'>
            
            <Cart />
            

            {productos?.length > 0 && (
                <div className='filtrosPage'>
                    <div className='searchInput'>
                        {productos?.length > 0 &&
                            <fieldset className="inputSearch">
                                <FontAwesomeIcon icon={faSearch} className="search-icon" />
                                <input
                                    type="text"
                                    placeholder="Buscar..."
                                    value={searchText}
                                    onChange={handleSearchInputChange}
                                    className='input'
                                />
                            </fieldset>
                        }
                    </div>
                    <div className='inputsGrap'>
                        <select
                            value={categoriasSeleccionadas}
                            onChange={handleCategoriaSelect}
                        >
                            <option value="">Categorías...</option>
                            {categorias.map(categoria => (
                                <option key={categoria.idCategoria} value={categoria.idCategoria}>
                                    {categoria.categoria}
                                </option>
                            ))}
                        </select>

                        <select
                            value={selectedItems.length > 0 ? selectedItems[0] : ""}
                            onChange={(e) => handleItemSelect(e.target.value)}
                        >
                            <option value="">Items...</option>
                            {productos.reduce((items, item) => {
                                for (let i = 1; i <= 10; i++) {
                                    const currentItem = item[`item${i}`];
                                    if (currentItem && !items.includes(currentItem)) {
                                        items.push(currentItem);
                                    }
                                }
                                return items;
                            }, []).map((item, index) => (
                                <option key={index} value={item}>{item}</option>
                            ))}
                        </select>
                    </div>

                    <div className='range'>
                        <input
                            type="range"
                            min={precioMinimo}
                            max={precioMaximo}
                            value={precioActual}
                            onChange={handlePrecioChange}
                        />
                        <div>{moneda} {precioActual.toLocaleString()}</div>
                    </div>
                </div>
            )}
            <div>
                {loading ? (
                    <ProductosLoading />
                ) : (
                    <div className='ProductsGrap'>
                        {productos
                            .filter(filterProductos)
                            .map(item => (
                                <Anchor className='cardProdcutmasVendido' key={item.idProducto} to={`/producto/${item.idProducto}/${item.titulo.replace(/\s+/g, '-')}`}>
                                    <img src={obtenerImagen(item)} alt="imagen" />
                                    <div className='cardText'>
                                        <h4>{item.titulo}</h4>
                                        {categorias
                                            .filter(categoriaFiltrada => categoriaFiltrada.idCategoria === item.idCategoria)
                                            .map(categoriaFiltrada => (
                                                <span
                                                    key={categoriaFiltrada.idCategoria}

                                                >
                                                    {categoriaFiltrada.categoria}
                                                </span>
                                            ))
                                        }
                                        <div className='deFLexPrice'>
                                            <h5> {moneda} {String(item?.precio)?.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</h5>
                                            {item.precioAnterior !== 0 && item.precioAnterior !== undefined && (
                                                <h5 className='precioTachado'>{moneda} {`${item?.precioAnterior}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</h5>
                                            )}
                                        </div>
                                    </div>
                                </Anchor>
                            ))}
                    </div>
                )}
            </div>
        </div>
    );
}
