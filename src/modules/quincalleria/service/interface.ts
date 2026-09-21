export interface Serie {
    serieId: number;
    nombre: string;
    descripcion: string;
}

export interface QuincalleriaInterface {
    quincalleriaId: number | null;
    nombre: string;
    unidad: 'Pz' | 'Mt';
    valor: number;
    rutaImagen: string|"";
    serie: Serie |null;
}