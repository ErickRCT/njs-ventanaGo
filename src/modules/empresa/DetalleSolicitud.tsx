import { useState } from "react";
import {
    Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Switch,
    Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography,
} from "@mui/material";
import { Check, Close, Edit, Email } from "@mui/icons-material";
import useWindowDimensions from "../../hooks/useWindowDimensions.ts";
import { abrirCorreoRespuesta } from "../solicitudes/correo.ts";
import { ChipEstado } from "../solicitudes/ChipEstado.tsx";
import { TablaItems } from "../solicitudes/TablaItems.tsx";
import { responderSolicitud } from "../solicitudes/solicitudesService.ts";
import { mensajeDeError } from "../../context/authApi.ts";
import { formatoPesos, LIMITES, SERVICIOS, type ItemVentana, type Solicitud } from "../solicitudes/tipos.ts";

type Accion = "ACEPTADA" | "MODIFICADA" | "RECHAZADA";

/** Ventana en edición: los números se guardan como texto para poder borrar y reescribir el campo. */
interface Borrador {
    id: string;
    anchoMm: string;
    altoMm: string;
    cantidad: string;
    precio: string;
}

const TITULO_ACCION: Record<Accion, string> = {
    ACEPTADA: "Aceptar solicitud",
    MODIFICADA: "Modificar solicitud",
    RECHAZADA: "Rechazar solicitud",
};

const enteroEnRango = (texto: string, minimo: number, maximo: number) => {
    const valor = Number(texto);
    return texto.trim() !== "" && Number.isInteger(valor) && valor >= minimo && valor <= maximo ? valor : null;
};

const formatoFechaHora = (iso: string) => new Date(iso).toLocaleString("es-CL", { dateStyle: "short", timeStyle: "short" });

interface DetalleSolicitudProps {
    solicitud: Solicitud;
    onClose: () => void;
}

