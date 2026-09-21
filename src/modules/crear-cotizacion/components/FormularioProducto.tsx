import { useState } from 'react';
import {Box, TextField, Grid, Paper, Typography, Button, Autocomplete, Alert} from '@mui/material';
import { FormularioProductoProps, Producto } from '../crearCotizacionInterface';

// Mapeo de nombre de color -> representación visual (color/gradiente)
// Ideal: reemplazar esto por un campo `hex` que venga directo del backend en coloresData
const COLOR_SWATCHES: Record<string, string> = {
  blanco: '#FFFFFF',
  negro: '#1A1A1A',
  titanio: 'linear-gradient(135deg, #A8A8A8 0%, #D4D4D4 45%, #8C8C8C 100%)',
  madera: 'linear-gradient(135deg, #8B5A2B 0%, #A9713F 50%, #6E431F 100%)',
  mate: 'linear-gradient(135deg, #5C5C5C 0%, #3A3A3A 100%)',
};

const DEFAULT_SWATCH = '#BDBDBD';

const getColorSwatch = (nombre?: string) => {
  if (!nombre) return DEFAULT_SWATCH;
  return COLOR_SWATCHES[nombre.trim().toLowerCase()] ?? DEFAULT_SWATCH;
};

// Pequeño círculo que representa el color
const ColorDot: React.FC<{ nombre?: string; size?: number }> = ({ nombre, size = 20 }) => (
    <Box
        sx={{
          width: size,
          height: size,
          minWidth: size,
          borderRadius: '50%',
          background: getColorSwatch(nombre),
          border: '1px solid rgba(0,0,0,0.15)',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.6) inset, 0 1px 2px rgba(0,0,0,0.15)',
        }}
    />
);

