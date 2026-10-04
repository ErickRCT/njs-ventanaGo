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
    Button
} from "@mui/material";
import type { TablePaginationProps } from '@mui/material';
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { Pauta } from "./service/interface.ts";
import {deletePauta, getAllPautas} from "./service/apiClient.ts";
import {StepperPauta} from "./StepperPauta.tsx";
import {TableSkeleton} from "../../components/TableSkeleton.tsx";
import {ErrorDisplay} from "../../components/ErrorDisplay.tsx";
import {EmptyState} from "../../components/EmptyState.tsx";
import {PaginationTable} from "../../components/PaginationTable.tsx";
import ToolbarTable from "../../components/ToolbarTable.tsx";
import PautaRow from "./PautaRow.tsx";


export const NuevoPautas = () => {
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [expandedRowId, setExpandedRowId] = useState<number | null>(null);
    const [pautas, setPautas] = useState<Pauta[]>([]);
    const [filteredPautas, setFilteredPautas] = useState<Pauta[]>([]);
    const [search, setSearch] = useState("");
    const [openForm, setOpenForm] = useState(false);
    const [errorCarga, setErrorCarga] = useState<Error | null>(null);
    const [editData, setEditData] = useState<Pauta | null>(null);
    const [dialogoEliminar, setDialogoEliminar] = useState(false);
    const [pautaAEliminar, setPautaAEliminar] = useState<Pauta | null>(null);
    const [dialogoPautaEnUso, setDialogoPautaEnUso] = useState(false);

    const handleChangePage: TablePaginationProps['onPageChange'] = (_, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleToggleRow = (pautaId: number | null) => {
        setExpandedRowId(current => current === pautaId ? null : pautaId);
    };

    const handleSubmit = async () => {
        await getPautas();
        setEditData(null);
        setOpenForm(false);
    };

    const handleEdit = (pauta: Pauta) => {
        setEditData(pauta);
        setOpenForm(true);
    };

    const handleDeleteClick = (pauta: Pauta) => {
        setPautaAEliminar(pauta);
        setDialogoEliminar(true);
    };

    const confirmarEliminar = async () => {

        if (pautaAEliminar?.pautaId == null) return;

        try {
            setLoading(true);
            setErrorCarga(null);

            await deletePauta(pautaAEliminar.pautaId);

            await getPautas();

            setDialogoEliminar(false);
            setPautaAEliminar(null);

        } catch (error: any) {

            console.error("Error delete pauta:", error);

            if (error?.response?.status === 500) {
                setDialogoEliminar(false);
                setDialogoPautaEnUso(true);
                return;
            }

            setErrorCarga(
                error instanceof Error
                    ? error
                    : new Error('Error Delete pautas')
            );

        } finally {
            setLoading(false);
        }
    };

    const pautasPaginados = useMemo(() => {
        return rowsPerPage > 0
            ? filteredPautas.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            : filteredPautas;
    }, [filteredPautas, page, rowsPerPage]);

    const getPautas = async () => {
        try {
            setLoading(true);
            setErrorCarga(null);
            const response = await getAllPautas();
            const pautasOrdenados = response.sort((a, b) => (b.pautaId ?? 0) - (a.pautaId ?? 0));
            setPautas(pautasOrdenados);
            setFilteredPautas(pautasOrdenados);
        } catch (error) {
            console.error("Error getPautas:", error);
            setErrorCarga(error instanceof Error ? error : new Error('Error al cargar las pautas'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getPautas();
    }, []);

    useEffect(() => {
        if(!openForm) {
            setEditData(null);
        }
    }, [openForm]);



    useEffect(() => {
        if (!search.trim()) {
            setFilteredPautas(pautas);
            return;
        }
        const term = search.trim().toLowerCase();
        const filtradas = pautas.filter(p =>
            `${p.pautaId}`.includes(term) ||
            p.nombre.toLowerCase().includes(term) ||
            p.descripcion?.toLowerCase().includes(term) ||
            p.tipoPauta?.nombre.toLowerCase().includes(term) ||
            p.quincallerias?.some(q => q.quincalleria.nombre?.toLowerCase()?.includes(term)) ||
            p.perfiles?.some(p => p.perfil?.descripcion?.toLowerCase()?.includes(term))
        );
        setPage(0);
        setFilteredPautas(filtradas);
    }, [search, pautas]);

    const renderTableContent = () => {
        if (loading) return <TableSkeleton />;
        if (pautasPaginados.length === 0) return <EmptyState />;

        return pautasPaginados.map(pauta => (
            <PautaRow
                key={pauta.pautaId}
                pauta={pauta}
                expanded={expandedRowId === pauta.pautaId}
                onToggle={() => handleToggleRow(pauta.pautaId ?? null)}
                editPauta={handleEdit}
                deletePauta={() => handleDeleteClick(pauta)}
            />
        ));
    };

    if (openForm) {
        return <StepperPauta onSubmit={handleSubmit} setMostrarFormulario={setOpenForm} pautaEdit={editData} />;
    }

    return (
        <Card>
            <ToolbarTable
                errorCarga={errorCarga}
                setSearch={setSearch}
                setOpenForm={setOpenForm}
                busquedaDescripcion={
                    <>
                        Filtra y muestra las pautas registradas según el ID, nombre , tipo pauta u otros datos ingresados.
                    </>
                }
                agregarDescripcion={
                    <>
                        Agregar una nueva pauta con medidas, tipos de perfiles y vidrios que podria solicitar el cliente.
                    </>
                }
                placeHolderBuscador={"Nombre , Serie , etc ..."}
            />

            <Box sx={{ overflowX: 'auto' }}>
                {errorCarga ? (

                    <ErrorDisplay
                        onRetry={getPautas}
                        title={"Error al cargar las pautas"}
                        message={"Ocurrió un error al intentar obtener la lista de pautas. Porfavor Intenta nuevamente."} />

                    ):(
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell padding="checkbox" ></TableCell>
                            <TableCell>Serie</TableCell>
                            <TableCell>Nombre</TableCell>
                            <TableCell>Descripción</TableCell>
                            <TableCell>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody sx={{ backgroundColor: "rgba(255, 255, 255, 0.6)" }}>
                        {renderTableContent()}
                    </TableBody>
                    <TableFooter>
                        <PaginationTable
                            count={filteredPautas.length}
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
                    Eliminar pauta
                </DialogTitle>

                <DialogContent sx={{ mt: 2, py: 2 }}>
                    <Alert severity="warning">
                        ¿Estás seguro de que deseas eliminar la pauta
                        <strong> {pautaAEliminar?.nombre}</strong>?
                        <br />
                        <br />
                        <strong> Esta acción no se puede deshacer.</strong>
                    </Alert>
                </DialogContent>

                <DialogActions>
                    <Button
                        onClick={() => {
                            setDialogoEliminar(false);
                            setPautaAEliminar(null);
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

            <Dialog
                maxWidth="sm"
                fullWidth
                open={dialogoPautaEnUso}
                onClose={() => setDialogoPautaEnUso(false)}
            >
                <DialogTitle>
                    No es posible eliminar la pauta
                </DialogTitle>

                <DialogContent sx={{ mt: 2, py: 2 }}>
                    <Alert severity="error">
                        La pauta
                        <strong> {pautaAEliminar?.nombre}</strong>
                        {" "}no puede ser eliminada porque actualmente está siendo utilizada
                        por una o más cotizaciones o registros del sistema.
                    </Alert>
                </DialogContent>

                <DialogActions>
                    <Button
                        onClick={() => {
                            setDialogoPautaEnUso(false);
                            setPautaAEliminar(null);
                        }}
                        variant="contained"
                    >
                        Entendido
                    </Button>
                </DialogActions>
            </Dialog>

        </Card>

    );
};