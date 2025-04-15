import React, { useEffect, useState } from 'react';
import './CardsCantidad.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faBook, faImage, faAddressBook, faList, faClipboardList, faRectangleList, faTag, faBuilding } from '@fortawesome/free-solid-svg-icons'; // Importa los íconos necesarios
import { Link as Anchor } from "react-router-dom";
import baseURL from '../../url';
import { faProductHunt } from '@fortawesome/free-brands-svg-icons';
import { fetchUsuario, getUsuario } from '../../user';
export default function CardsCantidad() {
    const [productos, setProductos] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [banners, setBanners] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [codigos, setCodigos] = useState([]);
    const [pedidos, setPedidos] = useState([]);


    useEffect(() => {
        cargarProductos();
        cargarUsuarios();
        cargarBanners();
        cargarCategoria();
        cargarCodigos();
        cargarPedidos();
    }, []);

    const cargarProductos = () => {
        fetch(`${baseURL}/productosGet.php`, {
            method: 'GET',
        })
            .then(response => response.json())
            .then(data => {
                setProductos(data.productos || []);
            })
            .catch(error => console.error('Error al cargar productos:', error));
    };


    const cargarUsuarios = () => {
        fetch(`${baseURL}/usuariosGet.php`, {
            method: 'GET',
        })
            .then(response => response.json())
            .then(data => {
                setUsuarios(data.usuarios || []);
            })
            .catch(error => console.error('Error al cargar usuarios:', error));
    };

    const cargarBanners = () => {
        fetch(`${baseURL}/bannersGet.php`, {
            method: 'GET',
        })
            .then(response => response.json())
            .then(data => {
                setBanners(data.banner || []);
                console.log(data.banner)
            })
            .catch(error => console.error('Error al cargar banners:', error));
    };


    const cargarCategoria = () => {
        fetch(`${baseURL}/categoriasGet.php`, {
            method: 'GET',
        })
            .then(response => response.json())
            .then(data => {
                setCategorias(data.categorias || []);
                console.log(data.categorias)
            })
            .catch(error => console.error('Error al cargar categorías:', error));
    };

    const cargarCodigos = () => {
        fetch(`${baseURL}/codigosGet.php`, {
            method: 'GET',
        })
            .then(response => response.json())
            .then(data => {
                setCodigos(data.codigos || []);
                console.log(data.codigos)
            })
            .catch(error => console.error('Error al cargar codigos:', error));
    };

    const cargarPedidos = () => {
        fetch(`${baseURL}/pedidoGet.php`, {
            method: 'GET',
        })
            .then(response => response.json())
            .then(data => {
                setPedidos(data.pedidos || []);
            })
            .catch(error => console.error('Error al cargar pedidos:', error));
    };
    //Trae usuario logueado-----------------------------
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            await fetchUsuario(); // Llama a la función para obtener datos del usuario
            setLoading(false);
        };

        fetchData();
    }, []);

    const usuarioLegued = getUsuario();
    return (
        <div className='CardsCantidad'>
            {loading ? (
                <></>
            ) : usuarioLegued?.idUsuario ? (
                <>
                    {usuarioLegued?.rol === 'admin' ? (
                        <>
                            <Anchor to={`/dashboard/usuarios`} className='cardCantidad'>
                                <FontAwesomeIcon icon={faUser} className='icons' />
                                <div className='deColumn'>
                                    <h3>Usuarios</h3>
                                    <h2>{usuarios.length}</h2>
                                </div>
                            </Anchor>

                            <Anchor to={`/dashboard/productos`} className='cardCantidad'>
                                <FontAwesomeIcon icon={faProductHunt} className='icons' />
                                <div className='deColumn'>
                                    <h3>Productos</h3>
                                    <h2>{productos.length}</h2>
                                </div>
                            </Anchor>

                            <Anchor to={`/dashboard/banners`} className='cardCantidad'>
                                <FontAwesomeIcon icon={faImage} className='icons' />
                                <div className='deColumn'>
                                    <h3>Banners</h3>
                                    <h2>{banners.length}</h2>
                                </div>
                            </Anchor>

                            <Anchor to={`/dashboard/categorias`} className='cardCantidad'>
                                <FontAwesomeIcon icon={faList} className='icons' />
                                <div className='deColumn'>
                                    <h3>Categorías</h3>
                                    <h2>{categorias.length}</h2>
                                </div>
                            </Anchor>

                            <Anchor to={`/dashboard/promociones`} className='cardCantidad'>
                                <FontAwesomeIcon icon={faTag} className='icons' />
                                <div className='deColumn'>
                                    <h3>Promociones</h3>
                                    <h2>{codigos.length}</h2>
                                </div>
                            </Anchor>

                            <Anchor to={`/dashboard/pedidos`} className='cardCantidad'>
                                <FontAwesomeIcon icon={faRectangleList} className='icons' />
                                <div className='deColumn'>
                                    <h3>Pedidos</h3>
                                    <h2>{pedidos.length}</h2>
                                </div>
                            </Anchor>
                        </>
                    ) : usuarioLegued?.rol === 'colaborador' ? (
                        <>
                            <Anchor to={`/dashboard/productos`} className='cardCantidad' id='cardCantidad2'>
                                <FontAwesomeIcon icon={faProductHunt} className='icons' />
                                <div className='deColumn'>
                                    <h3>Productos</h3>
                                    <h2>{productos.length}</h2>
                                </div>
                            </Anchor>
                            <Anchor to={`/dashboard/categorias`} className='cardCantidad' id='cardCantidad2'>
                                <FontAwesomeIcon icon={faList} className='icons' />
                                <div className='deColumn'>
                                    <h3>Categorías</h3>
                                    <h2>{categorias.length}</h2>
                                </div>
                            </Anchor>
                            <Anchor to={`/dashboard/pedidos`} className='cardCantidad' id='cardCantidad2' >
                                <FontAwesomeIcon icon={faRectangleList} className='icons' />
                                <div className='deColumn'>
                                    <h3>Pedidos</h3>
                                    <h2>{pedidos.length}</h2>
                                </div>
                            </Anchor>
                        </>
                    ) : (
                        <></>
                    )}
                </>
            ) : (
                <>
                    <Anchor to={`/dashboard/usuarios`} className='cardCantidad'>
                        <FontAwesomeIcon icon={faUser} className='icons' />
                        <div className='deColumn'>
                            <h3>Usuarios</h3>
                            <h2>{usuarios.length}</h2>
                        </div>
                    </Anchor>

                    <Anchor to={`/dashboard/productos`} className='cardCantidad'>
                        <FontAwesomeIcon icon={faProductHunt} className='icons' />
                        <div className='deColumn'>
                            <h3>Productos</h3>
                            <h2>{productos.length}</h2>
                        </div>
                    </Anchor>

                    <Anchor to={`/dashboard/banners`} className='cardCantidad'>
                        <FontAwesomeIcon icon={faImage} className='icons' />
                        <div className='deColumn'>
                            <h3>Banners</h3>
                            <h2>{banners.length}</h2>
                        </div>
                    </Anchor>

                    <Anchor to={`/dashboard/categorias`} className='cardCantidad'>
                        <FontAwesomeIcon icon={faList} className='icons' />
                        <div className='deColumn'>
                            <h3>Categorías</h3>
                            <h2>{categorias.length}</h2>
                        </div>
                    </Anchor>

                    <Anchor to={`/dashboard/promociones`} className='cardCantidad'>
                        <FontAwesomeIcon icon={faTag} className='icons' />
                        <div className='deColumn'>
                            <h3>Promociones</h3>
                            <h2>{codigos.length}</h2>
                        </div>
                    </Anchor>

                    <Anchor to={`/dashboard/pedidos`} className='cardCantidad'>
                        <FontAwesomeIcon icon={faRectangleList} className='icons' />
                        <div className='deColumn'>
                            <h3>Pedidos</h3>
                            <h2>{pedidos.length}</h2>
                        </div>
                    </Anchor>
                </>
            )}

        </div>
    );
}
