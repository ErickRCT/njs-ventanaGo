import axios, { AxiosResponse } from "axios";
import { Serie, Vidrio, Color, Pauta, Cotizacion, Ventana } from "./interface";
import {Cliente} from "../../../components/service/inteface.ts";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const getSeries = async (): Promise<Serie[]> => {
  try {
    const response: AxiosResponse<Serie[]> = await axios.get(`${API_BASE_URL}/serie`);
    console.log("API BASE : ",API_BASE_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching series:", error);
    throw error;
  }
};

export const getVidrios = async (): Promise<Vidrio[]> => {
  try {
    const response: AxiosResponse<Vidrio[]> = await axios.get(`${API_BASE_URL}/vidrio`);
    return response.data;
  } catch (error) {
    console.error("Error fetching vidrios:", error);
    throw error;
  }
};

export const getColores = async (): Promise<Color[]> => {
  try {
    const response: AxiosResponse<Color[]> = await axios.get(`${API_BASE_URL}/color`);
    return response.data;
  } catch (error) {
    console.error("Error fetching colores:", error);
    throw error;
  }
};

export const getPautas = async (serieId: number): Promise<Pauta[]> => {
  try {
    const response: AxiosResponse<Pauta[]> = await axios.get(`${API_BASE_URL}/pauta/serie/${serieId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching pautas:", error);
    throw error;
  }
};

export const postCotizacion = async (cotizacion : Cotizacion): Promise<Cotizacion> => {
  try {
    const response: AxiosResponse<Cotizacion> = await axios.post(`${API_BASE_URL}/cotizacion/agregar`, cotizacion);
    return response.data;
  } catch (error) {
    console.error("Error postCotizacion :", error);
    throw error;
  }
};
export const editCotizacion = async (cotizacion : Cotizacion): Promise<Cotizacion> => {
  try {
    const response: AxiosResponse<Cotizacion> = await axios.put(`${API_BASE_URL}/cotizacion/modificar`, cotizacion);
    return response.data;
  } catch (error) {
    console.error("Error editCotizacion :", error);
    throw error;
  }
};


export const getCotizacion = async (cotizacionId : number | null): Promise<Cotizacion> => {
  try {
    const response: AxiosResponse<Cotizacion> = await axios.get(`${API_BASE_URL}/cotizacion/${cotizacionId}`);
    return response.data;
  } catch (error) {
    console.error("Error getCotizacion :", error);
    throw error;
  }
};

export const postVentana = async (ventana : Ventana): Promise<Ventana> => {
  try {
    const response: AxiosResponse<Ventana> = await axios.post(`${API_BASE_URL}/ventana/agregar`, ventana);
    return response.data;
  } catch (error) {
    console.error("Error postVentana :", error);
    throw error;
  }
};

export const cotizarVentana = async (ventana : Ventana): Promise<Ventana> => {
  try {
    const response: AxiosResponse<Ventana> = await axios.post(`${API_BASE_URL}/ventana/cotizar`, ventana);
    return response.data;
  } catch (error) {
    console.error("Error cotizarVentana :", error);
    throw error;
  }
};

export const deleteVentana = async (ventanaId : number | null): Promise<void> => {
  try {
    const response: AxiosResponse<void> = await axios.delete(`${API_BASE_URL}/ventana/eliminar/${ventanaId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleteVentana :", error);
    throw error;
  }
};

export const descargarCotizacion = async (idCotizacion: number | null): Promise<void> => {
  try {
    const response: AxiosResponse<Blob> = await axios.get(
        `${API_BASE_URL}/documentos/cotizacion/${idCotizacion}`,
        {
          responseType: "blob", // Importante para manejar archivos binarios
        }
    );

    // Crear un enlace para descargar el archivo
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `cotizacion_${idCotizacion}.pdf`);
    document.body.appendChild(link);
    link.click();

    // Limpiar el objeto URL para liberar memoria
    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
  } catch (error) {
    console.error("Error al descargar la cotización:", error);
    throw error;
  }
};

export const descargarOrdenDeTrabajo = async (idCotizacion: number | null): Promise<void> => {
  try {
    const response: AxiosResponse<Blob> = await axios.get(
        `${API_BASE_URL}/documentos/orden-de-trabajo/${idCotizacion}`,
        {
          responseType: "blob", // Importante para manejar archivos binarios
        }
    );

    // Crear un enlace para descargar el archivo
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `orden-de-trabajo_${idCotizacion}.pdf`);
    document.body.appendChild(link);
    link.click();

    // Limpiar el objeto URL para liberar memoria
    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
  } catch (error) {
    console.error("Error al descargar la orden de trabajo:", error);
    throw error;
  }
};



export const getClientes = async (): Promise<Cliente[]> => {
  try {
    const response: AxiosResponse<Cliente[]> = await axios.get(`${API_BASE_URL}/cliente`);
    return response.data;
  } catch (error) {
    console.error("Error fetching clientes:", error);
    throw error;
  }
};

export const getCliente = async (clientId : number): Promise<Cliente> => {
  try {
    const response: AxiosResponse<Cliente> = await axios.get(`${API_BASE_URL}/cliente/${clientId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching cliente:", error);
    throw error;
  }
};
