import {PerfilInterface} from "./interface.ts";
import axios, {AxiosResponse} from "axios";
import {TipoPerfilInterface} from "../../tipo-perfil/service/interface.ts";
import {SerieInterface} from "../../serie/service/interface.ts";
import { getImagenesDisponibles } from '../../../utils/imagenes.ts';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const getAllPerfiles = async (): Promise<PerfilInterface[]> => {
    try {
        const response: AxiosResponse<PerfilInterface[]> = await axios.get(`${API_BASE_URL}/perfil`);
        return response.data;
    } catch (error) {
        console.error("Error fetching perfil:", error);
        throw error;
    }
};

export const getAllTipoPerfil = async (): Promise<TipoPerfilInterface[]> => {
    try {
        const response: AxiosResponse<TipoPerfilInterface[]> = await axios.get(`${API_BASE_URL}/tipo-perfil`);
        return response.data;
    } catch (error) {
        console.error("Error fetching tipo perfil:", error);
        throw error;
    }
};

export const getAllSeries = async (): Promise<SerieInterface[]> => {
    try {
        const response: AxiosResponse<SerieInterface[]> = await axios.get(`${API_BASE_URL}/serie`);
        return response.data;
    } catch (error) {
        console.error("Error fetching serie:", error);
        throw error;
    }
};

export const getImagenesServidor = getImagenesDisponibles;


export const postPerfiles = async (perfil : PerfilInterface): Promise<PerfilInterface> => {
    try {
        const response: AxiosResponse<PerfilInterface> = await axios.post(`${API_BASE_URL}/perfil/agregar`, perfil);
        return response.data;
    } catch (error) {
        console.error("Error postPerfil :", error);
        throw error;
    }
};

export const editPerfil = async (perfil : PerfilInterface): Promise<PerfilInterface> => {
    try {
        const response: AxiosResponse<PerfilInterface> = await axios.put(`${API_BASE_URL}/perfil/modificar`, perfil);
        return response.data;
    } catch (error) {
        console.error("Error editPerfil :", error);
        throw error;
    }
};

export const deletePerfil = async (perfilId : number | null): Promise<void> => {
    try {
        const response: AxiosResponse<void> = await axios.delete(`${API_BASE_URL}/perfil/eliminar/${perfilId}`);
        return response.data;
    } catch (error) {
        console.error("Error deleteVentana :", error);
        throw error;
    }
};

export const uploadImage = async (file: File): Promise<string> => {
    try {

        const formData = new FormData();

        formData.append("imagen", file);

        const response: AxiosResponse<string> = await axios.post(
            `${API_BASE_URL}/imagenes/upload`,
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