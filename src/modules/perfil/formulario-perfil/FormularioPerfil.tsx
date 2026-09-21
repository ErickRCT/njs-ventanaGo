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
    Checkbox,
    FormControlLabel,
    RadioGroup,
    FormControl,
    FormLabel,
    Radio
} from '@mui/material';
import {editPerfil, getAllSeries, getAllTipoPerfil} from '../service/apiClient.ts';
import { postPerfiles } from '../service/apiClient.ts';
import {PerfilInterface , TipoPerfil , Serie} from "../service/interface.ts";


interface PerfilFormProps {
    onSubmit: (perfilId: number) => void;
    onCancel?: () => void;
    perfilEdit?: PerfilInterface | null;
}

export const FormularioPerfil: React.FC<PerfilFormProps> = ({ onSubmit, onCancel , perfilEdit }) => {
    const [formData, setFormData] = useState<PerfilInterface>({
        perfilId: null,
        codigo: '',
        descripcion: '',
        peso: null,
        isBastidor: false,
        tipoPerfil: null,
        serie: null,
        reforzado: false,
        orientacion: 'H',
    });

    const [tiposPerfil, setTiposPerfil] = useState<TipoPerfil[]>([]);
    const [series, setSeries] = useState<Serie[]>([]);
    const [dialogoCampos, setDialogoCampos] = useState(false);
    const [dialogoExito, setDialogoExito] = useState(false);
    const [dialogoErrorPost, setDialogoErrorPost] = useState(false);
    const [perfilIdGuardado, setPerfilIdGuardado] = useState<number | null>(null);
    const [camposFaltantes, setCamposFaltantes] = useState<string[]>([]);

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const [tipos, series] = await Promise.all([
                    getAllTipoPerfil(),
                    getAllSeries()
                ]);
                setTiposPerfil(tipos);
                setSeries(series);
            } catch (error) {
                console.error("Error al cargar datos iniciales:", error);
            }
        };

        cargarDatos();
    }, []);

    const handleChange = (field: keyof PerfilInterface) => (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const value = event.target.type === 'checkbox' ?
            (event.target as HTMLInputElement).checked :
            event.target.value;
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleTipoPerfilChange = (_: any, newValue: TipoPerfil | null) => {
        setFormData(prev => ({ ...prev, tipoPerfil: newValue }));
    };

    const handleSerieChange = (_: any, newValue: Serie | null) => {
        setFormData(prev => ({ ...prev, serie: newValue }));
    };


    const handleOrientacionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, orientacion: event.target.value as 'H' | 'V' }));
    };

    const validateForm = (): { isValid: boolean, missingFields: string[] } => {
        const missingFields: string[] = [];

        if (!formData.codigo.trim()) missingFields.push('Código');
        if (!formData.peso) missingFields.push('Peso');
        if (!formData.tipoPerfil) missingFields.push('Tipo de Perfil');
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


            if (formData.perfilId) {
                // EDITAR
                const datosParaEnviar = {
                    perfilId: formData.perfilId,
                    codigo: formData.codigo.trim(),
                    descripcion: formData.descripcion.trim(),
                    peso: formData.peso,
                    isBastidor: formData.isBastidor,
                    tipoPerfil: formData.tipoPerfil,
                    serie: formData.serie,
                    reforzado: formData.reforzado,
                    orientacion: formData.orientacion
                };
                const response = await editPerfil(datosParaEnviar);
                if (response.perfilId) {
                    setPerfilIdGuardado(response.perfilId);
                    setDialogoExito(true);
                }

                console.log('Datos del formulario a enviar:', datosParaEnviar);
            } else {
                // CREAR
                const datosParaEnviar = {
                    codigo: formData.codigo.trim(),
                    descripcion: formData.descripcion.trim(),
                    peso: formData.peso,
                    isBastidor: formData.isBastidor,
                    tipoPerfil: formData.tipoPerfil,
                    serie: formData.serie,
                    reforzado: formData.reforzado,
                    orientacion: formData.orientacion
                };
                const response = await postPerfiles(datosParaEnviar);
                if (response.perfilId) {
                    setPerfilIdGuardado(response.perfilId);
                    setDialogoExito(true);
                }
                console.log('Datos del formulario a enviar:', datosParaEnviar);
            }


        } catch (err) {
            console.error('Error al guardar el perfil:', err);
            setDialogoErrorPost(true);
        }
    };

    useEffect(() => {
        if (perfilEdit) {
            setFormData({
                perfilId: perfilEdit.perfilId,
                codigo: perfilEdit.codigo,
                descripcion: perfilEdit.descripcion,
                peso: perfilEdit.peso,
                isBastidor: perfilEdit.isBastidor,
                tipoPerfil: perfilEdit.tipoPerfil,
                serie: perfilEdit.serie,
                reforzado: perfilEdit.reforzado,
                orientacion: perfilEdit.orientacion === 'H' ? 'H' : 'V',
            });
        }
    }, [perfilEdit]);

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const [tipos, series] = await Promise.all([
                    getAllTipoPerfil(),
                    getAllSeries()
                ]);
                setTiposPerfil(tipos);
                setSeries(series);
            } catch (error) {
                console.error("Error al cargar datos iniciales:", error);
            }
        };

        cargarDatos();
    }, []);

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
                    title={perfilEdit ? "Edita un Perfil" : "Crea un Nuevo Perfil"}
                    subheader="Completa los datos requeridos para crear un nuevo perfil"
                    sx={{ pb: 3 }}
                />

                <Box component="form" onSubmit={handleSubmit} noValidate>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Código"
                                fullWidth
                                value={formData.codigo}
                                onChange={handleChange('codigo')}
                                error={camposFaltantes.includes('Código')}
                                helperText={camposFaltantes.includes('Código') ? 'Este campo es requerido' : ''}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Peso"
                                fullWidth
                                value={formData.peso}
                                onChange={handleChange('peso')}
                                error={camposFaltantes.includes('Peso')}
                                helperText={camposFaltantes.includes('Peso') ? 'Este campo es requerido' : ''}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                label="Descripción"
                                fullWidth
                                multiline
                                rows={2}
                                value={formData.descripcion}
                                onChange={handleChange('descripcion')}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Autocomplete
                                options={tiposPerfil}
                                getOptionLabel={(option) => option.nombre}
                                value={formData.tipoPerfil}
                                onChange={handleTipoPerfilChange}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Tipo de Perfil"
                                        fullWidth
                                        error={camposFaltantes.includes('Tipo de Perfil')}
                                        helperText={camposFaltantes.includes('Tipo de Perfil') ? 'Este campo es requerido' : ''}
                                        InputLabelProps={{shrink: true,}}
                                    />
                                )}
                                isOptionEqualToValue={(option, value) =>
                                    option.tipoPerfilId === value?.tipoPerfilId
                                }
                            />
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
                                        InputLabelProps={{shrink: true,}}
                                    />
                                )}
                                isOptionEqualToValue={(option, value) =>
                                    option.serieId === value?.serieId
                                }
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={formData.isBastidor}
                                        onChange={handleChange('isBastidor')}
                                    />
                                }
                                label="¿Es bastidor?"
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={formData.reforzado}
                                        onChange={handleChange('reforzado')}
                                    />
                                }
                                label="¿Reforzado?"
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <FormControl component="fieldset">
                                <FormLabel component="legend">Orientación</FormLabel>
                                <RadioGroup
                                    row
                                    value={formData.orientacion}
                                    onChange={handleOrientacionChange}
                                >
                                    <FormControlLabel value="H" control={<Radio />} label="Horizontal" />
                                    <FormControlLabel value="V" control={<Radio />} label="Vertical" />
                                </RadioGroup>
                            </FormControl>
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
                                    {perfilEdit? "Actualizar" : "Guardar" }
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
                <DialogTitle>Perfil creado</DialogTitle>
                <DialogContent sx={{mt:2, py: 2 }}>
                    <Alert severity="success">
                        {perfilEdit? "El perfil se ha actualizado correctamente." : "El perfil se ha guardado correctamente." }
                    </Alert>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            setDialogoExito(false);
                            if (perfilIdGuardado) {
                                onSubmit(perfilIdGuardado);
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
                        Ocurrió un error al intentar guardar el perfil. Por favor inténtalo nuevamente.
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