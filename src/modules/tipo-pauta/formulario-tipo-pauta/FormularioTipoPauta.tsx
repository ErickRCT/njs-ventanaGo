import React, { useState , useEffect} from 'react';
import {
    Box,
    TextField,
    Button,
    Grid,
    Card,
    CardHeader,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert
} from '@mui/material';
import { SelectorImagen } from "../../perfil/formulario-perfil/SelectorImagen.tsx";
import {postTipoPauta, putTipoPauta} from '../service/apiClient.ts';
import { urlImagen } from '../../../utils/imagenes.ts';


interface TipoPauta {
    tipoPautaId: number | null;
    nombre: string;
    rutaImagen: string | null;
}

interface TipoPautaFormProps {
    onSubmit: (tipoPautaId: number) => void;
    onCancel?: () => void;
    tipoPautaEditar?: TipoPauta | null;
}


export const FormularioTipoPauta: React.FC<TipoPautaFormProps> = ({ onSubmit, onCancel , tipoPautaEditar }) => {
    const [formData, setFormData] = useState<TipoPauta>({
        tipoPautaId: null,
        nombre: '',
        rutaImagen: null,

    });

    const [dialogoCampos, setDialogoCampos] = useState(false);
    const [dialogoExito, setDialogoExito] = useState(false);
    const [dialogoErrorPost, setDialogoErrorPost] = useState(false);
    const [tipoPautaIdGuardado, setTipoPautaIdGuardado] = useState<number | null>(null);
    const [camposFaltantes, setCamposFaltantes] = useState<string[]>([]);

    const handleChange = (field: keyof TipoPauta) => (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const value = event.target.value;
        setFormData(prev => ({ ...prev, [field]: value }));
    };


    const handleImageSelect = (ruta: string) => {
        setFormData(prev => ({ ...prev, rutaImagen: ruta }));
    };

    const validateForm = (): { isValid: boolean, missingFields: string[] } => {
        const missingFields: string[] = [];

        if (!formData.nombre.trim()) missingFields.push('Nombre');

        return {
            isValid: missingFields.length === 0,
            missingFields
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
                tipoPautaId: formData.tipoPautaId,
                nombre: formData.nombre.trim(),
                rutaImagen: formData.rutaImagen,
            };

            console.log('Datos del formulario a enviar:', datosParaEnviar);

            let response;

            if (formData.tipoPautaId) {
                // EDITAR
                response = await putTipoPauta(datosParaEnviar);
            } else {
                // CREAR
                response = await postTipoPauta(datosParaEnviar);
            }

            if (response.tipoPautaId) {
                setTipoPautaIdGuardado(response.tipoPautaId);
                setDialogoExito(true);
            }

        } catch (err) {
            console.error('Error al guardar el tipo de pauta:', err);
            setDialogoErrorPost(true);
        }
    };

    useEffect(() => {
        if (tipoPautaEditar) {
            setFormData({
                tipoPautaId: tipoPautaEditar.tipoPautaId,
                nombre: tipoPautaEditar.nombre,
                rutaImagen: tipoPautaEditar.rutaImagen
            });
        }
    }, [tipoPautaEditar]);

    return (
        <>
            <Card sx={{
                border: 'none',
                boxShadow: 'none',
                maxWidth: '1200px',
                mx: 'auto',
                px: 2,
                py: 3
            }}>
                <CardHeader
                    title={
                        tipoPautaEditar
                            ? "Editar Tipo de Pauta"
                            : "Crear un Nuevo Tipo de Pauta"
                    }
                    subheader={
                        tipoPautaEditar
                            ? "Modifica los datos del tipo de pauta"
                            : "Completa los datos requeridos para crear un nuevo tipo de pauta"
                    }
                    sx={{ pb: 3 }}
                />

                <Box component="form" onSubmit={handleSubmit} noValidate>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                label="Nombre"
                                fullWidth
                                value={formData.nombre}
                                onChange={handleChange('nombre')}
                                error={camposFaltantes.includes('Nombre')}
                                helperText={camposFaltantes.includes('Nombre') ? 'Este campo es requerido' : ''}
                            />
                        </Grid>


                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                {formData.rutaImagen && (
                                    <Box
                                        sx={{
                                            width: 64,
                                            height: 64,
                                            borderRadius: 1,
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            overflow: 'hidden',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            backgroundColor: 'background.paper'
                                        }}
                                    >
                                        <img
                                            src={urlImagen(formData.rutaImagen)}
                                            alt="Imagen seleccionada"
                                            style={{
                                                maxWidth: '100%',
                                                maxHeight: '100%',
                                                objectFit: 'contain'
                                            }}
                                        />
                                    </Box>
                                )}
                                <SelectorImagen
                                    imagenActual={formData.rutaImagen || ''}
                                    onSeleccionar={handleImageSelect}
                                />
                            </Box>
                        </Grid>

                        <Grid item xs={12}>
                            <Box sx={{
                                display: 'flex',
                                gap: 2,
                                justifyContent: 'flex-end',
                                pt: 2
                            }}>
                                {onCancel && (
                                    <Button
                                        onClick={onCancel}
                                        variant="outlined"
                                        color="primary"
                                        size="large"
                                    >
                                        Volver
                                    </Button>
                                )}
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    size="large"
                                >
                                    {tipoPautaEditar
                                        ? 'Actualizar Tipo de Pauta'
                                        : 'Guardar Tipo de Pauta'}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </Card>

            {/* Diálogo para campos incompletos */}
            <Dialog maxWidth="sm" fullWidth open={dialogoCampos} onClose={() => setDialogoCampos(false)}>
                <DialogTitle>Formulario incompleto</DialogTitle>
                <DialogContent sx={{ mt:2,  py: 2 }}>
                    <Alert severity="warning">
                        Los siguientes campos obligatorios están incompletos:
                        <ul>
                            {camposFaltantes.map((campo, index) => (
                                <li key={index}>{campo}</li>
                            ))}
                        </ul>
                        Por favor, completa todos los campos obligatorios
                    </Alert>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setDialogoCampos(false)}
                        color="primary"
                        variant="contained"
                    >
                        Entendido
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Diálogo para éxito en guardado */}
            <Dialog maxWidth="sm" fullWidth open={dialogoExito} onClose={() => setDialogoExito(false)}>
                <DialogTitle>Tipo de Pauta creado</DialogTitle>
                <DialogContent sx={{mt:2, py: 2 }}>
                    <Alert severity="success">
                        El tipo de pauta se ha guardado correctamente.
                    </Alert>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            setDialogoExito(false);
                            if (tipoPautaIdGuardado) {
                                onSubmit(tipoPautaIdGuardado);
                            }
                        }}
                        color="primary"
                        variant="contained"
                    >
                        Continuar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Diálogo para error en guardado */}
            <Dialog maxWidth="sm" fullWidth open={dialogoErrorPost} onClose={() => setDialogoErrorPost(false)}>
                <DialogTitle>Error al guardar</DialogTitle>
                <DialogContent sx={{mt:2, py: 2 }}>
                    <Alert severity="error">
                        Ocurrió un error al intentar guardar el tipo de pauta. Por favor inténtalo nuevamente.
                    </Alert>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setDialogoErrorPost(false)}
                        color="primary"
                        variant="outlined"
                    >
                        Reintentar
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};