import { useEffect, useState } from 'react';
import { Box, TextField, Grid, Paper, Typography, Autocomplete, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import {getPerfiles, getQuincalleria, getSeries, getTipoPauta, postPauta} from '../service/apiClient';
import {
    Perfil,
    Quincalleria,
    Serie,
    TipoPauta,
    PautaVidrio,
    Pauta,
    PautaQuincalleria, PautaPerfil
} from '../service/interface';

export interface FormularioPautasProps {
  onSubmit: (data: Producto) => void;
  setMostrarFormulario: (mostrar: boolean) => void;
}

export interface Producto {
  serie: Serie | null;
  nombre: string;
  descripcion: string;
  pesoTeoricoHorizontal:number | null;
  pesoTeoricoVertical:number | null;
  pesoTeoricoReforzadoHorizontal:number | null;
  pesoTeoricoReforzadoVertical:number | null;
  verticalReforzada: number;
  horizontalReforzada: number;
  quincallerias: PautaQuincalleria[] | null;
  tipoPauta: TipoPauta | null;
  perfiles: PautaPerfil[] | null;
  vidrios: PautaVidrio[] | null;
  isReforzada: boolean;
}

export const FormularioPautas: React.FC<FormularioPautasProps> = ({ onSubmit,setMostrarFormulario }) => {
  const initialData: Producto = {
    serie: null,
    nombre: '',
    descripcion: "",
    pesoTeoricoHorizontal:0,
    pesoTeoricoVertical:0,
    pesoTeoricoReforzadoHorizontal:0,
    pesoTeoricoReforzadoVertical:0,
    verticalReforzada: 0,
    horizontalReforzada: 0,
    quincallerias: null,
    tipoPauta: null,
    perfiles: null,
    vidrios: null,
    isReforzada: false,
  };

  const [formDataPauta, setFormDataPauta] = useState<Producto>(initialData);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [quincalleriaData, setQuincalleriaData] = useState<Quincalleria[]>([]);
  const [tipoPautaData, setTipoPautaData] = useState<TipoPauta[]>([]);
  const [seriesDataPauta, setSeriesDataPauta] = useState<Serie[]>([]);
  const [perfilesDataPauta, setPerfilesDataPauta] = useState<Perfil[]>([]);
  const [openVidrioDialog, setOpenVidrioDialog] = useState(false);
  const [vidrioData, setVidrioData] = useState({
      pautaVidrioId:null,
      pautaId: null,
      cantidad: 0,
      variacionH: 0,
      variacionV: 0,
      formula: "",
      vidrioId: null,
      nombre: "",
      valor: 0,
  });
  const [isSerie, setIsSerie] = useState<boolean>(false);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;

        // Convertir explícitamente a número si el campo es uno de estos
        if (name === 'verticalReforzada' || name === 'horizontalReforzada') {
            setFormDataPauta((prev) => ({ ...prev, [name]: Number(value) }));
        } else {
            setFormDataPauta((prev) => ({ ...prev, [name]: value }));
        }
    };


  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const { nombre, descripcion, quincallerias, tipoPauta, perfiles } = formDataPauta;

    if (!nombre.trim() || !descripcion.trim() || !quincallerias || !tipoPauta || !perfiles) {
      setErrorMessage("Todos los campos son obligatorios excepto los campos de refuerzo.");
      return;
    }

      try {
          const response :Pauta = await postPauta({ ...formDataPauta });
          console.log("respuesta del post : ",response);


      } catch (error) {
          console.error("Error en el POST:", error);

      }

    console.log("Datos del formulario:", formDataPauta);

    setErrorMessage(null);
    onSubmit({ ...formDataPauta });
    setFormDataPauta(initialData);
  };

  const fetchData = async (fetchFunction: () => Promise<any>, setData: (data: any) => void) => {
    try {
      const response = await fetchFunction();
      setData(response);
    } catch (error) {
      console.error("Error al obtener los datos:", error);
    }
  };

  useEffect(() => {
    fetchData(getSeries, setSeriesDataPauta);
  }, []);

  useEffect(() => {
    if (formDataPauta.serie !== null) {
      fetchData(() => getQuincalleria(formDataPauta.serie!.serieId), setQuincalleriaData);
      fetchData(getTipoPauta, setTipoPautaData);
      fetchData(() => getPerfiles(formDataPauta.serie!.serieId), setPerfilesDataPauta);
    }
  }, [formDataPauta.serie]);

  useEffect(() => {
    setIsSerie(formDataPauta.serie === null);
  }, [formDataPauta.serie]);

    useEffect(() => {
        console.log("Datos del formulario : ", formDataPauta)
    }, [formDataPauta]);

  return (
      <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',

            minHeight: '100vh', // Asegura que ocupe toda la altura de la pantalla
            p: 2, // Padding para evitar que el formulario toque los bordes
          }}
      >
        <Box
            component="form"
            onSubmit={handleFormSubmit}
            noValidate
            sx={{
              width: '100%',
              maxWidth: '800px', // Ajusta el ancho máximo del formulario
            }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Grid item xs={12} sx={{ pb: 2 }}>
                <Autocomplete
                    options={seriesDataPauta}
                    getOptionLabel={(option) => option.nombre}
                    value={formDataPauta.serie || null}
                    onChange={(_event, newValue) => setFormDataPauta((prev) => ({ ...prev, serie: newValue || null }))}
                    renderInput={(params) => <TextField {...params} label="Serie" fullWidth size="small" name="serie" />}
                />
              </Grid>
              <Paper elevation={3} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Grid container spacing={1} sx={{ flexGrow: 1 }}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Nombre"
                        type="text"
                        value={formDataPauta.nombre}
                        name="nombre"
                        onChange={handleChange}
                        size="small"
                        required
                        disabled={isSerie}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Descripción"
                        type="text"
                        value={formDataPauta.descripcion}
                        name="descripcion"
                        onChange={handleChange}
                        size="small"
                        required
                        disabled={isSerie}
                    />
                  </Grid>
                  {['verticalReforzada', 'horizontalReforzada'].map((field) => (
                      <Grid item xs={12} sm={6} key={field}>
                        <TextField
                            fullWidth
                            label={field.split(/(?=[A-Z])/).join(' ')}
                            type="number"
                            value={formDataPauta[field as keyof Producto] === 0 ? "" : formDataPauta[field as keyof Producto]}
                            name={field}
                            onChange={handleChange}
                            size="small"
                            required={field === 'pesoTeoricoHorizontal' || field === 'pesoTeoricoVertical'}
                            disabled={isSerie}
                        />
                      </Grid>
                  ))}
                  <Grid item xs={12}>
                    <Autocomplete
                        disabled={isSerie}
                        options={tipoPautaData}
                        getOptionLabel={(option) => option.nombre}
                        value={formDataPauta.tipoPauta}
                        onChange={(_event, newValue) => setFormDataPauta((prev) => ({ ...prev, tipoPauta: newValue }))}
                        renderInput={(params) => <TextField {...params} label="Tipo Pauta" fullWidth size="small" required />}
                        renderOption={(props, option) => {
                          const { key, ...restProps } = props; // Desestructuramos key para no pasarlo con el spread
                          return (
                              <Box
                                  component="li"
                                  key={option.tipoPautaId} // Usamos quincalleriaId como key
                                  {...restProps} // Pasa el resto de las props sin incluir key
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    padding: 2,
                                    border: '1px solid #ccc',
                                    borderRadius: 1,
                                  }}
                              >
                                <img
                                    src={option.rutaImagen}
                                    style={{
                                      width: 100,
                                      height: 100,
                                      objectFit: 'contain',
                                    }}
                                />
                                <Box>
                                  <Typography variant="body1" fontWeight="bold">
                                    {option.nombre}
                                  </Typography>
                                </Box>
                              </Box>
                          );
                        }}
                    />
                  </Grid>
                </Grid>
                {errorMessage && <Typography variant="body2" color="error" sx={{ mt: 2 }}>{errorMessage}</Typography>}

                <Grid container spacing={1} sx={{ flexGrow: 1 }}>
                  <Grid item xs={12}>
                      <Autocomplete
                          disabled={isSerie}
                          multiple
                          options={quincalleriaData}
                          getOptionLabel={(option) => option.nombre}
                          isOptionEqualToValue={(option, value) =>
                              option.quincalleriaId === value.quincalleriaId
                          }
                          value={(formDataPauta.quincallerias || []).map((pq) => pq.quincalleria)}
                          onChange={(_event, newValue) =>
                              setFormDataPauta((prev) => ({
                                  ...prev,
                                  quincallerias: newValue.map((q) => {
                                      const existente = prev.quincallerias?.find(
                                          (pq) => pq.quincalleria.quincalleriaId === q.quincalleriaId
                                      );
                                      return {
                                          pautaQuincalleriaId: existente?.pautaQuincalleriaId ?? null,
                                          pautaId: existente?.pautaId ?? null,
                                          quincalleria: q,
                                          cantidad: existente?.cantidad ?? 1,
                                          variacionH: existente?.variacionH ?? 0,
                                          variacionV: existente?.variacionV ?? 0,
                                      };
                                  }),
                              }))
                          }
                          renderOption={(props, option) => {
                              const { key, ...restProps } = props;
                              return (
                                  <Box
                                      component="li"
                                      key={option.quincalleriaId}
                                      {...restProps}
                                      sx={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: 2,
                                          padding: 2,
                                          border: '1px solid #ccc',
                                          borderRadius: 1,
                                      }}
                                  >
                                      <img
                                          src={option.rutaImagen}
                                          style={{
                                              width: 100,
                                              height: 100,
                                              objectFit: 'contain',
                                          }}
                                      />
                                      <Box>
                                          <Typography variant="body1" fontWeight="bold">
                                              {option.nombre}
                                          </Typography>
                                          <Typography variant="body2" fontWeight="bold">
                                              ${option.valor}
                                          </Typography>
                                      </Box>
                                  </Box>
                              );
                          }}
                          renderInput={(params) => (
                              <TextField
                                  {...params}
                                  label="Quincalleria"
                                  fullWidth
                                  size="small"
                                  required
                              />
                          )}
                      />

                  </Grid>
                  <Grid item xs={12}>
                      <Autocomplete
                          disabled={isSerie}
                          multiple
                          options={perfilesDataPauta}
                          getOptionLabel={(option) => `${option?.codigo} - ${option?.descripcion}`}
                          isOptionEqualToValue={(option, value) => option?.perfilId === (value as Perfil).perfilId}
                          value={(formDataPauta.perfiles || []).map((p) => p.perfil)}
                          onChange={(_event, newValue) =>
                              setFormDataPauta((prev) => ({
                                  ...prev,
                                  perfiles: newValue.map((perfil) => {
                                      const existente = prev.perfiles?.find((p) => p.perfil?.perfilId === perfil?.perfilId);
                                      return {
                                          pautaPerfilId: existente?.pautaPerfilId ?? null,
                                          pautaId: existente?.pautaId ?? null,
                                          perfil,
                                          corte: existente?.corte ?? null,
                                          orientacion: existente?.orientacion ?? "H",
                                          cantidad: existente?.cantidad ?? 1,
                                          variacion: existente?.variacion ?? 0,
                                          dividir: existente?.dividir ?? false,
                                      };
                                  }),
                              }))
                          }
                          renderInput={(params) => (
                              <TextField {...params} label="Perfiles" fullWidth size="small" required />
                          )}
                      />

                  </Grid>

                  <Grid item xs={12}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setOpenVidrioDialog(true)}
                        disabled={isSerie}
                    >
                      Agregar Vidrio
                    </Button>
                  </Grid>

                  {/* Mostrar los vidrios agregados */}
                  <Grid item xs={12} sx={{ mt: 2 }}>
                    {formDataPauta.vidrios && formDataPauta.vidrios.length > 0 && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          {formDataPauta.vidrios.map((vidrio, index) => (
                              <Paper key={index} sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
                                <Box>
                                  <Typography variant="body1" fontWeight="bold">
                                    Vidrio {index + 1}
                                  </Typography>
                                  <Typography variant="body2">Cantidad: {vidrio.cantidad}</Typography>
                                  <Typography variant="body2">Variación Horizontal: {vidrio.variacionH}</Typography>
                                  <Typography variant="body2">Variación Vertical: {vidrio.variacionV}</Typography>
                                  <Typography variant="body2">Fórmula: {vidrio.formula}</Typography>
                                </Box>
                                <Button
                                    color="error"
                                    size="small"
                                    onClick={() =>
                                        setFormDataPauta((prev) => ({
                                            ...prev,
                                            vidrios: (prev.vidrios || []).filter((_, i) => i !== index), // Cambiar vidrio por vidrios
                                        }))
                                    }
                                >
                                  Eliminar
                                </Button>
                              </Paper>
                          ))}
                        </Box>
                    )}
                  </Grid>

                  {/* El diálogo de agregar vidrio */}
                  <Dialog open={openVidrioDialog} onClose={() => setOpenVidrioDialog(false)}>
                    <DialogTitle>Agregar Vidrio</DialogTitle>
                    <DialogContent>
                      <Grid container spacing={2} sx={{ pt: 2 }}>
                        <Grid item xs={12}>
                          <TextField
                              fullWidth
                              label="Cantidad"
                              type="number"
                              value={vidrioData.cantidad === 0 ? "" : vidrioData.cantidad}
                              onChange={(e) =>
                                  setVidrioData((prev) => ({ ...prev, cantidad: Number(e.target.value) }))
                              }
                              size="small"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                              fullWidth
                              label="Variación Horizontal"
                              type="number"
                              value={vidrioData.variacionH === 0 ? "" : vidrioData.variacionH}
                              onChange={(e) =>
                                  setVidrioData((prev) => ({ ...prev, variacionH: Number(e.target.value) }))
                              }
                              size="small"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                              fullWidth
                              label="Variación Vertical"
                              type="number"
                              value={vidrioData.variacionV === 0 ? "" : vidrioData.variacionV}
                              onChange={(e) =>
                                  setVidrioData((prev) => ({ ...prev, variacionV: Number(e.target.value) }))
                              }
                              size="small"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                              fullWidth
                              label="Fórmula"
                              type="text"
                              value={vidrioData.formula}
                              onChange={(e) =>
                                  setVidrioData((prev) => ({ ...prev, formula: e.target.value }))
                              }
                              size="small"
                          />
                        </Grid>
                      </Grid>
                    </DialogContent>
                    <DialogActions>
                      <Button onClick={() => setOpenVidrioDialog(false)} color="primary">
                        Volver
                      </Button>
                      <Button
                          onClick={() => {
                              setFormDataPauta((prev) => ({
                                  ...prev,
                                  vidrios: [...(prev.vidrios || []), vidrioData], // Cambiar vidrio por vidrios
                              }));
                              setVidrioData({
                                  pautaVidrioId: null,
                                  pautaId: null,
                                  cantidad: 0,
                                  variacionH: 0,
                                  variacionV: 0,
                                  formula: "",
                                  vidrioId: null,
                                  nombre: "",
                                  valor: 0,
                              });

                              setOpenVidrioDialog(false);
                          }}
                          color="primary"
                      >
                        Agregar
                      </Button>
                    </DialogActions>
                  </Dialog>
                </Grid>
              </Paper>
              <Box sx={{ paddingTop: '10px' }}>
                <Box
                    sx={{

                      padding: '10px',
                      display: 'flex', // Activa Flexbox
                      justifyContent: 'space-between', // Separa los elementos al máximo
                      alignItems: 'center', // Centra verticalmente los botones
                    }}
                >
                  {/* Botón Volver (a la izquierda) */}
                  <Button
                      color="primary"
                      onClick={() => setMostrarFormulario(false)}
                  >
                    Volver
                  </Button>

                  {/* Botón Agregar (a la derecha) */}
                  <Button
                      disabled={isSerie}
                      type="submit"
                      variant="contained"
                      color="primary"
                  >
                    Agregar
                  </Button>
                </Box>
              </Box>
            </Grid>
          </Grid>

        </Box>

      </Box>
  );
};