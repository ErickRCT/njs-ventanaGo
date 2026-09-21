import {
    Button,
    Container,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    Alert,
    Box,
} from "@mui/material";

import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { Cotizacion } from "../crear-cotizacion/service/interface";
import { getAllCotizaciones } from "./service/apiClient.ts";

import { CrearCotizacion } from "../crear-cotizacion/CrearCotizacion.tsx";

const NuevoInicio = () => {

    const navigate = useNavigate();

    const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [openFormEdit, setOpenFormEdit] = useState(false);
    const [cotizacionEditId, setCotizacionEditId] = useState<number | null>(null);

    const handleCrear = () => {
        navigate("/cotizacion");
    };

    const handleEdit = (id: number | null) => {
        setCotizacionEditId(id);
        setOpenFormEdit(true);
    };

    useEffect(() => {
        console.log("Cotizaciones :" , cotizaciones);
    }, [cotizaciones]);

    useEffect(() => {

        const fetchCotizaciones = async () => {

            try {

                setLoading(true);

                const response = await getAllCotizaciones();

                setCotizaciones(response);

            } catch (err) {

                console.error(err);
                setError("Error al obtener cotizaciones");

            } finally {

                setLoading(false);

            }
        };

        fetchCotizaciones();

    }, []);

    if (openFormEdit) {
        return (
            <Box>

                <Button
                    onClick={() => {
                        setOpenFormEdit(false);
                        setCotizacionEditId(null);
                    }}
                    variant="contained"
                    color="primary"
                    sx={{ mb: 2 }}
                >
                    VOLVER
                </Button>

                <CrearCotizacion id={cotizacionEditId} />

            </Box>
        );
    }


    return (
        <Container>

            {/* BOTÓN */}
            <Button
                variant="contained"
                color="primary"
                onClick={handleCrear}
                sx={{ mb: 3 }}
            >
                Crear Cotización
            </Button>

            {/* LOADING */}
            {loading && <CircularProgress />}

            {/* ERROR */}
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {/* TABLA */}
            {!loading && (
                <TableContainer component={Paper}>

                    <Table size="small">

                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Nombre</TableCell>
                                <TableCell>Cliente</TableCell>
                                <TableCell>Fecha</TableCell>
                                <TableCell>Total</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>

                            {[...cotizaciones]
                                .sort(
                                    (a, b) =>
                                        (b.cotizacionId ?? 0) -
                                        (a.cotizacionId ?? 0)
                                )
                                .map((cotizacion) => (

                                    <TableRow
                                        key={cotizacion.cotizacionId}
                                        hover
                                        onClick={() =>
                                            handleEdit(cotizacion.cotizacionId)
                                        }
                                        sx={{
                                            cursor: "pointer",
                                            "&:hover td": {
                                                backgroundColor: "#eeeeee",
                                            },
                                        }}
                                    >

                                        <TableCell>
                                            {cotizacion.cotizacionId}
                                        </TableCell>

                                        <TableCell>
                                            {cotizacion.nombreCotizacion}
                                        </TableCell>

                                        <TableCell>
                                            {cotizacion.cliente?.nombre}
                                        </TableCell>

                                        <TableCell>
                                            {new Date(cotizacion.fecha).toLocaleDateString("es-CL")}
                                        </TableCell>

                                        <TableCell>
                                            $
                                            {cotizacion.valorFinal}
                                        </TableCell>

                                    </TableRow>

                                ))}

                        </TableBody>

                    </Table>

                </TableContainer>
            )}

        </Container>
    );
};

export default NuevoInicio;