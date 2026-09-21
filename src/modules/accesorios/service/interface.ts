export interface ProductoCatalogoInterface {
    catalogoProductoId: number | null;
    categoria: CategoriaProductoInterface | null;
    nombre: string;
    descripcion: string;
    precio: string;
    imagen: string;
    stock: number | null;
    activo: boolean;
}

export interface CategoriaProductoInterface {
    catalogoCategoriaProductoId: number | null;
    nombre: string;
    descripcion: string;
    orden: string;
    activo: boolean;
}