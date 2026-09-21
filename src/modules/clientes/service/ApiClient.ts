
import axios, {AxiosResponse} from "axios";
import {Cliente} from "../../../components/service/inteface.ts";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const getClientes = async (): Promise<Cliente[]> => {
    try {
        const response: AxiosResponse<Cliente[]> = await axios.get(`${API_BASE_URL}/cliente`);
        return response.data;
    } catch (error) {
        console.error("Error fetching cliente:", error);
        throw error;
    }
};