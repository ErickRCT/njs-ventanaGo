import { Box, Button, List, ListItem, Typography } from "@mui/material";
import { ProductosAgregadosProps } from "../crearCotizacionInterface";
import { deleteVentana, getCotizacion } from "../service/apiClient";
import { Cotizacion } from "../service/interface";
import { urlImagen } from '../../../utils/imagenes.ts';

const ProductosAgregados = ({ cotizacion , setCotizacion }: ProductosAgregadosProps) => {

  const handleDelete = async (ventanaId: number | null) => {
    console.log("ventanaId al eliminar:", ventanaId);

    if (ventanaId === null) {
      console.error("No se puede eliminar: ventanaId es null");
      return;
    }

    try {

      await deleteVentana(ventanaId);
      console.log("Ventana eliminada exitosamente");

      const cotizacionActualizada: Cotizacion = await getCotizacion(cotizacion.cotizacionId);
      console.log("Cotización actualizada al eliminar:", cotizacionActualizada);

      setCotizacion(cotizacionActualizada);

    } catch (error) {
      console.error("Error en handleDelete:", error);
    }
  };


  return (
    <Box sx={{ width: { xs: "100%", md: "60%" } }}>
      <List>
        {cotizacion.ventanas.map((product) => (
          <ListItem
            key={product.ventanaId}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: 2,
              border: "1px solid #ddd",
              borderRadius: "8px",
              marginBottom: 2,
              flexWrap: "wrap",
            }}
          >
            <Box sx={{ width: "100%", mb: 1 }}>
              <Typography
                  variant="subtitle2"
                  fontWeight="bold"
                  sx={{ color: "#1976d2" }}
              >
                {product.descripcion || "Sin descripción"}
              </Typography>
            </Box>
            {/* Información del Producto */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
              <img
                src={urlImagen(product.pauta?.tipoPauta.rutaImagen)}
                
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "8px",
                  objectFit: "cover",
                }}
              />

              <Box sx={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                <Box>
                  <Typography variant="body1" fontWeight="bold">
                    Cantidad:
                  </Typography>
                  <Typography variant="body2">{product.cantidad}</Typography>
                  <Typography variant="body1" fontWeight="bold">
                    Precio:
                  </Typography>
                  <Typography variant="body2">
                    ${new Intl.NumberFormat("es-ES").format(product.precioNeto ?? 0)}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body1" fontWeight="bold">
                    Alto:
                  </Typography>
                  <Typography variant="body2">{product.alto} mm</Typography>
                  <Typography variant="body1" fontWeight="bold">
                    Ancho:
                  </Typography>
                  <Typography variant="body2">{product.ancho} mm</Typography>
                </Box>

                <Box>
                  <Typography variant="body1" fontWeight="bold">
                    Color:
                  </Typography>
                  <Typography variant="body2">{product.color?.nombre ?? "N/A"}</Typography>
                  <Typography variant="body1" fontWeight="bold">
                    Vidrio:
                  </Typography>
                  <Typography variant="body2">{product.vidrio?.nombre ?? "N/A"}</Typography>
                </Box>

                {/* {product.obs && (
                  <Box sx={{ maxWidth: "100%", wordWrap: "break-word", overflowWrap: "break-word" }}>
                    <Typography variant="body1" fontWeight="bold">
                      Observaciones:
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        overflowWrap: "break-word",
                      }}
                    >
                      {product.obs}
                    </Typography>
                  </Box>
                )} */}
              </Box>
            </Box>

            {/* Botones de Acción */}
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              
              <Button
                onClick={() => handleDelete(product.ventanaId)}
                variant="contained"
                color="error"
                size="small"
                sx={{
                  textTransform: "none",
                  padding: "4px 8px",
                  fontSize: "0.8rem",
                  minWidth: "auto",
                }}
              >
                Eliminar
              </Button>
            </Box>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default ProductosAgregados;
