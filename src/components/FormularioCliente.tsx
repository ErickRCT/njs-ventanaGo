import React, {useEffect, useState} from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  Autocomplete, CardHeader, Card,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import {  ClienteFormProps } from './types/cliente';
import { validarRUT, validarEmail, validarTelefono } from './utils/validacion';
import {getComunas, getRegiones, postCliente} from "./service/ApiClient.ts";

interface Region {
  regionId: number|null;
  nombre: string;
  codigo: string;
}

interface Comuna {
  comunaId: number|null;
  nombre: string;
  region: Region;
}

interface Cliente  {
  clienteId: number|null;
  rut: string;
  nombre: string;
  telefono: string;
  email: string;
  direccion: string;
  comuna:Comuna|null;
}

export const FormularioCliente: React.FC<ClienteFormProps> = ({
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<Cliente>({
    clienteId: null,
    rut: '',
    nombre: '',
    telefono: '',
    email: '',
    direccion: '',
    comuna: null,

  });

  const [errors, setErrors] = useState<Partial<Record<keyof Cliente, string>>>({});
  const [regionesData, setRegionesData] = useState<Region[]>([]);
  const [comunasData, setComunasData] = useState<Comuna[]>([]);
  const [loadingComunas, setLoadingComunas] = useState(false);
  const [dialogoCampos, setDialogoCampos] = useState(false);
  const [dialogoExito, setDialogoExito] = useState(false);
  const [dialogoErrorPost, setDialogoErrorPost] = useState(false);
  const [clienteIdGuardado, setClienteIdGuardado] = useState<number | null>(null);
  const [regionSeleccionada, setRegionSeleccionada] = useState<Region | null>(null);


  const validateField = (name: keyof Cliente, value: any): string => {
    // Manejar campos que son objetos (como comuna)
    if (name === 'comuna') {
      return !value ? 'Debe seleccionar una comuna' : '';
    }

    // Convertir a string para campos que podrían ser number|null
    const stringValue = String(value || '');

    switch (name) {
      case 'rut':
        return !validarRUT(stringValue) ? 'RUT inválido' : '';
      case 'email':
        return !validarEmail(stringValue) ? 'Email inválido' : '';
      case 'telefono':
        return !validarTelefono(stringValue) ? 'Teléfono inválido' : '';
      default:
        return stringValue.trim() === '' ? 'Campo requerido' : '';
    }
  };

  const normalizarRut = (rut: string): string => {
    return rut.replace(/[^0-9kK]/g, '').toUpperCase();
  };

  const handleChange = (field: keyof Cliente) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({
      ...prev,
      [field]: validateField(field, value),
    }));
  };

  const guardarCliente = async (formData: Cliente) => {
    try {
      const payload: Cliente = {
        ...formData,
        rut: normalizarRut(formData.rut),
      };

      const response = await postCliente(payload);
      return response.clienteId;
    } catch (error) {
      console.error("Error al crear cliente:", error);
      return null;
    }
  };


  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const nuevosErrores: Partial<Record<keyof Cliente, string>> = {};
    let esValido = true;

    const camposObligatorios: (keyof Cliente)[] = [
      'rut',
      'nombre',
      'telefono',
      'email',
      'direccion',
      'comuna',
    ];

    camposObligatorios.forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) {
        nuevosErrores[key] = error;
        esValido = false;
      }
    });

    setErrors(nuevosErrores);

    if (!esValido) {
      setDialogoCampos(true);
      return;
    }

    const clienteId = await guardarCliente(formData);

    if (clienteId) {
      setClienteIdGuardado(clienteId);
      setDialogoExito(true);
    } else {
      setDialogoErrorPost(true);
    }
  };



  const obtenerComunas = async (regionId: number) => {
    try {
      setLoadingComunas(true); // Primero activar loading
      const response = await getComunas(regionId);
      setComunasData(response);
    } catch (error) {
      console.error("Error al obtener las comunas:", error);
    } finally {
      setLoadingComunas(false);
    }
  };

  const handleRegionChange = (_event: any, newValue: Region | null) => {
    setRegionSeleccionada(newValue);

    setFormData(prev => ({
      ...prev,
      comuna: null, // reset comuna al cambiar región
    }));

    if (newValue?.regionId) {
      obtenerComunas(newValue.regionId);
    } else {
      setComunasData([]);
    }
  };


  const handleComunaChange = (_event: any, newValue: Comuna | null) => {
    setFormData(prev => ({
      ...prev,
      comuna: newValue,
    }));
  };


  const obtenerRegiones = async () => {
    try {
      const response = await getRegiones();
      setRegionesData(response);
    } catch (error) {
      console.error("Error al obtener las regiones:", error);
    }
  };

  useEffect(() => {
    obtenerRegiones();
  }, []);



  return (
      <>
          <Card sx={{border: 'none', boxShadow: 'none',maxWidth: '1200px', mx: 'auto', px: 2,}}>
            <CardHeader
                title="Datos Personales"
                subheader="Completa la información requerida para continuar"
            />
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField

                    fullWidth
                    label="RUT"
                    value={formData.rut}
                    onChange={handleChange('rut')}
                    error={!!errors.rut}
                    helperText={errors.rut}
                    placeholder="12.345.678-9"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField

                    fullWidth
                    label="Nombre Completo"
                    value={formData.nombre}
                    onChange={handleChange('nombre')}

                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Teléfono"
                    value={formData.telefono}
                    onChange={handleChange('telefono')}
                    placeholder="+56 9 1234 5678"
                    error={!!errors.telefono}
                    helperText={errors.telefono}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField

                    fullWidth
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange('email')}
                    error={!!errors.email}
                    helperText={errors.email}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField

                    fullWidth
                    label="Dirección"
                    value={formData.direccion}
                    onChange={handleChange('direccion')}

                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Autocomplete
                      options={regionesData}
                      getOptionLabel={(option) => option.nombre}
                      value={regionSeleccionada}
                      onChange={handleRegionChange}
                      isOptionEqualToValue={(option, value) =>
                          option.regionId === value?.regionId
                      }
                      renderInput={(params) => (
                          <TextField
                              {...params}
                              label="Región"
                              fullWidth
                              InputLabelProps={{
                                shrink: true,
                              }}
                          />
                      )}
                  />

                </Grid>
                <Grid item xs={12} sm={6}>
                  <Autocomplete
                      options={comunasData}
                      getOptionLabel={(option) => option.nombre}
                      value={formData.comuna}
                      onChange={handleComunaChange}
                      disabled={loadingComunas}
                      loading={loadingComunas}
                      renderInput={(params) => (
                          <TextField
                              {...params}
                              label="Comuna"
                              fullWidth
                              size="medium"
                              InputLabelProps={{
                                shrink: true,
                              }}

                          />
                      )}
                      isOptionEqualToValue={(option, value) =>
                          option.comunaId === value?.comunaId
                      }
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>

                    <Button type="submit" variant="contained" color="primary">
                      Guardar
                    </Button>
                    {onCancel && (
                      <Button onClick={onCancel} variant="outlined" color="primary">
                        Volver
                      </Button>
                    )}

                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Card>

        <Dialog open={dialogoCampos} onClose={() => setDialogoCampos(false)} fullWidth>
          <DialogTitle>Formulario incompleto</DialogTitle>
          <DialogContent sx={{mt:3}} >
            <Alert severity="warning">Por favor, completa todos los campos obligatorios.</Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogoCampos(false)}>Cerrar</Button>
          </DialogActions>
        </Dialog>

          <Dialog open={dialogoExito} onClose={() => setDialogoExito(false)} fullWidth>
            <DialogTitle>Cliente guardado</DialogTitle>
            <DialogContent sx={{mt:3}}>
              <Alert severity="success">El cliente se guardó correctamente.</Alert>
            </DialogContent>
            <DialogActions>
              <Button
                  onClick={() => {
                    setDialogoExito(false);
                    if (clienteIdGuardado !== null) {
                      onSubmit(clienteIdGuardado);
                    }
                  }}
              >
                Entendido
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog open={dialogoErrorPost} onClose={() => setDialogoErrorPost(false)}>
            <DialogTitle>Error al guardar</DialogTitle>
            <DialogContent sx={{mt:3}}>
              <Alert severity="error">Ocurrió un error al guardar el cliente. Intenta nuevamente.</Alert>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogoErrorPost(false)}>Volver</Button>
            </DialogActions>
          </Dialog>
      </>
  );
};