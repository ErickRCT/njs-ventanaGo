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
import {ChangeEvent, useEffect, useMemo, useState} from "react";
import {ColorInterface} from "./service/interface.ts";
import {getAllColor, postColor, putColor} from "./service/apiClient.ts";
import {FormularioColor} from "./formulario-color/FormularioColor.tsx";
import {ErrorDisplay} from "../../components/ErrorDisplay.tsx";
import {TableSkeleton} from "../../components/TableSkeleton.tsx";
import {EmptyState} from "../../components/EmptyState.tsx";
import {PaginationTable} from "../../components/PaginationTable.tsx";
import ColorRow from "./ColorRow.tsx";
import ToolbarTable from "../../components/ToolbarTable.tsx";

export const NuevoColor = () => {
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [colores, setColores] = useState<ColorInterface[]>([]);
    const [mostrarFormulario, setMostrarFormulario] = useState<boolean>(false);
    const [filteredColores, setFilteredColores] = useState<ColorInterface[]>([]);
    const [search, setSearch] = useState("");
    const [errorCarga, setErrorCarga] = useState<Error | null>(null);
    const [colorSeleccionado, setColorSeleccionado] = useState<ColorInterface | null>(null);

    const handleChangePage: TablePaginationProps['onPageChange'] = (_, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };


    const coloresPaginados = useMemo(() => {
        return rowsPerPage > 0
            ? filteredColores.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            : filteredColores;
    }, [filteredColores, page, rowsPerPage]);


    const handleFormSubmit = async (data: ColorInterface) => {
        try {

            if (data.colorId) {
                console.log("color antes del put : ",data);
                await putColor(data); // editar

            } else {
                await postColor(data); // crear
            }

            await getColores();

        } catch (error) {
            console.error("Error handleFormSubmit:", error);
            throw error;
        }
    };

    const handleEditar = (color: ColorInterface) => {
        setColorSeleccionado(color);
        setMostrarFormulario(true);
    };

    const getColores = async () => {
        try {
            setLoading(true);
            setErrorCarga(null);
            const response: ColorInterface[] = await getAllColor();
            const coloresOrdenados = response.sort((a, b) => b.colorId! - a.colorId!);
            setColores(coloresOrdenados);
            setFilteredColores(coloresOrdenados);
        } catch (error) {
            console.error("Error getColores :", error);
            setErrorCarga(error instanceof Error ? error : new Error('Error al cargar los colores'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getColores();
    }, []);

    //para limpiar el estado cuando se cierre el Dialog
    useEffect(() => {
        if(!mostrarFormulario) {
            setColorSeleccionado(null)
        }
    }, [mostrarFormulario]);

    useEffect(() => {
        if (!search.trim()) {
            setFilteredColores(colores);
            return;
        }
        const term = search.trim().toLowerCase();
        const filtradas = colores.filter(c =>
            `${c.colorId}`.includes(term) ||
            c.nombre.toLowerCase().includes(term)
        );
        setPage(0);
        setFilteredColores(filtradas);
    }, [search, colores]);


    const renderTableContent = () => {
        if (loading) return <TableSkeleton />;
        if (coloresPaginados.length === 0) return <EmptyState />;

        return coloresPaginados.map(color => (
            <ColorRow color={color} onEdit={handleEditar}/>
        ));
    };

    return (
        <Card>

            <ToolbarTable
                busquedaDescripcion={
                    <>
                        Filtra y muestra los colores registradas según el ID y el nombre del color
                    </>
                }
                agregarDescripcion={
                    <>
                        Agregar un nuevo color con nombre y valor.
                    </>
                }

                errorCarga={errorCarga}
                setSearch={setSearch}
                setOpenForm={setMostrarFormulario}

                placeHolderBuscador={"Nombre y Valor ..."}
            />



            <Dialog
                open={mostrarFormulario}
                onClose={() => setMostrarFormulario(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    {colorSeleccionado ? 'Editar Color' : 'Nuevo Color'}
                </DialogTitle>
                <DialogContent sx={{mt:"16px"}}>
                    <FormularioColor
                        onSubmit={handleFormSubmit}
                        setMostrarFormulario={setMostrarFormulario}
                        colorEdit={colorSeleccionado}
                    />
                </DialogContent>
            </Dialog>

            <Box sx={{ overflowX: 'auto' }}>
                {errorCarga ? (

                        <ErrorDisplay
                            onRetry={getColores}
                            title={"Error al cargar los colores"}
                            message={"Ocurrió un error al intentar obtener la lista de colores. Porfavor Intenta nuevamente."} />

                ) :  (
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Nombre</TableCell>
                                <TableCell>Valor</TableCell>
                                <TableCell>Acciones</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody sx={{ backgroundColor: "rgba(255, 255, 255, 0.6)" }}>
                            {renderTableContent()}
                        </TableBody>

                        <TableFooter>
                            <PaginationTable
                                count={filteredColores.length}
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