import React, { useState, useEffect } from 'react';
import './GraficoPedidos.css';
import { Chart } from 'primereact/chart';
import baseURL from '../../url';



export default function GraficoPedidosVSListaPrecios() {
    const [chartDataDia, setChartDataDia] = useState({});
    const [chartDataSemana, setChartDataSemana] = useState({});
    const [chartDataMes, setChartDataMes] = useState({});
    const [chartDataListaPrecio, setChartDataListaPrecio] = useState({});
    const [chartOptions, setChartOptions] = useState({});
    const [totalDia, setTotalDia] = useState(0);
    const [totalSemana, setTotalSemana] = useState(0);
    const [totalMes, setTotalMes] = useState(0);
    const [activeChart, setActiveChart] = useState('listaPrecio');

    


    const VALORES_DEFAULT = [0, 0];

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
                //const pedidosPagados = data.pedidos.filter(pedido => pedido.pagado === 'Si');
                const pedidosPagados = data.pedidos
                procesarDatos(pedidosPagados);
            })
            .catch(error => {
                console.error('Error al cargar pedidos:', error);
                establecerValoresPorDefecto();
            });
    };

    const procesarDatos = (pedidos) => {
        if (pedidos.length === 0) {
            establecerValoresPorDefecto();
            return;
        }

        calcularTotalesPorDia(pedidos);
        calcularTotalesPorSemanaConSemanasCompletas(pedidos);
        calcularTotalesPorMes(pedidos);
        calcularPedidosPorListaPrecio(pedidos); // NUEVO
    };

    const establecerValoresPorDefecto = () => {
        const diasPorDefecto = Array.from({ length: 7 }, (_, i) => `Día ${i + 1}`);
        const semanasPorDefecto = Array.from({ length: 4 }, (_, i) => `Semana ${i + 1}`);
        const mesesPorDefecto = ['Enero', 'Febrero', 'Marzo'];
        const valorDia = VALORES_DEFAULT[Math.floor(Math.random() * VALORES_DEFAULT.length)];
        const valorSemana = valorDia * 7;
        const valorMes = valorDia * 30;

        setTotalDia(valorDia);
        setTotalSemana(valorSemana);
        setTotalMes(valorMes);

        generarGraficoLinea(diasPorDefecto, Array(diasPorDefecto.length).fill(valorDia), 'Ventas por Día', setChartDataDia);
        generarGraficoLinea(semanasPorDefecto, Array(semanasPorDefecto.length).fill(valorSemana), 'Ventas por Semana', setChartDataSemana);
        generarGraficoLinea(mesesPorDefecto, Array(mesesPorDefecto.length).fill(valorMes), 'Ventas por Mes', setChartDataMes);
    };

    const calcularTotalesPorDia = (pedidos) => {
        const totalesPorDia = pedidos.reduce((acc, pedido) => {
            const fecha = new Date(pedido.createdAt).toLocaleDateString('es-ES');
            if (!acc[fecha]) acc[fecha] = 0;
            acc[fecha] += parseFloat(pedido.total);
            return acc;
        }, {});

        const fechasOrdenadas = Object.keys(totalesPorDia).sort((a, b) => new Date(a) - new Date(b));
        const totalGlobalDia = Object.values(totalesPorDia).reduce((acc, val) => acc + val, 0);
        setTotalDia(totalGlobalDia || VALORES_DEFAULT[Math.floor(Math.random() * VALORES_DEFAULT.length)]);

        generarGraficoLinea(fechasOrdenadas, fechasOrdenadas.map(fecha => totalesPorDia[fecha]), 'Ventas por Día', setChartDataDia);
    };

    const calcularTotalesPorSemanaConSemanasCompletas = (pedidos) => {
        const fechaActual = new Date();
        const añoActual = fechaActual.getFullYear();
        const mesActual = fechaActual.getMonth();
        const semanasDelMes = generarSemanasDelMes(añoActual, mesActual);

        const totalesPorSemana = pedidos.reduce((acc, pedido) => {
            const fecha = new Date(pedido.createdAt);
            const semana = getNumeroSemana(fecha);
            const key = `Semana ${semana}`;
            if (!acc[key]) acc[key] = 0;
            acc[key] += parseFloat(pedido.total);
            return acc;
        }, {});

        const semanasOrdenadas = semanasDelMes.sort((a, b) => a - b);
        const totalGlobalSemana = Object.values(totalesPorSemana).reduce((acc, val) => acc + val, 0);
        setTotalSemana(totalGlobalSemana || VALORES_DEFAULT[Math.floor(Math.random() * VALORES_DEFAULT.length)] * 7);

        const datosCompletosPorSemana = semanasOrdenadas.map(semana => totalesPorSemana[`Semana ${semana}`] || 0);
        generarGraficoLinea(semanasOrdenadas.map(s => `Semana ${s}`), datosCompletosPorSemana, 'Ventas por Semana', setChartDataSemana);
    };

    const calcularTotalesPorMes = (pedidos) => {
        const totales = pedidos.reduce((acc, pedido) => {
            const fecha = new Date(pedido.createdAt);
            const mes = fecha.toLocaleString('default', { month: 'long' });
            if (!acc[mes]) acc[mes] = 0;
            acc[mes] += parseFloat(pedido.total);
            return acc;
        }, {});

        const mesesOrdenados = Object.keys(totales).sort((a, b) => new Date(`1 ${a}`) - new Date(`1 ${b}`));
        const totalGlobalMes = Object.values(totales).reduce((acc, val) => acc + val, 0);
        setTotalMes(totalGlobalMes || VALORES_DEFAULT[Math.floor(Math.random() * VALORES_DEFAULT.length)] * 30);

        generarGraficoLinea(mesesOrdenados, mesesOrdenados.map(mes => totales[mes]), 'Ventas por Mes', setChartDataMes);
    };

    const calcularPedidosPorListaPrecio = (pedidos) => {
        console.log('Pedidos pagados:', pedidos.map(p => p.estado)); // 👈 Verifica aquí
        const conteo = pedidos.reduce((acc, pedido) => {
            const tipo = pedido.estado || 'Sin especificar';
            if (!acc[tipo]) acc[tipo] = 0;
            acc[tipo]++;
            return acc;
        }, {});

        const labels = Object.keys(conteo);
        const data = Object.values(conteo);
        generarGraficoPastel(labels, data, setChartDataListaPrecio);
    };

    const generarGraficoLinea = (labels, data, labelGrafico, setChartData) => {
        const chartData = {
            labels,
            datasets: [
                {
                    label: labelGrafico,
                    data,
                    fill: true,
                    backgroundColor: 'rgba(248, 0, 80, 0.3)',
                    borderColor: '#F80050',
                    tension: 0.4
                }
            ]
        };
        setChartData(chartData);
    };

    // const generarGraficoPastel = (labels, data, setChartData) => {

    //     const backgroundColors = ['#FF6384', '#36A2EB', '#FFCE56', '#8E44AD', '#2ECC71', '#E67E22'];

    //     const chartData = {
    //         labels,
    //         datasets: [
    //             {
    //                 data,
    //                 backgroundColor: backgroundColors,
    //                 hoverOffset: 10
    //             }
    //         ]
    //     };
    //     const options = {
    //         plugins: {
    //             legend: {
    //                 position: 'right',
    //             }
    //         },
    //         responsive: true
    //     };
    //     setChartOptions(options);
    //     setChartData(chartData);
    // };
    const generarGraficoPastel = (labels, data, setChartData) => {
        const backgroundColors = ['#FF6384', '#36A2EB', '#FFCE56', '#8E44AD', '#2ECC71', '#E67E22'];
        const total = data.reduce((acc, val) => acc + val, 0);
    
        const chartData = {
            labels,
            datasets: [
                {
                    data,
                    backgroundColor: backgroundColors,
                    hoverOffset: 10
                }
            ]
        };
    
        const options = {
            responsive: true,
            maintainAspectRatio: false, // 👈 añade esta línea
            plugins: {
                legend: {
                    position: 'right'
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const label = context.label || '';
                            const value = context.parsed;
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${percentage}% (${value} pedidos)`;
                        }
                    }
                }
            }
        };
    
        setChartOptions(options);
        setChartData(chartData);
    };
    

    
    const generarSemanasDelMes = (año, mes) => {
        const fechaInicioMes = new Date(año, mes, 1);
        const fechaFinMes = new Date(año, mes + 1, 0);
        const semanas = [];

        let semanaActual = getNumeroSemana(fechaInicioMes);

        while (fechaInicioMes <= fechaFinMes) {
            semanas.push(semanaActual);
            fechaInicioMes.setDate(fechaInicioMes.getDate() + 7);
            semanaActual = getNumeroSemana(fechaInicioMes);
        }

        return semanas;
    };

    const getNumeroSemana = (fecha) => {
        const primeraFechaAño = new Date(fecha.getFullYear(), 0, 1);
        const diasDesdePrimeroEnero = Math.floor((fecha - primeraFechaAño) / (24 * 60 * 60 * 1000));
        return Math.ceil((diasDesdePrimeroEnero + primeraFechaAño.getDay() + 1) / 7);
    };

    const manejarCambioGrafico = (tipoGrafico) => {
        setActiveChart(tipoGrafico);
    };

    return (
        <div className="GraficoContent">
            <h3 className='titleGrafico'>Pedidos vs Lista de Precios</h3>
            <div className="botones-grafico">
            <button className={activeChart === 'listaPrecio' ? 'activeBtnGraf' : 'desactiveBtn'} onClick={() => manejarCambioGrafico('listaPrecio')}>Lista de Precios</button>
                <button className={activeChart === 'dia' ? 'activeBtnGraf' : 'desactiveBtn'} onClick={() => manejarCambioGrafico('dia')}>Día</button>
                <button className={activeChart === 'semana' ? 'activeBtnGraf' : 'desactiveBtn'} onClick={() => manejarCambioGrafico('semana')}>Semana</button>
                <button className={activeChart === 'mes' ? 'activeBtnGraf' : 'desactiveBtn'} onClick={() => manejarCambioGrafico('mes')}>Mes</button>
                
            </div>
            <div className="grafico-container">
            {/* <div className="chart-wrapper"> */}
                {activeChart === 'dia' && <Chart type="line" data={chartDataDia} options={chartOptions} />}
                {activeChart === 'semana' && <Chart type="line" data={chartDataSemana} options={chartOptions} />}
                {activeChart === 'mes' && <Chart type="line" data={chartDataMes} options={chartOptions} />}
                {activeChart === 'listaPrecio' && <Chart type="pie" data={chartDataListaPrecio} options={chartOptions} />}
            </div>
        </div>
    );
}
