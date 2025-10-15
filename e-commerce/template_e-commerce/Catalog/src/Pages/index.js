import IndexLayout from "../Layouts/IndexLayout";
import MainLayout from "../Layouts/MainLayout";
import PagesLayaut from '../Layouts/PagesLayaut'
import { createBrowserRouter } from "react-router-dom";
import Productos from '../Pages/Productos/Productos'

import PagePriceList from "./ListaPrecios/PagePriceList";

import Usuarios from '../Pages/Usuarios/Usuarios'
import Banners from "./Banners/Banners";
import Main from "./Main/Main";
import Categorias from "./Categorias/Categorias";
import Codigos from "./Codigos/Codigos";
import PageDetail from '../Pages/PageDetail/PageDetail';
import PageProductos from "./PageProductos/PageProductos";
import Pedidos from "./Pedidos/Pedidos";

import PedidosDropshipper from "./PedidosDropshipper/PedidosDropshipper";

import LiquidacionDropshipper from "./LiquidacionDropshipper/LiquidacionDropshipper";


import Tienda from "./Tienda/Tienda";
import MetodosDePago from "./MetodosDePago/MetodosDePago";
import PedidosCatalogo from "./PedidosCatalogo/PedidosCatalogo";

export const router = createBrowserRouter([

    {
        path: "/",
        element: <IndexLayout />,

    },
    {
        path: "/",
        element: <PagesLayaut />,
        children: [
            {
                path: `/producto/:idProducto/:producto`,
                element: <PageDetail />,
            },
            // {
            //     path: `/productos`,
            //     element: <PageProductos />,
            // },

        ]
    },
    {
        path: "/",
        element: <MainLayout />,
        children: [
            {
                path: `/dashboard`,
                element: <Main />,
            },
            {
                path: `/dashboard/productos`,
                element: <Productos />,
            },
            {
                path: `/dashboard/lista-precios`,
                element: <PagePriceList />,
            },
            {
                path: `/dashboard/usuarios`,
                element: <Usuarios />,
            },

            {
                path: `/dashboard/banners`,
                element: <Banners />,
            },

            {
                path: `/dashboard/categorias`,
                element: <Categorias />,
            },

            {
                path: `/dashboard/promociones`,
                element: <Codigos />,
            },
            {
                path: `/dashboard/pedidos/view?`,
                element: <Pedidos />,
            },

                        {
                path: `/dashboard/pedidos/dropshipper/view?`,
                element: <PedidosDropshipper />,
            },

                                    {
                path: `/dashboard/pedidos/catalogo/view?`,
                element: <PedidosCatalogo />,
            },

                                                {
                path: `/dashboard/liquidacion/dropshipper/view?`,
                element: <LiquidacionDropshipper />,
            },

            {
                path: `/dashboard/mi-tienda`,
                element: <Tienda />,
            },
            {
                path: `/dashboard/metodos-de-pago`,
                element: <MetodosDePago />,
            },
        ],
    },


]);
