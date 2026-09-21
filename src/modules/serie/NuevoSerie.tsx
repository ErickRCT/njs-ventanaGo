import {
    Card,
    Box,
    TableRow,
    TableCell,
    TableHead,
    Table,
    TableBody,
    TableFooter,
    Dialog,
    DialogTitle,
    DialogContent, type TablePaginationProps,
} from "@mui/material";
import {useEffect, useState, useMemo, ChangeEvent} from "react";
import { SerieInterface } from "./service/interface.ts";
import { getAllSeries, postSerie , putSerie } from "./service/apiClient.ts";
import { FormularioSerie } from "./formulario-serie/FormularioSerie.tsx";
import {TableSkeleton} from "../../components/TableSkeleton.tsx";
import {EmptyState} from "../../components/EmptyState.tsx";
import SerieRow from "./SerieRow.tsx";
import {PaginationTable} from "../../components/PaginationTable.tsx";
import {ErrorDisplay} from "../../components/ErrorDisplay.tsx";
import ToolbarTable from "../../components/ToolbarTable.tsx";

export const NuevoSerie = () => {
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [series, setSeries] = useState<SerieInterface[]>([]);
    const [filteredSeries, setFilteredSeries] = useState<SerieInterface[]>([]);
    const [search, setSearch] = useState("");
    const [mostrarFormulario, setMostrarFormulario] = useState<boolean>(false);
    const [errorCarga, setErrorCarga] = useState<Error | null>(null);
    const [serieSeleccionada, setSerieSeleccionada] = useState<SerieInterface | null>(null);

    const handleChangePage: TablePaginationProps['onPageChange'] = (_, newPage) => {
        setPage(newPage);
    };


    const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleFormSubmit = async (data: SerieInterface) => {
        try {

            if (data.serieId) {
                console.log("serie antes del put : ",data);
                await putSerie(data); // editar

            } else {
                await postSerie(data); // crear
            }

            await getSeries();

        } catch (error) {
            console.error("Error handleFormSubmit:", error);
            throw error;
        }
    };

    const handleEditar = (serie: SerieInterface) => {
        setSerieSeleccionada(serie);
        setMostrarFormulario(true);
    };

    const getSeries = async () => {
        try {
            setLoading(true);
            setErrorCarga(null);
            const response: SerieInterface[] = await getAllSeries();
            const seriesOrdenados = response.sort((a, b) => b.serieId! - a.serieId!);
            setSeries(seriesOrdenados);
            setFilteredSeries(seriesOrdenados);
        } catch (error) {
            console.error("Error getSeries:", error);
            setErrorCarga(error instanceof Error ? error : new Error('Error al cargar las series'));

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getSeries();
    }, []);

//para limpiar el estado cuando se cierre el Dialog
    useEffect(() => {
        if(!mostrarFormulario) {
            setSerieSeleccionada(null)
        }
    }, [mostrarFormulario]);

    useEffect(() => {
        if (!search.trim()) {
            setFilteredSeries(series);
            return;
        }
        const term = search.trim().toLowerCase();
        const filtradas = series.filter(s =>
            `${s.serieId}`.includes(term) ||
            s.nombre.toLowerCase().includes(term) ||
            s.descripcion?.toLowerCase().includes(term)
        );
        setPage(0);
        setFilteredSeries(filtradas);
    }, [search, series]);

    const seriesPaginados = useMemo(() => {
        return rowsPerPage > 0
            ? filteredSeries.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            : filteredSeries;
    }, [filteredSeries, page, rowsPerPage]);

    const renderTableContent = () => {
        if (loading) return <TableSkeleton />;
        if (seriesPaginados.length === 0) return <EmptyState />;

        return seriesPaginados.map(serie => (
            <SerieRow
                serie={serie}
                onEdit={handleEditar}
            />
        ));
    };


    return (
        <Card>

            <ToolbarTable
                errorCarga={errorCarga}
                setSearch={setSearch}
                setOpenForm={setMostrarFormulario}
                busquedaDescripcion={
                    <>
                        Filtra y muestra las series registradas según el ID, nombre y descripcion.
                    </>
                }
                agregarDescripcion={
                    <>
                        Agregar una nueva serie con nombre y descripcion.
                    </>
                }
                placeHolderBuscador={"Nombre , Descripcion ..."}
            />


            <Dialog
                open={mostrarFormulario}
                onClose={() => setMostrarFormulario(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    {serieSeleccionada ? 'Editar Serie' : 'Nueva Serie'}
                </DialogTitle>
                <DialogContent sx={{ mt: "16px" }}>
                    <FormularioSerie
                        onSubmit={handleFormSubmit}
                        setMostrarFormulario={setMostrarFormulario}
                        serieEdit={serieSeleccionada}
                    />
                </DialogContent>
            </Dialog>

            <Box sx={{ overflowX: 'auto' }}>

                {errorCarga ? (

                    <ErrorDisplay
                        onRetry={getSeries}
                        title={"Error al cargar las series"}
                        message={"Ocurrió un error al intentar obtener la lista de series. Porfavor Intenta nuevamente."} />
                    ) : (

                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Nombre</TableCell>
                            <TableCell>Descripcion</TableCell>
                            <TableCell>Acciones</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody sx={{ backgroundColor: "rgba(255, 255, 255, 0.6)" }}>
                        {renderTableContent()}
                    </TableBody>

                    <TableFooter>
                            <PaginationTable
                                count={filteredSeries.length}
                                page={page}
                                rowsPerPage={rowsPerPage}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                            />
                    </TableFooter>
                </Table>

                    )}
            </Box>
        </Card>
    );
};