export const DetalleSolicitud = ({ solicitud, onClose }: DetalleSolicitudProps) => {
    const { width } = useWindowDimensions();
    const [accion, setAccion] = useState<Accion | null>(null);
    const [borrador, setBorrador] = useState<Borrador[]>([]);
    const [mensaje, setMensaje] = useState("");
    const [notificarEnApp, setNotificarEnApp] = useState(true);
    const [notificarPorCorreo, setNotificarPorCorreo] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [enviando, setEnviando] = useState(false);

    const pendiente = solicitud.estado === "PENDIENTE";
    const editaMedidas = accion === "MODIFICADA";

    const elegirAccion = (nueva: Accion) => {
        setAccion(nueva);
        setError(null);
        setBorrador(solicitud.items.map((item) => ({
            id: item.id,
            anchoMm: String(item.anchoMm),
            altoMm: String(item.altoMm),
            cantidad: String(item.cantidad),
            precio: item.precioUnitario === null ? "" : String(item.precioUnitario),
        })));
    };

    const cambiar = (id: string, campo: keyof Omit<Borrador, "id">, valor: string) => {
        setError(null);
        setBorrador((previo) => previo.map((fila) => (fila.id === id ? { ...fila, [campo]: valor } : fila)));
    };

    /** Ventanas con lo que se escribió, o el texto del primer problema. */
    const construirItems = (): ItemVentana[] | string => {
        const resultado: ItemVentana[] = [];
        for (const original of solicitud.items) {
            const fila = borrador.find((b) => b.id === original.id);
            if (!fila) return "Falta una ventana en el borrador.";
            const anchoMm = enteroEnRango(fila.anchoMm, LIMITES.minMm, LIMITES.maxAnchoMm);
            const altoMm = enteroEnRango(fila.altoMm, LIMITES.minMm, LIMITES.maxAltoMm);
            const cantidad = enteroEnRango(fila.cantidad, 1, LIMITES.maxCantidad);
            const precioUnitario = enteroEnRango(fila.precio, 1, 100_000_000);
            if (anchoMm === null) return `El ancho debe estar entre ${LIMITES.minMm} y ${LIMITES.maxAnchoMm} mm.`;
            if (altoMm === null) return `El alto debe estar entre ${LIMITES.minMm} y ${LIMITES.maxAltoMm} mm.`;
            if (cantidad === null) return `La cantidad debe estar entre 1 y ${LIMITES.maxCantidad}.`;
            if (precioUnitario === null) return "Ingresa el precio unitario de todas las ventanas.";
            resultado.push({ ...original, anchoMm, altoMm, cantidad, precioUnitario });
        }
        return resultado;
    };

    const handleEnviar = async () => {
        if (!accion) return;

        let items = solicitud.items;
        if (accion !== "RECHAZADA") {
            const construidos = construirItems();
            if (typeof construidos === "string") return setError(construidos);
            items = construidos;

            const cambioMedidas = items.some((item, i) => {
                const original = solicitud.items[i];
                return item.anchoMm !== original.anchoMm || item.altoMm !== original.altoMm || item.cantidad !== original.cantidad;
            });
            if (accion === "MODIFICADA" && !cambioMedidas) return setError("No cambiaste medidas ni cantidades. Si estás de acuerdo con lo pedido, usa Aceptar.");
            if (accion === "ACEPTADA" && cambioMedidas) return setError("Cambiaste medidas o cantidades: usa Modificar para informarlo al cliente.");
        }
        if (accion !== "ACEPTADA" && !mensaje.trim()) {
            return setError(accion === "RECHAZADA" ? "Indica el motivo del rechazo." : "Explica al cliente qué modificaste.");
        }

        setEnviando(true);
        try {
            const actualizada = await responderSolicitud(solicitud.numero, {
                estado: accion,
                mensaje: mensaje.trim(),
                items,
                notificarEnApp,
                notificarPorCorreo,
            });
            if (notificarPorCorreo) abrirCorreoRespuesta(actualizada);
            onClose();
        } catch (e) {
            console.error("Error al responder la solicitud:", e);
            setError(mensajeDeError(e, "No se pudo registrar la respuesta. Inténtalo nuevamente."));
        } finally {
            setEnviando(false);
        }
    };

    const total = solicitud.respuesta?.total ?? null;

    return (
        <Dialog open onClose={onClose} fullWidth maxWidth="md" fullScreen={width < 600}>
            <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                Solicitud N°{solicitud.numero}
                <ChipEstado estado={solicitud.estado} />
            </DialogTitle>

            <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "24px !important", "& > *": { flexShrink: 0 } }}>
                <Box>
                    <Typography sx={{ fontWeight: 600 }}>{solicitud.contacto.nombre}</Typography>
                    <Typography variant="body2" color="text.secondary">
                        {solicitud.contacto.email}
                        {solicitud.contacto.telefono && ` · ${solicitud.contacto.telefono}`}
                    </Typography>
                    {solicitud.contacto.direccion && (
                        <Typography variant="body2" color="text.secondary">{solicitud.contacto.direccion}</Typography>
                    )}
                    <Typography variant="caption" color="text.secondary">Recibida el {formatoFechaHora(solicitud.fecha)}</Typography>
                </Box>

                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
                    <Typography variant="body2" color="text.secondary">Servicios:</Typography>
                    {solicitud.servicios.map((s) => (
                        <Chip key={s} size="small" variant="outlined" label={SERVICIOS.find((x) => x.valor === s)?.etiqueta ?? s} />
                    ))}
                </Box>

                {solicitud.observaciones && (
                    <Alert severity="info" icon={false}>Comentarios del cliente: {solicitud.observaciones}</Alert>
                )}

                {(!accion || accion === "RECHAZADA") && (
                    <>
                        {solicitud.itemsOriginales && (
                            <Box>
                                <Typography variant="subtitle2" gutterBottom>Solicitado por el cliente</Typography>
                                <TablaItems items={solicitud.itemsOriginales} />
                            </Box>
                        )}
                        <Box>
                            {solicitud.itemsOriginales && <Typography variant="subtitle2" gutterBottom>Propuesta enviada</Typography>}
                            <TablaItems items={solicitud.items} />
                        </Box>
                    </>
                )}

                {accion && accion !== "RECHAZADA" && (
                    <>
                        <Typography variant="subtitle2">
                            {editaMedidas ? "Ajusta medidas, cantidades y precios" : "Define el precio unitario de cada ventana"}
                        </Typography>
                        <Box sx={{ overflowX: "auto" }}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Ventana</TableCell>
                                        <TableCell>Ancho (mm)</TableCell>
                                        <TableCell>Alto (mm)</TableCell>
                                        <TableCell>Cant.</TableCell>
                                        <TableCell>Precio unit. ($)</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {solicitud.items.map((item) => {
                                        const fila = borrador.find((b) => b.id === item.id);
                                        if (!fila) return null;
                                        const campo = (nombre: keyof Omit<Borrador, "id">, editable: boolean, etiqueta: string) => (
                                            <TextField
                                                size="small"
                                                type="number"
                                                value={fila[nombre]}
                                                disabled={!editable}
                                                onChange={(e) => cambiar(item.id, nombre, e.target.value)}
                                                inputProps={{ "aria-label": `${etiqueta} de ${item.descripcion}`, inputMode: "numeric" }}
                                                sx={{ minWidth: 96 }}
                                            />
                                        );
                                        return (
                                            <TableRow key={item.id}>
                                                <TableCell>
                                                    {item.descripcion}
                                                    <Box sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
                                                        {item.colorNombre} / {item.vidrioNombre}
                                                    </Box>
                                                </TableCell>
                                                <TableCell>{campo("anchoMm", editaMedidas, "Ancho")}</TableCell>
                                                <TableCell>{campo("altoMm", editaMedidas, "Alto")}</TableCell>
                                                <TableCell>{campo("cantidad", editaMedidas, "Cantidad")}</TableCell>
                                                <TableCell>{campo("precio", true, "Precio unitario")}</TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </Box>
                    </>
                )}

                {accion && (
                    <>
                        <TextField
                            fullWidth
                            multiline
                            minRows={2}
                            label={accion === "RECHAZADA" ? "Motivo del rechazo" : accion === "MODIFICADA" ? "Qué modificaste" : "Mensaje al cliente (opcional)"}
                            value={mensaje}
                            onChange={(e) => {
                                setError(null);
                                setMensaje(e.target.value);
                            }}
                        />
                        <Box>
                            <FormControlLabel
                                label="Avisar en la app"
                                control={<Switch checked={notificarEnApp} onChange={(e) => setNotificarEnApp(e.target.checked)} />}
                            />
                            <FormControlLabel
                                label={`Avisar por correo a ${solicitud.contacto.email}`}
                                control={<Switch checked={notificarPorCorreo} onChange={(e) => setNotificarPorCorreo(e.target.checked)} />}
                            />
                            {notificarPorCorreo && (
                                <Typography variant="caption" color="text.secondary" component="div">
                                    Se abrirá tu programa de correo con el mensaje listo para enviar.
                                </Typography>
                            )}
                        </Box>
                    </>
                )}

                {!pendiente && solicitud.respuesta && (
                    <Alert severity="info" icon={false}>
                        Respondida el {formatoFechaHora(solicitud.respuesta.fecha)}
                        {total !== null && ` · Total ${formatoPesos(total)}`}
                        {solicitud.respuesta.mensaje && <Box>{solicitud.respuesta.mensaje}</Box>}
                        <Box sx={{ fontSize: "0.75rem" }}>
                            Aviso en la app: {solicitud.respuesta.notificadoEnApp ? "sí" : "no"} · Correo: {solicitud.respuesta.notificadoPorCorreo ? "sí" : "no"}
                        </Box>
                    </Alert>
                )}
            </DialogContent>

            {/* Fuera del área con scroll para que el error siempre se vea junto a los botones. */}
            {accion && error && <Alert severity="error" sx={{ mx: 3, mb: 1 }}>{error}</Alert>}

            <DialogActions sx={{ px: 3, pb: 2, flexWrap: "wrap", gap: 1 }}>
                {!accion && (
                    <>
                        <Button onClick={onClose}>Cerrar</Button>
                        {pendiente ? (
                            <>
                                <Button color="error" startIcon={<Close />} onClick={() => elegirAccion("RECHAZADA")}>Rechazar</Button>
                                <Button startIcon={<Edit />} onClick={() => elegirAccion("MODIFICADA")}>Modificar</Button>
                                <Button variant="contained" startIcon={<Check />} onClick={() => elegirAccion("ACEPTADA")}>Aceptar</Button>
                            </>
                        ) : (
                            <Button startIcon={<Email />} onClick={() => abrirCorreoRespuesta(solicitud)}>Preparar correo</Button>
                        )}
                    </>
                )}
                {accion && (
                    <>
                        <Button onClick={() => setAccion(null)}>Volver</Button>
                        <Button variant="contained" color={accion === "RECHAZADA" ? "error" : "primary"} onClick={handleEnviar} disabled={enviando}>
                            {TITULO_ACCION[accion]} y responder
                        </Button>
                    </>
                )}
            </DialogActions>
        </Dialog>
    );
};
