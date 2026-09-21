import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    Button,
    Card,
    Box,
    TableRow,
    TableCell,
    TableHead,
    Table,
    TableBody,
    TableFooter, type TablePaginationProps,
} from "@mui/material";
import {ChangeEvent, useEffect, useMemo, useState} from "react";
import {PerfilInterface} from "./service/interface.ts";
import {deletePerfil, getAllPerfiles} from "./service/apiClient.ts";
import {FormularioPerfil} from "./formulario-perfil/FormularioPerfil.tsx";
import {TableSkeleton} from "../../components/TableSkeleton.tsx";
import {EmptyState} from "../../components/EmptyState.tsx";
import PerfilRow from "./PerfilRow.tsx";
import {ErrorDisplay} from "../../components/ErrorDisplay.tsx";
import {PaginationTable} from "../../components/PaginationTable.tsx";
import ToolbarTable from "../../components/ToolbarTable.tsx";

export const Perfil = () => {
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [expandedRowId, setExpandedRowId] = useState<number | null>(null);
    const [perfiles, setPerfiles] = useState<PerfilInterface[]>([]);
    const [filteredPerfiles, setFilteredPerfiles] = useState<PerfilInterface[]>([]);
    const [search, setSearch] = useState("");
    const [openForm, setOpenForm] = useState<boolean>(false);
    const [errorCarga, setErrorCarga] = useState<Error | null>(null);
    const [editData, setEditData] = useState<PerfilInterface | null>(null);
    const [dialogoEliminar, setDialogoEliminar] = useState(false);
    const [perfilAEliminar, setPerfilAEliminar] = useState<PerfilInterface | null>(null);



    const handleChangePage: TablePaginationProps['onPageChange'] = (_, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleToggleRow = (perfilId:number) => {
        setExpandedRowId(expandedRowId === perfilId ? null : perfilId);
    };


    const handleSubmit = async () => {
        await getPerfiles();
        setEditData(null);
        setOpenForm(false);
    };

    const handleCancel = () => {
        setEditData(null);
        setOpenForm(false);
    };

    const handleEdit = async (perfil : PerfilInterface) => {
        setEditData(perfil)
        setOpenForm(true);
    };

    const handleDeleteClick = (perfil: PerfilInterface) => {
        setPerfilAEliminar(perfil);
        setDialogoEliminar(true);
    };

    const confirmarEliminar = async () => {

        if (!perfilAEliminar) return;

        try {
            setLoading(true);
            setErrorCarga(null);

            await deletePerfil(perfilAEliminar.perfilId);

            await getPerfiles();

            setDialogoEliminar(false);
            setPerfilAEliminar(null);

        } catch (error) {
            console.error("Error delete perfil:", error);
            setErrorCarga(
                error instanceof Error
                    ? error
                    : new Error('Error Delete Perfiles')
            );
        } finally {
            setLoading(false);
        }
    };


    const perfilesPaginados = useMemo(() => {
        return rowsPerPage > 0
            ? filteredPerfiles.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            : filteredPerfiles;
    }, [filteredPerfiles, page, rowsPerPage]);


    const getPerfiles = async () => {
        try {
            setLoading(true);
            setErrorCarga(null);
            const response: PerfilInterface[] = await getAllPerfiles();
            console.log(response);
            const perfilesOrdenados = response.sort((a, b) => b.perfilId - a.perfilId);
            setPerfiles(perfilesOrdenados);
            setFilteredPerfiles(perfilesOrdenados);
        } catch (error) {
            console.error("Error getSeries:", error);
            setErrorCarga(error instanceof Error ? error : new Error('Error al cargar los perfiles'));

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getPerfiles()
    }, []);

    useEffect(() => {
        if (!search.trim()) {
            setFilteredPerfiles(perfiles);
            return;
        }
        const term = search.trim().toLowerCase();
        const filtradas = perfiles.filter(p =>
            `${p.perfilId}`.includes(term) ||
            p.codigo.toLowerCase().includes(term) ||
            p.descripcion?.toLowerCase().includes(term) ||
            p.tipoPerfil?.nombre.toLowerCase().includes(term) ||
            p.serie?.nombre.toLowerCase().includes(term) ||
            p.serie?.descripcion.toLowerCase().includes(term)
        );
        setPage(0);
        setFilteredPerfiles(filtradas);
    }, [search, perfiles]);

    const renderTableContent = () => {
        if (loading) return <TableSkeleton />;
        if (perfilesPaginados.length === 0) return <EmptyState />;

        return perfilesPaginados.map(perfil => (
            <PerfilRow
                key={perfil.perfilId}
                perfil={perfil}
                editPerfil={handleEdit}
                deletePerfil={() => handleDeleteClick(perfil)}
                expanded={expandedRowId === perfil.perfilId}
                onToggle={() => handleToggleRow(perfil.perfilId)}
            />
        ));
    };

    if (openForm) {
        return <FormularioPerfil onSubmit={handleSubmit} onCancel={handleCancel} perfilEdit={editData} />;
    }


    return (

        <Card>

            <ToolbarTable
                errorCarga={errorCarga}
                setSearch={setSearch}
                setOpenForm={setOpenForm}
                busquedaDescripcion={
                    <>
                        Filtra y muestra los perfiles registrados según el ID, codigo , descripcion u otros datos ingresados.
                    </>
                }
                agregarDescripcion={
                    <>
                        Agregar un nuevo perfil con codigo, peso , descripcion y otros datos necesarios.
                    </>
                }

                placeHolderBuscador={"Codigo , Descripcion , Peso ..."}
            />

            <Box sx={{ overflowX: 'auto' }}>


                {errorCarga? (

                    <ErrorDisplay
                        onRetry={getPerfiles}
                        title={"Error al cargar los perfiles"}
                        message={"Ocurrió un error al intentar obtener la lista de perfiles. Porfavor Intenta nuevamente."} />
                    ) :(


                <Table size="small">
                    <TableHead>
                        <TableRow>

                            <TableCell padding="checkbox"></TableCell>
                            <TableCell>Codigo</TableCell>
                            <TableCell>Descripcion</TableCell>
                            <TableCell>Peso</TableCell>
                            <TableCell>Acciones</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody sx={{ backgroundColor: "rgba(255, 255, 255, 0.6)" }}>
                        {renderTableContent()}
                    </TableBody>

                    <TableFooter>
                        <PaginationTable
                            count={filteredPerfiles.length}
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
                    Eliminar Perfil
                </DialogTitle>

                <DialogContent sx={{ mt: 2, py: 2 }}>
                    <Alert severity="warning">
                        ¿Estás seguro de que deseas eliminar el perfil
                        <strong> {perfilAEliminar?.descripcion}</strong>?
                        <br />
                        <br />
                        <strong> Esta acción no se puede deshacer.</strong>
                    </Alert>
                </DialogContent>

                <DialogActions>
                    <Button
                        onClick={() => {
                            setDialogoEliminar(false);
                            setPerfilAEliminar(null);
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