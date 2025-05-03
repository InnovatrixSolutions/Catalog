
import './App.css';
import { router, } from "./Pages/index";
import { RouterProvider } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import React from 'react'


function App() {


  return (
    <>
    <ToastContainer />
    <RouterProvider router={router} />
    </>
    

  );
}

export default App;
