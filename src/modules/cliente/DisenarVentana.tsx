import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Box, Button, Card, CardContent, Grid, MenuItem, Snackbar, TextField, Typography } from "@mui/material";
import { AddShoppingCart, ArrowBack } from "@mui/icons-material";
import { VisorVentanaAR } from "../realidad-aumentada/VisorVentanaAR.tsx";
import type { ConfigVentana } from "../realidad-aumentada/ventana3d.ts";
import { useAuth } from "../../context/AuthContext.tsx";
import { agregarAlCarrito } from "../solicitudes/solicitudesService.ts";
import { LIMITES } from "../solicitudes/tipos.ts";
import {
    cargarCatalogo, cargarPautas, colorMarcoHex, colorVidrioHex, hexACss, limitesDeModelo, problemasDePrecio, urlImagenPauta,
    type Catalogo, type PautaCatalogo,
} from "./catalogo.ts";
import { SelectorPauta } from "./SelectorPauta.tsx";
import { cotizarVentana } from "../crear-cotizacion/service/apiClient.ts";
import { mensajeDeError } from "../../context/authApi.ts";

const { minMm: MIN_MM, maxCantidad: MAX_CANTIDAD } = LIMITES;

// Mismo IVA que aplica Crear Cotización sobre el neto.
const IVA = 0.19;
const formatoPrecio = (valor: number) => new Intl.NumberFormat("es-ES", { maximumFractionDigits: 0 }).format(Math.round(valor));

const limitar = (valor: number, minimo: number, maximo: number) => Math.min(maximo, Math.max(minimo, valor));

const errorMedida = (texto: string, maximo: number) => {
    const valor = Number(texto);
    if (texto.trim() === "" || !Number.isFinite(valor)) return "Ingresa una medida.";
    if (valor < MIN_MM || valor > maximo) return `Entre ${MIN_MM} y ${maximo} mm.`;
    return null;
};

const errorCantidad = (texto: string) => {
    const valor = Number(texto);
    return Number.isInteger(valor) && valor >= 1 && valor <= MAX_CANTIDAD ? null : `Entre 1 y ${MAX_CANTIDAD}.`;
};

const PuntoColor = ({ color }: { color: number }) => (
    <Box
        component="span"
        sx={{
            display: "inline-block", width: 14, height: 14, mr: 1, borderRadius: "50%", verticalAlign: "middle",
            backgroundColor: hexACss(color), border: "1px solid rgba(0,0,0,0.25)",
        }}
    />
);

