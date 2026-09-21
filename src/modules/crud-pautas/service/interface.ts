// Interfaces básicas
export interface TipoProducto {
  tipoProductoId: number;
  nombre: string;
  descripcion: string;
  tipo_producto: null | TipoProducto;
}

export interface TipoPerfil {
  tipoPerfilId: number;
  nombre: string;
}

export interface Serie {
  serieId: number;
  nombre: string;
  descripcion: string;
}

// Interfaces para perfiles
export interface Perfil {
  perfilId: number;
  codigo: string;
  descripcion: string;
  peso: number | null;
  isBastidor: boolean | undefined;
  tipoPerfil: TipoPerfil;
  serie: Serie;
  reforzado: boolean;
  orientacion: string;
}

export interface PautaPerfil {
  pautaPerfilId: number|null;
  pautaId: number | null;
  perfil: Perfil | null;
  corte: string | null;
  orientacion: "H" | "V";
  cantidad: number;
  variacion: number;
  dividir: boolean;
}

// Interfaces para quincallería
export interface Quincalleria {
  quincalleriaId: number;
  nombre: string;
  unidad: 'Pz' | 'Mt';
  valor: number;
  rutaImagen: string;
  serie: Serie;
}

export interface PautaQuincalleria {
  pautaQuincalleriaId: number |null;
  pautaId: number | null;
  quincalleria: Quincalleria;
  cantidad: number;
  variacionH: number | null;
  variacionV: number | null;
}

// Interfaces para vidrios
export interface PautaVidrio {

  pautaId: number | null;
  cantidad: number;
  variacionH: number;
  variacionV: number;
  formula: string;
  vidrioId: number | null;
  nombre: string | null;
  valor: number | null;
}

export interface VidrioFormulario {
  cantidad: number;
  variacionH: number;
  variacionV: number;
  formula: string;
}


// Interfaces para tipo de pauta
export interface TipoPauta {
  tipoPautaId: number;
  nombre: string;
  rutaImagen: string;
  tipoProducto: TipoProducto;
}

// Interface principal para la pauta
export interface Pauta {
  pautaId?: number | null;
  nombre: string;
  descripcion: string;
  pesoTeoricoHorizontal:number | null;
  pesoTeoricoVertical:number | null;
  pesoTeoricoReforzadoHorizontal:number | null;
  pesoTeoricoReforzadoVertical:number | null;
  verticalReforzada: number;
  horizontalReforzada: number;
  isReforzada: boolean;
  tipoPauta: TipoPauta | null;
  vidrios: PautaVidrio[] | null;
  quincallerias: PautaQuincalleria[] | null;
  perfiles: PautaPerfil[] | null;
  serie: Serie | null;
}

export interface PautaDTO {
  pautaId?: number | null;
  serie: Serie | null;
  nombre: string;
  descripcion: string;
  pesoTeoricoHorizontal:number | null;
  pesoTeoricoVertical:number | null;
  pesoTeoricoReforzadoHorizontal:number | null;
  pesoTeoricoReforzadoVertical:number | null;
  verticalReforzada: number;
  horizontalReforzada: number;
  quincallerias: PautaQuincalleria[] | null;
  tipoPauta: TipoPauta | null;
  perfiles: PautaPerfil[] | null;
  vidrios: PautaVidrio[] | null;
  isReforzada: boolean;
}