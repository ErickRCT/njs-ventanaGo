import { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Step,
    StepLabel,
    StepContent,
    Stepper,
    Typography,
    Card,
    CardHeader,
    Grid,
    TextField,
    Autocomplete,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    FormControlLabel,
    Checkbox,
    InputAdornment
} from '@mui/material';
import {editPauta, getPerfiles, getQuincalleria, getSeries, getTipoPauta, postPauta} from './service/apiClient';
import {Perfil, Quincalleria, Serie, TipoPauta, PautaDTO, PautaPerfil, Pauta} from './service/interface';
import {Add} from '@mui/icons-material';

interface StepperPautaProps {
    onSubmit: () => void;
    setMostrarFormulario: (mostrar: boolean) => void;
    pautaEdit?: Pauta | null;
}

export const StepperPauta: React.FC<StepperPautaProps> = ({ onSubmit, setMostrarFormulario ,pautaEdit }) => {
    const initialData: PautaDTO = {
        serie: null,
        nombre: '',
        descripcion: "",
        pesoTeoricoHorizontal: 0,
        pesoTeoricoVertical: 0,
        pesoTeoricoReforzadoHorizontal: 0,
        pesoTeoricoReforzadoVertical: 0,
        verticalReforzada: 0,
        horizontalReforzada: 0,
        quincallerias: [],
        tipoPauta: null,
        perfiles: [],
        vidrios: [],
        isReforzada: false,
    };

    const [formData, setFormData] = useState<PautaDTO>(initialData);
    const [activeStep, setActiveStep] = useState(0);
    const [series, setSeries] = useState<Serie[]>([]);
    const [tipos, setTipos] = useState<TipoPauta[]>([]);
    const [perfiles, setPerfiles] = useState<Perfil[]>([]);
    const [quincalleria, setQuincalleria] = useState<Quincalleria[]>([]);
    const [dialogoExito, setDialogoExito] = useState(false);
    const [dialogoErrorPost, setDialogoErrorPost] = useState(false);
    const [perfilSeleccionado, setPerfilSeleccionado] = useState<Perfil | null>(null);
    const [perfilInputValue, setPerfilInputValue] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name.includes("Reforzada") ? Number(value) : value }));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        setFormData(prev => ({
            ...prev,
            isReforzada: isChecked,
            verticalReforzada: isChecked ? prev.verticalReforzada : 0,
            horizontalReforzada: isChecked ? prev.horizontalReforzada : 0
        }));
    };

    const handleNext = () => setActiveStep(prev => prev + 1);
    const handleBack = () => {
        if (activeStep === 0) {
            setMostrarFormulario(false);
        } else {
            setActiveStep((prevStep) => prevStep - 1);
        }
    };

    const handleSubmit = async () => {
        try {
            if (pautaEdit) {
                await editPauta(formData);
            } else {
                await postPauta(formData);
            }

            setDialogoExito(true);
        } catch (err) {
            console.error("Error al guardar pauta", err);
            setDialogoErrorPost(true);
        }
    };

    const handleRemoveVidrio = (indexToRemove: number) => {
        setFormData(prev => ({
            ...prev,
            vidrios: (prev.vidrios || []).filter((_, i) => i !== indexToRemove)
        }));
    };

    const handleRemovePerfil = (indexToRemove: number) => {
        setFormData(prev => ({
            ...prev,
            perfiles: (prev.perfiles || []).filter((_, i) => i !== indexToRemove)
        }));
    };

    const handleRemoveQuincalleria = (indexToRemove: number) => {
        setFormData(prev => ({
            ...prev,
            quincallerias: (prev.quincallerias || []).filter((_, i) => i !== indexToRemove)
        }));
    };

    const handleQuincalleriaChange = (index: number, field: string, value: number) => {
        const newQuincallerias = [...(formData.quincallerias || [])];
        newQuincallerias[index] = {
            ...newQuincallerias[index],
            [field]: value
        };
        setFormData(prev => ({
            ...prev,
            quincallerias: newQuincallerias
        }));
    };

    const handlePerfilChange = (index: number, field: string, value: number | boolean) => {
        const newPerfiles = [...(formData.perfiles || [])];
        newPerfiles[index] = {
            ...newPerfiles[index],
            [field]: value
        };
        setFormData(prev => ({
            ...prev,
            perfiles: newPerfiles
        }));
    };

    const handleVidrioChange = (index: number, field: string, value: number | string) => {
        const newVidrios = [...(formData.vidrios || [])];
        newVidrios[index] = {
            ...newVidrios[index],
            [field]: value
        };
        setFormData(prev => ({
            ...prev,
            vidrios: newVidrios
        }));
    };

    const isStepValid = (step: number): boolean => {
        switch (step) {
            case 0:
                return formData.serie !== null;

            case 1:
                return (
                    formData.nombre.trim() !== "" &&
                    (!formData.isReforzada ||
                        (formData.verticalReforzada > 0 &&
                            formData.horizontalReforzada > 0))
                );

            case 2:
                return (
                    formData.tipoPauta !== null &&
                    Array.isArray(formData.perfiles) &&
                    formData.perfiles.length > 0 &&
                    formData.perfiles.every(
                        p =>
                            p.perfil !== null &&
                            p.cantidad > 0
                    )
                );

            case 3: {
                const quincalleriasValidas =
                    Array.isArray(formData.quincallerias) &&
                    formData.quincallerias.length > 0 &&
                    formData.quincallerias.every(q => {
                        const isValidBase = q.quincalleria !== null;

                        if (q.quincalleria?.unidad === "Pz") {
                            return isValidBase && q.cantidad > 0;
                        }

                        return (
                            isValidBase &&
                            q.variacionH !== null &&
                            q.variacionH > 0 &&
                            q.variacionV !== null &&
                            q.variacionV > 0
                        );
                    });

                const vidriosValidos =
                    Array.isArray(formData.vidrios) &&
                    formData.vidrios.length > 0 &&
                    formData.vidrios.every(
                        v =>
                            v.cantidad > 0 &&
                            v.variacionH !== 0 &&
                            v.variacionV !== 0
                    );

                return quincalleriasValidas && vidriosValidos;
            }

            default:
                return false;
        }
    };


    useEffect(() => {
        getSeries().then(setSeries);
    }, []);

    useEffect(() => {
        if (formData.serie) {
            getTipoPauta().then(setTipos);
            getPerfiles(formData.serie.serieId).then(setPerfiles);
            getQuincalleria(formData.serie.serieId).then(setQuincalleria);
        }
    }, [formData.serie]);

    useEffect(() => {
        console.log("DATOS DEL FORMULARIO : ", formData)
    }, [formData]);

    useEffect(() => {
        if (pautaEdit) {
            setFormData({
                pautaId: pautaEdit.pautaId,
                nombre: pautaEdit.nombre,
                descripcion: pautaEdit.descripcion,
                serie: pautaEdit.serie,
                tipoPauta: pautaEdit.tipoPauta,

                pesoTeoricoHorizontal: pautaEdit.pesoTeoricoHorizontal,
                pesoTeoricoVertical: pautaEdit.pesoTeoricoVertical,
                pesoTeoricoReforzadoHorizontal: pautaEdit.pesoTeoricoReforzadoHorizontal,
                pesoTeoricoReforzadoVertical: pautaEdit.pesoTeoricoReforzadoVertical,

                verticalReforzada: pautaEdit.verticalReforzada,
                horizontalReforzada: pautaEdit.horizontalReforzada,
                isReforzada: pautaEdit.isReforzada,

                perfiles: pautaEdit.perfiles,
                quincallerias: pautaEdit.quincallerias,
                vidrios: pautaEdit.vidrios
            })
        }
    }, [pautaEdit])

    const steps = [
        //step1
        {
            label: 'Selecciona la Serie',
            description: 'Elige una serie para habilitar el resto del formulario.',
            content: (
                <Autocomplete
                    options={series}
                    value={formData.serie}
                    onChange={(_, newValue) => setFormData(prev => ({ ...prev, serie: newValue }))}
                    getOptionLabel={(option) => option.nombre}
                    renderInput={(params) => <TextField {...params} label="Serie" fullWidth size="small" InputLabelProps={{shrink: true,}}/>}
                />
            ),
        },
        //step2
        {
            label: 'Datos Básicos',
            description: 'Ingresa el nombre, descripción y refuerzos.',
            content: (
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <TextField fullWidth size="small" label="Nombre" name="nombre" value={formData.nombre} onChange={handleChange} />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField fullWidth size="small" label="Descripción (Opcional)" name="descripcion" value={formData.descripcion} onChange={handleChange} />
                    </Grid>

                    <>
                        <Grid item xs={6} md={3}>
                            <TextField
                                fullWidth
                                size="small"
                                type="number"
                                label="Tamaño Maximo"
                                name="Tamaño Maximo"
                                //value={formData.verticalReforzada|| ""}
                                //onChange={handleChange}
                                InputProps={{
                                    endAdornment: <InputAdornment position="end">mm</InputAdornment>,
                                }}
                                inputProps={{
                                    step: "1",
                                    min: "0"
                                }}
                            />
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <TextField
                                fullWidth
                                size="small"
                                type="number"
                                label="Tamaño Maximo"
                                name="Tamaño Maximo"
                                //value={formData.horizontalReforzada || ""}
                                //onChange={handleChange}
                                InputProps={{
                                    endAdornment: <InputAdornment position="end">mm</InputAdornment>,
                                }}
                                inputProps={{
                                    step: "1",
                                    min: "0"
                                }}
                            />
                        </Grid>
                    </>

                    <Grid item xs={12}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={formData.isReforzada}
                                    onChange={handleCheckboxChange}
                                    name="isReforzada"
                                    color="primary"
                                />
                            }
                            label="Reforzado"
                        />
                    </Grid>

                    {formData.isReforzada && (
                        <>
                            <Grid item xs={6} md={3}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    type="number"
                                    label="Vertical Reforzada"
                                    name="verticalReforzada"
                                    value={formData.verticalReforzada|| ""}
                                    onChange={handleChange}
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end">mm</InputAdornment>,
                                    }}
                                    inputProps={{
                                        step: "1",
                                        min: "0"
                                    }}
                                />
                            </Grid>
                            <Grid item xs={6} md={3}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    type="number"
                                    label="Horizontal Reforzada"
                                    name="horizontalReforzada"
                                    value={formData.horizontalReforzada || ""}
                                    onChange={handleChange}
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end">mm</InputAdornment>,
                                    }}
                                    inputProps={{
                                        step: "1",
                                        min: "0"
                                    }}
                                />
                            </Grid>
                        </>
                    )}
                </Grid>
            ),
        },
        //step3

        {
            label: 'Tipo de Pauta y Perfiles',
            description: 'Selecciona el tipo de pauta y los perfiles.',
            content: (
                <Box>
                    <Autocomplete
                        sx={{ mb: 2 }}
                        options={tipos}
                        value={formData.tipoPauta}
                        getOptionLabel={(option) => option.nombre}
                        onChange={(_, newVal) => setFormData(prev => ({ ...prev, tipoPauta: newVal }))}
                        renderInput={(params) => (
                            <TextField {...params} label="Tipo Pauta" fullWidth size="small" InputLabelProps={{shrink: true}} />
                        )}
                    />



                    <Autocomplete
                        value={perfilSeleccionado}
                        inputValue={perfilInputValue}
                        options={perfiles}
                        getOptionLabel={(option) =>
                            `${option.codigo} - ${
                                option.orientacion === "H" ? "Horizontal" : "Vertical"
                            }`
                        }
                        onInputChange={(_, newInputValue) => {
                            setPerfilInputValue(newInputValue);
                        }}
                        onChange={(_, newVal) => {
                            if (!newVal) return;

                            setFormData(prev => ({
                                ...prev,
                                perfiles: [
                                    ...(prev.perfiles || []),
                                    {
                                        pautaPerfilId: null,
                                        pautaId: null,
                                        perfil: newVal,
                                        corte: null,
                                        orientacion: newVal.orientacion || "H",
                                        cantidad: 1,
                                        variacion: 0,
                                        dividir: false,
                                    } as PautaPerfil
                                ]
                            }));

                            // Limpiar selección
                            setPerfilSeleccionado(null);

                            // Limpiar texto visible inmediatamente
                            setPerfilInputValue("");
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Seleccionar Perfil"
                                fullWidth
                                size="small"
                                InputLabelProps={{ shrink: true }}
                            />
                        )}
                    />


                    {/* Cards de perfiles */}
                    {formData.perfiles && formData.perfiles.length > 0 && (
                        <Box display="flex" flexWrap="wrap" gap={2} mt={2}>
                            {formData.perfiles.map((perfil, index) => (
                                <Card key={index} variant="outlined" sx={{ p: 2, maxWidth: 220 }}>
                                    <Typography><strong>Perfil:</strong> {perfil.perfil?.codigo}</Typography>
                                    <Typography><strong>Orientación:</strong> {perfil.perfil?.orientacion === 'H' ? 'Horizontal' : 'Vertical'}</Typography>

                                    <TextField
                                        sx={{ mt: 1 }}
                                        fullWidth
                                        size="small"
                                        type="number"
                                        label="Cantidad"
                                        value={perfil.cantidad || ""}
                                        onChange={e => handlePerfilChange(index, 'cantidad', Number(e.target.value))}
                                        inputProps={{ min: 1 }}
                                    />

                                    <TextField
                                        sx={{ mt: 1 }}
                                        fullWidth
                                        size="small"
                                        type="number"
                                        label="Variación"
                                        value={perfil.variacion || ""}
                                        onChange={e => handlePerfilChange(index, 'variacion', Number(e.target.value))}
                                        InputProps={{
                                            endAdornment: <InputAdornment position="end">mm</InputAdornment>,
                                        }}
                                        inputProps={{ step: "1" ,min: "-99999"}}
                                    />

                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={perfil.dividir || false}
                                                onChange={e => handlePerfilChange(index, 'dividir', e.target.checked)}
                                                color="primary"
                                            />
                                        }
                                        label="Dividir"
                                        sx={{ mt: 1 }}
                                    />

                                    <Button
                                        variant="outlined"
                                        color="error"
                                        onClick={() => handleRemovePerfil(index)}
                                        sx={{ mt: 1 }}
                                    >
                                        Eliminar
                                    </Button>
                                </Card>
                            ))}
                        </Box>
                    )}
                </Box>
            ),
        },
        //step4
        {
            label: 'Quincallería y Vidrio',
            description: 'Agrega quincallería y vidrios.',
            content: (
                <Box>
                    <Autocomplete
                        multiple
                        options={quincalleria}
                        getOptionLabel={(q) => q.nombre}
                        value={(formData.quincallerias || []).map(q => q.quincalleria)}
                        onChange={(_, newVal) => {
                            setFormData(prev => ({
                                ...prev,
                                quincallerias: newVal.map(q => ({
                                    pautaQuincalleriaId: null,
                                    pautaId: null,
                                    quincalleria: q,
                                    cantidad: q.unidad === 'Pz' ? 1 : 0,
                                    variacionH: q.unidad === 'Mt' ? 0 : null,
                                    variacionV: q.unidad === 'Mt' ? 0 : null
                                }))
                            }));
                        }}
                        renderInput={(params) => <TextField {...params} label="Quincallería" fullWidth size="small" InputLabelProps={{shrink: true,}} />}
                    />

                    {formData.quincallerias && formData.quincallerias.length > 0 && (
                        <Box display="flex" flexWrap="wrap" gap={2} mt={2}>
                            {formData.quincallerias.map((item, index) => (
                                <Card
                                    key={index}
                                    variant="outlined"
                                    sx={{ p: 2, maxWidth: 220, display: "flex", flexDirection: "column" }}
                                >
                                    {/* Contenido superior */}
                                    <Box sx={{ flexGrow: 1 }}>
                                        <Typography variant="subtitle1">
                                            {item.quincalleria?.nombre}
                                        </Typography>
                                        <Typography variant="body2">
                                            Unidad: {item.quincalleria?.unidad}
                                        </Typography>

                                        {item.quincalleria?.unidad !== "Pz" && (
                                            <>
                                                <TextField
                                                    sx={{ mt: 1 }}
                                                    fullWidth
                                                    size="small"
                                                    type="number"
                                                    label="Variación Horizontal"
                                                    value={item.variacionH || ""}
                                                    onChange={(e) =>
                                                        handleQuincalleriaChange(
                                                            index,
                                                            "variacionH",
                                                            Number(e.target.value)
                                                        )
                                                    }
                                                    InputProps={{
                                                        endAdornment: (
                                                            <InputAdornment position="end">mm</InputAdornment>
                                                        ),
                                                    }}
                                                    inputProps={{ step: "1", min: "0" }}
                                                />
                                                <TextField
                                                    sx={{ mt: 1 }}
                                                    fullWidth
                                                    size="small"
                                                    type="number"
                                                    label="Variación Vertical"
                                                    value={item.variacionV || ""}
                                                    onChange={(e) =>
                                                        handleQuincalleriaChange(
                                                            index,
                                                            "variacionV",
                                                            Number(e.target.value)
                                                        )
                                                    }
                                                    InputProps={{
                                                        endAdornment: (
                                                            <InputAdornment position="end">mm</InputAdornment>
                                                        ),
                                                    }}
                                                    inputProps={{ step: "1", min: "0" }}
                                                />
                                            </>
                                        )}
                                    </Box>

                                    {/* Cantidad SOLO si es Pz, justo arriba del botón */}
                                    {item.quincalleria?.unidad === "Pz" && (
                                        <TextField
                                            sx={{ mt: 1 }}
                                            fullWidth
                                            size="small"
                                            type="number"
                                            label="Cantidad"
                                            value={item.cantidad || ""}
                                            onChange={(e) =>
                                                handleQuincalleriaChange(index, "cantidad", Number(e.target.value))
                                            }
                                            inputProps={{ min: 1 }}
                                        />
                                    )}

                                    {/* Botón siempre al fondo */}
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        onClick={() => handleRemoveQuincalleria(index)}
                                        sx={{ mt: 2 }}
                                    >
                                        Eliminar
                                    </Button>
                                </Card>
                            ))}
                        </Box>

                    )}

                    <Box mt={2} display="flex" flexDirection="column" gap={2}>
                        <Button
                            variant="contained"
                            onClick={() => {
                                setFormData(prev => ({
                                    ...prev,
                                    vidrios: [
                                        ...(prev.vidrios || []),
                                        {
                                            pautaId: null,
                                            cantidad: 1,
                                            variacionH: 0,
                                            variacionV: 0,
                                            formula: "",
                                            vidrioId: null,
                                            nombre: "",
                                            valor: 0,
                                        }
                                    ]
                                }));
                            }}
                            sx={{ height: "fit-content", alignSelf: "flex-start" }}
                            startIcon={<Add />}
                        >
                            Agregar Vidrio
                        </Button>

                        {formData.vidrios && formData.vidrios.length > 0 && (
                            <Box display="flex" flexWrap="wrap" gap={2}>
                                {formData.vidrios.map((vidrio, index) => (
                                    <Card key={index} variant="outlined" sx={{ p: 2, maxWidth: 220 }}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            type="number"
                                            label="Cantidad"
                                            value={vidrio.cantidad || ""}
                                            onChange={e => handleVidrioChange(index, 'cantidad', Number(e.target.value))}
                                            inputProps={{ min: 1 }}
                                        />
                                        <TextField
                                            sx={{ mt: 1 }}
                                            fullWidth
                                            size="small"
                                            type="number"
                                            label="Variación Horizontal"
                                            value={vidrio.variacionH || ""}
                                            onChange={e => handleVidrioChange(index, 'variacionH', Number(e.target.value))}
                                            InputProps={{
                                                endAdornment: <InputAdornment position="end">mm</InputAdornment>,
                                            }}
                                            inputProps={{
                                                step: "1",
                                                min: "-99999"
                                            }}
                                        />
                                        <TextField
                                            sx={{ mt: 1 }}
                                            fullWidth
                                            size="small"
                                            type="number"
                                            label="Variación Vertical"
                                            value={vidrio.variacionV || ""}
                                            onChange={e => handleVidrioChange(index, 'variacionV', Number(e.target.value))}
                                            InputProps={{
                                                endAdornment: <InputAdornment position="end">mm</InputAdornment>,
                                            }}
                                            inputProps={{
                                                step: "1",
                                                min: "-99999"
                                            }}
                                        />
                                        <TextField
                                            sx={{ mt: 1 }}
                                            fullWidth
                                            size="small"
                                            label="Fórmula"
                                            value={vidrio.formula}
                                            onChange={e => handleVidrioChange(index, 'formula', e.target.value)}
                                        />
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            onClick={() => handleRemoveVidrio(index)}
                                            sx={{ mt: 1 }}
                                        >
                                            Eliminar
                                        </Button>
                                    </Card>
                                ))}
                            </Box>
                        )}
                    </Box>
                </Box>
            )
        }
    ];

    return (
        <Box display="flex" justifyContent="center" mt={4}>
            <Card sx={{ border: 'none', boxShadow: 'none', width: '100%', maxWidth: 800 }}>
                <CardHeader titleTypographyProps={{ variant: 'h5' }} title={pautaEdit? "Actualizar Pauta" : "Crear Pautas"} subheader="Completa la información paso a paso" />
                <Stepper activeStep={activeStep} orientation="vertical" sx={{ px: 3 }}>
                    {steps.map((step, index) => (
                        <Step key={step.label}>
                            <StepLabel>{step.label}</StepLabel>
                            <StepContent>
                                <Typography>{step.description}</Typography>
                                <Box mt={2}>{step.content}</Box>
                                <Box sx={{ mt: 2 }}>
                                    <Button onClick={handleBack} sx={{ mr: 1 }}>Atrás</Button>
                                    <Button
                                        variant="contained"
                                        onClick={index === steps.length - 1 ? handleSubmit : handleNext}
                                        disabled={!isStepValid(index)}
                                    >
                                        {index === steps.length - 1 ? 'Finalizar' : 'Continuar'}
                                    </Button>
                                </Box>
                            </StepContent>
                        </Step>
                    ))}
                </Stepper>

                <Dialog maxWidth="sm" fullWidth open={dialogoExito} onClose={() => setDialogoExito(false)}>
                    <DialogTitle>{pautaEdit? "Pauta actualizada" : "Pauta creada"}</DialogTitle>
                    <DialogContent sx={{ mt: 2, py: 2 }}>
                        <Alert severity="success">{pautaEdit? "La Pauta se ha actualizado correctamente." :"La Pauta se ha guardado correctamente."}</Alert>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => {
                                setDialogoExito(false);
                                onSubmit();
                                setMostrarFormulario(false);
                            }}
                            color="primary"
                            variant="contained"
                        >
                            Entendido
                        </Button>
                    </DialogActions>
                </Dialog>

                <Dialog maxWidth="sm" fullWidth open={dialogoErrorPost} onClose={() => setDialogoErrorPost(false)}>
                    <DialogTitle>Error al guardar</DialogTitle>
                    <DialogContent sx={{ mt: 2, py: 2 }}>
                        <Alert severity="error">
                            Ocurrió un error al intentar guardar la pauta. Por favor inténtalo nuevamente.
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
            </Card>
        </Box>
    );
};