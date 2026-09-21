import {useEffect, useState} from 'react';
import { Box, TextField, Grid, Alert, Button } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { ColorInterface } from '../service/interface';

export interface FormularioColorProps {
    onSubmit: (data: any) => Promise<void>;
    setMostrarFormulario: (mostrar: boolean) => void;
    colorEdit?: ColorInterface | null;
}

export const FormularioColor: React.FC<FormularioColorProps> = ({ onSubmit, setMostrarFormulario , colorEdit}) => {
    const initialData: ColorInterface = {
        colorId:null,
        nombre: '',
        valor: 0,
    };

    const [formDataColor, setFormDataColor] = useState(initialData);
    const [formStatus, setFormStatus] = useState<'form' | 'success' | 'error' | 'warning'>('form');
    const [loading, setLoading] = useState(false);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setFormDataColor((prev) => ({ ...prev, [name]: value }));
    };

    const handleFormSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        const { nombre, valor } = formDataColor;

        if (!nombre.trim() || valor <= 0) {
            setFormStatus('warning');
            return;
        }

        setLoading(true);
        try {
            await onSubmit({ ...formDataColor });
            setFormDataColor(initialData);
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
        console.log("color para editar",colorEdit)
    }, [colorEdit]);

    useEffect(() => {
        if (colorEdit) {
            setFormDataColor(colorEdit);
        } else {
            setFormDataColor(initialData);
        }
    }, [colorEdit]);

    return (
        <>
            {formStatus === 'form' && (
                <Box
                    component="form"
                    onSubmit={handleFormSubmit}
                    noValidate
                    sx={{ width: '100%', paddingTop: '6px' }}
                >
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Nombre"
                                type="text"
                                value={formDataColor.nombre}
                                name="nombre"
                                onChange={handleChange}
                                size="small"
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Valor"
                                type="number"
                                value={formDataColor.valor === 0 ? "" : formDataColor.valor}
                                name="valor"
                                onChange={handleChange}
                                size="small"
                                inputProps={{ min: 1 }}
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
                                    {colorEdit ? 'Actualizar' : 'Agregar'}
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
                                El color se guardó correctamente.
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
