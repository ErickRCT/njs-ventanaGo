import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Alert, Box, Button, Card, CardContent, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle,
    FormControlLabel, FormGroup, FormHelperText, Grid, IconButton, TextField, Typography,
} from "@mui/material";
import { Add, Delete, Remove, RequestQuote } from "@mui/icons-material";
import { useAuth } from "../../context/AuthContext.tsx";
import { mensajeDeError } from "../../context/authApi.ts";
import { validarEmail, validarTelefono } from "../../components/utils/validacion.ts";
import {
    cambiarCantidad, enviarSolicitud, quitarDelCarrito, useCarrito, useSolicitudes,
} from "../solicitudes/solicitudesService.ts";
import { cantidadVentanas, LIMITES, SERVICIOS, type DatosContacto, type ItemVentana, type Servicio } from "../solicitudes/tipos.ts";
import { MiniVentana } from "./MiniVentana.tsx";

const MAX_CANTIDAD = LIMITES.maxCantidad;
const CONTACTO_VACIO: DatosContacto = { nombre: "", email: "", telefono: "", direccion: "" };

interface ErroresSolicitud {
    nombre?: string;
    email?: string;
    telefono?: string;
    direccion?: string;
    servicios?: string;
}

const validar = (contacto: DatosContacto, servicios: Servicio[]): ErroresSolicitud => {
    const errores: ErroresSolicitud = {};
    if (!contacto.nombre.trim()) errores.nombre = "Ingresa tu nombre.";
    if (!validarEmail(contacto.email.trim())) errores.email = "Ingresa un correo válido.";
    if (contacto.telefono.trim() && !validarTelefono(contacto.telefono.trim())) errores.telefono = "Ingresa un teléfono chileno válido.";
    if (servicios.length === 0) errores.servicios = "Elige al menos un servicio.";
    if (servicios.some((s) => s !== "FABRICACION") && !contacto.direccion.trim()) {
        errores.direccion = "Indica la dirección para la instalación o el flete.";
    }
    return errores;
};

interface FilaCarritoProps {
    item: ItemVentana;
    usuario: string;
    /** Los cambios se guardan en el servidor; si fallan, el carrito muestra el motivo. */
    onError: (error: unknown) => void;
}

const FilaCarrito = ({ item, usuario, onError }: FilaCarritoProps) => (
    <Card variant="outlined">
        <CardContent sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
            <MiniVentana item={item} />
            <Box sx={{ flex: 1, minWidth: 200 }}>
                <Typography sx={{ fontWeight: 600 }}>{item.descripcion}</Typography>
                <Typography variant="body2" color="text.secondary">
                    {item.serieNombre && `${item.serieNombre} · `}{item.anchoMm} × {item.altoMm} mm · {item.colorNombre} · Vidrio {item.vidrioNombre}
                </Typography>
                {item.observaciones && (
                    <Typography variant="body2" color="text.secondary">Obs.: {item.observaciones}</Typography>
                )}
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <IconButton
                    aria-label="Disminuir cantidad"
                    disabled={item.cantidad <= 1}
                    onClick={() => cambiarCantidad(usuario, item.id, item.cantidad - 1).catch(onError)}
                >
                    <Remove />
                </IconButton>
                <Typography sx={{ minWidth: 28, textAlign: "center" }} aria-label="Cantidad">{item.cantidad}</Typography>
                <IconButton
                    aria-label="Aumentar cantidad"
                    disabled={item.cantidad >= MAX_CANTIDAD}
                    onClick={() => cambiarCantidad(usuario, item.id, item.cantidad + 1).catch(onError)}
                >
                    <Add />
                </IconButton>
                <IconButton aria-label="Quitar del carrito" onClick={() => quitarDelCarrito(usuario, item.id).catch(onError)}>
                    <Delete />
                </IconButton>
            </Box>
        </CardContent>
    </Card>
);

