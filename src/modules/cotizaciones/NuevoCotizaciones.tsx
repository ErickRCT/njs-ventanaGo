import {
    Card,
    Box,
    TableRow,
    TableCell,
    TableHead,
    Table,
    TableBody,
    TableFooter,
    type TablePaginationProps, Button,
} from "@mui/material";

import {ChangeEvent,  useEffect, useMemo, useState} from "react";

import {Cotizacion} from "../crear-cotizacion/service/interface.ts";
import {getAllCotizaciones} from "./service/apiClient.ts";
import {TableSkeleton} from "../../components/TableSkeleton.tsx";
import {EmptyState} from "../../components/EmptyState.tsx";
import CotizacionRow from "./CotizacionRow.tsx";
import {ErrorDisplay} from "../../components/ErrorDisplay.tsx";
import {PaginationTable} from "../../components/PaginationTable.tsx";
import ToolbarTable from "../../components/ToolbarTable.tsx";
import {CrearCotizacion} from "../crear-cotizacion/CrearCotizacion.tsx";


export const NuevoCotizaciones = () => {

    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [expandedRowId, setExpandedRowId] = useState<number | null>(null);
    const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
    const [filteredCotizaciones, setFilteredCotizaciones] = useState<Cotizacion[]>([]);
    const [search, setSearch] = useState("");
    const [errorCarga, setErrorCarga] = useState<Error | null>(null);
    const [openForm, setOpenForm] = useState<boolean>(false);
    const [openFormEdit, setOpenFormEdit] = useState<boolean>(false);
    const [cotizacionEditId, setCotizacionEditId] = useState<number | null>(null);



    const handleChangePage: TablePaginationProps['onPageChange'] = (_, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };


    const handleToggleRow = (cotizacionId:number|null) => {
        setExpandedRowId(expandedRowId === cotizacionId ? null : cotizacionId);
    };


    const cotizacionesPaginados = useMemo(() => {
        return rowsPerPage > 0
            ? filteredCotizaciones.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            : filteredCotizaciones;
    }, [filteredCotizaciones, page, rowsPerPage]);


    const obtenerCotizaciones = async () => {
        setLoading(true);
        try {
            setErrorCarga(null);
            const response = await getAllCotizaciones();
            const sortedCotizaciones = response.sort((a: Cotizacion, b: Cotizacion) =>
                (b.cotizacionId ?? 0) - (a.cotizacionId ?? 0)
            );
            setCotizaciones(sortedCotizaciones);
            setFilteredCotizaciones(sortedCotizaciones);
            setLoading(false);
        } catch (error) {
            console.error('Error al obtener las cotizaciones:', error);
            setErrorCarga(error instanceof Error ? error : new Error('Error al cargar las pautas'));
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (id: number | null) => {
        setCotizacionEditId(id);
        setOpenFormEdit(true);
    };

    useEffect(() => {
        obtenerCotizaciones();
    }, []);

    useEffect(() => {
        const savedSearch = sessionStorage.getItem("searchCotizaciones");
        if (savedSearch) {
            setSearch(savedSearch);
        }
    }, []);

    useEffect(() => {
        sessionStorage.setItem("searchCotizaciones", search);
    }, [search]);



    useEffect(() => {
        if (!search.trim()) {
            setFilteredCotizaciones(cotizaciones);
            return;
        }

        const term = search.trim().toLowerCase();

        const filtradas = cotizaciones.filter(c => {
            // Convertimos todos los valores a string para comparar
            const searchableValues = [
                c.cotizacionId?.toString(),
                c.estado,
                c.fecha,
                c.ganancia?.toString(),
                c.descuento?.toString(),
                c.condiciones,
                c.valorFlete?.toString(),
                c.valorInstalacion?.toString(),
                c.otrosGastos,
                c.valorOtrosGastos?.toString(),
                c.valorManoDeObra?.toString(),
                c.neto?.toString(),
                c.totalm2?.toString(),
                c.cantidadProductos?.toString()
            ].filter(value => value !== null && value !== undefined) as string[];

            return searchableValues.some(value => value.toLowerCase().includes(term));
        });

        setPage(0);
        setFilteredCotizaciones(filtradas);
    }, [search, cotizaciones]);


    const renderTableContent = () => {
        if (loading) return <TableSkeleton />;
        if (cotizacionesPaginados.length === 0 && !loading) return <EmptyState />;

        return cotizacionesPaginados.map(cotizacion => (
            <CotizacionRow
                key={cotizacion.cotizacionId}
                cotizacion={cotizacion}
                expanded={expandedRowId === cotizacion.cotizacionId}
                onToggle={() => handleToggleRow(cotizacion.cotizacionId)}
                onEdit={handleEdit}
            />
        ));
    };

    if (openForm) {
        return <Box>
            <Button
                onClick={async () => {
                    setOpenForm(false);
                    await obtenerCotizaciones();
                }}
                variant="contained"
                color="primary"
            >
                VOLVER
            </Button>
            <CrearCotizacion/>
        </Box>;
    }

    if (openFormEdit) {
        return (
            <Box>
                <Button
                    onClick={async () => {
                        setOpenFormEdit(false);
                        setCotizacionEditId(null);
                        await obtenerCotizaciones();
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
        <Card>
            <ToolbarTable
                errorCarga={errorCarga}
                setSearch={setSearch}
                setOpenForm={setOpenForm}
                search={search}
                busquedaDescripcion={
                    <>
                        Filtra y muestra las cotizaciones registradas según el cliente, fecha u otros datos ingresados
                    </>
                }
                agregarDescripcion={
                    <>
                        Agregar una nueva cotización con medidas, tipos de perfiles y vidrios solicitados por el cliente.
                    </>
                }
                placeHolderBuscador={"Cliente , ID , Fecha..."}

            />

            <Box sx={{ overflowX: 'auto' }}>

                {errorCarga? (
                    <ErrorDisplay
                        onRetry={obtenerCotizaciones}
                        title={"Error al cargar las cotizaciones"}
                        message={"Ocurrió un error al intentar obtener la lista de cotizaciones. Porfavor Intenta nuevamente."} />
                    ) : (
                <Table size="small">
                    <TableHead>
                        <TableRow>

                            <TableCell>ID</TableCell>
                            <TableCell>Neto</TableCell>
                            <TableCell>Estado</TableCell>
                            <TableCell>Fecha</TableCell>
                            <TableCell>Acciones</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody sx={{ backgroundColor: "rgba(255, 255, 255, 0.6)" }}>
                        {renderTableContent()}
                    </TableBody>

                    <TableFooter>
                        <PaginationTable
                            count={filteredCotizaciones.length}
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