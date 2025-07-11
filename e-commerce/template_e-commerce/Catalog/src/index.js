import React from 'react';
import ReactDOM from 'react-dom/client';
// import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';


// PrimeReact theme (choose one)
import 'primereact/resources/themes/saga-blue/theme.css';



// Core PrimeReact CSS
import 'primereact/resources/primereact.min.css';

// PrimeIcons for components like Dropdown, Calendar, etc.
import 'primeicons/primeicons.css';

// Optional: your own global styles
// import './index.css';

import 'primeflex/primeflex.css';



const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
