import './App.css';
import React, { useEffect } from 'react';
import { RouterProvider } from "react-router-dom";
import { router } from "./Pages/index";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  // Mostrar el modo desde el archivo .env
  console.log('Env MODE:', process.env.REACT_APP_MODE);

  useEffect(() => {
    const mode = (process.env.REACT_APP_MODE || '').toLowerCase().trim();
    console.log('App mode detected:', mode);

    const root = document.documentElement;

    // Colores según el modo
    const colorDropshipper = '#026349ff'; // verde clásico
    const colorCatalog = 'rgba(46, 167, 135, 1)'; // verde clásico

    // Aplica color según el modo actual
    if (mode === 'dropshipper') {
      console.log('🎨 Modo dropshipper activado');
      root.style.setProperty('--color1', colorDropshipper);
    } else {
      console.log('🎨 Modo catálogo activado');
      root.style.setProperty('--color1', colorCatalog);
    }
  }, []);

  return (
    <>
      <ToastContainer />
      <RouterProvider router={router} />
    </>
  );
}

export default App;
