import axios, { AxiosResponse } from "axios";
import {SerieInterface} from "./interface.ts";




// const API_BASE_URL = 'http://147.93.35.74:7099'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


export const getAllSeries = async (): Promise<SerieInterface[]> => {
    try {
        const response: AxiosResponse<SerieInterface[]> = await axios.get(`${API_BASE_URL}/serie`);
        return response.data;
    } catch (error) {
        console.error("Error fetching serie:", error);
        throw error;
    }
};

export const postSerie = async (serie : SerieInterface): Promise<SerieInterface> => {
    try {
        const response: AxiosResponse<SerieInterface> = await axios.post(`${API_BASE_URL}/serie/agregar`, serie);
        return response.data;
    } catch (error) {
        console.error("Error postSerie :", error);
        throw error;
    }
};

export const putSerie = async (serie : SerieInterface): Promise<SerieInterface> => {
    try {
        const response: AxiosResponse<SerieInterface> = await axios.put(`${API_BASE_URL}/serie/modificar`, serie);
        return response.data;
    } catch (error) {
        console.error("Error putSerie :", error);
        throw error;
    }
};


export const deleteSerie = async (serieId:number) => {
    try {
        const response: AxiosResponse<any> = await axios.delete(`${API_BASE_URL}/serie/eliminar/${serieId}`);
        return response.data;
    } catch (error) {
        console.error("Error deleteSerie :", error);
        throw error;
    }
};