export const Carrito = () => {
    const navigate = useNavigate();
    const { usuario } = useAuth();
    const items = useCarrito(usuario);
    const solicitudes = useSolicitudes();

    const [abierto, setAbierto] = useState(false);
    const [contacto, setContacto] = useState<DatosContacto>(CONTACTO_VACIO);
    const [servicios, setServicios] = useState<Servicio[]>(["FABRICACION"]);
    const [observaciones, setObservaciones] = useState("");
    const [errores, setErrores] = useState<ErroresSolicitud>({});
    const [errorEnvio, setErrorEnvio] = useState<string | null>(null);
    const [errorCarrito, setErrorCarrito] = useState<string | null>(null);
    const [enviando, setEnviando] = useState(false);

    const mostrarErrorCarrito = (error: unknown) => setErrorCarrito(mensajeDeError(error, "No se pudo actualizar el carrito."));

    const abrirSolicitud = () => {
        // Los datos de contacto se recuerdan de la última solicitud; si no hay, se usa el correo de la cuenta.
        const ultima = [...solicitudes].reverse().find((s) => s.usuario === usuario);
        setContacto(ultima?.contacto ?? { ...CONTACTO_VACIO, email: usuario });
        setErrores({});
        setErrorEnvio(null);
        setAbierto(true);
    };

    const alternarServicio = (servicio: Servicio) =>
        setServicios((previos) => (previos.includes(servicio) ? previos.filter((s) => s !== servicio) : [...previos, servicio]));

    const handleEnviar = async () => {
        const encontrados = validar(contacto, servicios);
        setErrores(encontrados);
        if (Object.keys(encontrados).length > 0) return;

        setEnviando(true);
        setErrorEnvio(null);
        try {
            await enviarSolicitud(usuario, {
                contacto: {
                    nombre: contacto.nombre.trim(),
                    email: contacto.email.trim(),
                    telefono: contacto.telefono.trim(),
                    direccion: contacto.direccion.trim(),
                },
                servicios,
                observaciones: observaciones.trim(),
            });
        } catch (error) {
            console.error("Error al enviar la solicitud:", error);
            setErrorEnvio(mensajeDeError(error, "No se pudo enviar la solicitud. Inténtalo nuevamente."));
            return;
        } finally {
            setEnviando(false);
        }
        setAbierto(false);
        setObservaciones("");
        navigate("/cliente/mis-cotizaciones");
    };

    const campo = (nombre: keyof DatosContacto) => ({
        value: contacto[nombre],
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => setContacto((previo) => ({ ...previo, [nombre]: e.target.value })),
        error: Boolean(errores[nombre]),
        helperText: errores[nombre],
        fullWidth: true,
    });

    if (items.length === 0) {
        return (
            <Card>
                <CardContent sx={{ textAlign: "center", py: 6 }}>
                    <Typography variant="h6" gutterBottom>Tu carrito está vacío</Typography>
                    <Typography color="text.secondary" sx={{ mb: 3 }}>
                        Diseña una ventana, míralas en tu pared con realidad aumentada y agrégala aquí para cotizarla.
                    </Typography>
                    <Button variant="contained" onClick={() => navigate("/cliente/disenar")}>Diseñar una ventana</Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Grid container spacing={3} alignItems="flex-start">
                <Grid item xs={12} md={8}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        {errorCarrito && <Alert severity="error" onClose={() => setErrorCarrito(null)}>{errorCarrito}</Alert>}
                        {items.map((item) => (
                            <FilaCarrito key={item.id} item={item} usuario={usuario} onError={mostrarErrorCarrito} />
                        ))}
                    </Box>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            <Typography variant="h6">Resumen</Typography>
                            <Typography color="text.secondary">
                                {cantidadVentanas(items)} ventana(s) en {items.length} tipo(s) distinto(s).
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Los valores los define la empresa al responder tu solicitud.
                            </Typography>
                            <Button variant="contained" size="large" startIcon={<RequestQuote />} onClick={abrirSolicitud}>
                                Solicitar cotización
                            </Button>
                            <Button onClick={() => navigate("/cliente/disenar")}>Agregar otra ventana</Button>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Dialog open={abierto} onClose={() => setAbierto(false)} fullWidth maxWidth="sm">
                <DialogTitle>Solicitar cotización</DialogTitle>
                <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "24px !important" }}>
                    <Typography variant="body2" color="text.secondary">
                        La empresa recibirá tu solicitud y te responderá en la app; también puede avisarte por correo.
                    </Typography>
                    <TextField label="Nombre" {...campo("nombre")} />
                    <TextField label="Correo" type="email" {...campo("email")} />
                    <TextField label="Teléfono (opcional)" {...campo("telefono")} />
                    <TextField label="Dirección de la obra" {...campo("direccion")} />

                    <Box>
                        <Typography variant="subtitle2">Servicios que necesitas</Typography>
                        <FormGroup row>
                            {SERVICIOS.map(({ valor, etiqueta }) => (
                                <FormControlLabel
                                    key={valor}
                                    label={etiqueta}
                                    control={<Checkbox checked={servicios.includes(valor)} onChange={() => alternarServicio(valor)} />}
                                />
                            ))}
                        </FormGroup>
                        {errores.servicios && <FormHelperText error>{errores.servicios}</FormHelperText>}
                    </Box>

                    <TextField
                        fullWidth
                        multiline
                        minRows={2}
                        label="Comentarios (opcional)"
                        value={observaciones}
                        onChange={(e) => setObservaciones(e.target.value)}
                    />
                    {errorEnvio && <Alert severity="error">{errorEnvio}</Alert>}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setAbierto(false)}>Cancelar</Button>
                    <Button variant="contained" onClick={handleEnviar} disabled={enviando}>
                        {enviando ? "Enviando…" : "Enviar solicitud"}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};
