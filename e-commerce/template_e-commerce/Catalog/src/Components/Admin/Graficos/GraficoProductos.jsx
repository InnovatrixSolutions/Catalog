import React, { useState, useEffect } from 'react';
import './GraficoPedidos.css';
import { Chart } from 'primereact/chart';
import baseURL from '../../url';
import moneda from '../../moneda';

export default function GraficoProductos() {
    const [pedidos, setPedidos] = useState([]);
    const [chartData, setChartData] = useState({});
    const [chartOptions, setChartOptions] = useState({});

    useEffect(() => {
        cargarPedidos();
    }, []);

    const cargarPedidos = () => {
        fetch(`${baseURL}/pedidoGet.php`, {
            method: 'GET',
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error en la conexión');
                }
                return response.json();
            })
            .then(data => {
                // Filtra los pedidos pagados
                const pedidosFiltrados = data.pedidos.filter(pedido => pedido.pagado === 'Si');
                setPedidos(pedidosFiltrados?.reverse());
                procesarDatosGrafico(pedidosFiltrados);
            })
            .catch(error => {
                console.error('Error al cargar pedidos:', error);
                // Establecer datos por defecto en caso de error o sin pedidos
                establecerDatosPorDefecto();
            });
    };

    const procesarDatosGrafico = (pedidos) => {
        const contadorProductos = {};

        pedidos.forEach(pedido => {
            JSON.parse(pedido.productos).forEach(producto => {
                if (contadorProductos[producto.titulo]) {
                    contadorProductos[producto.titulo] += producto.cantidad; // Sumar cantidades
                } else {
                    contadorProductos[producto.titulo] = producto.cantidad; // Inicializar cantidad
                }
            });
        });

        // Filtrar y ordenar los productos más vendidos (por ejemplo, más de 2 ventas)
        const productosFiltrados = Object.keys(contadorProductos)
            .filter(titulo => contadorProductos[titulo] > 3)
            .map(titulo => ({
                titulo,
                cantidad: contadorProductos[titulo]
            }))
            .sort((a, b) => b.cantidad - a.cantidad) // Ordenar por cantidad de mayor a menor
            .slice(0, 6); // Limitar a los 6 productos más vendidos

        // Crear datos para el gráfico
        let labels, data;

        if (productosFiltrados.length > 0) {
            labels = productosFiltrados.map(producto => producto.titulo);
            data = productosFiltrados.map(producto => producto.cantidad);
        } else {
            establecerDatosPorDefecto();
            return; // Salir de la función para no establecer chartData con valores vacíos
        }

        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

        // Generar tonalidades desde #F80050 (opaco) hasta rgba(248, 0, 80, 0.1)
        const backgroundColors = generateColorShades('#F80050', productosFiltrados.length);

        setChartData({
            labels: labels,
            datasets: [{
                label: 'Cantidad de productos vendidos',
                data: data,
                backgroundColor: backgroundColors, // Usar tonalidades generadas
                borderColor: '#F80050', // Color del borde
                fill: true // Llenar el área bajo la línea
            }]
        });

        setChartOptions({
            plugins: {
                legend: {
                    labels: {
                        color: textColor
                    }
                }
            },

            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: surfaceBorder
                    }
                }
            }
        });
    };


    const generateColorShades = (baseColor, count) => {
        // Convertir el color base a RGB
        const r = parseInt(baseColor.slice(1, 3), 16);
        const g = parseInt(baseColor.slice(3, 5), 16);
        const b = parseInt(baseColor.slice(5, 7), 16);

        const shades = [];
        for (let i = 0; i < count; i++) {
            // Asignar opacidad total al más vendido (índice 0) y decrecer para el resto
            const alpha = i === 0 ? 0.9 : (0.5 - ((i - 1) * (0.6 / (count - 1)))); // Decrementar alpha
            shades.push(`rgba(${r}, ${g}, ${b}, ${alpha < 0.1 ? 0.1 : alpha})`); // Asegurarse de que no baje de 0.1
        }
        return shades; // Dejar el array en el orden original
    };

    const establecerDatosPorDefecto = () => {
        const labels = ['Producto A', 'Producto B', 'Producto C'];
        const data = [5, 3, 8]; // Cantidades por defecto

        setChartData({
            labels: labels,
            datasets: [{
                label: 'Cantidad de productos vendidos',
                data: data,
                backgroundColor: 'rgba(248, 0, 80, 0.4)', // Color de fondo
                borderColor: '#F80050', // Color del borde
                fill: true // Llenar el área bajo la línea
            }]
        });

        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');

        setChartOptions({
            responsive: true,
            maintainAspectRatio: false, // 👈 Esto asegura que use todo el espacio disponible
            plugins: {
                legend: {
                    labels: {
                        color: textColor
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                }
            }
        });
    };

    return (
        <div className="GraficoContent">
            <h3 className='titleGrafico'>Productos más vendidos</h3>
            <div className="grafico-container-2">
                <Chart type="polarArea" data={chartData} options={chartOptions} />
            </div>
        </div>
    );
}
