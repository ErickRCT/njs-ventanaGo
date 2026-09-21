import React, { useState, useEffect } from 'react';
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
    Alert,
    FormControlLabel,
    Switch,
    InputAdornment,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    SelectChangeEvent,
    FormHelperText,
    Typography
} from '@mui/material';
import { CategoriaProductoInterface, ProductoCatalogoInterface } from '../service/interface.ts';
import {getAllCategoria, getImagenUrl, postProducto, putProducto, uploadImage} from "../service/apiClient.ts";

interface FormularioAccesorioProps {
    onSubmit: () => void;
    onCancel?: () => void;
    accesorioEdit?: ProductoCatalogoInterface | null;
}

export const FormularioAccesorio: React.FC<FormularioAccesorioProps> = ({
                                                                            onSubmit,
                                                                            onCancel,
                                                                            accesorioEdit
                                                                        }) => {
    const [formData, setFormData] = useState<ProductoCatalogoInterface>({
        catalogoProductoId: null,
        nombre: '',
        descripcion: '',
        precio: '',
        imagen: '',
        stock: null,
        activo: true,
        categoria: null,
    });
    const [categorias, setCategorias] = useState<CategoriaProductoInterface[]>([]);

    const [dialogoCampos, setDialogoCampos] = useState(false);
    const [dialogoExito, setDialogoExito] = useState(false);
    const [dialogoErrorPost, setDialogoErrorPost] = useState(false);
    const [subiendoImagen, setSubiendoImagen] = useState(false);
    const [errorImagen, setErrorImagen] = useState<string | null>(null);
    const [camposFaltantes, setCamposFaltantes] = useState<string[]>([]);

    useEffect(() => {
        if (accesorioEdit) {
            setFormData({
                catalogoProductoId: accesorioEdit.catalogoProductoId,
                nombre: accesorioEdit.nombre || '',
                descripcion: accesorioEdit.descripcion || '',
                precio: accesorioEdit.precio || '',
                imagen: accesorioEdit.imagen || '',
                stock: accesorioEdit.stock ? accesorioEdit.stock : null,
                activo: accesorioEdit.activo ?? true,
                categoria: accesorioEdit.categoria || null,
            });
        }
    }, [accesorioEdit]);

    useEffect(() => {
        const cargarCategorias = async () => {
            try {
                const response = await getAllCategoria();
                const sorted = [...(response || [])].sort((a, b) =>
                    (a.nombre || '').localeCompare(b.nombre || '', 'es', { sensitivity: 'base' })
                );
                setCategorias(sorted);
            } catch (error) {
                console.error("Error al obtener categorías:", error);
            }
        };

        cargarCategorias();
    }, []);

    const handleCategoriaChange = (event: SelectChangeEvent<number | string>) => {
        const selectedId = Number(event.target.value);

        const categoriaEncontrada = categorias.find(
            c => Number(c.catalogoCategoriaProductoId) === selectedId
        ) ?? null;

        setFormData(prev => ({
            ...prev,
            categoria: categoriaEncontrada
        }));

        if (camposFaltantes.includes("Categoría")) {
            setCamposFaltantes(prev => prev.filter(c => c !== "Categoría"));
        }
    };

    const handleChange = (field: keyof ProductoCatalogoInterface) => (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const value = event.target.value;

        setFormData(prev => ({
            ...prev,
            [field]: field === 'stock'
                ? (value === '' ? null : parseInt(value, 10))
                : value
        }));

        if (camposFaltantes.length > 0) {
            let fieldName = '';
            if (field === 'nombre') fieldName = 'Nombre';
            if (field === 'precio') fieldName = 'Precio';

            if (fieldName && camposFaltantes.includes(fieldName)) {
                setCamposFaltantes(prev => prev.filter(campo => campo !== fieldName));
            }
        }
    };

    const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            activo: event.target.checked
        }));
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setSubiendoImagen(true);
        setErrorImagen(null);

        try {
            const responseData: any = await uploadImage(file);

            const nombreImagen = typeof responseData === 'string'
                ? responseData
                : (responseData.nombre || responseData.fileName || responseData.url || responseData.ruta);

            setFormData(prev => ({
                ...prev,
                imagen: nombreImagen
            }));
        } catch (error) {
            console.error("Error al subir la imagen:", error);
            setErrorImagen("No se pudo subir la imagen. Inténtalo nuevamente.");
        } finally {
            setSubiendoImagen(false);
        }
    };

    const handleBlur = (field: string) => () => {
        if (field === 'nombre' && !formData.nombre.trim()) {
            if (!camposFaltantes.includes('Nombre')) {
                setCamposFaltantes(prev => [...prev, 'Nombre']);
            }
        } else if (field === 'precio' && (!formData.precio || parseFloat(formData.precio) <= 0)) {
            if (!camposFaltantes.includes('Precio')) {
                setCamposFaltantes(prev => [...prev, 'Precio']);
            }
        }
    };

    // Validación: Únicamente Categoría, Nombre y Precio
    const validateForm = (): { isValid: boolean; missingFields: string[] } => {
        const missingFields: string[] = [];

        if (!formData.categoria) missingFields.push("Categoría");
        if (!formData.nombre.trim()) missingFields.push('Nombre');
        if (!formData.precio || isNaN(parseFloat(formData.precio)) || parseFloat(formData.precio) <= 0) {
            missingFields.push('Precio');
        }

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
                catalogoProductoId: formData.catalogoProductoId,
                nombre: formData.nombre.trim(),
                descripcion: formData.descripcion.trim(),
                precio: formData.precio.toString(),
                imagen: formData.imagen,
                stock: formData.stock ?? 0,
                activo: formData.activo,
                categoria: formData.categoria,
            };

            if (formData.catalogoProductoId && formData.catalogoProductoId !== 0) {
                await putProducto(datosParaEnviar);
            } else {
                await postProducto(datosParaEnviar);
            }

            setDialogoExito(true);
        } catch (err) {
            console.error("Error al guardar el accesorio:", err);
            setDialogoErrorPost(true);
        }
    };

    return (
        <>
            <Card
                sx={{
                    border: 'none',
                    boxShadow: 'none',
                    maxWidth: '1200px',
                    mx: 'auto',
                    px: 2,
                    py: 3
                }}
            >
                <CardHeader
                    title={
                        formData.catalogoProductoId
                            ? 'Editar Producto'
                            : 'Nuevo Producto'
                    }
                    subheader={
                        formData.catalogoProductoId
                            ? 'Modifica los datos del producto y guarda los cambios'
                            : 'Completa los datos requeridos para registrar un nuevo producto'
                    }
                    sx={{ pb: 3 }}
                />

                <Box component="form" onSubmit={handleSubmit} noValidate>
                    <Grid container spacing={3}>

                        {/* Categoría (Obligatorio) */}
                        <Grid item xs={12} sm={6}>
                            <FormControl
                                fullWidth
                                required
                                error={camposFaltantes.includes("Categoría")}
                            >
                                <InputLabel id="label-categoria">Categoría</InputLabel>
                                <Select
                                    labelId="label-categoria"
                                    label="Categoría *"
                                    value={
                                        formData.categoria?.catalogoCategoriaProductoId ?? ""
                                    }
                                    onChange={handleCategoriaChange}
                                >
                                    {categorias.map(categoria => (
                                        <MenuItem
                                            key={categoria.catalogoCategoriaProductoId}
                                            value={categoria.catalogoCategoriaProductoId!}
                                        >
                                            {categoria.nombre}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {camposFaltantes.includes("Categoría") && (
                                    <FormHelperText>Debe seleccionar una categoría</FormHelperText>
                                )}
                            </FormControl>
                        </Grid>

                        {/* Nombre (Obligatorio) */}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                label="Nombre del Producto"
                                fullWidth
                                value={formData.nombre}
                                onChange={handleChange('nombre')}
                                onBlur={handleBlur('nombre')}
                                error={camposFaltantes.includes('Nombre')}
                                helperText={camposFaltantes.includes('Nombre') ? 'Este campo es requerido' : ''}
                            />
                        </Grid>

                        {/* Precio (Obligatorio) */}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                label="Precio"
                                fullWidth
                                type="number"
                                value={formData.precio}
                                onChange={handleChange('precio')}
                                onBlur={handleBlur('precio')}
                                error={camposFaltantes.includes('Precio')}
                                helperText={camposFaltantes.includes('Precio') ? 'Debe ser un precio válido y mayor a 0' : ''}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                    inputProps: { min: 0, step: "any" }
                                }}
                            />
                        </Grid>

                        {/* Stock (Opcional) */}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Stock Inicial / Disponible"
                                fullWidth
                                type="number"
                                value={formData.stock !== null && formData.stock !== undefined ? formData.stock : ''}
                                onChange={handleChange('stock')}
                                InputProps={{
                                    inputProps: { min: 0 }
                                }}
                            />
                        </Grid>

                        {/* Descripción (Opcional) */}
                        <Grid item xs={12}>
                            <TextField
                                label="Descripción"
                                fullWidth
                                multiline
                                rows={3}
                                value={formData.descripcion}
                                onChange={handleChange('descripcion')}
                            />
                        </Grid>

                        {/* Estado Activo/Inactivo */}
                        <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center' }}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.activo}
                                        onChange={handleSwitchChange}
                                        color="primary"
                                    />
                                }
                                label={formData.activo ? "Producto Activo" : "Producto Inactivo"}
                            />
                        </Grid>

                        {/* Subir Imagen (Opcional) */}
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Typography variant="body2" color="textSecondary">
                                    Imagen del Producto
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    {formData.imagen && (
                                        <Box
                                            sx={{
                                                width: 80,
                                                height: 80,
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
                                                src={
                                                getImagenUrl(formData.imagen)
                                                }
                                                alt="Previsualización"
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover'
                                                }}
                                            />
                                        </Box>
                                    )}

                                    <Button
                                        variant="outlined"
                                        component="label"
                                        color="primary"
                                        startIcon={subiendoImagen ? <CircularProgress size={20} /> : ""}
                                        disabled={subiendoImagen}
                                    >
                                        {subiendoImagen ? 'Subiendo...' : 'Subir Imagen'}
                                        <input
                                            type="file"
                                            hidden
                                            accept="image/*"
                                            onChange={handleFileUpload}
                                        />
                                    </Button>
                                </Box>

                                {errorImagen && (
                                    <Alert severity="error" sx={{ py: 0, px: 2 }}>
                                        {errorImagen}
                                    </Alert>
                                )}
                            </Box>
                        </Grid>

                        {/* Botones de Acción */}
                        <Grid item xs={12}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    gap: 2,
                                    justifyContent: 'flex-end',
                                    pt: 2
                                }}
                            >
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
                                    disabled={subiendoImagen}
                                >
                                    {formData.catalogoProductoId ? 'Guardar Cambios' : 'Crear Producto'}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </Card>

            {/* Diálogos */}
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
                        Por favor, completa los datos requeridos antes de guardar.
                    </Alert>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogoCampos(false)} color="primary" variant="contained">
                        Entendido
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog maxWidth="sm" fullWidth open={dialogoExito} onClose={() => setDialogoExito(false)}>
                <DialogTitle>Operación exitosa</DialogTitle>
                <DialogContent sx={{ mt: 2, py: 2 }}>
                    <Alert severity="success">
                        {formData.catalogoProductoId
                            ? 'El producto se ha actualizado correctamente.'
                            : 'El producto se ha creado correctamente.'}
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

            <Dialog maxWidth="sm" fullWidth open={dialogoErrorPost} onClose={() => setDialogoErrorPost(false)}>
                <DialogTitle>Error al guardar</DialogTitle>
                <DialogContent sx={{ mt: 2, py: 2 }}>
                    <Alert severity="error">
                        Ocurrió un error al intentar guardar el producto. Por favor, inténtalo nuevamente.
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