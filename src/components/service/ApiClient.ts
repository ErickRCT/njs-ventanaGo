import axios, {AxiosResponse} from "axios";
import {Cliente, Comuna, Region} from "./inteface.ts";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const getRegiones = async (): Promise<Region[]> => {
    try {
        const response: AxiosResponse<Region[]> = await axios.get(`${API_BASE_URL}/region`);
        return response.data;
    } catch (error) {
        console.error("Error fetching Region:", error);
        throw error;
    }
};

export const getComunas = async (regionId:number): Promise<Comuna[]> => {
    try {
        const response: AxiosResponse<Comuna[]> = await axios.get(`${API_BASE_URL}/comuna/region/${regionId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching comuna:", error);
        throw error;
    }
};

export const postCliente = async (cliente : Cliente): Promise<Cliente> => {
    try {
        const response: AxiosResponse<Cliente> = await axios.post(`${API_BASE_URL}/cliente/agregar`, cliente);
        return response.data;
    } catch (error) {
        console.error("Error postCliente :", error);
        throw error;
    }
};