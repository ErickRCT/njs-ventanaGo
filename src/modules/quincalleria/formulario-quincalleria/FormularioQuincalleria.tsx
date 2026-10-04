import React, { useState, useEffect } from 'react';
import {
    Box,
    TextField,
    Button,
    Grid,
    Autocomplete,
    Card,
    CardHeader,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    FormControl,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio
} from '@mui/material';
import {editQuincalleria, getAllSeries} from '../service/apiClient.ts';
import { SelectorImagen } from "../../perfil/formulario-perfil/SelectorImagen.tsx";
import { postQuincalleria } from '../service/apiClient.ts';
import {QuincalleriaInterface} from "../service/interface.ts";
import { urlImagen } from '../../../utils/imagenes.ts';

interface Serie {
    serieId: number;
    nombre: string;
    descripcion: string;
}

interface Quincalleria {
    nombre: string;
    unidad: 'Pz' | 'Mt';
    valor: number;
    serie: Serie | null;
    rutaImagen: string | null;
}

interface QuincalleriaFormProps {
    onSubmit: () => void;
    onCancel?: () => void;
    quincalleriaEdit?: QuincalleriaInterface | null;
}

export const FormularioQuincalleria: React.FC<QuincalleriaFormProps> = ({ onSubmit, onCancel,quincalleriaEdit }) => {
    const [formData, setFormData] = useState<QuincalleriaInterface>({
        quincalleriaId: null,
        nombre: '',
        unidad: 'Pz',
        valor: 0,
        serie: null,
        rutaImagen: "",
    });

    const [series, setSeries] = useState<Serie[]>([]);
    const [dialogoCampos, setDialogoCampos] = useState(false);
    const [dialogoExito, setDialogoExito] = useState(false);
    const [dialogoErrorPost, setDialogoErrorPost] = useState(false);
    const [camposFaltantes, setCamposFaltantes] = useState<string[]>([]);
    const [, setTouchedFields] = useState<Record<string, boolean>>({
        nombre: false,
        valor: false,
        serie: false
    });

    useEffect(() => {
        const cargarSeries = async () => {
            try {
                const seriesData = await getAllSeries();
                setSeries(seriesData);
            } catch (error) {
                console.error("Error al cargar series:", error);
            }
        };

        cargarSeries();
    }, []);

    const handleChange = (field: keyof Quincalleria) => (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const value = event.target.value;
        setFormData(prev => ({
            ...prev,
            [field]: field === 'valor' ? parseFloat(value) || 0 : value
        }));

        // Limpiar el error de validación para este campo si existe
        if (camposFaltantes.length > 0) {
            let fieldName = '';
            if (field === 'nombre') fieldName = 'Nombre';
            if (field === 'valor') fieldName = 'Valor';

            if (fieldName && camposFaltantes.includes(fieldName)) {
                setCamposFaltantes(prev => prev.filter(campo => campo !== fieldName));
            }
        }
    };

    const handleUnidadChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            unidad: event.target.value as 'Pz' | 'Mt'
        }));
    };

    const handleSerieChange = (_: any, newValue: Serie | null) => {
        setFormData(prev => ({ ...prev, serie: newValue }));

        // Limpiar el error de validación para Serie si existe
        if (camposFaltantes.includes('Serie')) {
            setCamposFaltantes(prev => prev.filter(campo => campo !== 'Serie'));
        }
    };

    const handleImageSelect = (ruta: string) => {
        setFormData(prev => ({ ...prev, rutaImagen: ruta }));
    };

    const handleBlur = (field: string) => () => {
        setTouchedFields(prev => ({ ...prev, [field]: true }));
        // Validar solo este campo
        if (field === 'nombre' && !formData.nombre.trim()) {
            if (!camposFaltantes.includes('Nombre')) {
                setCamposFaltantes(prev => [...prev, 'Nombre']);
            }
        } else if (field === 'valor' && (isNaN(formData.valor) || formData.valor <= 0)) {
            if (!camposFaltantes.includes('Valor')) {
                setCamposFaltantes(prev => [...prev, 'Valor']);
            }
        }
    };

    const validateForm = (): { isValid: boolean, missingFields: string[] } => {
        const missingFields: string[] = [];

        if (!formData.nombre.trim()) missingFields.push('Nombre');
        if (isNaN(formData.valor) || formData.valor <= 0) missingFields.push('Valor');
        if (!formData.serie) missingFields.push('Serie');

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
                quincalleriaId: formData.quincalleriaId,
                nombre: formData.nombre.trim(),
                unidad: formData.unidad,
                valor: formData.valor,
                serie: formData.serie,
                rutaImagen: formData.rutaImagen
            };

            if (formData.quincalleriaId) {
                // EDITAR
                await editQuincalleria(datosParaEnviar);
            } else {
                // CREAR
                await postQuincalleria(datosParaEnviar);
            }

            setDialogoExito(true);

        } catch (err) {
            console.error(err);
            setDialogoErrorPost(true);
        }
    };


    useEffect(() => {
        if (quincalleriaEdit) {
            setFormData({
                quincalleriaId: quincalleriaEdit.quincalleriaId,
                nombre: quincalleriaEdit.nombre,
                unidad: quincalleriaEdit.unidad,
                valor: quincalleriaEdit.valor,
                serie: quincalleriaEdit.serie,
                rutaImagen: quincalleriaEdit.rutaImagen
            });
        }
    }, [quincalleriaEdit]);

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
                    title={formData.quincalleriaId ? "Editar Artículo de Quincallería" : "Nuevo Artículo de Quincallería"}
                    subheader={formData.quincalleriaId ? "Modifica los datos y guarda los cambios" : "Completa los datos requeridos para crear un nuevo artículo"}
                    sx={{ pb: 3 }}
                />

                <Box component="form" onSubmit={handleSubmit} noValidate>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Nombre"
                                fullWidth
                                value={formData.nombre}
                                onChange={handleChange('nombre')}
                                onBlur={handleBlur('nombre')}
                                error={camposFaltantes.includes('Nombre')}
                                helperText={camposFaltantes.includes('Nombre') ? 'Este campo es requerido' : ''}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Valor"
                                fullWidth
                                type="number"
                                value={formData.valor === 0 ? '' : formData.valor}
                                onChange={handleChange('valor')}
                                onBlur={handleBlur('valor')}
                                error={camposFaltantes.includes('Valor')}
                                helperText={camposFaltantes.includes('Valor') ? 'Debe ser un valor positivo' : ''}
                                InputProps={{
                                    inputProps: {
                                        min: 0,
                                        step: "any"
                                    }
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <FormControl component="fieldset">
                                <FormLabel component="legend">Unidad</FormLabel>
                                <RadioGroup
                                    row
                                    value={formData.unidad}
                                    onChange={handleUnidadChange}
                                >
                                    <FormControlLabel value="Pz" control={<Radio />} label="Pz" />
                                    <FormControlLabel value="Mt" control={<Radio />} label="Mt" />
                                </RadioGroup>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Autocomplete
                                options={series}
                                getOptionLabel={(option) => option.nombre}
                                value={formData.serie}
                                onChange={handleSerieChange}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Serie"
                                        fullWidth
                                        error={camposFaltantes.includes('Serie')}
                                        helperText={camposFaltantes.includes('Serie') ? 'Este campo es requerido' : ''}
                                        onBlur={handleBlur('serie')}
                                        InputLabelProps={{shrink: true,}}
                                    />
                                )}
                                isOptionEqualToValue={(option, value) =>
                                    option.serieId === value?.serieId
                                }
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
                                    {formData.quincalleriaId ? "Editar" : "Guardar"}
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
                <DialogTitle>Artículo creado</DialogTitle>
                <DialogContent sx={{mt:2, py: 2 }}>
                    <Alert severity="success">
                        {formData.quincalleriaId ? "El artículo de quincallería se ha editado correctamente." : "El artículo de quincallería se ha guardado correctamente."}
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

            {/* Diálogo para error en guardado */}
            <Dialog maxWidth="sm" fullWidth open={dialogoErrorPost} onClose={() => setDialogoErrorPost(false)}>
                <DialogTitle>Error al guardar</DialogTitle>
                <DialogContent sx={{mt:2, py: 2 }}>
                    <Alert severity="error">
                        Ocurrió un error al intentar guardar el artículo. Por favor inténtalo nuevamente.
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