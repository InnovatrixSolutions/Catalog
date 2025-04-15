import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import baseURL from '../../url';
import './Estado.css'

export default function Estado() {
    const [estado, setEstado] = useState(null);
    const [idEstado, setIdEstado] = useState(null);

    // Obtener el primer estado desde el servidor
    useEffect(() => {
        const fetchEstado = async () => {
            try {
                const response = await fetch(`${baseURL}/estado.php?`);
                const data = await response.json();
                if (data.error) {
                    console.error(data.error);
                } else {
                    setEstado(data.estado);
                    setIdEstado(data.idEstado); // Guardar el idEstado
                }
            } catch (error) {
                console.error("Error al obtener el estado:", error);
            }
        };

        fetchEstado();
    }, []);

    // Función para abrir el modal y actualizar el estado
    const handleEditEstado = async () => {
        const { value: nuevoEstado } = await Swal.fire({
            title: 'Estado de tienda',
            input: 'select',
            inputOptions: {
                'Cerrado': 'Cerrado',
                'Abierto': 'Abierto'
            },
            inputPlaceholder: 'Selecciona',
            showCancelButton: true
        });

        if (nuevoEstado && idEstado) {
            try {
                const response = await fetch(`${baseURL}/estado.php?idEstado=${idEstado}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nuevoEstado })
                });

                const data = await response.json();
                if (data.error) {
                    Swal.fire('Error', data.error, 'error');
                } else {
                    Swal.fire('Actualizado', '', 'success');
                    setEstado(nuevoEstado); // Actualizar el estado en el componente
                }
            } catch (error) {
                Swal.fire('Error', 'No se pudo actualizar', 'error');
            }
        }
    };

    return (
        <div>
            {
                estado ? (
                    estado === 'Abierto' ? (
                        <button className='Abierto' onClick={handleEditEstado}>{estado}</button>
                    ) : (
                        <button className='Cerrado' onClick={handleEditEstado}>{estado}</button>
                    )
                ) : null
            }


        </div>
    );
}
