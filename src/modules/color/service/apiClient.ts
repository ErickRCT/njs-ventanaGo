import axios, { AxiosResponse } from "axios";
import {ColorInterface} from "./interface.ts";




// const API_BASE_URL = 'http://147.93.35.74:7099'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


export const getAllColor = async (): Promise<ColorInterface[]> => {
    try {
        const response: AxiosResponse<ColorInterface[]> = await axios.get(`${API_BASE_URL}/color`);
        return response.data;
    } catch (error) {
        console.error("Error fetching color:", error);
        throw error;
    }
};

export const postColor = async (color : ColorInterface): Promise<ColorInterface> => {
    try {
        const response: AxiosResponse<ColorInterface> = await axios.post(`${API_BASE_URL}/color/agregar`, color);
        return response.data;
    } catch (error) {
        console.error("Error postColor :", error);
        throw error;
    }
};

export const putColor = async (color : ColorInterface): Promise<ColorInterface> => {
    try {
        const response: AxiosResponse<ColorInterface> = await axios.put(`${API_BASE_URL}/color/modificar`, color);
        return response.data;
    } catch (error) {
        console.error("Error putColor :", error);
        throw error;
    }
};

export const deleteColor = async (colorId:number) => {
    try {
        const response: AxiosResponse<any> = await axios.delete(`${API_BASE_URL}/color/eliminar/${colorId}`);
        return response.data;
    } catch (error) {
        console.error("Error deleteColor :", error);
        throw error;
    }
};
