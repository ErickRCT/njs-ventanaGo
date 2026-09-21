import { useState, useEffect } from "react";
import {
    Box,
    Typography,
    TextField,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
} from "@mui/material";
import { CalcularValoresProps } from "../crearCotizacionInterface";
import DownloadBar from "../../DownloadBar.tsx";

const CalcularValores = ({
                             cotizacion,
                             setCostosExtras,
                             costosExtras,
                             onSaveCostosExtras,
                             onDescargarCotizacion,
                             onDescargarOrdenDeTrabajo,
                             ganancia,
                             setGanancia,
                             descuento,
                             setDescuento,
                         }: CalcularValoresProps) => {

    const [valores, setValores] = useState({
        neto: 0,
        ventanasConGanancia: 0,
        costosExtras: 0,
        subtotal: 0,
        iva: 0,
        totalFinal: 0,
    });

    const [openDialog, setOpenDialog] = useState(false);

    // ================== DESCARGAS ==================
    const handleDownloadQuote = () => onDescargarCotizacion();
    const handleDownloadOptimization = () => console.log("Descargando optimización...");
    const handleDownloadMaterialList = () => console.log("Descargando lista de materiales...");
    const handleDownloadWorkOrder = () => onDescargarOrdenDeTrabajo();
    const handleDownloadAll = () => console.log("Descargando todos los documentos...");

    // ================== CALCULO ==================
    const calculatePrices = () => {
        const netoVentanas = cotizacion.neto || 0;

        const costosAdicionales =
            (costosExtras.valorFlete || 0) +
            (costosExtras.valorInstalacion || 0) +
            (costosExtras.valorManoDeObra || 0) +
            (costosExtras.valorOtrosGastos || 0);

        // Ganancia sobre ventanas
        let ventanasConGanancia = netoVentanas + (netoVentanas * ganancia) / 100;

        // Descuento sobre ventanas con ganancia
        if (descuento > 0) {
            ventanasConGanancia -= (ventanasConGanancia * descuento) / 100;
        }

        // Subtotal antes de IVA
        const subtotal = ventanasConGanancia + costosAdicionales;

        // IVA
        const iva = subtotal * 0.19;

        // Total final
        const totalFinal = subtotal + iva;

        setValores({
            neto: netoVentanas,
            ventanasConGanancia,
            costosExtras: costosAdicionales,
            subtotal,
            iva,
            totalFinal,
        });
    };

    useEffect(() => {
        calculatePrices();
    }, [cotizacion, ganancia, descuento, costosExtras]);

    // ================== HANDLERS ==================
    const handleGananciaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setGanancia(Number(e.target.value));
    };

    const handleDescuentoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDescuento(Number(e.target.value));
    };

    const handleDialogOpen = () => setOpenDialog(true);
    const handleDialogClose = () => setOpenDialog(false);

    const handleCostosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCostosExtras({
            ...costosExtras,
            [e.target.name]:
                e.target.type === "number"
                    ? e.target.value === ""
                        ? 0
                        : Number(e.target.value)
                    : e.target.value,
        });
    };

    // ================== FORMATO CLP ==================
    const formatCLP = (value: number) =>
        new Intl.NumberFormat("es-CL", {
            style: "currency",
            currency: "CLP",
            maximumFractionDigits: 0,
        }).format(value);

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Resumen de Precios
            </Typography>

            {/* GANANCIA */}
            <Box sx={{ mb: 2 }}>
                <TextField
                    label="Porcentaje de Ganancia (%)"
                    type="number"
                    value={ganancia === 0 ? "" : ganancia}
                    onChange={handleGananciaChange}
                    fullWidth
                    inputProps={{ min: 0 }}
                />
            </Box>

            {/* DESCUENTO */}
            <Box sx={{ mb: 2 }}>
                <TextField
                    label="Porcentaje de Descuento (%)"
                    type="number"
                    value={descuento === 0 ? "" : descuento}
                    onChange={handleDescuentoChange}
                    fullWidth
                    inputProps={{ min: 0, max: 100 }}
                />
            </Box>

            {/* COSTOS EXTRAS */}
            <Box sx={{ mb: 2 }}>
                <Button variant="outlined" onClick={handleDialogOpen} fullWidth>
                    Agregar Costos Extras
                </Button>
            </Box>

            {/* BARRA DESCARGA */}
            <Box sx={{ mt: 2 }}>
                <DownloadBar
                    onDownloadQuote={handleDownloadQuote}
                    onDownloadOptimization={handleDownloadOptimization}
                    onDownloadMaterialList={handleDownloadMaterialList}
                    onDownloadWorkOrder={handleDownloadWorkOrder}
                    onDownloadAll={handleDownloadAll}
                />
            </Box>

            {/* ===== RESUMEN ===== */}
            <Box sx={{ mt: 3, p: 2, border: "1px solid #ddd", borderRadius: 2 }}>
                <Typography><strong>Neto Ventanas:</strong> {formatCLP(valores.neto)}</Typography>
                <Typography><strong>Ventanas + Ganancia - Descuento:</strong> {formatCLP(valores.ventanasConGanancia)}</Typography>
                <Typography><strong>Costos Extras:</strong> {formatCLP(valores.costosExtras)}</Typography>

                <Typography sx={{ mt: 1 }}><strong>Subtotal:</strong> {formatCLP(valores.subtotal)}</Typography>
                <Typography><strong>IVA 19%:</strong> {formatCLP(valores.iva)}</Typography>

                <Typography variant="h6" sx={{ mt: 1 }}>
                    <strong>VALOR FINAL:</strong> {formatCLP(valores.totalFinal)}
                </Typography>
            </Box>

            {/* ================== DIALOG COSTOS EXTRAS ================== */}
            <Dialog open={openDialog} onClose={handleDialogClose}>
                <DialogTitle>Costos Extras</DialogTitle>
                <DialogContent>
                    <Grid sx={{mt:2}} container spacing={2}>
                        <Grid item xs={6}>
                            <TextField label="Descripción Flete" name="flete" value={costosExtras.flete} onChange={handleCostosChange} fullWidth />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField label="Valor Flete" name="valorFlete" type="number" value={costosExtras.valorFlete === 0 ? "" : costosExtras.valorFlete} onChange={handleCostosChange} fullWidth />
                        </Grid>

                        <Grid item xs={6}>
                            <TextField label="Descripción Instalación" name="instalacion" value={costosExtras.instalacion} onChange={handleCostosChange} fullWidth />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField label="Valor Instalación" name="valorInstalacion" type="number" value={costosExtras.valorInstalacion === 0 ? "" : costosExtras.valorInstalacion } onChange={handleCostosChange} fullWidth />
                        </Grid>

                        <Grid item xs={6}>
                            <TextField label="Otros Gastos" name="otrosGastos" value={costosExtras.otrosGastos} onChange={handleCostosChange} fullWidth />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField label="Valor Otros Gastos" name="valorOtrosGastos" type="number" value={costosExtras.valorOtrosGastos === 0 ? "" : costosExtras.valorOtrosGastos} onChange={handleCostosChange} fullWidth />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField label="Mano de Obra" name="valorManoDeObra" type="number" value={costosExtras.valorManoDeObra === 0 ? "" : costosExtras.valorManoDeObra} onChange={handleCostosChange} fullWidth />
                        </Grid>
                    </Grid>
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleDialogClose}>Cancelar</Button>
                    <Button
                        variant="contained"
                        onClick={() => {
                            onSaveCostosExtras();
                            handleDialogClose();
                        }}
                    >
                        Guardar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CalcularValores;