import axios, { AxiosResponse } from "axios";
import { Cotizacion } from "../../crear-cotizacion/service/interface";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const getAllCotizaciones = async (): Promise<Cotizacion[]> => {
    try {
      const response: AxiosResponse<Cotizacion[]> = await axios.get(`${API_BASE_URL}/cotizacion`);
      return response.data;
    } catch (error) {
      console.error("Error getAllCotizaciones :", error);
      throw error;
    }
  };