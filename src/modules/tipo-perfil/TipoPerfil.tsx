import {TipoPerfilInterface} from "./service/interface.ts";
import {ChangeEvent, useEffect, useMemo, useState} from "react";
import {getAllTipoPerfil, postTipoPerfil, putTipoPerfil} from "./service/ApiClient.ts";
import {
    Box,
    Card,
    Dialog,
    DialogContent,
    DialogTitle,
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead, type TablePaginationProps,
    TableRow,
} from "@mui/material";
import {FormularioTipoPerfil} from "./formulario-tipo-perfil/FormularioTipoPerfil.tsx";
import {TableSkeleton} from "../../components/TableSkeleton.tsx";
import {EmptyState} from "../../components/EmptyState.tsx";
import TipoPerfilRow from "./TipoPerfilRow.tsx";
import {ErrorDisplay} from "../../components/ErrorDisplay.tsx";
import {PaginationTable} from "../../components/PaginationTable.tsx";
import ToolbarTable from "../../components/ToolbarTable.tsx";

export const TipoPerfil = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [mostrarFormulario, setMostrarFormulario] = useState<boolean>(false);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [tipoPerfil, setTipoPerfil] = useState<TipoPerfilInterface[]>([]);
    const [filteredTipoPerfil, setFilteredTipoPerfil] = useState<TipoPerfilInterface[]>([]);
    const [errorCarga, setErrorCarga] = useState<Error | null>(null);
    const [tipoPerfilSeleccionado, setTipoPerfilSeleccionado] = useState<TipoPerfilInterface | null>(null);


    const handleChangePage: TablePaginationProps['onPageChange'] = (_, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const tipoPerfilPaginados = useMemo(() => {
        return rowsPerPage > 0
            ? filteredTipoPerfil.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            : filteredTipoPerfil;
    }, [filteredTipoPerfil, page, rowsPerPage]);



    const handleFormSubmit = async (data: TipoPerfilInterface) => {
        try {

            if (data.tipoPerfilId) {
                console.log("tipo perfil antes del put : ",data);
                await putTipoPerfil(data); // editar

            } else {
                await postTipoPerfil(data); // crear
            }

            await getTipoPerfil();

        } catch (error) {
            console.error("Error handleFormSubmit:", error);
            throw error;
        }
    };

    const handleEditar = (tipoPerfil: TipoPerfilInterface) => {
        setTipoPerfilSeleccionado(tipoPerfil);
        setMostrarFormulario(true);
    };



    const getTipoPerfil = async () => {
        try {
            setLoading(true);
            setErrorCarga(null);
            const response: TipoPerfilInterface[] = await getAllTipoPerfil();
            const tipoPerfilOrdenado = response.sort((a, b) => b.tipoPerfilId! - a.tipoPerfilId!);
            setTipoPerfil(tipoPerfilOrdenado);
            setFilteredTipoPerfil(tipoPerfilOrdenado);
        } catch (error) {
            console.error("Error getVidrios :", error);
            setErrorCarga(error instanceof Error ? error : new Error('Error al cargar los colores'));
        } finally {
            setLoading(false);

        }
    };

    useEffect(() => {
        getTipoPerfil()
    }, []);

    //para limpiar el estado cuando se cierre el Dialog
    useEffect(() => {
        if(!mostrarFormulario) {
            setTipoPerfilSeleccionado(null)
        }
    }, [mostrarFormulario]);

    useEffect(() => {
        if (!search.trim()) {
            setFilteredTipoPerfil(tipoPerfil);
            return;
        }
        const term = search.trim().toLowerCase();
        const filtradas = tipoPerfil.filter(t =>
            `${t.tipoPerfilId}`.includes(term) ||
            t.nombre.toLowerCase().includes(term)
        );
        setPage(0);
        setFilteredTipoPerfil(filtradas);
    }, [search, tipoPerfil]);


    const renderTableContent = () => {
        if (loading) return <TableSkeleton />;
        if (tipoPerfilPaginados.length === 0) return <EmptyState />;

        return tipoPerfilPaginados.map(tipoPerfil => (
            <TipoPerfilRow
                tipoPerfil={tipoPerfil}
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
                        Filtra y muestra los tipos de perfil registrados según el ID y nombre.
                    </>
                }
                agregarDescripcion={
                    <>
                        Agregar un nuevo tipo de perfil asignando un nombre.
                    </>
                }
                placeHolderBuscador={"Nombre ..."}
            />

            <Dialog
                open={mostrarFormulario}
                onClose={() => setMostrarFormulario(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Nuevo Tipo de Perfil</DialogTitle>
                <DialogContent sx={{mt:"16px"}}>
                    <FormularioTipoPerfil
                        onSubmit={handleFormSubmit}
                        setMostrarFormulario={setMostrarFormulario}
                        tipoPerfilEdit={tipoPerfilSeleccionado}
                    />
                </DialogContent>
            </Dialog>

            <Box sx={{ overflowX: 'auto' }}>

                {errorCarga ? (

                    <ErrorDisplay
                        onRetry={getTipoPerfil}
                        title={"Error al cargar los tipos de perfiles"}
                        message={"Ocurrió un error al intentar obtener la lista de tipos de perfiles. Porfavor Intenta nuevamente."} />
                    ):(

                <Table size="small">
                    <TableHead>
                        <TableRow>

                            <TableCell>Nombre</TableCell>
                            <TableCell>Acciones</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody sx={{ backgroundColor: "rgba(255, 255, 255, 0.6)" }}>
                        {renderTableContent()}
                    </TableBody>

                    <TableFooter>
                        <PaginationTable
                            count={filteredTipoPerfil.length}
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
}