export const DisenarVentana = () => {
    const navigate = useNavigate();
    const { usuario } = useAuth();
    const [catalogo, setCatalogo] = useState<Catalogo | null>(null);
    const [pautas, setPautas] = useState<PautaCatalogo[] | null>(null);
    const [errorPautas, setErrorPautas] = useState(false);
    const [elegida, setElegida] = useState<PautaCatalogo | null>(null);
    const [ancho, setAncho] = useState("1200");
    const [alto, setAlto] = useState("1000");
    const [cantidad, setCantidad] = useState("1");
    const [colorNombre, setColorNombre] = useState("");
    const [vidrioNombre, setVidrioNombre] = useState("");
    const [observaciones, setObservaciones] = useState("");
    const [intentoAgregar, setIntentoAgregar] = useState(false);
    const [agregada, setAgregada] = useState(false);
    const [precioNeto, setPrecioNeto] = useState<number | null>(null);
    const [agregando, setAgregando] = useState(false);
    const [errorAgregar, setErrorAgregar] = useState<string | null>(null);

    const obtenerPautas = () => {
        setErrorPautas(false);
        setPautas(null);
        cargarPautas().then(setPautas).catch((error) => {
            console.error("Error al cargar las pautas:", error);
            setErrorPautas(true);
        });
    };

    useEffect(obtenerPautas, []);

    useEffect(() => {
        let cancelado = false;
        cargarCatalogo().then((cargado) => {
            if (cancelado) return;
            setCatalogo(cargado);
            setColorNombre(cargado.colores[0]?.nombre ?? "");
            setVidrioNombre(cargado.vidrios[0]?.nombre ?? "");
        });
        return () => {
            cancelado = true;
        };
    }, []);

    const hojas = elegida?.hojas ?? 2;
    const modelo = elegida?.modelo ?? "corredera";
    // Los máximos dependen de la forma: una corredera de 6 hojas admite mucho más ancho que una puerta.
    const { maxAnchoMm: MAX_ANCHO_MM, maxAltoMm: MAX_ALTO_MM } = limitesDeModelo(modelo, hojas);
    const errores = {
        ancho: errorMedida(ancho, MAX_ANCHO_MM),
        alto: errorMedida(alto, MAX_ALTO_MM),
        cantidad: errorCantidad(cantidad),
    };
    const hayErrores = Object.values(errores).some(Boolean);
    const pauta = elegida?.pauta;
    // Igual que en Crear Cotización: las pautas reforzadas avisan desde qué medidas llevan refuerzo.
    const conRefuerzo = Boolean(pauta?.isReforzada)
        && (Number(ancho) >= (pauta?.horizontalReforzada ?? 0) || Number(alto) >= (pauta?.verticalReforzada ?? 0));
    // Los errores se muestran al agregar, o apenas el usuario deja un campo con un valor inválido.
    const mostrar = (error: string | null, texto: string) => error !== null && (intentoAgregar || texto !== "");

    // Mientras se escribe, el visor usa la medida más cercana válida en vez de quedarse con la anterior.
    const config: ConfigVentana = useMemo(() => ({
        anchoMm: limitar(Number(ancho) || MIN_MM, MIN_MM, MAX_ANCHO_MM),
        altoMm: limitar(Number(alto) || MIN_MM, MIN_MM, MAX_ALTO_MM),
        hojas,
        modelo,
        colorMarco: colorMarcoHex(colorNombre),
        colorVidrio: colorVidrioHex(vidrioNombre),
    }), [ancho, alto, hojas, modelo, colorNombre, vidrioNombre, MAX_ANCHO_MM, MAX_ALTO_MM]);

    // El precio lo calcula el backend con el mismo cálculo de Crear Cotización, pero sin guardar la ventana.
    const colorPrecio = catalogo?.colores.find((c) => c.nombre === colorNombre);
    const vidrioPrecio = catalogo?.vidrios.find((v) => v.nombre === vidrioNombre);
    const medidasValidas = !errores.ancho && !errores.alto;
    // Con una pauta mal cargada el backend daría un precio irreal: en ese caso se muestra "a confirmar".
    const problemasPrecio = useMemo(() => (elegida ? problemasDePrecio(elegida.pauta) : []), [elegida]);
    const precioConfiable = problemasPrecio.length === 0;
    useEffect(() => {
        if (problemasPrecio.length) console.warn(`Pauta "${elegida?.pauta.nombre.trim()}" con datos incompletos:`, problemasPrecio);
    }, [elegida, problemasPrecio]);
    useEffect(() => {
        setPrecioNeto(null);
        if (!elegida || !precioConfiable || !medidasValidas || colorPrecio?.id == null || vidrioPrecio?.id == null) return;
        let cancelado = false;
        const temporizador = setTimeout(async () => {
            try {
                const ventana = await cotizarVentana({
                    ventanaId: null,
                    descripcion: elegida.pauta.nombre.trim(),
                    cantidad: 1,
                    ancho: Number(ancho),
                    alto: Number(alto),
                    observaciones: "",
                    precioNeto: 0,
                    cotizacionId: null,
                    color: { colorId: colorPrecio.id!, nombre: colorPrecio.nombre, valor: colorPrecio.valor ?? 0 },
                    vidrio: { vidrioId: vidrioPrecio.id!, nombre: vidrioPrecio.nombre, valor: vidrioPrecio.valor ?? 0 },
                    pauta: elegida.pauta,
                });
                if (!cancelado) setPrecioNeto(ventana.precioNeto ?? 0);
            } catch (error) {
                console.error("Error al calcular el precio de la ventana:", error);
            }
        }, 500);
        return () => {
            cancelado = true;
            clearTimeout(temporizador);
        };
    }, [elegida, precioConfiable, ancho, alto, medidasValidas, colorPrecio, vidrioPrecio]);

    const elegirPauta = (nueva: PautaCatalogo) => {
        setElegida(nueva);
        setIntentoAgregar(false);
    };

    const handleAgregar = async () => {
        setIntentoAgregar(true);
        setErrorAgregar(null);
        const color = catalogo?.colores.find((c) => c.nombre === colorNombre);
        const vidrio = catalogo?.vidrios.find((v) => v.nombre === vidrioNombre);
        if (!elegida || hayErrores || !color || !vidrio) return;

        setAgregando(true);
        try {
            await agregarAlCarrito(usuario, {
            descripcion: elegida.pauta.nombre.trim(),
            pautaId: elegida.pauta.pautaId,
            serieNombre: elegida.serieNombre,
            imagenPauta: elegida.pauta.tipoPauta?.rutaImagen || undefined,
            hojas,
            anchoMm: Number(ancho),
            altoMm: Number(alto),
            cantidad: Number(cantidad),
            colorId: color.id,
            colorNombre: color.nombre,
            vidrioId: vidrio.id,
            vidrioNombre: vidrio.nombre,
            observaciones: observaciones.trim(),
            });
        } catch (error) {
            setErrorAgregar(mensajeDeError(error, "No se pudo agregar la ventana al carrito. Inténtalo nuevamente."));
            return;
        } finally {
            setAgregando(false);
        }
        setIntentoAgregar(false);
        setAgregada(true);
    };

    if (!elegida) {
        return (
            <Card>
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                    <SelectorPauta pautas={pautas} error={errorPautas} onReintentar={obtenerPautas} onElegir={elegirPauta} />
                </CardContent>
            </Card>
        );
    }

    const imagenPauta = urlImagenPauta(elegida.pauta.tipoPauta?.rutaImagen);

    return (
        <Card>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={5}>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            {catalogo?.basico && (
                                <Alert severity="info">
                                    No se pudo cargar el catálogo de colores y vidrios; se muestran opciones básicas.
                                </Alert>
                            )}

                            <Button size="small" startIcon={<ArrowBack />} onClick={() => setElegida(null)} sx={{ alignSelf: "flex-start" }}>
                                Cambiar pauta
                            </Button>

                            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                                {imagenPauta && (
                                    <img
                                        src={imagenPauta}
                                        alt=""
                                        onError={(e) => {
                                            e.currentTarget.style.display = "none";
                                        }}
                                        style={{ width: 72, height: 72, objectFit: "contain", flexShrink: 0 }}
                                    />
                                )}
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography sx={{ fontWeight: 600, overflowWrap: "anywhere" }}>{elegida.pauta.nombre.trim()}</Typography>
                                    <Typography variant="body2" color="text.secondary">Serie {elegida.serieNombre}</Typography>
                                </Box>
                            </Box>

                            {pauta?.isReforzada && (
                                <Alert severity={conRefuerzo ? "warning" : "info"}>
                                    {conRefuerzo
                                        ? "Con estas medidas la ventana lleva refuerzo. "
                                        : ""}
                                    Reforzado desde {pauta.horizontalReforzada} mm de ancho o {pauta.verticalReforzada} mm de alto.
                                </Alert>
                            )}

                            <Box sx={{ display: "flex", gap: 2 }}>
                                <TextField
                                    fullWidth
                                    label="Ancho (mm)"
                                    type="number"
                                    value={ancho}
                                    onChange={(e) => setAncho(e.target.value)}
                                    inputProps={{ min: MIN_MM, max: MAX_ANCHO_MM, inputMode: "numeric" }}
                                    error={mostrar(errores.ancho, ancho)}
                                    helperText={mostrar(errores.ancho, ancho) ? errores.ancho : " "}
                                />
                                <TextField
                                    fullWidth
                                    label="Alto (mm)"
                                    type="number"
                                    value={alto}
                                    onChange={(e) => setAlto(e.target.value)}
                                    inputProps={{ min: MIN_MM, max: MAX_ALTO_MM, inputMode: "numeric" }}
                                    error={mostrar(errores.alto, alto)}
                                    helperText={mostrar(errores.alto, alto) ? errores.alto : " "}
                                />
                            </Box>

                            <TextField
                                select
                                fullWidth
                                label="Color del marco"
                                value={colorNombre}
                                onChange={(e) => setColorNombre(e.target.value)}
                                disabled={!catalogo}
                            >
                                {(catalogo?.colores ?? []).map((color) => (
                                    <MenuItem key={color.nombre} value={color.nombre}>
                                        <PuntoColor color={colorMarcoHex(color.nombre)} />
                                        {color.nombre}
                                    </MenuItem>
                                ))}
                            </TextField>

                            <TextField
                                select
                                fullWidth
                                label="Vidrio"
                                value={vidrioNombre}
                                onChange={(e) => setVidrioNombre(e.target.value)}
                                disabled={!catalogo}
                            >
                                {(catalogo?.vidrios ?? []).map((vidrio) => (
                                    <MenuItem key={vidrio.nombre} value={vidrio.nombre}>{vidrio.nombre}</MenuItem>
                                ))}
                            </TextField>

                            <TextField
                                label="Cantidad"
                                type="number"
                                value={cantidad}
                                onChange={(e) => setCantidad(e.target.value)}
                                inputProps={{ min: 1, max: MAX_CANTIDAD, inputMode: "numeric" }}
                                error={mostrar(errores.cantidad, cantidad)}
                                helperText={mostrar(errores.cantidad, cantidad) ? errores.cantidad : " "}
                                sx={{ maxWidth: 160 }}
                            />

                            <TextField
                                fullWidth
                                multiline
                                minRows={2}
                                label="Observaciones (opcional)"
                                value={observaciones}
                                onChange={(e) => setObservaciones(e.target.value)}
                            />

                            {precioNeto !== null && (
                                <Box>
                                    <Typography variant="body1" fontWeight="bold">
                                        Precio:
                                    </Typography>
                                    <Typography variant="body2">
                                        Neto: ${formatoPrecio(precioNeto)}
                                    </Typography>
                                    <Typography variant="body2">
                                        IVA 19%: ${formatoPrecio(precioNeto * IVA)}
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                        Total con IVA: ${formatoPrecio(precioNeto * (1 + IVA))}
                                    </Typography>
                                </Box>
                            )}
                            {!precioConfiable && (
                                <Box>
                                    <Typography variant="body1" fontWeight="bold">
                                        Precio:
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        A confirmar por la empresa.
                                    </Typography>
                                </Box>
                            )}

                            <Button
                                variant="contained"
                                size="large"
                                startIcon={<AddShoppingCart />}
                                onClick={handleAgregar}
                                disabled={!catalogo || agregando}
                            >
                                {agregando ? "Agregando…" : "Agregar al carrito"}
                            </Button>
                            {errorAgregar && <Alert severity="error">{errorAgregar}</Alert>}
                            <Typography variant="caption" color="text.secondary">
                                Las medidas son referenciales: la empresa las confirma en terreno antes de fabricar.
                            </Typography>
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={7}>
                        <VisorVentanaAR config={config} />
                    </Grid>
                </Grid>
            </CardContent>

            <Snackbar
                open={agregada}
                autoHideDuration={5000}
                onClose={() => setAgregada(false)}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert
                    severity="success"
                    variant="filled"
                    action={<Button color="inherit" size="small" onClick={() => navigate("/cliente/carrito")}>Ver carrito</Button>}
                >
                    Ventana agregada al carrito.
                </Alert>
            </Snackbar>
        </Card>
    );
};
