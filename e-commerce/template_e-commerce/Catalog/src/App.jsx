
import './App.css';
import { useEffect } from 'react';
import { router, } from "./Pages/index";
import { RouterProvider } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import React from 'react'

function App() {
  console.log('Env USER TYPE:', process.env.REACT_APP_USER_TYPE);

  useEffect(() => {
    const userType = process.env.REACT_APP_USER_TYPE;
    console.log('userType:', userType); // 👈 verify in dev tools
    const root = document.documentElement;

    if (userType === "Dropshipper") {
      root.style.setProperty('--color1', '#FF6600');
    } else {
      root.style.setProperty('--color1', '#2ea74e');
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
