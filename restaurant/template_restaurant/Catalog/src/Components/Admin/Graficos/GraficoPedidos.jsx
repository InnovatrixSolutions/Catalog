import React, { useState, useEffect } from 'react';
import './GraficoPedidos.css';
import { Chart } from 'primereact/chart';
import baseURL from '../../url';

export default function GraficoPedidos() {
    const [chartDataDia, setChartDataDia] = useState({});
    const [chartDataSemana, setChartDataSemana] = useState({});
    const [chartDataMes, setChartDataMes] = useState({});
    const [chartOptions, setChartOptions] = useState({});
    const [totalDia, setTotalDia] = useState(0);
    const [totalSemana, setTotalSemana] = useState(0);
    const [totalMes, setTotalMes] = useState(0);
    const [activeChart, setActiveChart] = useState('dia');

    // Array de valores por defecto
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
                const pedidosPagados = data.pedidos.filter(pedido => pedido.pagado === 'Si');
                procesarDatos(pedidosPagados);
            })
            .catch(error => {
                console.error('Error al cargar pedidos:', error);
                // Si hay un error, establecer valores por defecto
                establecerValoresPorDefecto();
            });
    };

    const procesarDatos = (pedidos) => {
        if (pedidos.length === 0) {
            // Si no hay pedidos, establecer valores por defecto
            establecerValoresPorDefecto();
            return; // Salir de la función si no hay pedidos
        }

        calcularTotalesPorDia(pedidos);
        calcularTotalesPorSemanaConSemanasCompletas(pedidos);
        calcularTotalesPorMes(pedidos);
    };

    const establecerValoresPorDefecto = () => {
        const diasPorDefecto = Array.from({ length: 7 }, (_, i) => `Día ${i + 1}`);
        const semanasPorDefecto = Array.from({ length: 4 }, (_, i) => `Semana ${i + 1}`);
        const mesesPorDefecto = ['Enero', 'Febrero', 'Marzo'];

        // Asignar valores por defecto aleatorios a los totales
        const valorDia = VALORES_DEFAULT[Math.floor(Math.random() * VALORES_DEFAULT.length)];
        const valorSemana = valorDia * 7; // Total por semana como un múltiplo del valor diario
        const valorMes = valorDia * 30; // Total por mes como un múltiplo del valor diario

        setTotalDia(valorDia);
        setTotalSemana(valorSemana);
        setTotalMes(valorMes);

        // Generar gráficos por defecto con valores aleatorios
        generarGrafico(diasPorDefecto, Array(diasPorDefecto.length).fill(valorDia), 'Ventas por Día', setChartDataDia);
        generarGrafico(semanasPorDefecto, Array(semanasPorDefecto.length).fill(valorSemana), 'Ventas por Semana', setChartDataSemana);
        generarGrafico(mesesPorDefecto, Array(mesesPorDefecto.length).fill(valorMes), 'Ventas por Mes', setChartDataMes);
    };

    // Gráfico por día
    const calcularTotalesPorDia = (pedidos) => {
        const totalesPorDia = pedidos.reduce((acc, pedido) => {
            const fecha = new Date(pedido.createdAt).toLocaleDateString('es-ES'); // Formato de fecha
            if (!acc[fecha]) {
                acc[fecha] = 0;
            }
            acc[fecha] += parseFloat(pedido.total);
            return acc;
        }, {});

        // Ordenar por fechas más antiguas primero
        const fechasOrdenadas = Object.keys(totalesPorDia).sort((a, b) => new Date(a) - new Date(b));

        // Calcular total global por día
        const totalGlobalDia = Object.values(totalesPorDia).reduce((acc, val) => acc + val, 0);
        setTotalDia(totalGlobalDia || VALORES_DEFAULT[Math.floor(Math.random() * VALORES_DEFAULT.length)]);

        generarGrafico(fechasOrdenadas, fechasOrdenadas.map(fecha => totalesPorDia[fecha] || totalGlobalDia), 'Ventas por Día', setChartDataDia);
    };

    // Gráfico por semana
    const calcularTotalesPorSemanaConSemanasCompletas = (pedidos) => {
        const fechaActual = new Date();
        const añoActual = fechaActual.getFullYear();
        const mesActual = fechaActual.getMonth();

        const semanasDelMes = generarSemanasDelMes(añoActual, mesActual);

        const totalesPorSemana = pedidos.reduce((acc, pedido) => {
            const fecha = new Date(pedido.createdAt);
            const semana = getNumeroSemana(fecha);
            const key = `Semana ${semana}`;

            if (!acc[key]) {
                acc[key] = 0;
            }
            acc[key] += parseFloat(pedido.total);
            return acc;
        }, {});

        // Ordenar las semanas cronológicamente
        const semanasOrdenadas = semanasDelMes.sort((a, b) => a - b);

        // Calcular total global por semana
        const totalGlobalSemana = Object.values(totalesPorSemana).reduce((acc, val) => acc + val, 0);
        setTotalSemana(totalGlobalSemana || VALORES_DEFAULT[Math.floor(Math.random() * VALORES_DEFAULT.length)] * 7);

        const datosCompletosPorSemana = semanasOrdenadas.map(semana => totalesPorSemana[`Semana ${semana}`] || totalGlobalSemana);

        generarGrafico(semanasOrdenadas.map(semana => `Semana ${semana}`), datosCompletosPorSemana, 'Ventas por Semana', setChartDataSemana);
    };

    // Gráfico por mes
    const calcularTotalesPorMes = (pedidos) => {
        const totalesPorMesODia = pedidos.reduce((acc, pedido) => {
            const fecha = new Date(pedido.createdAt);
            const mes = fecha.toLocaleString('default', { month: 'long' });

            if (!acc.meses[mes]) {
                acc.meses[mes] = 0;
            }
            acc.meses[mes] += parseFloat(pedido.total);
            return acc;
        }, { meses: {} });

        const mesesOrdenados = Object.keys(totalesPorMesODia.meses).sort((a, b) => new Date(`1 ${a}`) - new Date(`1 ${b}`));

        const totalGlobalMes = Object.values(totalesPorMesODia.meses).reduce((acc, val) => acc + val, 0);
        setTotalMes(totalGlobalMes || VALORES_DEFAULT[Math.floor(Math.random() * VALORES_DEFAULT.length)] * 30);

        generarGrafico(mesesOrdenados, mesesOrdenados.map(mes => totalesPorMesODia.meses[mes] || totalGlobalMes), 'Ventas por Mes', setChartDataMes);
    };

    // Generar todas las semanas del mes actual
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

    // Función para obtener el número de la semana
    const getNumeroSemana = (fecha) => {
        const primeraFechaAño = new Date(fecha.getFullYear(), 0, 1);
        const diasDesdePrimeroEnero = Math.floor((fecha - primeraFechaAño) / (24 * 60 * 60 * 1000));
        return Math.ceil((diasDesdePrimeroEnero + primeraFechaAño.getDay() + 1) / 7);
    };

    const generarGrafico = (labels, data, labelGrafico, setChartData) => {
        const chartData = {
            labels: labels, // Días, semanas o meses
            datasets: [
                {
                    label: labelGrafico,
                    data: data,
                    fill: true,
                    backgroundColor: 'rgba(248, 0, 80, 0.3)',
                    borderColor: '#F80050',
                    tension: 0.4
                }
            ]
        };
        setChartData(chartData);
    };
    const manejarCambioGrafico = (tipoGrafico) => {
        setActiveChart(tipoGrafico);
    };
    return (
        <div className="GraficoContent">
            <h3 className='titleGrafico'>Ventas Realizadas</h3>
            <div className="botones-grafico">
                <button
                    className={activeChart === 'dia' ? 'activeBtnGraf' : 'desactiveBtn'}
                    onClick={() => manejarCambioGrafico('dia')}
                >
                    Día
                </button>
                <button
                    className={activeChart === 'semana' ? 'activeBtnGraf' : 'desactiveBtn'}
                    onClick={() => manejarCambioGrafico('semana')}
                >
                    Semana
                </button>
                <button
                    className={activeChart === 'mes' ? 'activeBtnGraf' : 'desactiveBtn'}
                    onClick={() => manejarCambioGrafico('mes')}
                >
                    Mes
                </button>
            </div>
            <div className="grafico-container"> {/* Contenedor para el gráfico */}
                {activeChart === 'dia' && <Chart type="line" data={chartDataDia} options={chartOptions} />}
                {activeChart === 'semana' && <Chart type="line" data={chartDataSemana} options={chartOptions} />}
                {activeChart === 'mes' && <Chart type="line" data={chartDataMes} options={chartOptions} />}
            </div>
        </div>
    );
}
