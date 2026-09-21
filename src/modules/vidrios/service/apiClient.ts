import axios, { AxiosResponse } from "axios";
import {Vidrio} from "./interface.ts";




// const API_BASE_URL = 'http://147.93.35.74:7099'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


export const getAllVidrio = async (): Promise<Vidrio[]> => {
    try {
        const response: AxiosResponse<Vidrio[]> = await axios.get(`${API_BASE_URL}/vidrio`);
        return response.data;
    } catch (error) {
        console.error("Error fetching vidrio:", error);
        throw error;
    }
};

export const postVidrio = async (vidrio : Vidrio): Promise<Vidrio> => {
    try {
        const response: AxiosResponse<Vidrio> = await axios.post(`${API_BASE_URL}/vidrio/agregar`, vidrio);
        return response.data;
    } catch (error) {
        console.error("Error postVidrio :", error);
        throw error;
    }
};

export const putVidrio = async (vidrio : Vidrio): Promise<Vidrio> => {
    try {
        const response: AxiosResponse<Vidrio> = await axios.put(`${API_BASE_URL}/vidrio/modificar`, vidrio);
        return response.data;
    } catch (error) {
        console.error("Error putVidrio :", error);
        throw error;
    }
};

export const deleteVidrio = async (vidrioId:number) => {
    try {
        const response: AxiosResponse<any> = await axios.delete(`${API_BASE_URL}/vidrio/eliminar/${vidrioId}`);
        return response.data;
    } catch (error) {
        console.error("Error deletePauta :", error);
        throw error;
    }
};

