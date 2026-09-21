import axios, { AxiosResponse } from "axios";
import {Pauta, Perfil, Quincalleria, Serie, TipoPauta} from "./interface";
import {PautaDTO} from "./interface.ts"


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


export const getQuincalleria = async (serieId : number): Promise<Quincalleria[]> => {
  try {
    const response: AxiosResponse<Quincalleria[]> = await axios.get(`${API_BASE_URL}/quincalleria/serie/${serieId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching quincalleria:", error);
    throw error;
  }
};

export const getTipoPauta = async (): Promise<TipoPauta[]> => {
    try {
      const response: AxiosResponse<TipoPauta[]> = await axios.get(`${API_BASE_URL}/tipo-pauta`);
      return response.data;
    } catch (error) {
      console.error("Error fetching tipo-pauta:", error);
      throw error;
    }
  };

  export const getSeries = async (): Promise<Serie[]> => {
    try {
      const response: AxiosResponse<Serie[]> = await axios.get(`${API_BASE_URL}/serie`);
      return response.data;
    } catch (error) {
      console.error("Error fetching series:", error);
      throw error;
    }
  };

  export const getPerfiles = async (serieId : number): Promise<Perfil[]> => {
    try {
      const response: AxiosResponse<Perfil[]> = await axios.get(`${API_BASE_URL}/perfil/serie/${serieId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching perfiles:", error);
      throw error;
    }
  };

export const postPauta = async (pauta : PautaDTO): Promise<PautaDTO> => {
  try {
    const response: AxiosResponse<Pauta> = await axios.post(`${API_BASE_URL}/pauta/agregar`, pauta);
    return response.data;
  } catch (error) {
    console.error("Error postPauta :", error);
    throw error;
  }
};

export const getAllPautas = async (): Promise<Pauta[]> => {
  try {
    const response: AxiosResponse<Pauta[]> = await axios.get(`${API_BASE_URL}/pauta`);
    return response.data;
  } catch (error) {
    console.error("Error getAllPautas :", error);
    throw error;
  }
};

export const deletePauta = async (pautaId:number) => {
  try {
    const response: AxiosResponse<any> = await axios.delete(`${API_BASE_URL}/pauta/eliminar/${pautaId}`);
    return response.data;
  } catch (error) {
    console.error("Error deletePauta :", error);
    throw error;
  }
};

export const editPauta = async (pauta : PautaDTO): Promise<PautaDTO> => {
  try {
    const response: AxiosResponse<PautaDTO> = await axios.put(`${API_BASE_URL}/pauta/modificar`, pauta);
    return response.data;
  } catch (error) {
    console.error("Error editPauta :", error);
    console.error("Data Pauta :", pauta);

    throw error;
  }
};