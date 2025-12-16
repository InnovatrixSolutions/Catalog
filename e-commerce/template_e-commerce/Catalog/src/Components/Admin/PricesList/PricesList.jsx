// PricesList.jsx
import React, { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faEdit,
  faArrowUp,
  faArrowDown,
  faSync,
  faEye,
  faArrowDown as faDownload,
} from "@fortawesome/free-solid-svg-icons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

import baseURL from "../../url";
import moneda from "../../moneda";
import { Link as Anchor } from "react-router-dom";
import { fetchUsuario, getUsuario } from "../../user";

// Si tienes un modal propio para crear listas, déjalo
import NewPricesListt from "../NewPricesList/NewPricesList";

export default function PricesList({ idProducto = null }) {
  const [pricesList, setPricesList] = useState([]);
  const [ordenInvertido, setOrdenInvertido] = useState(false);
  const [visibleCount, setVisibleCount] = useState(20);

  // filtros
  const [filtroId, setFiltroId] = useState("");
  const [filtroTitulo, setFiltroTitulo] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");

  // auth
  const [loadingUser, setLoadingUser] = useState(true);

    const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const [editPrecio, setEditPrecio] = useState("");
  const [editTipoLista, setEditTipoLista] = useState("");
  const [editEstado, setEditEstado] = useState("");
  const [editVigDesde, setEditVigDesde] = useState("");
  const [editVigHasta, setEditVigHasta] = useState("");


  useEffect(() => {
    (async () => {
      try {
        await fetchUsuario();
      } finally {
        setLoadingUser(false);
      }
    })();
  }, []);

  const usuarioLegued = getUsuario();

  const cargarListaPrecios = async () => {
    try {
      const url = idProducto
        ? `${baseURL}/listaPreciosGet.php?idProducto=${encodeURIComponent(
            String(idProducto)
          )}`
        : `${baseURL}/listaPreciosGet.php`;

      console.log("GET lista precios URL:", url);

      const res = await fetch(url, { method: "GET" });
      const text = await res.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Respuesta no es JSON: " + text);
      }

      if (!res.ok || data?.error) {
        throw new Error(data?.error || "Error cargando lista de precios");
      }

      // tu backend suele devolver: { listaprecios: [] }
      const arr =
        data?.listaprecios ||
        data?.listaPrecios ||
        data?.precios ||
        [];

      setPricesList(Array.isArray(arr) ? arr : []);
    } catch (e) {
      console.error(e);
      toast.error(e?.message || "No se pudo cargar la lista de precios");
      setPricesList([]);
    }
  };

  useEffect(() => {
    cargarListaPrecios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idProducto]);

  const recargarListaPrecios = () => cargarListaPrecios();

  const invertirOrden = () => {
    setPricesList((prev) => [...prev].reverse());
    setOrdenInvertido((p) => !p);
  };

  const handleShowMore = () => setVisibleCount((p) => p + 20);

  const pricesListFiltered = useMemo(() => {
    const fId = String(filtroId ?? "").trim();
    const fTit = String(filtroTitulo ?? "").trim().toLowerCase();
    const fCat = String(filtroCategoria ?? "").trim();

    return (pricesList || []).filter((item) => {
      const idMatch = !fId || String(item?.idProducto ?? "").includes(fId);

      // Si el backend NO trae titulo, esto queda "" y no rompe
      const titulo = String(item?.titulo ?? "");
      const tituloMatch = !fTit || titulo.toLowerCase().includes(fTit);

      // Puede venir idCategoria, o puede venir categoria (texto)
      const idCategoria = String(item?.idCategoria ?? "");
      const categoriaTxt = String(item?.categoria ?? "");
      const categoriaMatch =
        !fCat ||
        idCategoria.includes(fCat) ||
        categoriaTxt.toLowerCase().includes(fCat.toLowerCase());

      return idMatch && tituloMatch && categoriaMatch;
    });
  }, [pricesList, filtroId, filtroTitulo, filtroCategoria]);

  const descargarExcel = () => {
    const data = pricesListFiltered.map((item) => ({
      IdListaPrecio: item?.idListaPrecio ?? "",
      IdProducto: item?.idProducto ?? "",
      Titulo: item?.titulo ?? "",
      Categoria: item?.categoria ?? item?.idCategoria ?? "",
      Subcategoria: item?.subcategoria ?? item?.idSubCategoria ?? "",
      Precio: item?.precio ?? "",
      TipoLista: item?.tipoLista ?? "",
      Estado: item?.estado ?? "",
      VigenciaDesde: item?.vigenciaDesde ?? "",
      VigenciaHasta: item?.vigenciaHasta ?? "",
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "PricesList");
    XLSX.writeFile(wb, "pricesList.xlsx");
  };

  const descargarPDF = () => {
    const pdf = new jsPDF();
    pdf.text("Lista de precios", 10, 10);

    const columns = [
      "idListaPrecio",
      "idProducto",
      "titulo",
      "precio",
      "tipoLista",
      "estado",
      "vigenciaDesde",
      "vigenciaHasta",
    ];

    const body = pricesListFiltered.map((item) =>
      columns.map((k) => String(item?.[k] ?? ""))
    );

    pdf.autoTable({
      head: [columns],
      body,
      startY: 20,
      styles: { fontSize: 8 },
    });

    pdf.save("lista_precios.pdf");
  };

  const eliminarRegistro = async (idListaPrecio) => {
    // Ajusta el endpoint si tu delete es distinto.
    // Si tu sistema elimina por productDelete.php, eso es para productos, NO lista_precios.
    toast.info("Aún no conecté el delete real de lista_precios en este archivo.");
    console.log("Eliminar idListaPrecio:", idListaPrecio);
  };

  const abrirEditar = (item) => {
    if (!item?.titulo) {
      toast.error("Este registro no tiene idListaPrecio");
      return;
    }

    setEditItem(item);

    setEditPrecio(item?.precio ?? "");
    setEditTipoLista(String(item?.tipoLista ?? "").toLowerCase());
    setEditEstado(String(item?.estado ?? "").toLowerCase());
    setEditVigDesde(item?.vigenciaDesde ?? "");
    setEditVigHasta(item?.vigenciaHasta ?? "");

    setEditOpen(true);
  };

  const cerrarEditar = () => {
    setEditOpen(false);
    setEditItem(null);
  };

    const guardarEdicion = async () => {
    try {
      if (!editItem?.idListaPrecio) throw new Error("Falta idListaPrecio");

      const fd = new FormData();
      fd.append("idListaPrecio", String(editItem.idListaPrecio));
      fd.append("idProducto", String(editItem.idProducto)); // requerido por tu PUT actual
      fd.append("precio", String(editPrecio));
      fd.append("tipoLista", String(editTipoLista)); // catalogo|dropshipper
      fd.append("estado", String(editEstado)); // actual|anterior
      fd.append("vigenciaDesde", String(editVigDesde));
      fd.append("vigenciaHasta", editVigHasta ? String(editVigHasta) : "");

      const res = await fetch(`${baseURL}/listaPreciosPut.php`, {
        method: "POST",
        body: fd,
      });

      const data = await res.json();
      if (!res.ok || data?.error) throw new Error(data?.error || "Error guardando");

      toast.success("Precio actualizado");
      cerrarEditar();
      cargarListaPrecios(); // refresca tabla
    } catch (e) {
      console.error(e);
      toast.error(e?.message || "No se pudo guardar");
    }
  };



  return (
    <div>
      <h1 className="titles-text-heading">Lista de precios</h1>
      <ToastContainer />

      <div className="deFlexContent">
        <div className="deFlex2">
          <NewPricesListt />
          <button className="excel" onClick={descargarExcel}>
            <FontAwesomeIcon icon={faDownload} /> Excel
          </button>
          <button className="pdf" onClick={descargarPDF}>
            <FontAwesomeIcon icon={faDownload} /> PDF
          </button>
        </div>

        <div className="filtrosContain">
          <div className="inputsColumn">
            <button>
              {String(pricesListFiltered.length).replace(/\B(?=(\d{3})+(?!\d))/g, ".")} /{" "}
              {String(pricesList.length).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
            </button>
          </div>

          <div className="inputsColumn">
            <input
              type="number"
              value={filtroId}
              onChange={(e) => setFiltroId(e.target.value)}
              placeholder="Id Producto"
            />
          </div>

          <div className="inputsColumn">
            <input
              type="text"
              value={filtroTitulo}
              onChange={(e) => setFiltroTitulo(e.target.value)}
              placeholder="Titulo (si existe)"
            />
          </div>

          <div className="inputsColumn">
            <input
              type="text"
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              placeholder="Categoria (id o texto)"
            />
          </div>

          <button className="reload" onClick={recargarListaPrecios}>
            <FontAwesomeIcon icon={faSync} />
          </button>

          <button className="reverse" onClick={invertirOrden}>
            {ordenInvertido ? (
              <FontAwesomeIcon icon={faArrowUp} />
            ) : (
              <FontAwesomeIcon icon={faArrowDown} />
            )}
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>IdListaPrecio</th>
              <th>IdProducto</th>
              <th>Titulo</th>
              <th>Precio</th>
              <th>TipoLista</th>
              <th>Estado</th>
              <th>VigenciaDesde</th>
              <th>VigenciaHasta</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {pricesListFiltered.slice(0, visibleCount).map((item) => (
              <tr key={item?.idListaPrecio ?? `${item?.idProducto}-${item?.tipoLista}-${item?.estado}`}>
                <td>{item?.idListaPrecio ?? "-"}</td>
                <td>{item?.idProducto ?? "-"}</td>
                <td>{item?.titulo ?? "-"}</td>

                <td style={{ color: "#008000" }}>
                  {moneda}{" "}
                  {String(item?.precio ?? "")
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                </td>

                <td>{item?.tipoLista ?? "-"}</td>
                <td>{item?.estado ?? "-"}</td>
                <td>{item?.vigenciaDesde ?? "-"}</td>
                <td>{item?.vigenciaHasta ?? "-"}</td>

                <td>
                  {loadingUser ? null : (
                    <>
                      {/* Editar */}
                      <button className="editar" onClick={() => abrirEditar(item)}>
                        <FontAwesomeIcon icon={faEdit} />
                      </button>

                      {/* Ver producto (si tienes ruta) */}
                      {item?.idProducto ? (
                        <Anchor
                          className="editar"
                          to={`/producto/${item?.idProducto}/${String(item?.titulo ?? "producto").replace(/\s+/g, "-")}`}
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </Anchor>
                      ) : null}

                      {/* Eliminar (pendiente conectar endpoint real) */}
                      <button
                        className="eliminar"
                        onClick={() => eliminarRegistro(item?.idListaPrecio)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pricesListFiltered.length > visibleCount && (
        <button onClick={handleShowMore} id="show-more-btn">
          Mostrar más
        </button>
      )}

            {editOpen && (
        <div className="modal">
          <div className="modal-content">
            <div className="deFlexBtnsModal">
              <h3 style={{ margin: 0 }}>
                Editar lista de precios #{editItem?.idListaPrecio}
              </h3>
              <span className="close" onClick={cerrarEditar}>
                &times;
              </span>
            </div>

<div className="edit-grid">
  <fieldset id="descripcion">
    <legend>Producto</legend>
    <div>
      <b>{editItem?.titulo ?? "—"}</b>
      <div style={{ fontSize: 12, opacity: 0.8 }}>
        idProducto: {editItem?.idProducto}
      </div>
    </div>
  </fieldset>

  <fieldset>
    <legend>Precio</legend>
    <input
      type="number"
      min="0"
      step="0.01"
      value={editPrecio}
      onChange={(e) => setEditPrecio(e.target.value)}
    />
  </fieldset>

  <fieldset>
    <legend>Tipo Lista</legend>
    <select value={editTipoLista} onChange={(e) => setEditTipoLista(e.target.value)}>
      <option value="catalogo">catalogo</option>
      <option value="dropshipper">dropshipper</option>
    </select>
  </fieldset>

  <fieldset>
    <legend>Estado</legend>
    <select value={editEstado} onChange={(e) => setEditEstado(e.target.value)}>
      <option value="actual">actual</option>
      <option value="anterior">anterior</option>
    </select>
  </fieldset>

  <fieldset>
    <legend>Vigencia Desde</legend>
    <input
      type="date"
      value={editVigDesde || ""}
      onChange={(e) => setEditVigDesde(e.target.value)}
    />
  </fieldset>

  <fieldset>
    <legend>Vigencia Hasta</legend>
    <input
      type="date"
      value={editVigHasta || ""}
      onChange={(e) => setEditVigHasta(e.target.value)}
    />
  </fieldset>
</div>

<button className="btnPost" onClick={guardarEdicion}>
  Guardar
</button>

          </div>
        </div>
      )}

    </div>
  );
}
