import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import baseURL from '../url';
import './Cart.css';
import whatsappIcon from '../../images/wpp.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faShoppingCart, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Link as Anchor } from "react-router-dom";
import moneda from '../moneda';
import Swal from 'sweetalert2';
import { ToastContainer, toast } from 'react-toastify';
import MiPedido from './FormularioPedido';
import { Button } from 'primereact/button';
export default function Cart() {
    const [cartItems, setCartItems] = useState([]);
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [modalIsOpen2, setModalIsOpen2] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [noteText, setNoteText] = useState('');
    const [location, setLocation] = useState('');
    const [name, setName] = useState('');
    const [telefono, setTelefono] = useState('');
    const [direccion, setDireccion] = useState('');
    const [codigo, setCodigo] = useState('');
    const [tienda, setTienda] = useState([]);
    const [descuento, setDescuento] = useState(0);
    const [codigoValido, setCodigoValido] = useState(false);
    const [totalPrice, setTotalPrice] = useState(0);
    const [deliveryOption, setDeliveryOption] = useState('delivery');
    const [metodos, setMetodos] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [pagoRecibir, setPagoRecibir] = useState('');
    const [estado, setEstado] = useState(null);
    let now = new Date();
    // Obtener la diferencia de zona horaria en minutos (Argentina es GMT-3)
    let offset = -3 * 60; // Argentina está a GMT-3
    // Ajustar la fecha actual sumando/restando el offset
    let argentinaTime = new Date(now.getTime() + offset * 60 * 1000);
    // Formatear la fecha a 'YYYY-MM-DD HH:MM:SS'
    let createdAt = argentinaTime.toISOString().slice(0, 19).replace('T', ' ');



    const [modalStep, setModalStep] = useState('summary'); // 'summary' or 'form'


    const [address, setAddress] = useState('');
    useEffect(() => {
        cargarTienda()
    }, []);
    useEffect(() => {
        // Calcular el precio total al cargar el carrito o al actualizar los productos
        let totalPriceCalc = 0;
        cartItems.forEach(item => {
            totalPriceCalc += item.precio * item.cantidad;
        });
        setTotalPrice(totalPriceCalc);
    }, [cartItems]);

    useEffect(() => {
        const fetchEstado = async () => {
            try {
                const response = await fetch(`${baseURL}/estado.php?`);
                const data = await response.json();
                if (data.error) {
                    console.error(data.error);
                } else {
                    setEstado(data.estado);
                }
            } catch (error) {
                console.error("Error al obtener el estado:", error);
            }
        };

        fetchEstado();
    }, []);
    const cargarTienda = () => {
        fetch(`${baseURL}/tiendaGet.php`, {
            method: 'GET',
        })
            .then(response => response.json())
            .then(data => {
                setTienda(data.tienda.reverse() || []);
            })
            .catch(error => console.error('Error al cargar datos:', error));
    };

    useEffect(() => {
        cargarMetodos();
        cargarProductos();
    }, [isFocused]);

    useEffect(() => {
        const fetchCartItems = async () => {
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            const promises = cart.map(async (cartItem) => {
                const producto = productos.find(producto => producto.idProducto === cartItem.idProducto);
                return {
                    ...producto,
                    cantidad: cartItem.cantidad,
                    items: cartItem.items,
                };
            });

            Promise.all(promises)
                .then((items) => {
                    setCartItems(items);
                    setLoading(false);
                })
                .catch((error) => {
                    console.error('Error al obtener detalles del carrito:', error);
                    setLoading(false);
                });
        };

        fetchCartItems();
    }, [productos, isFocused]);



    const cargarMetodos = () => {
        fetch(`${baseURL}/metodoGet.php`, {
            method: 'GET',
        })
            .then(response => response.json())
            .then(data => {
                // Filtra solo los métodos con estado "Activo"
                const metodosActivos = (data.metodos || [])?.filter(metodo => metodo.estado === 'Activo');
                setMetodos(metodosActivos);
                console.log(metodosActivos);
            })
            .catch(error => console.error('Error al cargar datos bancarios:', error));
    };

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

    const obtenerImagen = (item) => {
        return item.imagen1 || item.imagen2 || item.imagen3 || item.imagen4 || null;
    };

    const openModal = () => {
        setModalIsOpen(true);
        setIsFocused(true);
    };

    
    const closeModal = () => {
        setModalIsOpen(false);
        setIsFocused(false);
    };

    // const openModal2 = () => {
    //     setModalIsOpen2(true);
    // };


    const openModal2 = () => {
    setModalStep('form');
    setModalIsOpen2(true);
    };


    const closeModal2 = () => {
        setModalIsOpen2(false);
    };

    const removeFromCart = (id) => {
        const updatedCart = cartItems.filter(item => item.idProducto !== id);
        setCartItems(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
    };

    const clearCart = () => {
        setCartItems([]);
        localStorage.removeItem('cart');
    };

    const [codigos, setCodigos] = useState([]);

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
    const handleWhatsappMessage = (data) => {
        const { idPedido, nombre, telefono, entrega, pago, codigo, total, nota, productos, pagoRecibir } = data;

        const formattedTotalPrice = total?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        const phoneNumber = `${tienda[0]?.telefono}`;

        // Formatear los detalles de los productos
        const productosDetails = productos.map(item => {
            return `\n✅ *${item.titulo}* \n      Precio: ${moneda} ${item?.precio?.toString()?.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}  x  ${item.cantidad}\n      ${item.items}\n`;
        }).join('');

        const message = `¡Hola! 🌟 Mi pedido es el N°${idPedido}\n${productosDetails}\n👤 Nombre: ${nombre}\n\n📱 Teléfono: ${telefono}\n\n📦 Entrega: ${entrega}\n\n💵 Forma de pago: ${pago}\n\n📌 Pago al recibirlo: ${pagoRecibir}\n\n🏷 Código de descuento: ${codigo}\n\n✅ Nota: ${nota}\n\n*Total: ${moneda} ${formattedTotalPrice}*`;

        const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;

        window.open(whatsappUrl, '_blank');

        // Limpiar estados (opcional, dependiendo de tu lógica)
        setName('');
        setLocation('');
        setNoteText('');
        setCodigo('');
        setModalIsOpen(false);
        setModalIsOpen2(false);
    };





    // Función para aumentar la cantidad de un producto en el carrito
    const increaseQuantity = (index) => {
        const updatedCartItems = [...cartItems];
        updatedCartItems[index].cantidad += 1;
        setCartItems(updatedCartItems);
        localStorage.setItem('cart', JSON.stringify(updatedCartItems));
    };

    // Función para disminuir la cantidad de un producto en el carrito
    const decreaseQuantity = (index) => {
        const updatedCartItems = [...cartItems];
        if (updatedCartItems[index].cantidad > 1) {
            updatedCartItems[index].cantidad -= 1;
            setCartItems(updatedCartItems);
            localStorage.setItem('cart', JSON.stringify(updatedCartItems));
        }
    };


    //pedido-------------------------------------------------------------------
    const [mensaje, setMensaje] = useState('');
    const crearPedido = async () => {
        setMensaje('Procesando...');

        try {
            // Construir la lista de productos del pedido
            const productosPedido = cartItems?.map(item => {
                return {
                    idProducto: item?.idProducto,
                    idCategoria: item.idCategoria,
                    titulo: item?.titulo,
                    cantidad: item?.cantidad,
                    items: item?.items,
                    precio: item?.precio,
                    imagen: obtenerImagen(item)
                };
            });

            // Convertir la lista de productos a JSON
            const productosPedidoJSON = JSON.stringify(productosPedido);

            // Calcular el precio total del pedido
            let totalPrice = 0;
            cartItems.forEach(item => {
                totalPrice += item?.precio * item?.cantidad;
            });

            // Enviar el pedido con el precio total descontado
            const formData = new FormData();
            formData.append('productos', productosPedidoJSON);
            formData.append('total', totalPrice);
            formData.append('nombre', name);
            formData.append('telefono', telefono);

            const entrega = deliveryOption === 'delivery' ? address : 'Retiro en Sucursal';
            formData.append('entrega', entrega);
            formData.append('pago', paymentMethod);
            formData.append('nota', noteText);
            formData.append('codigo', codigo);
            formData.append('estado', 'Pendiente');
            formData.append('pagado', 'No');
            formData.append('pagoRecibir', pagoRecibir);
            formData.append('createdAt', createdAt);

            const response = await fetch(`${baseURL}/pedidoPost.php`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            if (data.idPedido) {
                setMensaje('');
                Swal.fire(
                    'Pedido enviado!',
                    `Pedido N°${data.idPedido} creado con éxito.`,
                    'success'
                );

                // Aquí pasamos los datos necesarios a handleWhatsappMessage
                handleWhatsappMessage(data);
                // Guardar el idPedido en localStorage
                localStorage.setItem('idPedido', data.idPedido);
                // Limpiar campos y cerrar modal
                setName('');
                setCodigo('');
                setNoteText('');
                closeModal();
                closeModal2();
                clearCart();
            } else if (data?.error) {
                setMensaje('');
                Swal.fire(
                    'Error',
                    data?.error,
                    'error'
                );
            }
        } catch (error) {
            console.error('Error:', error);
            setMensaje('');
            Swal.fire(
                'Error',
                'Error de conexión. Por favor, inténtelo de nuevo.',
                'error'
            );
        }
    };

    useEffect(() => {
        if (metodos && metodos.length > 0) {
            setPaymentMethod(metodos[0].tipo);
        }
    }, [metodos]);

    const handlePaymentChange = (metodo) => {
        setPaymentMethod(metodo);
        if (metodo === 'Transferencia') {
            setPagoRecibir('Si'); // Valor predeterminado "Sí" para Transferencia
        } else {
            setPagoRecibir(''); // Borra el valor si no es Transferencia
        }
    };
    const handlePagoRecibirChange = (value) => {
        setPagoRecibir(value);
    };

    const clearCartAll = () => {
  setCartItems([]);
  localStorage.removeItem('cart');
  setModalIsOpen2(false); // Optional: close the modal
};

    return (
        <div>
            <ToastContainer />
            <button onClick={openModal} className='cartIconFixed'>
                {
                    cartItems?.length >= 1 && (
                        <span>{cartItems.length}</span>
                    )

                }
                <FontAwesomeIcon icon={faShoppingCart} />
            </button>

            <Modal
                isOpen={modalIsOpen}
                className="modal-cart"
                overlayClassName="overlay-cart"
                onRequestClose={closeModal}
            >
                <div className='deFLex'>
                    <button onClick={closeModal} ><FontAwesomeIcon icon={faArrowLeft} />  </button>
                    
                </div>


                {
                    estado === 'Abierto' ? (
                        <>
                            {cartItems?.length === 0 ?
                                (<p className='nohay'> No hay productos</p>)
                                : (<>
                                    <div className="modal-content-cart">


                                        {loading ? (
                                            <p>Cargando...</p>
                                        ) : (
                                            <div>

                                                {cartItems.map((item, index) => (
                                                    <div key={item?.idProducto} className='cardProductCart' >
                                                        <Anchor to={`/producto/${item?.idProducto}/${item?.titulo?.replace(/\s+/g, '-')}`} onClick={closeModal}>
                                                            <img src={obtenerImagen(item)} alt="imagen" />
                                                        </Anchor>
                                                        <div className='cardProductCartText'>
                                                            <h3>{item.titulo}</h3>
                                                            <span>
                                                                {item?.items?.map((sabor, index) => (
                                                                    <span key={index}>{sabor}, </span>
                                                                ))}
                                                            </span>
                                                            <strong>{moneda} {item?.precio?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</strong>
                                                        </div>
                                                        <div className='deColumn'>
                                                            <button onClick={() => removeFromCart(item.idProducto)} className='deleteCart'>  <FontAwesomeIcon icon={faTrash} /></button>
                                                            <div className='deFlexCantidad'>
                                                                <button onClick={() => decreaseQuantity(index)}>-</button>
                                                                <span>{item.cantidad}</span>
                                                                <button onClick={() => increaseQuantity(index)}>+</button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className='deColumnCart'>
                                        <h4>Total: {moneda} {totalPrice?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</h4>

                                        <button className='btn' onClick={openModal2}>
                                            Finalizar pedido
                                        </button>
                                        
                                    </div>

                                    {/* <Modal
                                        isOpen={modalIsOpen2}
                                        onRequestClose={closeModal2}
                                        className="modal-cart"
                                        overlayClassName="overlay-cart"
                                    >
                                        <div className='deFLex'>
                                            <button onClick={closeModal2} ><FontAwesomeIcon icon={faArrowLeft} />  </button>
                                            <h4>(*) Campos obligatorios</h4>
                                        </div>
                                        <div className="modal-send-form">
                                            <input
                                                type="text"
                                                id="name"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                placeholder='Apellido y Nombre (*)'
                                            />

                                            <input
                                                type="number"
                                                id="telefono"
                                                value={telefono}
                                                onChange={(e) => setTelefono(e.target.value)}
                                                placeholder='Telefono / WathsApp (*)'
                                            />
                                            <div className='deFLexRadio'>
                                                <label>Opciones de entrega (*)</label>

                                                <div
                                                    onClick={() => setDeliveryOption('delivery')}
                                                >
                                                    <input
                                                        type="radio"
                                                        id="delivery"
                                                        name="deliveryOption"
                                                        value="delivery"
                                                        checked={deliveryOption === 'delivery'}
                                                        onChange={() => setDeliveryOption('delivery')}
                                                    />
                                                    <label htmlFor="delivery">Envío a domicilio</label>
                                                </div>

                                                <div
                                                    onClick={() => setDeliveryOption('pickup')}
                                                >
                                                    <input
                                                        type="radio"
                                                        id="pickup"
                                                        name="deliveryOption"
                                                        value="pickup"
                                                        checked={deliveryOption === 'pickup'}
                                                        onChange={() => setDeliveryOption('pickup')}
                                                    />
                                                    <label htmlFor="pickup">Retiro en Sucursal</label>
                                                </div>


                                            </div>
                                            {deliveryOption === 'delivery' && (

                                                <input
                                                    type="text"
                                                    id="address"
                                                    name="address"
                                                    value={address}
                                                    onChange={(e) => setAddress(e.target.value)}
                                                    placeholder="Dirección / Nro. (*)"
                                                />

                                            )}
                                            <div className='deFLexRadio'>
                                                <label>Formas de pago (*)</label>
                                                {metodos?.map(metodo => (
                                                    <section key={metodo.idMetodo} className='columnRadio'>
                                                        <div>
                                                            <input
                                                                type="radio"
                                                                name="paymentMethod"
                                                                id={metodo.tipo}
                                                                value={metodo.tipo}
                                                                checked={paymentMethod === metodo.tipo}
                                                                onChange={() => handlePaymentChange(metodo.tipo)}
                                                            />
                                                            <label htmlFor={metodo.tipo}>{metodo.tipo}</label>
                                                        </div>

                                                        {paymentMethod === 'Transferencia' && metodo.tipo === 'Transferencia' && (
                                                            <section className='radioRecibi'>
                                                                <label htmlFor="">Pago al recibirlo</label>
                                                                <div>
                                                                    <input
                                                                        type="radio"
                                                                        name="pagoRecibir"
                                                                        id="Sí"
                                                                        value="Si"
                                                                        checked={pagoRecibir === 'Si'}
                                                                        onChange={() => handlePagoRecibirChange('Si')}
                                                                    />
                                                                    <label htmlFor="Sí">Sí</label>
                                                                </div>
                                                                <div>
                                                                    <input
                                                                        type="radio"
                                                                        name="pagoRecibir"
                                                                        id="No"
                                                                        value="No"
                                                                        checked={pagoRecibir === 'No'}
                                                                        onChange={() => handlePagoRecibirChange('No')}
                                                                    />
                                                                    <label htmlFor="No">No (envío comprobante)</label>
                                                                </div>
                                                            </section>
                                                        )}
                                                    </section>
                                                ))}

                                            </div>
                                            {metodos?.length > 0 && metodos?.some(m => m.tipo === paymentMethod) ? (
                                                <>
                                                    {metodos
                                                        ?.filter(metodo => metodo.tipo === paymentMethod)
                                                        ?.map(datos => (
                                                            < >
                                                                {
                                                                    datos?.datos === '' ? (
                                                                        < >
                                                                        </>

                                                                    ) : (
                                                                        <div className='deFLexRadioMetod' >
                                                                            <span key={datos.idDatos}>
                                                                                {datos.datos}
                                                                            </span>
                                                                        </div>
                                                                    )
                                                                }

                                                            </>
                                                        ))}
                                                </>
                                            ) : null}



                                            <input
                                                type="text"
                                                id="codigo"
                                                value={codigo}
                                                onChange={(e) => setCodigo(e.target.value)}
                                                placeholder='Codigo de descuento (opcional)'
                                            />
                                            <textarea
                                                placeholder="Agrega aquí el horario o cambios del pedido"
                                                value={noteText}
                                                onChange={(e) => setNoteText(e.target.value)}
                                            />
                                            <fieldset className='deNonefieldset'>
                                                <legend>Productos</legend>
                                                <textarea
                                                    name='productos'
                                                    value={cartItems.map(item => `${item.titulo}, x ${item.cantidad}, ${item.items}, ${item.precio}, ${obtenerImagen(item)}  `).join('\n')}
                                                    readOnly
                                                />
                                            </fieldset>


                                        </div>
                                        {mensaje ? (
                                            <button type='button' className='btn' disabled>
                                                {mensaje}
                                            </button>
                                        ) : (
                                            <button type='button' onClick={crearPedido} className='btn'>
                                                Finalizar pedido
                                            </button>
                                        )}
                                    </Modal> */}
                                     <Modal
                                        isOpen={modalIsOpen2}
                                        onRequestClose={closeModal2}
                                        className="modal-cart"
                                        overlayClassName="overlay-cart"
                                    >
                                                                                <div className='deFLex'>
                                            <button onClick={closeModal2} ><FontAwesomeIcon icon={faArrowLeft} />  </button>
                                            <h4>(*) Campos obligatorios</h4>
                                        </div>

                                    <MiPedido 
                                    onPedidoSuccess={clearCartAll} 
                                    cartItems={cartItems} 
                                    totalPrice={totalPrice}
                                    />
                                    {/* <div className="modal-send-form">                                    


                                        
                                        {/* <MiPedido /> */}
                   


                                        
                                    </Modal>

                                </>)}
                        </>
                    ) : (
                        <p className='nohay'>El establecimiento se encuentra <br />cerrado en estos momentos. <br />Consulte por horarios de atención.</p>
                    )
                }

            </Modal>
        </div >
    );
}
