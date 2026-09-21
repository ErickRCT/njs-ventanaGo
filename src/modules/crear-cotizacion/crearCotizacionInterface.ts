
import { Serie, Vidrio,Color, Pauta, Cotizacion } from "./service/interface";

export interface Producto {
    item: string;
    cantidad: number;
    ancho: number;
    alto: number;
    color?: Color | null;
    vidrio?: Vidrio | null;
    obs?: string | null;
  }
  export interface ProductoAgregado {
    precio: number;
    imagenProducto: string | null;
    item: string;
    cantidad: number;
    ancho: number;
    alto: number;
    color?: Color | null;
    vidrio?: Vidrio | null;
    obs?: string | null;
  }

  export interface ListaModelosProps {
    modelosData: Serie[];
    selectedModel: number | null;
    setSelectedModel: (model: number) => void;
    openList: () => void;
    closeForm: () => void;
  }

  export interface Perfiles {
    descripcion: string;
    imagen: string;
  }
  
  export interface ListaProductosFormularioProps {
    altoReforzado:number;
    anchoReforzado:number;
    isReforzado:boolean;
    pautasData: Pauta[];
    currentProducts: Pauta[];
    isListOpen: boolean;
    isFormOpen: boolean;
    currentPage: number;
    productsPerPage: number;
    selectedProduct: string | null;
    selectedProductImage: string | null;
    handlePageChange: (event: React.ChangeEvent<unknown>, value: number) => void;
    openForm: (pauta:Pauta) => void;
    closeForm: () => void;
    closeList: () => void;
    handleFormSubmit: (data: any) => void;
    vidriosData:Vidrio[],
    coloresData:Color[],
  }

  
  export interface ProductosAgregadosProps {
    cotizacion:Cotizacion;
    setCotizacion: any;
  }
  
  export interface CalcularValoresProps {
    cotizacion:Cotizacion;
    setCostosExtras: any;
    costosExtras:any;
    onSaveCostosExtras:any;
    onDescargarCotizacion:any;
    onDescargarOrdenDeTrabajo:any;
    ganancia:any;
    setGanancia: any;
    descuento: any;
    setDescuento: any;

  }

  export interface FormularioProductoProps {
    altoReforzado:number;
    anchoReforzado:number;
    isReforzado:boolean;
    closeForm:() => void,
    onSubmit: (data: Producto) => void;
    productDescription: string | null;
    productoImage: string | null;
    vidriosData:Vidrio[],
    coloresData:Color[],
  }
  
  