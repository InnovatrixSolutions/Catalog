import React, { useEffect, useState } from 'react';
import './MercadoPago.css';
import baseURL from '../url'; // Asegúrate de que `baseURL` esté definido correctamente

export default function MercadoPago() {
    const [preferenceId, setPreferenceId] = useState(null);
    const [isButtonInitialized, setIsButtonInitialized] = useState(false); // Estado para verificar la inicialización del botón

    // Función para cargar el script de Mercado Pago dinámicamente solo si no está cargado
    const loadMercadoPagoScript = () => {
        if (!document.querySelector('script[src="https://sdk.mercadopago.com/js/v2"]')) {
            const script = document.createElement("script");
            script.src = "https://sdk.mercadopago.com/js/v2";
            script.async = true;
            script.onload = () => handleMercadoPago(); // Llamamos a la función que inicializa Mercado Pago
            document.body.appendChild(script);
        } else {
            handleMercadoPago(); // Si ya está cargado, inicializamos Mercado Pago directamente
        }
    };

    // Función para inicializar Mercado Pago una vez que el script esté cargado
    const handleMercadoPago = () => {
        if (!isButtonInitialized) { // Solo inicializamos si no lo hemos hecho antes
            const mp = new window.MercadoPago('TEST-018adba1-4218-4371-98b6-8dcec99816f6', { // Tu Public Key
                locale: 'es-AR',
            });

            mp.checkout({
                preference: {
                    id: preferenceId,
                },
                render: {
                    container: '.checkout-btn', // Clase del botón
                    label: 'Pagar con mercado pago', // Texto del botón
                },
                success: (data) => {
                    console.log('Pago exitoso:', data);
                    if (data.collection.status === 'approved') {
                        // Redirigir a la baseURL después de un pago exitoso
                        window.location.href = baseURL; // Cambia a la URL que desees
                    } else {
                        console.error('El pago no fue aprobado', data);
                        // Manejo adicional en caso de que el pago no sea aprobado
                    }
                },

                failure: (error) => {
                    // Manejo de errores
                    console.error('Error en el pago:', error);
                    // Mostrar un mensaje o redirigir a otra página
                    window.location.href = `${baseURL}/error`; // Redirigir a una página de error si lo deseas
                },
                onClose: () => {
                    // Este callback se ejecuta si el modal se cierra
                    console.log('Modal cerrado');
                },
            });

            setIsButtonInitialized(true); // Marcamos el botón como inicializado
        }
    };

    // Crear preferencia de pago
    useEffect(() => {
        const createPreference = async () => {
            try {
                const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: "Bearer TEST-1771609002540620-102217-2f8e7b82aab4d3d590d289e6caa73b0c-274113222", // Tu Access Token
                    },
                    body: JSON.stringify({
                        items: [
                            {
                                title: "Producto de prueba",
                                quantity: 1,
                                unit_price: 10.0, // Monto a cobrar
                            },
                        ],
                        payer: {
                            email: "test_user@test.com", // Correo del pagador (puede ser de prueba)
                        },
                    }),
                });

                const preference = await response.json();
                setPreferenceId(preference.id);
            } catch (error) {
                console.error('Error al crear la preferencia:', error);
            }
        };

        createPreference();
    }, []);

    // Cargar el script de Mercado Pago después de crear la preferencia
    useEffect(() => {
        if (preferenceId) {
            loadMercadoPagoScript();
        }
    }, [preferenceId]);

    return (
        <div>
            {/* Si ya tenemos una preferencia creada, renderizamos el botón de Mercado Pago */}
            {preferenceId ? (
                <div className='btnMp'>
                    <div className="checkout-btn"></div>
                </div>
            ) : (
                <p>Cargando...</p>
            )}
        </div>
    );
}

//produccion
// APP_USR-1771609002540620-102217-936885c13884fbef9892aeb7bad2bb1b-274113222

// APP_USR-a22d882c-c5a9-43d5-91bd-4f97bcf1cd3f

//prueba test
//TEST-1771609002540620-102217-2f8e7b82aab4d3d590d289e6caa73b0c-274113222
//TEST-018adba1-4218-4371-98b6-8dcec99816f6