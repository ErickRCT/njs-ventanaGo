import {
    Card,
    Box,
    TableRow,
    TableCell,
    TableHead,
    Table,
    TableBody,
    TableFooter,
    type TablePaginationProps,
    Dialog,
    DialogContent
} from "@mui/material";
import {ChangeEvent, useEffect, useMemo, useState} from "react";
import {getClientes} from "./service/ApiClient.ts";
import {Cliente} from "../../components/service/inteface.ts";
import {FormularioCliente} from "../../components/FormularioCliente.tsx";
import {TableSkeleton} from "../../components/TableSkeleton.tsx";
import {EmptyState} from "../../components/EmptyState.tsx";
import {ErrorDisplay} from "../../components/ErrorDisplay.tsx";
import ClienteRow from "./ClienteRow.tsx";
import {PaginationTable} from "../../components/PaginationTable.tsx";
import ToolbarTable from "../../components/ToolbarTable.tsx";

export const NuevoCliente = () => {
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [expandedRowId, setExpandedRowId] = useState<number | null>(null);
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [openForm, setOpenForm] = useState<boolean>(false);
    const [errorCarga, setErrorCarga] = useState<Error | null>(null);
    const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
    const [search, setSearch] = useState("");
    const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);


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
        await obtenerClientes();
        setOpenForm(false);
    };

    const handleCancel = () => {
        setOpenForm(false);
    };

    const obtenerClientes = async () => {
        try {
            setLoading(true);
            setErrorCarga(null);
            const response = await getClientes();
            const clientesOrdenados = response.sort((a, b) => b.clienteId! - a.clienteId!);
            setClientes(clientesOrdenados);
            setFilteredClientes(clientesOrdenados);
        } catch (error) {
            console.error("Error al obtener los clientes:", error);
            setErrorCarga(error instanceof Error ? error : new Error('Error al cargar las series'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        obtenerClientes()
    }, []);

    useEffect(() => {
        if (!search.trim()) {
            setFilteredClientes(clientes);
            return;
        }
        const term = search.trim().toLowerCase();
        const filtradas = clientes.filter(c =>
            `${c.clienteId}`.includes(term) ||
            c.nombre.toLowerCase().includes(term) ||
            c.rut?.toLowerCase().includes(term) ||
            c.direccion?.toLowerCase().includes(term) ||
            c.comuna?.nombre?.toLowerCase().includes(term) ||
            c.comuna?.region.nombre.toLowerCase().includes(term)
        );
        setPage(0);
        setFilteredClientes(filtradas);
    }, [search, clientes]);

    const clientesPaginados = useMemo(() => {
        return rowsPerPage > 0
            ? filteredClientes.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            : filteredClientes;
    }, [filteredClientes, page, rowsPerPage]);

    const renderTableContent = () => {
        if (loading) return <TableSkeleton />;
        if (clientesPaginados.length === 0) return <EmptyState />;

        return clientesPaginados.map(cliente => (
            <ClienteRow
                key={cliente.clienteId}
                cliente={cliente}
                expanded={expandedRowId === cliente.clienteId}
                onToggle={() => handleToggleRow(cliente.clienteId)}
            />
        ));
    };

    return (
        <>
            <Card>
                <ToolbarTable
                    errorCarga={errorCarga}
                    setSearch={setSearch}
                    setOpenForm={setOpenForm}
                    busquedaDescripcion={
                        <>
                            Filtra y muestra los clientes registrados según el rut, nombre u otros datos ingresados.
                        </>
                    }
                    agregarDescripcion={
                        <>
                            Agregar un nuevo cliente con Rut, direccion y otros datos requeridos.
                        </>
                    }
                    placeHolderBuscador={"Nombre, RUT o Correo..."}
                />

                <Box sx={{ overflowX: 'auto' }}>
                    {errorCarga ? (
                        <ErrorDisplay
                            onRetry={obtenerClientes}
                            title={"Error al cargar los clientes"}
                            message={"Ocurrió un error al intentar obtener la lista de clientes. Porfavor Intenta nuevamente."}
                        />
                    ) : (
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Rut</TableCell>
                                    <TableCell>Nombre</TableCell>
                                    <TableCell>Dirección</TableCell>
                                    <TableCell>Teléfono</TableCell>
                                    <TableCell>Acciones</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody sx={{ backgroundColor: "rgba(255, 255, 255, 0.6)" }}>
                                {renderTableContent()}
                            </TableBody>

                            <TableFooter>
                                <PaginationTable
                                    count={filteredClientes.length}
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

            {/* Dialog para el formulario de nuevo cliente */}
            <Dialog
                open={openForm}
                onClose={handleCancel}
                fullWidth
                maxWidth="md"
            >
                <DialogContent>
                    <FormularioCliente
                        onSubmit={handleSubmit}
                        onCancel={handleCancel}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
};