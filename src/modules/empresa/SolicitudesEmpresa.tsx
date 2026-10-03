import { useState } from "react";
import { Alert, Box, Button, Card, Tab, Table, TableBody, TableCell, TableHead, TableRow, Tabs, Typography } from "@mui/material";
import { ChipEstado } from "../solicitudes/ChipEstado.tsx";
import { useSolicitudes } from "../solicitudes/solicitudesService.ts";
import {
    cantidadVentanas, ETIQUETA_ESTADO, formatoPesos, SERVICIOS, totalItems, type EstadoSolicitud,
} from "../solicitudes/tipos.ts";
import { DetalleSolicitud } from "./DetalleSolicitud.tsx";

type Filtro = EstadoSolicitud | "TODAS";

const FILTROS: Filtro[] = ["TODAS", "PENDIENTE", "ACEPTADA", "MODIFICADA", "RECHAZADA"];

export const SolicitudesEmpresa = () => {
    const solicitudes = useSolicitudes();
    const [filtro, setFiltro] = useState<Filtro>("PENDIENTE");
    const [abierta, setAbierta] = useState<number | null>(null);

    const visibles = solicitudes
        .filter((s) => filtro === "TODAS" || s.estado === filtro)
        .sort((a, b) => b.numero - a.numero);
    const seleccionada = solicitudes.find((s) => s.numero === abierta);

    return (
        <Card>
            <Tabs
                value={filtro}
                onChange={(_, valor: Filtro) => setFiltro(valor)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{ borderBottom: "1px solid #edf2f7" }}
            >
                {FILTROS.map((f) => {
                    const cantidad = solicitudes.filter((s) => f === "TODAS" || s.estado === f).length;
                    return <Tab key={f} value={f} label={`${f === "TODAS" ? "Todas" : ETIQUETA_ESTADO[f]} (${cantidad})`} />;
                })}
            </Tabs>

            {visibles.length === 0 ? (
                <Box sx={{ p: 3 }}>
                    <Alert severity="info">
                        {solicitudes.length === 0
                            ? "Aún no llegan solicitudes de cotización de los clientes."
                            : "No hay solicitudes en este estado."}
                    </Alert>
                </Box>
            ) : (
                <Box sx={{ overflowX: "auto" }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>N°</TableCell>
                                <TableCell>Fecha</TableCell>
                                <TableCell>Cliente</TableCell>
                                <TableCell>Servicios</TableCell>
                                <TableCell>Ventanas</TableCell>
                                <TableCell>Estado</TableCell>
                                <TableCell>Total</TableCell>
                                <TableCell>Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody sx={{ backgroundColor: "rgba(255, 255, 255, 0.6)" }}>
                            {visibles.map((s) => {
                                const total = totalItems(s.items);
                                return (
                                    <TableRow key={s.numero} hover>
                                        <TableCell>{s.numero}</TableCell>
                                        <TableCell>{new Date(s.fecha).toLocaleDateString("es-CL")}</TableCell>
                                        <TableCell>
                                            <Typography variant="body2">{s.contacto.nombre}</Typography>
                                            <Typography variant="caption" color="text.secondary">{s.contacto.email}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            {s.servicios.map((v) => SERVICIOS.find((x) => x.valor === v)?.etiqueta ?? v).join(", ")}
                                        </TableCell>
                                        <TableCell>{cantidadVentanas(s.items)}</TableCell>
                                        <TableCell><ChipEstado estado={s.estado} /></TableCell>
                                        <TableCell>{total === null || s.estado === "RECHAZADA" ? "—" : formatoPesos(total)}</TableCell>
                                        <TableCell>
                                            <Button size="small" onClick={() => setAbierta(s.numero)}>
                                                {s.estado === "PENDIENTE" ? "Responder" : "Ver"}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </Box>
            )}

            {seleccionada && <DetalleSolicitud key={seleccionada.numero} solicitud={seleccionada} onClose={() => setAbierta(null)} />}
        </Card>
    );
};
