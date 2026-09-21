import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import useWindowDimensions from "../../hooks/useWindowDimensions";
import CalcularValores from "./components/CalcularValores";
import ProductosAgregados from "./components/ProductosAgregados";
import ListaProductosFormulario from "./components/ListaProductosFormulario";
import { Producto } from "./crearCotizacionInterface";
import { BarraAccionesCotizacion } from "./components/agregar-cliente/BarraAccionesCotizacion.tsx";
import {
  descargarCotizacion, descargarOrdenDeTrabajo, editCotizacion,
  getColores,
  getCotizacion,
  getPautas,
  getSeries,
  getVidrios,
  postCotizacion,
  postVentana
} from "./service/apiClient";
import { Serie, Vidrio, Color, Pauta, Cotizacion, Ventana } from "./service/interface";
import {Cliente} from "../../components/service/inteface.ts";
import ListaModelos from "./components/ListaModelos.tsx";
import { CircularProgress, Backdrop } from "@mui/material";

interface CrearCotizacionProps {
  id?: number | null;
}

export const CrearCotizacion = ({ id }: CrearCotizacionProps) => {
  const [isListOpen, setListOpen] = useState(false);
  const [isFormOpen, setFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [selectedProductImage, setSelectedProductImage] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<number>(0);
  const [nombreCotizacion, setNombreCotizacion] = useState("");
  const [cotizacion, setCotizacion] = useState<Cotizacion>({
    cotizacionId: null,
    cliente: null,
    nombreCotizacion: null,
    estado: "CREADA",
    fecha: new Date().toISOString().split("T")[0],
    ganancia: 50,
    descuento: 0,
    neto: 0,
    valorFinal: 0,
    totalm2: 0.0,
    cantidadProductos: 1,
    valorManoDeObra: 0,
    flete: null,
    valorFlete: 0,
    instalacion: null,
    valorInstalacion: 0,
    otrosGastos: null,
    valorOtrosGastos: 0,
    condiciones: null,
    ventanas: [],
  });
  const [modelosData, setModelosData] = useState<Serie[]>([]);
  const [vidriosData, setVidriosData] = useState<Vidrio[]>([]);
  const [coloresData, setColoresData] = useState<Color[]>([]);
  const [pautasData, setPautasData] = useState<Pauta[]>([]);
  const [pautaFormData, setPautaFormData] = useState<Pauta>();
  const [altoReforzado, setAltoReforzado] = useState<number>(0);
  const [anchoReforzado, setAnchoReforzado] = useState<number>(0);
  const [isReforzado, setIsReforzado] = useState<boolean>(false);
  const [idCliente, setIdCliente] = useState<number | null>(0);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const { width } = useWindowDimensions();
  const productsPerPage = width < 900 ? 2 : 3;
  const [currentPage, setCurrentPage] = useState(1);
  const [costosExtras, setCostosExtras] = useState({
    flete: "",
    valorFlete: 0,
    instalacion: "",
    valorInstalacion: 0,
    valorManoDeObra: 0,
    valorOtrosGastos: 0,
    otrosGastos: "",
  });
  const [ganancia, setGanancia] = useState(50);
  const [descuento, setDescuento] = useState(0);
  const [loadingDescarga, setLoadingDescarga] = useState(false);

  const openList = () => setListOpen(true);
  const closeList = () => setListOpen(false);

  const openForm = (pautaData: Pauta) => {
    setIsReforzado(pautaData.isReforzada);
    setAltoReforzado(pautaData.verticalReforzada);
    setAnchoReforzado(pautaData.horizontalReforzada);
    setPautaFormData(pautaData);
    setSelectedProduct(pautaData.nombre);
    setSelectedProductImage(pautaData.tipoPauta.rutaImagen);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setListOpen(true);
  };

  const handleFormSubmit = async (data: Producto) => {
    try {

      let cotizacionIdUse = cotizacion.cotizacionId;


      if (cotizacionIdUse === null) {
        const nuevaCotizacion = await postCotizacion(cotizacion);
        cotizacionIdUse = nuevaCotizacion.cotizacionId;
        console.log('cotizacionId', cotizacionIdUse);
        setCotizacion(nuevaCotizacion);
      }


      const ventana: Ventana = {
        ventanaId: null,
        descripcion: data.item || "",
        cantidad: data.cantidad,
        ancho: data.ancho,
        alto: data.alto,
        observaciones: data.obs || "",
        precioNeto: 0,
        cotizacionId: cotizacionIdUse,
        color: data.color || null,
        vidrio: data.vidrio || null,
        pauta: pautaFormData || null,
      };

      console.log("ventana", ventana);

      await postVentana(ventana);

      const cotizacionActualizada = await getCotizacion(cotizacionIdUse);
      //borrar cuando se actualice BD
      await editCotizacion(cotizacionActualizada);
      setCotizacion(cotizacionActualizada);

    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleCostosExtras = async () => {
    try {
      const totalExtras =
          (costosExtras.valorFlete || 0) +
          (costosExtras.valorInstalacion || 0) +
          (costosExtras.valorManoDeObra || 0) +
          (costosExtras.valorOtrosGastos || 0);

      const cotizacionActualizada = {
        ...cotizacion,
        flete: costosExtras.flete || null,
        valorFlete: costosExtras.valorFlete || 0,
        instalacion: costosExtras.instalacion || null,
        valorInstalacion: costosExtras.valorInstalacion || 0,
        valorManoDeObra: costosExtras.valorManoDeObra || 0,
        otrosGastos: costosExtras.otrosGastos || null,
        valorOtrosGastos: costosExtras.valorOtrosGastos || 0,
        neto: (cotizacion.neto || 0) + totalExtras,
      };

      const response = await editCotizacion(cotizacionActualizada);
      const cotizacionCompleta = await getCotizacion(response.cotizacionId);
      setCotizacion(cotizacionCompleta);
    } catch (error) {
      console.error("Error al guardar costos extras:", error);
    }
  };


  const handleGanacia = async () => {
    try {

      const cotizacionActualizada = {
        ...cotizacion,
        ganancia: ganancia || null,
      };

      const response = await editCotizacion(cotizacionActualizada);
      const cotizacionCompleta = await getCotizacion(response.cotizacionId);
      setCotizacion(cotizacionCompleta);
    } catch (error) {
      console.error("Error al guardar costos extras:", error);
    }
  };

  const handleDescuento = async () => {
    try {
      const cotizacionActualizada = {
        ...cotizacion,
        descuento: descuento || 0,
      };

      const response = await editCotizacion(cotizacionActualizada);
      const cotizacionCompleta = await getCotizacion(response.cotizacionId);
      setCotizacion(cotizacionCompleta);
    } catch (error) {
      console.error("Error al guardar descuento:", error);
    }
  };

  const handleDescargarCotizacion = async () => {
    if (cotizacion.cotizacionId) {
      try {
        setLoadingDescarga(true);
        await descargarCotizacion(cotizacion.cotizacionId);
      } catch (error) {
        console.error("Error al descargarCotizacion:", error);
      } finally {
        setLoadingDescarga(false);
      }
    }
  };

  const handleDescargarOrdenDeTrabajo = async () => {

    if (cotizacion.cotizacionId) {
      try {
        setLoadingDescarga(true);
        await descargarOrdenDeTrabajo(cotizacion.cotizacionId);

      } catch (error) {
        console.error("Error al descargarOrden de trabajo:", error);
      } finally {
        setLoadingDescarga(false);
      }
    }
  };


  const addCliente = async (cliente: Cliente | null) => {

      const cotizacionConCliente = {
        ...cotizacion,
        cliente: cliente,
      }
      setCotizacion(cotizacionConCliente);

  }

  const addNombreCotizacion = async (nombreCotizacion: string | null) => {

    const cotizacionConNombreCotizacion = {
      ...cotizacion,
      nombreCotizacion: nombreCotizacion,
    }
    setCotizacion(cotizacionConNombreCotizacion);

  }

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = pautasData.slice(indexOfFirstProduct, indexOfLastProduct);

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  useEffect(() => {
    obtenerModelos();
    obtenerVidrios();
    obtenerColores();
    if (id !== undefined) {
      cargarCotizacionExistente(id);
    }
  }, []);

  useEffect(() => {
    obtenerPautas(selectedModel);
  }, [selectedModel]);

  useEffect(() => {
      addCliente(cliente);
  }, [cliente]);

  useEffect(() => {
    addNombreCotizacion(nombreCotizacion);
  }, [nombreCotizacion]);

  useEffect(() => {
    if(cotizacion.cotizacionId !== null) {
      handleGanacia();
    }
  }, [ganancia]);

  useEffect(() => {
    if (cotizacion.cotizacionId !== null) {
      handleDescuento();
    }
  }, [descuento]);


  useEffect(() => {
    console.log("Cotizacion : ",cotizacion);
  }, [cotizacion]);

  const obtenerModelos = async () => {
    try {
      const response = await getSeries();
      setModelosData(response);
    } catch (error) {
      console.error("Error al obtener las series:", error);
    }
  };

  const obtenerVidrios = async () => {
    try {
      const response = await getVidrios();
      setVidriosData(response);
    } catch (error) {
      console.error("Error al obtener los vidrios:", error);
    }
  };

  const obtenerColores = async () => {
    try {
      const response = await getColores();
      setColoresData(response);
    } catch (error) {
      console.error("Error al obtener los colores:", error);
    }
  };

  const obtenerPautas = async (serieId: number) => {
    try {
      const response = await getPautas(serieId);
      setPautasData(response);
    } catch (error) {
      console.error("Error al obtener las pautas:", error);
    }
  };

  const cargarCotizacionExistente = async (id: number | null) => {
    try {
      const cotizacionExistente = await getCotizacion(id);
      setCotizacion(cotizacionExistente);

      if (cotizacionExistente.cliente) {
        setCliente(cotizacionExistente.cliente);
        setIdCliente(cotizacionExistente.cliente.clienteId);
      }

      setCostosExtras({
        flete: cotizacionExistente.flete || "",
        valorFlete: cotizacionExistente.valorFlete || 0,
        instalacion: cotizacionExistente.instalacion || "",
        valorInstalacion: cotizacionExistente.valorInstalacion || 0,
        valorManoDeObra: cotizacionExistente.valorManoDeObra || 0,
        valorOtrosGastos: cotizacionExistente.valorOtrosGastos || 0,
        otrosGastos: cotizacionExistente.otrosGastos || "",
      });
    } catch (error) {
      console.error("Error al cargar cotización existente:", error);
    }
  };

  return (
      <Box sx={{ maxWidth: width < 600 ? '100%' : '1200px', margin: '0 auto', padding: '16px' }}>
        <BarraAccionesCotizacion
            setIdCliente={setIdCliente}
            idCotizacion={cotizacion.cotizacionId}
            setCliente={setCliente}
            cliente={cliente}
            nombreCotizacion={nombreCotizacion}
            setNombreCotizacion={setNombreCotizacion}
            cotizacionCliente={cotizacion.cliente}
            onDescargar={handleDescargarCotizacion}
        />


        <div className={`${width > 600 ?"d-flex gap-3" :""}`}>

          <ListaModelos
              modelosData={modelosData}
              selectedModel={selectedModel}
              setSelectedModel={setSelectedModel}
              openList={openList}
              closeForm={closeForm}
          />

          <ListaProductosFormulario
              altoReforzado={altoReforzado}
              anchoReforzado={anchoReforzado}
              isReforzado={isReforzado}
              pautasData={pautasData}
              currentProducts={currentProducts}
              isListOpen={isListOpen}
              isFormOpen={isFormOpen}
              currentPage={currentPage}
              productsPerPage={productsPerPage}
              selectedProduct={selectedProduct}
              selectedProductImage={selectedProductImage}
              handlePageChange={handlePageChange}
              openForm={openForm}
              closeForm={closeForm}
              closeList={closeList}
              handleFormSubmit={handleFormSubmit}
              vidriosData={vidriosData}
              coloresData={coloresData}
          />
        </div>

        <Box
            sx={{ marginTop: 4, backgroundColor: 'rgba(255, 255, 255, 0.6)',borderRadius: 2 }}
        >

          {/* Mostrar productos agregados si existen */}
          {cotizacion.ventanas.length > 0 && (
              <Box
                  sx={{ display: "flex", gap: 10,
                    justifyContent: "start"
                    , flexWrap: "wrap" }}
              >
                <ProductosAgregados cotizacion={cotizacion} setCotizacion={setCotizacion} />
                <CalcularValores
                    cotizacion={cotizacion}
                    costosExtras={costosExtras}
                    setCostosExtras={setCostosExtras}
                    onSaveCostosExtras={handleCostosExtras}
                    onDescargarCotizacion={handleDescargarCotizacion}
                    onDescargarOrdenDeTrabajo={handleDescargarOrdenDeTrabajo}
                    ganancia={ganancia}
                    setGanancia={setGanancia}
                    descuento={descuento}
                    setDescuento={setDescuento}
                />

              </Box>
          )}

        </Box>

        <Backdrop
            open={loadingDescarga}
            sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        >
          <CircularProgress color="inherit" />
        </Backdrop>

      </Box>
  );

};
