// src/router/index.jsx (o donde lo tengas)
import IndexLayout from "../Layouts/IndexLayout";
import MainLayout from "../Layouts/MainLayout";
import PagesLayaut from "../Layouts/PagesLayaut";
import { createBrowserRouter } from "react-router-dom";

import Productos from "../Pages/Productos/Productos";
import PagePriceList from "./ListaPrecios/PagePriceList";
import Usuarios from "../Pages/Usuarios/Usuarios";
import Banners from "./Banners/Banners";
import Main from "./Main/Main";
import Categorias from "./Categorias/Categorias";
import Codigos from "./Codigos/Codigos";
import PageDetail from "../Pages/PageDetail/PageDetail";
import Pedidos from "./Pedidos/Pedidos";
import PedidosDropshipper from "./PedidosDropshipper/PedidosDropshipper";
import PedidosCatalogo from "./PedidosCatalogo/PedidosCatalogo";
import LiquidacionDropshipper from "./LiquidacionDropshipper/LiquidacionDropshipper";
import Tienda from "./Tienda/Tienda";
import MetodosDePago from "./MetodosDePago/MetodosDePago";

// ⚠️ IMPORTANTE: basename toma PUBLIC_URL en build (o "/" en dev)
export const router = createBrowserRouter(
  [    // Público
    {
      path: "/",
      element: <IndexLayout />,
    },
    {
      path: "/",
      element: <PagesLayaut />,
      children: [
        {
          // NO pongas "/" delante si quieres que sea relativa al parent,
          // aquí igual funciona con absoluta porque el parent es "/"
          path: "producto/:idProducto/:producto",
          element: <PageDetail />,
        },
      ],
    },

    // Admin
    {
      path: "/",
      element: <MainLayout />,
      children: [
        { path: "dashboard", element: <Main /> },
        { path: "dashboard/productos", element: <Productos /> },
        { path: "dashboard/lista-precios", element: <PagePriceList /> },
        { path: "dashboard/usuarios", element: <Usuarios /> },
        { path: "dashboard/banners", element: <Banners /> },
        { path: "dashboard/categorias", element: <Categorias /> },
        { path: "dashboard/promociones", element: <Codigos /> },

              // Pedidos (normales)
        { path: "dashboard/pedidos", element: <Pedidos /> },
        { path: "dashboard/pedidos/view", element: <Pedidos /> }, // alias viejo
        // Pedidos Dropshipper
        { path: "dashboard/pedidos-dropshipper", element: <PedidosDropshipper /> },

        // Pedidos Catálogo
        { path: "dashboard/pedidos-catalogo", element: <PedidosCatalogo /> },

        // Liquidación Dropshipper
        { path: "dashboard/liquidacion-dropshipper", element: <LiquidacionDropshipper /> },

        


        { path: "dashboard/mi-tienda", element: <Tienda /> },
        { path: "dashboard/metodos-de-pago", element: <MetodosDePago /> },
      ],
    },

    // 404 opcional
    // { path: "*", element: <NotFound /> },
  ],
  {
    // 👇 clave para que build y start se vean igual en raíz o subcarpeta
    basename: process.env.PUBLIC_URL || "/",
  }
);
