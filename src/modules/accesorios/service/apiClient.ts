import axios, { AxiosResponse } from "axios";
import {ProductoCatalogoInterface , CategoriaProductoInterface} from "./interface.ts";
import { getImagenesDisponibles } from '../../../utils/imagenes.ts';




// const API_BASE_URL = 'http://147.93.35.74:3099'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


export const getAllProductos = async (): Promise<ProductoCatalogoInterface[]> => {
    try {
        const response: AxiosResponse<ProductoCatalogoInterface[]> = await axios.get(`${API_BASE_URL}/catalogo/producto`);
        return response.data;
    } catch (error) {
        console.error("Error fetching color:", error);
        throw error;
    }
};

export const postProducto = async (producto : ProductoCatalogoInterface): Promise<ProductoCatalogoInterface> => {
    try {
        const response: AxiosResponse<ProductoCatalogoInterface> = await axios.post(`${API_BASE_URL}/catalogo/producto/agregar`, producto);
        return response.data;
    } catch (error) {
        console.error("Error postColor :", error);
        throw error;
    }
};

export const putProducto = async (producto : ProductoCatalogoInterface): Promise<ProductoCatalogoInterface> => {
    try {
        const response: AxiosResponse<ProductoCatalogoInterface> = await axios.put(`${API_BASE_URL}/catalogo/producto/modificar`, producto);
        return response.data;
    } catch (error) {
        console.error("Error putColor :", error);
        throw error;
    }
};

export const deleteProducto = async (productoId:number) => {
    try {
        const response: AxiosResponse<any> = await axios.delete(`${API_BASE_URL}/catalogo/producto/eliminar/${productoId}`);
        return response.data;
    } catch (error) {
        console.error("Error deleteColor :", error);
        throw error;
    }
};



export const getAllCategoria = async (): Promise<CategoriaProductoInterface[]> => {
    try {
        const response: AxiosResponse<CategoriaProductoInterface[]> = await axios.get(`${API_BASE_URL}/catalogo/categoriaproducto`);
        return response.data;
    } catch (error) {
        console.error("Error fetching color:", error);
        throw error;
    }
};

export const postCategoria = async (categoria : CategoriaProductoInterface): Promise<CategoriaProductoInterface> => {
    try {
        const response: AxiosResponse<CategoriaProductoInterface> = await axios.post(`${API_BASE_URL}/catalogo/categoriaproducto/agregar`, categoria);
        return response.data;
    } catch (error) {
        console.error("Error postColor :", error);
        throw error;
    }
};

export const putCategoria = async (categoria : CategoriaProductoInterface): Promise<ProductoCatalogoInterface> => {
    try {
        const response: AxiosResponse<CategoriaProductoInterface> = await axios.put(`${API_BASE_URL}/catalogo/categoriaproducto/modificar`, categoria);
        return response.data;
    } catch (error) {
        console.error("Error putColor :", error);
        throw error;
    }
};

export const deleteCategoria = async (categoriaId:number) => {
    try {
        const response: AxiosResponse<any> = await axios.delete(`${API_BASE_URL}/catalogo/categoriaproducto/eliminar/${categoriaId}`);
        return response.data;
    } catch (error) {
        console.error("Error deleteColor :", error);
        throw error;
    }
};

export const getImagenesServidor = getImagenesDisponibles;

export const uploadImage = async (file: File): Promise<string> => {
    try {

        const formData = new FormData();

        formData.append("file", file);
        formData.append("destino", "catalogo-producto");

        const response: AxiosResponse<string> = await axios.post(
            `${API_BASE_URL}/api/images/upload`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            }
        );

        return response.data;

    } catch (error) {
        console.error("Error uploadImage:", error);
        throw error;
    }
};

export const getImagenUrl = (nombreImagen?: string, destino = 'catalogo-producto'): string => {

    return `${API_BASE_URL}/api/images/${nombreImagen}?destino=${destino}`;
};