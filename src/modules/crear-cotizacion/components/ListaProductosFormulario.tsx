import React from "react";
import {
    Box,
    Grid,
    Typography,
    Collapse,
    Alert
} from "@mui/material";

import { FormularioProducto } from "./FormularioProducto";
import {
    productBoxStyles,
    productListBoxStyles
} from "../crearCotizacionStyles";

import { ListaProductosFormularioProps } from "../crearCotizacionInterface";
import { urlImagen } from '../../../utils/imagenes.ts';

const ListaProductosFormulario: React.FC<ListaProductosFormularioProps> = ({
                                                                               altoReforzado,
                                                                               anchoReforzado,
                                                                               isReforzado,
                                                                               pautasData,
                                                                               isListOpen,
                                                                               isFormOpen,
                                                                               selectedProduct,
                                                                               selectedProductImage,
                                                                               openForm,
                                                                               closeForm,
                                                                               closeList,
                                                                               handleFormSubmit,
                                                                               vidriosData,
                                                                               coloresData,
                                                                           }) => {
    return (
        <Box sx={productListBoxStyles}>
            {pautasData.length === 0 && (
                <Alert severity="info">
                    Selecciona una serie para comenzar
                </Alert>
            )}

            {/* Vista de listado */}
            <Collapse in={isListOpen}>
                <Box sx={{ p: 2 }}>
                    <Grid container spacing={3}>
                        {pautasData.map((producto, index) => (
                            <Grid
                                item
                                xs={6}
                                sm={6}
                                md={4}
                                key={index}
                                sx={{
                                    display: "flex",
                                }}
                            >
                                <Box
                                    onClick={() => {
                                        closeList();
                                        openForm(producto);
                                    }}
                                    sx={{
                                        ...productBoxStyles,
                                        width: "100%",
                                        height: 230,
                                        display: "flex",
                                        flexDirection: "column",
                                    }}
                                >
                                    {/* Imagen */}
                                    <Box
                                        sx={{
                                            height: 140,
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            overflow: "hidden",
                                            p: 1,
                                        }}
                                    >
                                        <img
                                            src={urlImagen(producto.tipoPauta?.rutaImagen)}
                                            alt={`Producto ${index + 1}`}
                                            onError={(e) => {
                                                e.currentTarget.src = "/images/no-image.png";
                                            }}
                                            style={{
                                                maxWidth: "100%",
                                                maxHeight: "100%",
                                                objectFit: "contain",
                                            }}
                                        />
                                    </Box>

                                    {/* Nombre */}
                                    <Box
                                        sx={{
                                            marginTop:1,
                                            height: 50,
                                            px: 1,
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                        }}
                                    >
                                        <Typography
                                            variant="body2"
                                            align="center"
                                            sx={{
                                                fontWeight: 600,
                                                fontSize: {
                                                    xs: "0.70rem",
                                                    sm: "0.75rem",
                                                    md: "0.80rem",
                                                    lg: "0.875rem",
                                                },
                                                lineHeight: 1.3,
                                                overflowWrap: "break-word",
                                                wordBreak: "break-word",
                                            }}
                                        >
                                            {producto.nombre}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            </Collapse>

            {/* Vista del formulario */}
            <Collapse in={isFormOpen}>
                <Box>
                    <FormularioProducto
                        altoReforzado={altoReforzado}
                        anchoReforzado={anchoReforzado}
                        isReforzado={isReforzado}
                        closeForm={closeForm}
                        onSubmit={handleFormSubmit}
                        productDescription={selectedProduct}
                        productoImage={selectedProductImage}
                        vidriosData={vidriosData}
                        coloresData={coloresData}
                    />
                </Box>
            </Collapse>
        </Box>
    );
};

export default ListaProductosFormulario;