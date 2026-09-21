import axios, {AxiosResponse} from "axios";
import {TipoPerfilInterface} from "./interface.ts";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


export const getAllTipoPerfil = async (): Promise<TipoPerfilInterface[]> => {
    try {
        const response: AxiosResponse<TipoPerfilInterface[]> = await axios.get(`${API_BASE_URL}/tipo-perfil`);
        return response.data;
    } catch (error) {
        console.error("Error fetching tipo perfil:", error);
        throw error;
    }
};

export const postTipoPerfil = async (tipoPerfil : TipoPerfilInterface): Promise<TipoPerfilInterface> => {
    try {
        const response: AxiosResponse<TipoPerfilInterface> = await axios.post(`${API_BASE_URL}/tipo-perfil/agregar`, tipoPerfil);
        return response.data;
    } catch (error) {
        console.error("Error postTipoPerfil :", error);
        throw error;
    }
};

export const putTipoPerfil = async (tipoPerfil : TipoPerfilInterface): Promise<TipoPerfilInterface> => {
    try {
        const response: AxiosResponse<TipoPerfilInterface> = await axios.put(`${API_BASE_URL}/tipo-perfil/modificar`, tipoPerfil);
        return response.data;
    } catch (error) {
        console.error("Error putTipoPerfil :", error);
        throw error;
    }
};