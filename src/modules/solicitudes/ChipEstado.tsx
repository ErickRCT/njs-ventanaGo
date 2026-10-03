import { Chip } from "@mui/material";
import { ETIQUETA_ESTADO, type EstadoSolicitud } from "./tipos.ts";

const COLOR: Record<EstadoSolicitud, "warning" | "success" | "info" | "error"> = {
    PENDIENTE: "warning",
    ACEPTADA: "success",
    MODIFICADA: "info",
    RECHAZADA: "error",
};

export const ChipEstado = ({ estado }: { estado: EstadoSolicitud }) => (
    <Chip size="small" color={COLOR[estado]} label={ETIQUETA_ESTADO[estado]} />
);