export const FormularioProducto: React.FC<FormularioProductoProps> = ({
                                                                        altoReforzado,
                                                                        anchoReforzado,
                                                                        isReforzado,
                                                                        closeForm,
                                                                        onSubmit,
                                                                        productDescription,
                                                                        productoImage,
                                                                        vidriosData,
                                                                        coloresData,
                                                                      }) => {
  // Medidas mínimas (valores en duro según lo solicitado)
  const MIN_ANCHO = 300; // 300mm mínimo para ancho
  const MIN_ALTO = 300;  // 300mm mínimo para alto

  const initialData: Producto = {
    item: '',
    cantidad: 1,
    ancho: 0,
    alto: 0,
    color: null,
    vidrio: null,
    obs: '',
  };

  const [formData, setFormData] = useState<Producto>(initialData);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "cantidad" || name === "ancho" || name === "alto" ? Number(value) : value,
    }));
  };

  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const { item, cantidad, ancho, alto, color, vidrio } = formData;

    // Validación de campos obligatorios
    if (!item.trim() || !color || !vidrio) {
      setErrorMessage("Todos los campos son obligatorios excepto 'Observaciones'");
      return;
    }

    // Validación de valores positivos
    if (cantidad <= 0 || ancho <= 0 || alto <= 0) {
      setErrorMessage("Cantidad, Ancho y Alto deben ser números positivos.");
      return;
    }

    // Validación de medidas mínimas
    if (ancho < MIN_ANCHO) {
      setErrorMessage(`El ancho mínimo permitido es ${MIN_ANCHO}mm`);
      return;
    }

    if (alto < MIN_ALTO) {
      setErrorMessage(`El alto mínimo permitido es ${MIN_ALTO}mm`);
      return;
    }

    setErrorMessage(null);
    onSubmit(formData);
    setFormData(initialData);
  };

  const cancelarButton = () => {
    setFormData(initialData);
    closeForm();
  };

  return (
      <Paper elevation={3} sx={{ p: 2, width: '80%', mx: 'auto', my: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            {productoImage && (
                <Box textAlign="center" mb={2}>
                  <img
                      src={`http://147.93.35.74/${productoImage}`}
                      alt="Producto"
                      style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }}
                  />
                </Box>
            )}
            {productDescription && (
                <Typography variant="body2" color="info" sx={{ textAlign: 'center', fontWeight: 'bold', mt: 2 }}>
                  {productDescription}
                </Typography>
            )}
            {isReforzado && (
                <Alert severity="warning" sx={{ mt: 2, py: 0.5 }}>
                  <Typography variant="caption" component="div" sx={{ fontSize: '0.75rem', lineHeight: 1.2 }}>
                    {`Reforzado desde ${anchoReforzado}mm ancho y ${altoReforzado}mm alto`}
                  </Typography>
                </Alert>
            )}

          </Grid>

          <Grid item xs={12} md={8}>
            <Box component="form" onSubmit={handleFormSubmit} noValidate>
              <Grid container spacing={1}>
                <Grid item xs={12} sm={6}>
                  <TextField
                      fullWidth
                      label="Descripcion"
                      type="text"
                      value={formData.item}
                      name="item"
                      onChange={handleChange}
                      size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                      fullWidth
                      label="Cantidad"
                      type="number"
                      value={formData.cantidad === 0 ? "" : formData.cantidad}
                      name="cantidad"
                      onChange={handleChange}
                      size="small"
                      inputProps={{ min: 1 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                      fullWidth
                      label={`Ancho`}
                      type="number"
                      value={formData.ancho === 0 ? "" : formData.ancho}
                      name="ancho"
                      onChange={handleChange}
                      size="small"
                      inputProps={{ min: MIN_ANCHO }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderColor: isReforzado && formData.ancho >= anchoReforzado ? '#C49B3B' : undefined,
                          '& fieldset': { borderColor: isReforzado && formData.ancho >= anchoReforzado ? '#C49B3B' : undefined },
                          '&:hover fieldset': { borderColor: isReforzado && formData.ancho >= anchoReforzado ? '#C49B3B' : undefined },
                          '&.Mui-focused fieldset': { borderColor: isReforzado && formData.ancho >= anchoReforzado ? '#C49B3B' : undefined },
                        },
                      }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                      fullWidth
                      label={`Alto`}
                      type="number"
                      value={formData.alto === 0 ? "" : formData.alto}
                      name="alto"
                      onChange={handleChange}
                      size="small"
                      inputProps={{ min: MIN_ALTO }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderColor: isReforzado && formData.alto >= altoReforzado ? '#C49B3B' : undefined,
                          '& fieldset': { borderColor: isReforzado && formData.alto >= altoReforzado ? '#C49B3B' : undefined },
                          '&:hover fieldset': { borderColor: isReforzado && formData.alto >= altoReforzado ? '#C49B3B' : undefined },
                          '&.Mui-focused fieldset': { borderColor: isReforzado && formData.alto >= altoReforzado ? '#C49B3B' : undefined },
                        },
                      }}
                  />
                </Grid>

                {/* Campo Color con swatch visual */}
                <Grid item xs={12}>
                  <Autocomplete
                      options={coloresData}
                      getOptionLabel={(option) => option.nombre}
                      value={formData.color || null}
                      onChange={(_event, newValue) => setFormData((prev) => ({ ...prev, color: newValue || null }))}
                      renderOption={(props, option) => {
                        const { key, ...optionProps } = props;
                        return (
                            <Box
                                component="li"
                                key={key}
                                {...optionProps}
                                sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}
                            >
                              <ColorDot nombre={option.nombre} />
                              <Typography variant="body2">{option.nombre}</Typography>
                            </Box>
                        );
                      }}
                      renderInput={(params) => (
                          <TextField
                              {...params}
                              label="Color"
                              fullWidth
                              size="small"
                              name="color"
                              InputProps={{
                                ...params.InputProps,
                                startAdornment: formData.color ? (
                                    <Box sx={{ display: 'flex', alignItems: 'center', pl: 0.5, pr: 0.5 }}>
                                      <ColorDot nombre={formData.color.nombre} size={18} />
                                    </Box>
                                ) : null,
                              }}
                          />
                      )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Autocomplete
                      options={vidriosData}
                      getOptionLabel={(option) => option.nombre}
                      value={formData.vidrio || null}
                      onChange={(_event, newValue) => setFormData((prev) => ({ ...prev, vidrio: newValue || null }))}
                      renderInput={(params) => <TextField {...params} label="Vidrio" fullWidth size="small" name="vidrio" />}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                      fullWidth
                      multiline
                      rows={2}
                      label="Observaciones"
                      value={formData.obs}
                      name="obs"
                      onChange={handleChange}
                      size="small"
                  />
                </Grid>
              </Grid>
              {errorMessage && (
                  <Typography variant="body2" color="error" sx={{ mt: 2 }}>
                    {errorMessage}
                  </Typography>
              )}
              <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }} size="small">
                Agregar Producto
              </Button>
              <Button onClick={cancelarButton} variant="outlined" fullWidth sx={{ mt: 2 }} size="small">
                Cancelar
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
  );
};