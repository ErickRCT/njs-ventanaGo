import {useEffect, useState} from 'react';
import {Box, TextField, Grid, Button, Alert} from '@mui/material';
import { SerieInterface } from '../service/interface';
import {LoadingButton} from "@mui/lab";

export interface FormularioSeriesProps {
    onSubmit: (data:SerieInterface) => void;
    setMostrarFormulario: (mostrar: boolean) => void;
    serieEdit?: SerieInterface | null;
}

export const FormularioSerie: React.FC<FormularioSeriesProps> = ({ onSubmit, setMostrarFormulario , serieEdit}) => {

    const initialData:SerieInterface = {
        serieId: null,
        nombre: '',
        descripcion: '',
    };

    const [formDataSerie, setFormDataSerie] = useState<SerieInterface>(initialData);
    const [formStatus, setFormStatus] = useState<'form' | 'success' | 'error' | 'warning'>('form');
    const [loading, setLoading] = useState(false);

    // Maneja cambios en los campos del formulario
    const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setFormDataSerie((prev) => ({ ...prev, [name]: value }));
    };

    // Valida y envía el formulario
    const handleFormSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        const { nombre, descripcion } = formDataSerie;

        // Validación de campos
        if (!nombre.trim() || !descripcion.trim()) {
            setFormStatus('warning');
            return;
        }


        setLoading(true);
        try {
            await onSubmit({ ...formDataSerie });
            setFormDataSerie(initialData);
            setFormStatus('success');
        } catch (error) {
            console.error("Error en el POST:", error);
            setFormStatus('error');
        } finally {
            setLoading(false);
        }
    };

    const handleCerrar = () => {
        setMostrarFormulario(false);
    };

    useEffect(() => {
        console.log("serie para editar",serieEdit)
    }, [serieEdit]);

    useEffect(() => {
        if (serieEdit) {
            setFormDataSerie(serieEdit);
        } else {
            setFormDataSerie(initialData);
        }
    }, [serieEdit]);

    return (

        <>
            {formStatus === 'form' && (

                <Box
                    component="form"
                    onSubmit={handleFormSubmit}
                    noValidate
                    sx={{
                        width: '100%',
                        paddingTop: '6px',
                    }}
                >
                    <Grid container spacing={2}>
                        {/* Campo Nombre */}
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Nombre"
                                type="text"
                                value={formDataSerie.nombre}
                                name="nombre"
                                onChange={handleChange}
                                size="small"

                            />
                        </Grid>

                        {/* Campo descripcion */}
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Descripcion"
                                type="text"
                                value={formDataSerie.descripcion}
                                name="descripcion"
                                onChange={handleChange}
                                size="small"


                            />
                        </Grid>



                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                                <LoadingButton
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    loading={loading}
                                >
                                    {serieEdit ? 'Actualizar' : 'Agregar'}
                                </LoadingButton>

                                <Button variant="outlined" color="primary" onClick={handleCerrar}>
                                    Cancelar
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            )}

            {formStatus === 'warning' && (
                <Box sx={{ width: '100%', paddingTop: '6px' }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Alert severity="warning" sx={{ mt: 2 }}>
                                Por favor, completa todos los campos obligatorios.
                            </Alert>
                        </Grid>
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                                <Button color="primary" size="small" onClick={() => setFormStatus('form')}>
                                    Volver
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            )}

            {formStatus === 'success' && (
                <Box sx={{ width: '100%', paddingTop: '6px' }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Alert severity="success" sx={{ mt: 2 }}>
                                La serie se guardó correctamente.
                            </Alert>
                        </Grid>
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                                <Button color="primary" size="small" onClick={() => setMostrarFormulario(false)}>
                                    Entendido
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            )}

            {formStatus === 'error' && (
                <Box sx={{ width: '100%', paddingTop: '6px' }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Alert severity="error" sx={{ mt: 2 }}>
                                Ocurrió un error al guardar el color. Intenta nuevamente.
                            </Alert>
                        </Grid>
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                                <Button color="primary" size="small" onClick={() => setFormStatus('form')}>
                                    Volver
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            )}
        </>
    );
};