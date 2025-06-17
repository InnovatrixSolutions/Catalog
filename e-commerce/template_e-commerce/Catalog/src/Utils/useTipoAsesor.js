import { useMemo } from 'react';

export function useTipoAsesor() {
  return useMemo(() => {
    // 1. Variable de entorno (útil en Vite o Create React App)
    const tipoEnv = import.meta.env.VITE_TIPO_ASESOR;
    if (tipoEnv === 'dropshipper' || tipoEnv === 'catalogo') {
      return tipoEnv;
    }

    // 2. Variable guardada localmente (opcional)
    const tipoLocal = localStorage.getItem('tipoAsesor');
    if (tipoLocal === 'dropshipper' || tipoLocal === 'catalogo') {
      return tipoLocal;
    }

    // 3. Detectar desde el dominio
    const hostname = window.location.hostname;
    return hostname.includes('dropshipper') ? 'dropshipper' : 'catalogo';
  }, []);
}
