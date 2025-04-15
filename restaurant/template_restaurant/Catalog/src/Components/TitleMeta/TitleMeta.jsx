import React, { useEffect, useState } from 'react';
import baseURL from '../url';

export default function TitleMeta() {
    const [tienda, setTienda] = useState({});

    useEffect(() => {
        cargarTienda();
    }, []);

    const cargarTienda = () => {
        fetch(`${baseURL}/tiendaGet.php`, {
            method: 'GET',
        })
            .then(response => response.json())
            .then(data => {
                setTienda(data.tienda.reverse()[0] || {});
            })
            .catch(error => console.error('Error al cargar datos:', error));
    };

    useEffect(() => {
        if (tienda.nombre) {
            // Cambiar el título de la página con el nombre de la tienda
            document.title = tienda.nombre;

            // Crear o modificar la meta descripción
            const metaDescription = document.querySelector('meta[name="description"]');
            if (metaDescription) {
                metaDescription.setAttribute('content', tienda.nombre);
            } else {
                const meta = document.createElement('meta');
                meta.name = 'description';
                meta.content = tienda.nombre;
                document.head.appendChild(meta);
            }

            // Crear o modificar el favicon con la imagen1 de la tienda
            const linkIcon = document.querySelector("link[rel='icon']");
            if (linkIcon) {
                linkIcon.href = tienda.imagen1;
            } else {
                const link = document.createElement('link');
                link.rel = 'icon';
                link.href = tienda.imagen1;
                document.head.appendChild(link);
            }
        }
    }, [tienda]);

    return (
        <div>

        </div>
    );
}
