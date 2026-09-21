import axios, {AxiosResponse} from "axios";
import {TipoPautaInterface} from "./interface.ts";
import {TipoProducto} from "../../crud-pautas/service/interface.ts";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const getAllTipoPauta = async (): Promise<TipoPautaInterface[]> => {
    try {
        const response: AxiosResponse<TipoPautaInterface[]> = await axios.get(`${API_BASE_URL}/tipo-pauta`);
        return response.data;
    } catch (error) {
        console.error("Error fetching tipo-pauta:", error);
        throw error;
    }
};

export const postTipoPauta = async (tipoPauta : TipoPautaInterface): Promise<TipoPautaInterface> => {
    try {
        const response: AxiosResponse<TipoPautaInterface> = await axios.post(`${API_BASE_URL}/tipo-pauta/agregar`,tipoPauta);
        return response.data;
    } catch (error) {
        console.error("Error post tipo-pauta:", error);
        throw error;
    }
}

export const putTipoPauta = async (tipoPauta : TipoPautaInterface): Promise<TipoPautaInterface> => {
    try {
        const response: AxiosResponse<TipoPautaInterface> = await axios.put(`${API_BASE_URL}/tipo-pauta/modificar`,tipoPauta);
        return response.data;
    } catch (error) {
        console.error("Error put tipo-pauta:", error);
        throw error;
    }
};

export const getAllTipoProducto = async (): Promise<TipoProducto[]> => {
    try {
        const response: AxiosResponse<TipoProducto[]> = await axios.get(`${API_BASE_URL}/tipo-producto`);
        return response.data;
    } catch (error) {
        console.error("Error fetching tipo-producto:", error);
        throw error;
    }
};