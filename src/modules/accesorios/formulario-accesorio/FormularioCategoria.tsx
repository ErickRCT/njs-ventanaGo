import React, { useState, useEffect } from "react";
import {
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    Grid,
    TextField,
    FormControlLabel,
    Switch,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
} from "@mui/material";
import type { CategoriaProductoInterface as CatalogoCategoriaProductoInterface } from "../service/interface.ts";
// IMPORTANTE: Asegúrate de ajustar la ruta de importación según tu estructura de carpetas
import { postCategoria, putCategoria } from "../service/apiClient.ts";

interface FormularioCategoriaProps {
    categoriaEdit?: CatalogoCategoriaProductoInterface | null;
    onSubmit: () => void;
    onCancel: () => void;
}

export const FormularioCategoria: React.FC<FormularioCategoriaProps> = ({
                                                                            categoriaEdit,
                                                                            onSubmit,
                                                                            onCancel,
                                                                        }) => {
    const [formData, setFormData] = useState<CatalogoCategoriaProductoInterface>({
        catalogoCategoriaProductoId: null,
        nombre: "",
        descripcion: "",
        orden: "1",
        activo: true,
    });

    // Diálogos de notificación
    const [dialogoCampos, setDialogoCampos] = useState(false);
    const [dialogoExito, setDialogoExito] = useState(false);
    const [dialogoErrorPost, setDialogoErrorPost] = useState(false);
    const [camposFaltantes, setCamposFaltantes] = useState<string[]>([]);

    useEffect(() => {
        if (categoriaEdit) {
            setFormData({
                catalogoCategoriaProductoId: categoriaEdit.catalogoCategoriaProductoId,
                nombre: categoriaEdit.nombre || "",
                descripcion: categoriaEdit.descripcion || "",
                orden: categoriaEdit.orden || "1",
                activo: categoriaEdit.activo ?? true,
            });
        }
    }, [categoriaEdit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, checked, type } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));

        // Limpieza básica de errores al escribir
        if (camposFaltantes.length > 0 && name === "nombre" && value.trim()) {
            setCamposFaltantes((prev) => prev.filter((campo) => campo !== "Nombre"));
        }
    };

    const validateForm = (): { isValid: boolean; missingFields: string[] } => {
        const missingFields: string[] = [];

        if (!formData.nombre.trim()) {
            missingFields.push("Nombre");
        }

        return {
            isValid: missingFields.length === 0,
            missingFields,
        };
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const { isValid, missingFields } = validateForm();

        if (!isValid) {
            setCamposFaltantes(missingFields);
            setDialogoCampos(true);
            return;
        }

        try {
            const datosParaEnviar = {
                catalogoCategoriaProductoId: formData.catalogoCategoriaProductoId,
                nombre: formData.nombre.trim(),
                descripcion: formData.descripcion.trim(),
                orden: formData.orden.toString(),
                activo: formData.activo,
            };

            if (formData.catalogoCategoriaProductoId && formData.catalogoCategoriaProductoId !== 0) {
                // EDITAR CATEGORÍA (PUT)
                await putCategoria(datosParaEnviar);
            } else {
                // CREAR CATEGORÍA (POST)
                await postCategoria(datosParaEnviar);
            }

            setDialogoExito(true);
        } catch (err) {
            console.error("Error al guardar la categoría:", err);
            setDialogoErrorPost(true);
        }
    };

    useEffect(() => {
        console.log(formData);
    }, [formData]);

    return (
        <>
            <Card sx={{ p: 2 }}>
                <CardHeader
                    title={
                        formData.catalogoCategoriaProductoId
                            ? `Editar Categoría: ${formData.nombre}`
                            : "Nueva Categoría de Producto"
                    }
                    subheader="Ingrese la información requerida para la categoría."
                />
                <Divider sx={{ mb: 3 }} />
                <CardContent>
                    <Box component="form" onSubmit={handleSubmit} noValidate>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={8}>
                                <TextField
                                    fullWidth
                                    required
                                    label="Nombre de la Categoría"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleChange}
                                    error={camposFaltantes.includes("Nombre")}
                                    helperText={
                                        camposFaltantes.includes("Nombre")
                                            ? "Este campo es requerido"
                                            : ""
                                    }
                                />
                            </Grid>

                            <Grid item xs={12} sm={4}>
                                <TextField
                                    fullWidth
                                    required
                                    label="Orden de despliegue"
                                    name="orden"
                                    type="number"
                                    value={formData.orden}
                                    onChange={handleChange}
                                    inputProps={{ min: 1 }}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={3}
                                    label="Descripción"
                                    name="descripcion"
                                    value={formData.descripcion}
                                    onChange={handleChange}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formData.activo}
                                            onChange={handleChange}
                                            name="activo"
                                            color="primary"
                                        />
                                    }
                                    label={formData.activo ? "Categoría Activa" : "Categoría Inactiva"}
                                />
                            </Grid>
                        </Grid>

                        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 4 }}>
                            <Button variant="outlined" color="secondary" onClick={onCancel}>
                                Cancelar
                            </Button>
                            <Button type="submit" variant="contained" color="primary">
                                {formData.catalogoCategoriaProductoId ? "Guardar Cambios" : "Crear Categoría"}
                            </Button>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            {/* Diálogo: Campos incompletos */}
            <Dialog maxWidth="sm" fullWidth open={dialogoCampos} onClose={() => setDialogoCampos(false)}>
                <DialogTitle>Formulario incompleto</DialogTitle>
                <DialogContent sx={{ mt: 2, py: 2 }}>
                    <Alert severity="warning">
                        Los siguientes campos obligatorios están incompletos:
                        <ul>
                            {camposFaltantes.map((campo, index) => (
                                <li key={index}>{campo}</li>
                            ))}
                        </ul>
                        Por favor, completa todos los datos requeridos.
                    </Alert>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogoCampos(false)} color="primary" variant="contained">
                        Entendido
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Diálogo: Éxito */}
            <Dialog maxWidth="sm" fullWidth open={dialogoExito} onClose={() => setDialogoExito(false)}>
                <DialogTitle>Operación exitosa</DialogTitle>
                <DialogContent sx={{ mt: 2, py: 2 }}>
                    <Alert severity="success">
                        {formData.catalogoCategoriaProductoId
                            ? "La categoría se ha actualizado correctamente."
                            : "La categoría se ha creado correctamente."}
                    </Alert>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            setDialogoExito(false);
                            onSubmit();
                        }}
                        color="primary"
                        variant="contained"
                    >
                        Continuar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Diálogo: Error */}
            <Dialog maxWidth="sm" fullWidth open={dialogoErrorPost} onClose={() => setDialogoErrorPost(false)}>
                <DialogTitle>Error al guardar</DialogTitle>
                <DialogContent sx={{ mt: 2, py: 2 }}>
                    <Alert severity="error">
                        Ocurrió un error al intentar guardar la categoría. Por favor, inténtalo nuevamente.
                    </Alert>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogoErrorPost(false)} color="primary" variant="outlined">
                        Reintentar
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};