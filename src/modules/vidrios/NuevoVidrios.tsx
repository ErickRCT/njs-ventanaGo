import {
    Card,
    Box,
    TableRow,
    TableCell,
    TableHead,
    Table,
    TableBody,
    TableFooter,
    Dialog, DialogTitle, DialogContent, type TablePaginationProps,
} from "@mui/material";
import {ChangeEvent, useEffect, useMemo, useState} from "react";
import {Vidrio} from "./service/interface.ts";
import {getAllVidrio, postVidrio, putVidrio} from "./service/apiClient.ts";
import {FormularioVidrios} from "./formulario-vidrios/FormularioVidrios.tsx";
import {TableSkeleton} from "../../components/TableSkeleton.tsx";
import {EmptyState} from "../../components/EmptyState.tsx";
import VidrioRow from "./VidrioRow.tsx";
import {ErrorDisplay} from "../../components/ErrorDisplay.tsx";
import {PaginationTable} from "../../components/PaginationTable.tsx";
import ToolbarTable from "../../components/ToolbarTable.tsx";


export const NuevoVidrios = () => {
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [vidrios, setVidrios] = useState<Vidrio[]>([]);
    const [mostrarFormulario, setMostrarFormulario] = useState<boolean>(false);
    const [filteredVidrios, setFilteredVidrios] = useState<Vidrio[]>([]);
    const [search, setSearch] = useState("");
    const [errorCarga, setErrorCarga] = useState<Error | null>(null);
    const [vidrioSeleccionado, setVidrioSeleccionado] = useState<Vidrio | null>(null);



    const handleChangePage: TablePaginationProps['onPageChange'] = (_, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };


    const vidriosPaginados = useMemo(() => {
        return rowsPerPage > 0
            ? filteredVidrios.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            : filteredVidrios;
    }, [filteredVidrios, page, rowsPerPage]);



    const handleFormSubmit = async (data: Vidrio) => {
        try {

            if (data.vidrioId) {
                console.log("vidrio antes del put : ",data);
                await putVidrio(data); // editar

            } else {
                await postVidrio(data); // crear
            }

            await getVidrios();

        } catch (error) {
            console.error("Error handleFormSubmit:", error);
            throw error;
        }
    };

    const handleEditar = (vidrio: Vidrio) => {
        setVidrioSeleccionado(vidrio);
        setMostrarFormulario(true);
    };

    const getVidrios = async () => {
        try {
            setLoading(true);
            setErrorCarga(null);
            const response: Vidrio[] = await getAllVidrio();
            const vidriosOrdenados = response.sort((a, b) => b.vidrioId - a.vidrioId);
            setVidrios(vidriosOrdenados);
            setFilteredVidrios(vidriosOrdenados);
        } catch (error) {
            console.error("Error getVidrios :", error);
            setErrorCarga(error instanceof Error ? error : new Error('Error al cargar los vidrios'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getVidrios();
    }, []);

    //para limpiar el estado cuando se cierre el Dialog
    useEffect(() => {
        if(!mostrarFormulario) {
            setVidrioSeleccionado(null)
        }
    }, [mostrarFormulario]);

    useEffect(() => {
        if (!search.trim()) {
            setFilteredVidrios(vidrios);
            return;
        }
        const term = search.trim().toLowerCase();
        const filtradas = vidrios.filter(v =>
            `${v.vidrioId}`.includes(term) ||
            v.nombre.toLowerCase().includes(term)
        );
        setPage(0);
        setFilteredVidrios(filtradas);
    }, [search, vidrios]);


    const renderTableContent = () => {
        if (loading) return <TableSkeleton />;
        if (vidriosPaginados.length === 0) return <EmptyState />;

        return vidriosPaginados.map(vidrio => (
            <VidrioRow
                vidrio={vidrio}
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
                        Filtra y muestra los vidrios registrados según el ID y el nombre.
                    </>
                }
                agregarDescripcion={
                    <>
                        Agregar un nuevo vidrio asignando un nombre y valor.
                    </>
                }
                placeHolderBuscador={"Nombre , Valor ..."}
            />

            <Dialog
                open={mostrarFormulario}
                onClose={() => setMostrarFormulario(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    {vidrioSeleccionado ? 'Editar Vidrio' : 'Nuevo Vidrio'}
                </DialogTitle>
                <DialogContent sx={{mt:"16px"}}>

                    <FormularioVidrios
                        onSubmit={handleFormSubmit}
                        setMostrarFormulario={setMostrarFormulario}
                        vidrioEdit={vidrioSeleccionado}
                    />


                </DialogContent>

            </Dialog>

            <Box sx={{ overflowX: 'auto' }}>
                {errorCarga ? (

                    <ErrorDisplay
                        onRetry={getVidrios}
                        title={"Error al cargar los vidrios"}
                        message={"Ocurrió un error al intentar obtener la lista de vidrios. Porfavor Intenta nuevamente."} />

                    ):(

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
                            count={filteredVidrios.length}
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