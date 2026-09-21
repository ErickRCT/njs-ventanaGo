export interface Region {
    regionId: number|null;
    nombre: string;
    codigo: string;
}

export interface Comuna {
    comunaId: number|null;
    nombre: string;
    region: Region;
}

export interface Cliente  {
    clienteId: number|null;
    rut: string;
    nombre: string;
    telefono: string;
    email: string;
    direccion: string;
    comuna:Comuna|null;
}