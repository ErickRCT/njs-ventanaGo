import React from "react";
import { List, ListItem, ListItemText, Typography, Box } from "@mui/material";
import { listItemStyles, modelListScrollBoxStyles, modelListPrincipalBoxStyles } from "../crearCotizacionStyles";
import { ListaModelosProps } from "../crearCotizacionInterface";
import useWindowDimensions from "../../../hooks/useWindowDimensions.ts";


const ListaModelos: React.FC<ListaModelosProps> = ({
  modelosData,
  selectedModel,
  setSelectedModel,
  openList,
  closeForm,
}) => {

    const {width} = useWindowDimensions();

  return (
    <Box sx={{
        ...modelListPrincipalBoxStyles, // Estilos base
        maxWidth: width > 600 ? "400px" : "none", // Estilo condicional
        marginBottom: width > 600 ? "0" : "20px",
    }}>
      <Typography variant="h5" gutterBottom>
        Selecciona una Serie
      </Typography>
      <Box sx={modelListScrollBoxStyles}>
        <List>
          {Object.values(modelosData).map((item, index) => (
            <ListItem
              key={index}
              button
              onClick={() => {
                setSelectedModel(item.serieId);
                openList();
                closeForm();
              }}
              sx={listItemStyles(selectedModel, item.serieId)}
            >
              <ListItemText primary={item.nombre} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );
};

export default ListaModelos;
