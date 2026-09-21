export interface TipoPerfil {
    tipoPerfilId: number | null;
    nombre: string;
}

export interface Serie {
    serieId: number | null;
    nombre: string;
    descripcion: string;
}

export interface PerfilInterface {
    perfilId?: number | null;
    codigo: string;
    descripcion: string;
    peso: number | null;
    isBastidor: boolean | undefined;
    tipoPerfil: TipoPerfil | null;
    serie: Serie | null;
    reforzado: boolean;
    orientacion: 'H' | 'V';
}