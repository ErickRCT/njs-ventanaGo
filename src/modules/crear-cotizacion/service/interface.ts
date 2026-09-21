import {Cliente} from "../../../components/service/inteface.ts";

export interface Serie {
    serieId: number;
    nombre: string;
  }

  export interface Vidrio {
    vidrioId: number;
    nombre: string;
    valor:number;
  }

  export interface Color {
    colorId: number;
    nombre: string;
    valor:number;
  }



  interface TipoProducto {
    tipoProductoId: number;
    nombre: string;
    descripcion: string | null;
    tipo_producto: any | null;
  }
  
  interface TipoPauta {
    tipoPautaId: number;
    nombre: string;
    rutaImagen: string;
    tipoProducto: TipoProducto;
  }
  
  interface VidrioPauta {
    pautaVidrioId: number;
    cantidad: number;
    variacionH: number | null;
    variacionV: number | null;
    formula: string | null;
    vidrioId: number | null;
    nombre: string | null;
    valor: number | null;
  }
  
  interface Quincalleria {
    quincalleriaId: number;
    nombre: string;
    unidad: string;
    valor: number;
    rutaImagen: string;
  }
  
  interface PautaQuincalleria {
    pautaQuincalleriaId: number;
    quincalleria: Quincalleria;
    cantidad: number;
    variacionH: number | null;
    variacionV: number | null;
  }
  
  interface TipoPerfil {
    tipoPerfilId: number;
    nombre: string;
  }
  
  interface Perfil {
    perfilId: number;
    codigo: string;
    descripcion: string | null;
    peso: string;
    isBastidor: boolean | null;
    tipoPerfil: TipoPerfil;
    serie: Serie;
  }
  
  interface PautaPerfil {
    pautaPerfilId: number;
    perfil: Perfil;
    corte: string | null;
    orientacion: string;
    cantidad: number;
    variacion: number;
    dividir: boolean;
  }
  
  export interface Pauta {
    serieId:number
    pautaId: number;
    nombre: string;
    descripcion: string;
    pesoTeoricoHorizontal: number;
    pesoTeoricoVertical: number;
    pesoTeoricoReforzadoHorizontal: number;
    pesoTeoricoReforzadoVertical: number;
    verticalReforzada: number;
    horizontalReforzada: number;
    isReforzada: boolean;
    tipoPauta: TipoPauta;
    vidrios: VidrioPauta[];
    quincallerias: PautaQuincalleria[];
    perfiles: PautaPerfil[];
  }

  export interface Ventana {
    ventanaId:number | null;
    descripcion: string | null,
    cantidad: number | null,
    ancho: number | null,
    alto: number | null,
    observaciones: string | null,
    precioNeto: number| null,
    cotizacionId: number| null,
    color:Color| null,
    vidrio:Vidrio| null,
    pauta:Pauta| null,
  }
  
  export interface Cotizacion {
    cotizacionId: number | null;
    cliente: Cliente | null;
    nombreCotizacion:string | null,
    estado: string;
    fecha: string;
    ganancia: number | null;
    descuento: number | null;
    condiciones: string | null;
    flete: string | null;
    valorFlete: number;
    instalacion: string | null;
    valorInstalacion: number;
    otrosGastos: string | null;
    valorOtrosGastos: number;
    valorManoDeObra: number;
    neto: number | null;
    valorFinal: number;
    totalm2: number | null;
    cantidadProductos: number| null;
    ventanas: Ventana[];
  }
  