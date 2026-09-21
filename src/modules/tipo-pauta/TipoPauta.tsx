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
} from "@mui/material";
import {ChangeEvent, useEffect, useMemo, useState} from "react";
import {getAllTipoPauta} from "./service/apiClient.ts";
import {TableSkeleton} from "../../components/TableSkeleton.tsx";
import {EmptyState} from "../../components/EmptyState.tsx";
import {ErrorDisplay} from "../../components/ErrorDisplay.tsx";
import {PaginationTable} from "../../components/PaginationTable.tsx";
import ToolbarTable from "../../components/ToolbarTable.tsx";
import {TipoPautaInterface} from "./service/interface.ts";
import TipoPautaRow from "./TipoPautaRow.tsx";
import {FormularioTipoPauta} from "./formulario-tipo-pauta/FormularioTipoPauta.tsx";


export const TipoPauta = () => {
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [expandedRowId, setExpandedRowId] = useState<number | null>(null);
    const [tipoPauta, setTipoPauta] = useState<TipoPautaInterface[]>([]);
    const [openForm, setOpenForm] = useState<boolean>(false);
    const [errorCarga, setErrorCarga] = useState<Error | null>(null);
    const [filteredTipoPauta, setFilteredTipoPauta] = useState<TipoPautaInterface[]>([]);
    const [search, setSearch] = useState("");
    const [tipoPautaEditar, setTipoPautaEditar] = useState<TipoPautaInterface | null>(null);


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
        await getTipoPauta();
        setOpenForm(false);
    };

    const handleEditar = (tipoPauta: TipoPautaInterface) => {
        setTipoPautaEditar(tipoPauta);
        setOpenForm(true);
    };

    const handleCancel = () => {
        setOpenForm(false);
    };


    const getTipoPauta = async () => {

        try {
            setLoading(true);
            setErrorCarga(null);
            const response = await getAllTipoPauta();
            const tipoPautaOrdenados = response.sort((a, b) => b.tipoPautaId! - a.tipoPautaId!);
            setTipoPauta(tipoPautaOrdenados);
            setFilteredTipoPauta(tipoPautaOrdenados);


        } catch (error) {
            console.error("Error al obtener los clientes:", error);
            setErrorCarga(error instanceof Error ? error : new Error('Error al cargar las series'));
        } finally {setLoading(false)}
    };

    useEffect(() => {
        getTipoPauta()
    }, []);


    useEffect(() => {
        if (!search.trim()) {
            setFilteredTipoPauta(tipoPauta);
            return;
        }
        const term = search.trim().toLowerCase();
        const filtradas = tipoPauta.filter(tp =>
            `${tp.tipoPautaId}`.includes(term) ||
            tp.nombre.toLowerCase().includes(term)
        );
        setPage(0);
        setFilteredTipoPauta(filtradas);
    }, [search, tipoPauta]);

    //para limpiar el estado cuando se cierre el Dialog
    useEffect(() => {
        if(!openForm) {
            setTipoPautaEditar(null)
        }
    }, [openForm]);

    const tipoPautaPaginados = useMemo(() => {
        return rowsPerPage > 0
            ? filteredTipoPauta.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            : filteredTipoPauta;
    }, [filteredTipoPauta, page, rowsPerPage]);

    const renderTableContent = () => {
        if (loading) return <TableSkeleton />;
        if (tipoPautaPaginados.length === 0) return <EmptyState />;

        return tipoPautaPaginados.map(tipoPauta => (
            <TipoPautaRow key={tipoPauta.tipoPautaId}
                          tipoPauta={tipoPauta}
                        expanded={expandedRowId === tipoPauta.tipoPautaId}
                        onToggle={() => handleToggleRow(tipoPauta.tipoPautaId)}
                          onEdit={() => handleEditar(tipoPauta)}/>
        ));
    };

    if (openForm) {
        return <FormularioTipoPauta onSubmit={handleSubmit} onCancel={handleCancel} tipoPautaEditar={tipoPautaEditar} />;
    }


    return (
        <Card>

            <ToolbarTable
                errorCarga={errorCarga}
                setSearch={setSearch}
                setOpenForm={setOpenForm}
                busquedaDescripcion={
                    <>
                        Filtra y muestra los tipos de pauta registrados según el ID, nombre y otros datos ingresados.
                    </>
                }
                agregarDescripcion={
                    <>
                        Agregar un nuevo tipo de pauta.
                    </>
                }
                placeHolderBuscador={"Nombre ..."}

            />

            <Box sx={{ overflowX: 'auto' }}>

                {errorCarga? (

                    <ErrorDisplay
                        onRetry={getTipoPauta}
                        title={"Error al cargar los tipos de pauta"}
                        message={"Ocurrió un error al intentar obtener la lista de tipos de pauta. Porfavor Intenta nuevamente."} />
                    ) : (

                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Nombre</TableCell>
                            <TableCell>imagen</TableCell>
                            <TableCell>Acciones</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody sx={{ backgroundColor: "rgba(255, 255, 255, 0.6)" }}>
                        {renderTableContent()}
                    </TableBody>

                    <TableFooter>
                        <PaginationTable
                            count={filteredTipoPauta.length}
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