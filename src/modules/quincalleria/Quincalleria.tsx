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
    DialogContent,
    DialogActions,
    Alert,
    Button,
    type TablePaginationProps,
} from "@mui/material";
import {ChangeEvent, useEffect, useMemo, useState} from "react";
import {deleteQuincalleria, getAllQuincalleria} from "./service/apiClient.ts";
import {TableSkeleton} from "../../components/TableSkeleton.tsx";
import {EmptyState} from "../../components/EmptyState.tsx";
import {ErrorDisplay} from "../../components/ErrorDisplay.tsx";
import {PaginationTable} from "../../components/PaginationTable.tsx";
import ToolbarTable from "../../components/ToolbarTable.tsx";
import {QuincalleriaInterface} from "./service/interface.ts";
import QuincalleriaRow from "./QuincalleriaRow.tsx";
import {FormularioQuincalleria} from "./formulario-quincalleria/FormularioQuincalleria.tsx";


export const Quincalleria = () => {
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [expandedRowId, setExpandedRowId] = useState<number | null>(null);
    const [quincalleria, setQuincalleria] = useState<QuincalleriaInterface[]>([]);
    const [openForm, setOpenForm] = useState<boolean>(false);
    const [errorCarga, setErrorCarga] = useState<Error | null>(null);
    const [filteredQuincalleria, setFilteredQuincalleria] = useState<QuincalleriaInterface[]>([]);
    const [search, setSearch] = useState("");
    const [editData, setEditData] = useState<QuincalleriaInterface | null>(null);
    const [dialogoEliminar, setDialogoEliminar] = useState(false);
    const [quincalleriaAEliminar, setQuincalleriaAEliminar] = useState<QuincalleriaInterface | null>(null);


    const handleChangePage: TablePaginationProps['onPageChange'] = (_, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (
        event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleToggleRow = (clienteId:number|null) => {
        setExpandedRowId(expandedRowId === clienteId ? null : clienteId);
    };


    const handleSubmit = async () => {
        await getQuincalleria();
        setEditData(null);
        setOpenForm(false);
    };

    const handleCancel = () => {
        setEditData(null);
        setOpenForm(false);
    };

    const handleEdit = async (quincalleria : QuincalleriaInterface) => {
        setEditData(quincalleria)
        setOpenForm(true);
    };

    const handleDeleteClick = (quincalleria: QuincalleriaInterface) => {
        setQuincalleriaAEliminar(quincalleria);
        setDialogoEliminar(true);
    };


    const getQuincalleria = async () => {

        try {
            setLoading(true);
            setErrorCarga(null);
            const response = await getAllQuincalleria();
            const quincalleriaOrdenados = response.sort((a, b) => b.quincalleriaId! - a.quincalleriaId!);
            setQuincalleria(quincalleriaOrdenados);
            setFilteredQuincalleria(quincalleriaOrdenados);
            console.log("Data Quincalleria : ",quincalleriaOrdenados);

        } catch (error) {
            console.error("Error al obtener las Quincallerias:", error);
            setErrorCarga(error instanceof Error ? error : new Error('Error al cargar las Quincallerias'));
        } finally {setLoading(false)}
    };

    const confirmarEliminar = async () => {

        if (!quincalleriaAEliminar) return;

        try {
            setLoading(true);
            setErrorCarga(null);

            await deleteQuincalleria(quincalleriaAEliminar.quincalleriaId);

            await getQuincalleria();

            setDialogoEliminar(false);
            setQuincalleriaAEliminar(null);

        } catch (error) {
            console.error("Error delete quincalleria:", error);
            setErrorCarga(
                error instanceof Error
                    ? error
                    : new Error('Error Delete Quincallerias')
            );
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        getQuincalleria()
    }, []);


    useEffect(() => {
        if (!search.trim()) {
            setFilteredQuincalleria(quincalleria);
            return;
        }
        const term = search.trim().toLowerCase();
        const filtradas = quincalleria.filter(q =>
            `${q.quincalleriaId}`.includes(term) ||
            q.nombre.toLowerCase().includes(term) ||
            q.unidad.toLowerCase().includes(term) ||
            q.serie?.nombre.toLowerCase().includes(term) ||
            q.serie?.descripcion.toLowerCase().includes(term)
        );
        setPage(0);
        setFilteredQuincalleria(filtradas);
    }, [search, quincalleria]);

    const quincalleriaPaginados = useMemo(() => {
        return rowsPerPage > 0
            ? filteredQuincalleria.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            : filteredQuincalleria;
    }, [filteredQuincalleria, page, rowsPerPage]);

    const renderTableContent = () => {
        if (loading) return <TableSkeleton />;
        if (quincalleriaPaginados.length === 0) return <EmptyState />;

        return quincalleriaPaginados.map(quincalleria => (
            <QuincalleriaRow
                key={quincalleria.quincalleriaId}
                quincalleria={quincalleria}
                deleteQuincalleria={() => handleDeleteClick(quincalleria)}
                editQuincalleria={handleEdit}
                expanded={expandedRowId === quincalleria.quincalleriaId}
                onToggle={() => handleToggleRow(quincalleria.quincalleriaId)}/>
        ));
    };

    if (openForm) {
        return <FormularioQuincalleria onSubmit={handleSubmit} onCancel={handleCancel} quincalleriaEdit={editData} />;
    }


    return (
        <Card>

            <ToolbarTable
                errorCarga={errorCarga}
                setSearch={setSearch}
                setOpenForm={setOpenForm}
                busquedaDescripcion={
                    <>
                        Filtra y muestra las quincallerias registradas según el ID, nombre , unidad y otros datos ingresados.
                    </>
                }
                agregarDescripcion={
                    <>
                        Agregar una nueva quincalleria con serie, tipos de perfiles , vidrios y otros datos requeridos.
                    </>
                }
                placeHolderBuscador={"Nombre , Unidad , Valor ..."}
            />

            <Box sx={{ overflowX: 'auto' }}>

                {errorCarga? (

                    <ErrorDisplay
                        onRetry={getQuincalleria}
                        title={"Error al cargar las quincallerias"}
                        message={"Ocurrió un error al intentar obtener la lista de quincallerias. Porfavor Intenta nuevamente."} />
                ) : (

                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell padding="checkbox"></TableCell>
                                <TableCell>Nombre</TableCell>
                                <TableCell>Unidad</TableCell>
                                <TableCell>Valor</TableCell>
                                <TableCell>Imagen</TableCell>
                                <TableCell>Acciones</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody sx={{ backgroundColor: "rgba(255, 255, 255, 0.6)" }}>
                            {renderTableContent()}
                        </TableBody>

                        <TableFooter>
                            <PaginationTable
                                count={filteredQuincalleria.length}
                                page={page}
                                rowsPerPage={rowsPerPage}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                            />
                        </TableFooter>
                    </Table>

                )}
            </Box>

            <Dialog
                maxWidth="sm"
                fullWidth
                open={dialogoEliminar}
                onClose={() => setDialogoEliminar(false)}
            >
                <DialogTitle>
                    Eliminar Quincallería
                </DialogTitle>

                <DialogContent sx={{ mt: 2, py: 2 }}>
                    <Alert severity="warning">
                        ¿Estás seguro de que deseas eliminar la quincallería
                        <strong> {quincalleriaAEliminar?.nombre}</strong>?
                        <br />
                        <br />
                        <strong>Esta acción no se puede deshacer.</strong>
                    </Alert>
                </DialogContent>

                <DialogActions>
                    <Button
                        onClick={() => {
                            setDialogoEliminar(false);
                            setQuincalleriaAEliminar(null);
                        }}
                        color="primary"
                        variant="outlined"
                    >
                        Cancelar
                    </Button>

                    <Button
                        onClick={confirmarEliminar}
                        color="error"
                        variant="contained"
                    >
                        Eliminar
                    </Button>
                </DialogActions>
            </Dialog>
        </Card>
    );
};