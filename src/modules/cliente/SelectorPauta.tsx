import { useMemo, useState } from "react";
import { Alert, Box, Button, Card, CardActionArea, Chip, Grid, Skeleton, Typography } from "@mui/material";
import { urlImagenPauta, type PautaCatalogo } from "./catalogo.ts";

interface SelectorPautaProps {
    /** null mientras se cargan. */
    pautas: PautaCatalogo[] | null;
    error: boolean;
    onReintentar: () => void;
    onElegir: (pauta: PautaCatalogo) => void;
}

const TODAS = "Todas";

export const SelectorPauta = ({ pautas, error, onReintentar, onElegir }: SelectorPautaProps) => {
    const [serie, setSerie] = useState(TODAS);

    const series = useMemo(() => [...new Set((pautas ?? []).map((p) => p.serieNombre))], [pautas]);
    const visibles = (pautas ?? []).filter((p) => serie === TODAS || p.serieNombre === serie);

    if (error) {
        return (
            <Alert severity="error" action={<Button color="inherit" size="small" onClick={onReintentar}>Reintentar</Button>}>
                No se pudieron cargar las pautas. Revisa tu conexión e inténtalo nuevamente.
            </Alert>
        );
    }

    if (pautas === null) {
        return (
            <Grid container spacing={2}>
                {Array.from({ length: 6 }, (_, i) => (
                    <Grid item xs={6} md={4} lg={3} key={i}><Skeleton variant="rounded" height={210} /></Grid>
                ))}
            </Grid>
        );
    }

    if (pautas.length === 0) return <Alert severity="info">Aún no hay pautas disponibles para cotizar.</Alert>;

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography variant="h6">Elige una pauta</Typography>

            {series.length > 1 && (
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    {[TODAS, ...series].map((nombre) => (
                        <Chip
                            key={nombre}
                            label={nombre}
                            color={nombre === serie ? "primary" : "default"}
                            variant={nombre === serie ? "filled" : "outlined"}
                            onClick={() => setSerie(nombre)}
                        />
                    ))}
                </Box>
            )}

            <Grid container spacing={2}>
                {visibles.map((item) => {
                    const imagen = urlImagenPauta(item.pauta.tipoPauta?.rutaImagen);
                    return (
                        <Grid item xs={6} md={4} lg={3} key={item.pauta.pautaId} sx={{ display: "flex" }}>
                            <Card variant="outlined" sx={{ width: "100%" }}>
                                <CardActionArea
                                    onClick={() => onElegir(item)}
                                    sx={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-start" }}
                                >
                                    <Box sx={{ height: 140, width: "100%", p: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
                                        {imagen && (
                                            <img
                                                src={imagen}
                                                alt={item.pauta.nombre.trim()}
                                                onError={(e) => {
                                                    e.currentTarget.style.display = "none";
                                                }}
                                                style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                                            />
                                        )}
                                    </Box>
                                    <Box sx={{ px: 1.5, pb: 1.5, textAlign: "center" }}>
                                        <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.3, overflowWrap: "anywhere" }}>
                                            {item.pauta.nombre.trim()}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">{item.serieNombre}</Typography>
                                    </Box>
                                </CardActionArea>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>
        </Box>
    );
};
