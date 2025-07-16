import React, { useEffect, useState, useRef } from 'react';
import baseURL from '../url';
import './Products.css';
import SwiperCore, { Navigation, Pagination, Autoplay } from 'swiper/core';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDoubleRight } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProductosLoading from '../ProductosLoading/ProductosLoading';
import { Link as Anchor } from "react-router-dom";
import moneda from '../moneda';
import { Carousel } from 'primereact/carousel';
import { Tag } from 'primereact/tag';

SwiperCore.use([Navigation, Pagination, Autoplay]);

export default function Products() {

    const responsiveOptions = [
        { breakpoint: '575px', numVisible: 1, numScroll: 1 },
        { breakpoint: '767px', numVisible: 2, numScroll: 1 },
        { breakpoint: '1199px', numVisible: 3, numScroll: 1 },
        { breakpoint: '1400px', numVisible: 4, numScroll: 1 }
    ];
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fixedCategories, setFixedCategories] = useState(false);
    const categoriasRefs = useRef([]);
    const categoriasInputRef = useRef(null);
    const swiperRef = useRef(null);
    const [productos, setProductos] = useState([]);
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todo');
    const [subcategorias, setSubCategorias] = useState([]);
    const [subcategoriaSeleccionada, setSubcategoriaSeleccionada] = useState(null);

    const handleClickCategoria = (categoria) => {
        setCategoriaSeleccionada(categoria);
        setSubcategoriaSeleccionada('Todo');
    };

    const handleClickSubcategoria = (subcategoria) => {
        setSubcategoriaSeleccionada(subcategoria);
    };

    useEffect(() => {
        cargarProductos();
        cargarCategorias();
        cargarSubCategoria();
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const handleScroll = () => {
        if (categoriasInputRef.current) {
            const bannerElement = document.querySelector('.BannerContain');
            const bannerHeight = bannerElement ? bannerElement.offsetHeight : 0;

            if (window.scrollY > categoriasInputRef.current.offsetTop && window.scrollY > bannerHeight) {
                setFixedCategories(true);
            } else {
                setFixedCategories(false);
            }
        }
    };



    const cargarProductos = () => {
        fetch(`${baseURL}/productosGet.php`, {
            method: 'GET',
        })
            .then(response => response.json())
            .then(data => {
                setProductos(data.productos);
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
                const categoriasOrdenadas = (data?.categorias || [])?.sort((a, b) => a.orden - b.orden); // Ordenar categorías por el campo 'orden'
                setCategorias(categoriasOrdenadas);
            })
            .catch(error => console.error('Error al cargar categorías:', error));
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

    const categoriasConProductos = categorias?.filter(categoria =>
        productos?.some(producto => producto?.idCategoria === categoria?.idCategoria)
    );

    const masVendidos = productos.filter(p => p.masVendido === "si").slice(0, 20);
    return (
        <div className='ProductsContain'>
            <ToastContainer />
            {productos?.length > 0 && (
                <div className={`categoriasInputs ${fixedCategories ? 'fixed' : ''}`} id='FlexIn' ref={categoriasInputRef}>
                    <div className='categoriasInputsFilter' >
                        <input
                            type="button"
                            value="Todo"
                            onClick={() => handleClickCategoria('Todo')}
                            style={{
                                backgroundColor: categoriaSeleccionada === 'Todo' ? '#09c332' : '',
                                color: categoriaSeleccionada === 'Todo' ? '#fff' : '',
                            }}
                        />
                        {categoriasConProductos?.map(({ categoria, idCategoria }) => (
                            <div className='columnInput' key={idCategoria}>
                                <input
                                    type="button"
                                    value={categoria}
                                    onClick={() => handleClickCategoria(idCategoria)}
                                    style={{
                                        backgroundColor: categoriaSeleccionada === idCategoria ? '#09c332' : '',
                                        color: categoriaSeleccionada === idCategoria ? '#fff' : '',
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                    {categoriaSeleccionada !== 'Todo' &&
                        subcategorias?.filter(subcategoria =>
                            subcategoria.idCategoria === categoriaSeleccionada &&
                            productos.some(producto => producto.idSubCategoria === subcategoria.idSubCategoria)
                        )?.length > 0 && ( // Verifica si hay subcategorías filtradas
                            <div className='categoriasInputsFilter' id='subcategoriasInputs'>
                                {/* <input
                                    type="button"
                                    value="Todo"
                                    onClick={() => handleClickSubcategoria('Todo')}
                                    style={{
                                        borderBottom: subcategoriaSeleccionada === 'Todo' ? '2px solid #09c332' : '',
                                        color: subcategoriaSeleccionada === 'Todo' ? '#09c332' : '',
                                    }}
                                    id='subcategoriaInput'
                                /> */}

                                {subcategorias
                                    ?.filter(subcategoria =>
                                        subcategoria.idCategoria === categoriaSeleccionada &&
                                        productos.some(producto => producto.idSubCategoria === subcategoria.idSubCategoria)
                                    )
                                    ?.map(subcategoria => (
                                        <div key={subcategoria.idSubCategoria}>
                                            <input
                                                type="button"
                                                value={subcategoria.subcategoria}
                                                onClick={() => handleClickSubcategoria(subcategoria.idSubCategoria)}
                                                style={{
                                                    borderBottom: subcategoriaSeleccionada === subcategoria.idSubCategoria ? '2px solid #F80050' : '',
                                                    color: subcategoriaSeleccionada === subcategoria.idSubCategoria ? '#F80050' : '',
                                                }}
                                                id='subcategoriaInput'

                                            />
                                        </div>
                                    ))}
                            </div>
                        )}



                </div>
            )}


            {loading ? (
                <ProductosLoading />
            ) : (
                <div className='Products'>
                    {categoriaSeleccionada === 'Todo' && (
                        <>
                            {productos?.some(item => item.masVendido === "si") && (
                                <div className='categoriSection'>
                                    {/* <Swiper
                                        effect={'coverflow'}
                                        grabCursor={true}
                                        slidesPerView={'auto'}
                                        id='swiper_container_products'
                                        autoplay={{ delay: 3000 }}
                                    > */}
                                    {productos?.filter(item => item.masVendido === "si")?.slice(0, 1)?.map(item => (

                                        
                                            <Carousel
                                                value={masVendidos}
                                                numVisible={3}            // cuantos se ven en desktop
                                                numScroll={2}             // avanza uno a uno
                                                responsiveOptions={responsiveOptions}
                                                 circular
                                                // autoplayInterval={3000}
                                                showNavigators={masVendidos.length > 6}
                                                showIndicators={masVendidos.length > 6}

                                                // autoplayInterval={3000}
                                                itemTemplate={(item) => (
                                                    <div className="carousel-card  surface-border border-round m-2 text-center py-5 px-3">
                                                        <Tag value="Más Vendido" severity="success" className="mb-2" />
                                                        <div className="mb-3">
                                                            
                                                            <Anchor to={`/producto/${item.idProducto}/${item.titulo.replace(/\s+/g, '-')}`}>
                                                            
                                                                <img
                                                                    src={obtenerImagen(item)}
                                                                    alt={item.titulo}
                                                                    style={{ width: '8rem', height: '8rem', objectFit: 'cover' }}
                                                                />
                                                            </Anchor>
                                                        </div>
                                                        <div>
                                                            <h4 className="mb-1">{item.titulo}</h4>
                                                            <h6 className="mt-0 mb-3">${item.precio}</h6>
                                                            <div className="mt-5 flex flex-wrap gap-2 justify-content-center">
                                                                <h5>
                                                                    {moneda} {String(item?.precio).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                                                                </h5>
                                                                <h5 className="precioTachado">
                                                                    {moneda} {`${item?.precioAnterior}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                                                                </h5>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            />

                                        


                                        // <SwiperSlide key={item.idProducto} id='SwiperSlide-scroll-products-masvendidos'>
                                        //     <Anchor className='cardProdcutmasVendido' to={`/producto/${item.idProducto}/${item.titulo.replace(/\s+/g, '-')}`}>
                                        //         <img src={obtenerImagen(item)} alt="imagen" />
                                        //         <h6 className='masVendido'>Más Vendido</h6>
                                        //         <div className='cardText'>
                                        //             <h4>{item.titulo}</h4>
                                        //             <span>{item.descripcion}</span>
                                        //             <div className='deFLexPrice'>
                                        //                 <h5> {moneda} {String(item?.precio)?.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</h5>
                                        //                 {(item.precioAnterior >= 1 && item.precioAnterior !== undefined) && (
                                        //                     <h5 className='precioTachado'>{moneda} {`${item?.precioAnterior}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</h5>
                                        //                 )}
                                        //             </div>
                                        //         </div>
                                        //     </Anchor>

                                        // </SwiperSlide>


                                    ))}
                                    {/* </Swiper> */}
                                </div>
                            )}




                            {categoriasConProductos?.map(({ categoria, idCategoria }) => {
                                // build this category’s product list
                                const productosDeEstaCat = productos.filter(p => p.idCategoria === idCategoria);
                                // const visibleCount = Math.min(productosDeEstaCat.length, 3);
                                return (
                                    <div
                                        key={idCategoria}
                                        className='categoriSection'
                                        ref={ref => categoriasRefs.current[categorias.findIndex(cat => cat.idCategoria === idCategoria)] = ref}
                                    >
                                        <div className='deFlexTitlesection'>
                                            <h3>{categoria}</h3>
                                            <button onClick={() => handleClickCategoria(idCategoria)}>
                                                Ver más
                                            </button>
                                        </div>

                                        <Carousel
                                            value={productosDeEstaCat}
                                            numVisible={3}
                                            numScroll={2}
                                            responsiveOptions={responsiveOptions}

                                            showIndicators={productosDeEstaCat.length > 3}
                                            circular
                                            // autoplayInterval={3000}
                                            itemTemplate={(item) => (
                                                <div className="carousel-card surface-border border-round m-2 text-center py-5 px-3">
                                                    <div className="mb-3">
                                                        <Anchor to={`/producto/${item.idProducto}/${item.titulo.replace(/\s+/g, '-')}`}>
                                                            <img
                                                                src={obtenerImagen(item)}
                                                                alt={item.titulo}
                                                                style={{ width: '8rem', height: '8rem', objectFit: 'cover' }}
                                                            />
                                                        </Anchor>
                                                    </div>
                                                    <div>
                                                        <h4 className="mb-1">{item.titulo}</h4>
                                                        <h6 className="mt-0 mb-3">${item.precio}</h6>
                                                        <div className="mt-5 flex flex-wrap gap-2 justify-content-center">
                                                            <h5>
                                                                {moneda} {String(item.precio).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                                                            </h5>
                                                            <h5 className="precioTachado">
                                                                {moneda} {`${item.precioAnterior}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                                                            </h5>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        />
                                    </div>
                                );
                            })}





                            {categoriasConProductos?.map(({ categoria, idCategoria }) => (
                                <div key={idCategoria} className='categoriSection' ref={ref => categoriasRefs.current[categorias.findIndex(cat => cat.idCategoria === idCategoria)] = ref}>
                                    <div className='deFlexTitlesection'>
                                        <h3>{categoria}</h3>
                                        <button onClick={() => handleClickCategoria(idCategoria)}>
                                            Ver más
                                        </button>
                                    </div>

                                    {/* <Swiper
                                        effect={'coverflow'}
                                        grabCursor={true}
                                        slidesPerView={'auto'}
                                        id='swiper_container_products'
                                    > */}


                                    {productos?.filter(item => item.idCategoria === idCategoria)?.map(item => (



                                        console.log(item.idProducto, item.titulo.replace(/\s+/g, '-'))

                                        // <SwiperSlide id='SwiperSlide-scroll-products' key={item.idProducto}>
                                        //     <Anchor className='cardProdcut' key={item.idProducto} to={`/producto/${item.idProducto}/${item.titulo.replace(/\s+/g, '-')}`}>

                                        //         <img src={obtenerImagen(item)} alt="imagen" />
                                        //         <div className='cardText'>
                                        //             <h4>{item.titulo}</h4>
                                        //             {/* <span>{item.descripcion}</span> */}
                                        //             <div className='deFLexPrice'>
                                        //                 {/* <h5> {moneda} {String(item?.precio)?.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</h5> */}
                                        //                 {/* {(item.precioAnterior >= 1 && item.precioAnterior !== undefined) && (
                                        //                     <h5 className='precioTachado'>{moneda} {`${item?.precioAnterior}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</h5>
                                        //                 )} */}
                                        //             </div>
                                        //             <FontAwesomeIcon icon={faAngleDoubleRight} className='iconCard' />
                                        //         </div>

                                        //     </Anchor>
                                        // </SwiperSlide>




                                    ))}

                                    {/* </Swiper> */}
                                </div>

                            ))}
                        </>
                    )}

                    {/* <div className='categoriSectionSelected'>
                        {productos
                            ?.filter(item => {
                                // Si "Todo" está seleccionado en subcategoría, muestra todos los productos de la categoría
                                if (subcategoriaSeleccionada === 'Todo' || !subcategoriaSeleccionada) {
                                    return item.idCategoria === categoriaSeleccionada;
                                }
                                // Si hay subcategoría seleccionada, filtra por subcategoría
                                return item.idSubCategoria === subcategoriaSeleccionada;
                            })
                            ?.map(item => (
                                <Anchor key={item.idProducto} to={`/producto/${item.idProducto}/${item.titulo.replace(/\s+/g, '-')}`}>
                                    <div className='cardProdcutSelected'>
                                        <img src={obtenerImagen(item)} alt="imagen" />
                                        <div className='cardTextSelected'>
                                            <h4>{item.titulo}</h4>
                                            <span>{item.descripcion}</span>
                                            <div className='deFLexPrice'>
                                                <h5> {moneda} {String(item?.precio)?.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</h5>
                                                {(item.precioAnterior >= 1 && item.precioAnterior !== undefined) && (
                                                    <h5 className='precioTachado'>{moneda} {`${item?.precioAnterior}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</h5>
                                                )}
                                            </div>
                                            <FontAwesomeIcon icon={faAngleDoubleRight} className='iconCard' />
                                        </div>
                                    </div>
                                </Anchor>
                            ))}
                    </div> */}


                </div>
            )}
        </div>
    );
}
