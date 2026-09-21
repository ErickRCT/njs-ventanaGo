import axios, {AxiosResponse} from "axios";
import {QuincalleriaInterface} from "./interface.ts";
import {Serie} from "./interface.ts";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const getAllQuincalleria = async (): Promise<QuincalleriaInterface[]> => {
    try {
        const response: AxiosResponse<QuincalleriaInterface[]> = await axios.get(`${API_BASE_URL}/quincalleria`);
        return response.data;
    } catch (error) {
        console.error("Error fetching quincalleria:", error);
        throw error;
    }
};

export const getAllSeries = async (): Promise<Serie[]> => {
    try {
        const response: AxiosResponse<Serie[]> = await axios.get(`${API_BASE_URL}/serie`);
        return response.data;
    } catch (error) {
        console.error("Error fetching serie:", error);
        throw error;
    }
};

export const postQuincalleria = async (quincalleria : QuincalleriaInterface): Promise<QuincalleriaInterface> => {
    try {
        const response: AxiosResponse<QuincalleriaInterface> = await axios.post(`${API_BASE_URL}/quincalleria/agregar`, quincalleria);
        return response.data;
    } catch (error) {
        console.error("Error postQuincalleria :", error);
        throw error;
    }
};

export const deleteQuincalleria = async (quincalleriaId : number | null): Promise<void> => {
    try {
        const response: AxiosResponse<void> = await axios.delete(`${API_BASE_URL}/quincalleria/eliminar/${quincalleriaId}`);
        return response.data;
    } catch (error) {
        console.error("Error deleteVentana :", error);
        throw error;
    }
};

export const editQuincalleria = async (quincalleria : QuincalleriaInterface): Promise<QuincalleriaInterface> => {
    try {
        const response: AxiosResponse<QuincalleriaInterface> = await axios.put(`${API_BASE_URL}/quincalleria/modificar`, quincalleria);
        return response.data;
    } catch (error) {
        console.error("Error editQuincalleria :", error);
        throw error;
    }
};


