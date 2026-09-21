import {useEffect, useState} from 'react';
import { Box, TextField, Grid, Alert, Button } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Vidrio } from '../service/interface';


export interface FormularioVidriosProps {
    onSubmit: (data: any) => Promise<void>;
    setMostrarFormulario: (mostrar: boolean) => void;
    vidrioEdit?: Vidrio | null;
}

export const FormularioVidrios: React.FC<FormularioVidriosProps> = ({ onSubmit, setMostrarFormulario ,vidrioEdit }) => {
    const initialData: Omit<Vidrio, 'vidrioId'> = {
        nombre: '',
        valor: 0,
    };

    const [formDataVidrio, setFormDataVidrio] = useState(initialData);
    const [formStatus, setFormStatus] = useState<'form' | 'success' | 'error' | 'warning'>('form');
    const [loading, setLoading] = useState<boolean>(false);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setFormDataVidrio((prev) => ({ ...prev, [name]: value }));
    };

    const handleFormSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        const { nombre, valor } = formDataVidrio;

        if (!nombre.trim() || valor <= 0) {
            setFormStatus('warning');
            return;
        }

        setLoading(true);
        try {
            await onSubmit({ ...formDataVidrio });
            setFormDataVidrio(initialData);
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
        console.log("vidrio para editar",vidrioEdit)
    }, [vidrioEdit]);

    useEffect(() => {
        if (vidrioEdit) {
            setFormDataVidrio(vidrioEdit);
        } else {
            setFormDataVidrio(initialData);
        }
    }, [vidrioEdit]);

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
                                value={formDataVidrio.nombre}
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
                                value={formDataVidrio.valor === 0 ? "" : formDataVidrio.valor}
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
                                    {vidrioEdit ? 'Actualizar' : 'Agregar'}
                                </LoadingButton>

                                <Button variant="outlined" onClick={handleCerrar}>
                                    Cancelar
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            )}

            {formStatus === 'warning' && (

                <Box

                    sx={{ width: '100%', paddingTop: '6px' }}
                >
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Alert
                                severity="warning"

                                sx={{ mt: 2 }}
                            >
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

                <Box

                    sx={{ width: '100%', paddingTop: '6px' }}
                >
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Alert
                                severity="success"

                                sx={{ mt: 2 }}
                            >
                                El vidrio se guardó correctamente.
                            </Alert>
                        </Grid>



                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                                <Button color="primary" size="small" onClick={() => setMostrarFormulario(false)}>
                                    Cerrar
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>

            )}

            {formStatus === 'error' && (

                <Box

                    sx={{ width: '100%', paddingTop: '6px' }}
                >
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Alert
                                severity="error"

                                sx={{ mt: 2 }}
                            >
                                Ocurrió un error al guardar el vidrio. Intenta nuevamente.
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
