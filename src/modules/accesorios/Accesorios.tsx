import React, { ChangeEvent, useEffect, useMemo, useState, useCallback } from "react";
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
    TableFooter,
    Tabs,
    Tab,
    Chip,
    Avatar,
    IconButton,
    Tooltip,
    Grid,
    Typography,
    CircularProgress,
    type TablePaginationProps,
} from "@mui/material";

import {
    TableChart as TableChartIcon,
    ViewModule as ViewModuleIcon,
    Category as CategoryIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
} from "@mui/icons-material";

import { TableSkeleton } from "../../components/TableSkeleton.tsx";
import { EmptyState } from "../../components/EmptyState.tsx";
import { ErrorDisplay } from "../../components/ErrorDisplay.tsx";
import { PaginationTable } from "../../components/PaginationTable.tsx";
import ToolbarTable from "../../components/ToolbarTable.tsx";
import { FormularioAccesorio } from "./formulario-accesorio/FormularioAccesorio.tsx";
import { FormularioCategoria } from "./formulario-accesorio/FormularioCategoria.tsx";

// Métodos e interfaces de API
import {
    getAllProductos,
    getAllCategoria,
    deleteProducto,
    deleteCategoria, getImagenUrl
} from "./service/apiClient.ts";
import { CategoriaProductoInterface, ProductoCatalogoInterface } from "./service/interface.ts";

const formatCurrency = (val: string | number) => {
    const num = typeof val === "string" ? parseFloat(val) : val;
    return new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
        maximumFractionDigits: 0,
    }).format(isNaN(num) ? 0 : num);
};

export const Accesorios = () => {
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [search, setSearch] = useState("");
    const [errorCarga, setErrorCarga] = useState<Error | null>(null);

    // Listas de datos
    const [productos, setProductos] = useState<ProductoCatalogoInterface[]>([]);
    const [categorias, setCategorias] = useState<CategoriaProductoInterface[]>([]);

    // Control de Pestañas
    const [currentTab, setCurrentTab] = useState<"PRODUCTOS_TABLA" | "PRODUCTOS_TARJETAS" | "CATEGORIAS">("PRODUCTOS_TABLA");

    // Estados para Formulario Producto
    const [openFormProducto, setOpenFormProducto] = useState(false);
    const [productoEdit, setProductoEdit] = useState<ProductoCatalogoInterface | null>(null);

    // Estados para Formulario Categoría
    const [openFormCategoria, setOpenFormCategoria] = useState(false);
    const [categoriaEdit, setCategoriaEdit] = useState<CategoriaProductoInterface | null>(null);

    // Estado para Diálogo de Eliminación
    const [dialogoEliminar, setDialogoEliminar] = useState(false);
    const [itemAEliminar, setItemAEliminar] = useState<{ id: number; nombre: string; tipo: "PRODUCTO" | "CATEGORIA" } | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Función principal para cargar datos desde las APIs
    const fetchDatos = useCallback(async () => {
        setLoading(true);
        setErrorCarga(null);
        try {
            const [dataProductos, dataCategorias] = await Promise.all([
                getAllProductos(),
                getAllCategoria(),
            ]);

            // Guardamos los arreglos invertidos para que el último agregado quede de primero
            setProductos([...(dataProductos || [])].reverse());
            setCategorias([...((dataCategorias as unknown as CategoriaProductoInterface[]) || [])].reverse());
        } catch (error) {
            console.error("Error al cargar los datos del catálogo:", error);
            setErrorCarga(error as Error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDatos();
    }, [fetchDatos]);

    // Filtrados
    // Filtrados independientes según la pestaña activa
    const filteredProductos = useMemo(() => {
        // Si la pestaña actual es Categorías, no filtramos productos por el buscador global
        if (!search.trim() || currentTab === "CATEGORIAS") return productos;

        const term = search.trim().toLowerCase();
        return productos.filter(
            (p) =>
                `${p.catalogoProductoId}`.includes(term) ||
                p.nombre.toLowerCase().includes(term) ||
                (p.descripcion && p.descripcion.toLowerCase().includes(term))
        );
    }, [productos, search, currentTab]);

    const filteredCategorias = useMemo(() => {
        // Si estamos en cualquier pestaña de Productos, no filtramos categorías
        if (!search.trim() || currentTab !== "CATEGORIAS") return categorias;

        const term = search.trim().toLowerCase();
        return categorias.filter(
            (c) =>
                `${c.catalogoCategoriaProductoId}`.includes(term) ||
                c.nombre.toLowerCase().includes(term) ||
                (c.descripcion && c.descripcion.toLowerCase().includes(term))
        );
    }, [categorias, search, currentTab]);

    // Paginación
    const dataPaginada = useMemo(() => {
        const dataset = currentTab === "CATEGORIAS" ? filteredCategorias : filteredProductos;
        return rowsPerPage > 0
            ? dataset.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            : dataset;
    }, [currentTab, filteredProductos, filteredCategorias, page, rowsPerPage]);

    const handleSearchChange = (value: string) => {
        setSearch(value);
        setPage(0);
    };

    // CAMBIO: `search` es controlado (search={search} en ToolbarTable), así que
    // el input SIEMPRE refleja el valor real sin importar la pestaña — eso ya
    // resuelve el bug de sincronización. Lo único que sigue siendo una decisión
    // de negocio de esta pantalla es CUÁNDO limpiar el término de búsqueda:
    // - Tabla <-> Tarjetas: mismo dataset (productos), se mantiene el filtro.
    // - Cualquiera de Productos <-> Categorías: dataset distinto, se limpia.
    const esCategoria = (tab: typeof currentTab) => tab === "CATEGORIAS";

    const handleTabChange = (_: React.SyntheticEvent, newValue: "PRODUCTOS_TABLA" | "PRODUCTOS_TARJETAS" | "CATEGORIAS") => {
        if (esCategoria(currentTab) !== esCategoria(newValue)) {
            setSearch("");
        }
        setCurrentTab(newValue);
        setPage(0);
    };

    const handleChangePage: TablePaginationProps["onPageChange"] = (_, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Manejador Dinámico del botón "Agregar" de la Toolbar
    const handleCrearNuevo = () => {
        if (currentTab === "CATEGORIAS") {
            setCategoriaEdit(null);
            setOpenFormCategoria(true);
        } else {
            setProductoEdit(null);
            setOpenFormProducto(true);
        }
    };

    // Acciones Productos
    const handleEditarProducto = (producto: ProductoCatalogoInterface) => {
        setProductoEdit(producto);
        setOpenFormProducto(true);
    };

    // CAMBIO: ya no es necesario limpiar la búsqueda manualmente al volver; el
    // input queda sincronizado automáticamente por ser un componente controlado.
    const handleSaveProducto = () => {
        setOpenFormProducto(false);
        setProductoEdit(null);
        fetchDatos();
    };

    const handleCancelProducto = () => {
        setOpenFormProducto(false);
        setProductoEdit(null);
    };

    // Acciones Categorías
    const handleEditarCategoria = (categoria: CategoriaProductoInterface) => {
        setCategoriaEdit(categoria);
        setOpenFormCategoria(true);
    };

    const handleSaveCategoria = () => {
        setOpenFormCategoria(false);
        setCategoriaEdit(null);
        fetchDatos();
    };

    const handleCancelCategoria = () => {
        setOpenFormCategoria(false);
        setCategoriaEdit(null);
    };

    // Eliminación
    const handleDeleteClick = (id: number, nombre: string, tipo: "PRODUCTO" | "CATEGORIA") => {
        setItemAEliminar({ id, nombre, tipo });
        setDialogoEliminar(true);
    };

    const confirmarEliminar = async () => {
        if (!itemAEliminar) return;

        setDeleting(true);
        try {
            if (itemAEliminar.tipo === "PRODUCTO") {
                await deleteProducto(itemAEliminar.id);
            } else {
                await deleteCategoria(itemAEliminar.id);
            }

            // Refresca la tabla tras eliminar
            await fetchDatos();
        } catch (error) {
            console.error("Error al eliminar el registro:", error);
        } finally {
            setDeleting(false);
            setDialogoEliminar(false);
            setItemAEliminar(null);
        }
    };

    // Render de Tabla Categorías
    const renderCategoriasTableContent = () => {
        if (loading) {
            return (
                <TableRow>
                    <TableCell colSpan={6}>
                        <TableSkeleton />
                    </TableCell>
                </TableRow>
            );
        }

        if (filteredCategorias.length === 0) {
            return (
                <TableRow>
                    <TableCell colSpan={6} align="center">
                        <EmptyState />
                    </TableCell>
                </TableRow>
            );
        }

        return (dataPaginada as CategoriaProductoInterface[]).map((cat) => (
            <TableRow key={cat.catalogoCategoriaProductoId} hover>
                <TableCell><strong>#{cat.catalogoCategoriaProductoId}</strong></TableCell>
                <TableCell><strong>{cat.nombre}</strong></TableCell>
                <TableCell>{cat.descripcion || "-"}</TableCell>
                <TableCell>{cat.orden}</TableCell>
                <TableCell>
                    <Chip
                        label={cat.activo ? "Activo" : "Inactivo"}
                        color={cat.activo ? "success" : "default"}
                        size="small"
                        variant="outlined"
                    />
                </TableCell>
                <TableCell align="right">
                    <Tooltip title="Editar Categoría">
                        <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEditarCategoria(cat)}
                        >
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar Categoría">
                        <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteClick(cat.catalogoCategoriaProductoId!, cat.nombre, "CATEGORIA")}
                        >
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </TableCell>
            </TableRow>
        ));
    };

    // Render de Tabla Productos (Orden: Imagen, Nombre, Categoria, Descripcion, Precio)
    const renderProductosTableContent = () => {
        if (loading) {
            return (
                <TableRow>
                    <TableCell colSpan={7}>
                        <TableSkeleton />
                    </TableCell>
                </TableRow>
            );
        }

        if (filteredProductos.length === 0) {
            return (
                <TableRow>
                    <TableCell colSpan={7} align="center">
                        <EmptyState />
                    </TableCell>
                </TableRow>
            );
        }

        return (dataPaginada as ProductoCatalogoInterface[]).map((item) => (
            <TableRow key={item.catalogoProductoId} hover>
                {/* 1. Imagen */}
                <TableCell>
                    <Avatar
                        alt={item.nombre}
                        src={getImagenUrl(item.imagen)}
                        variant="rounded"
                        sx={{ width: 80, height: 80, "& img": { objectFit: "cover" } }}
                    />
                </TableCell>
                {/* 2. Nombre */}
                <TableCell><strong>{item.nombre}</strong></TableCell>
                {/* 3. Categoría */}
                <TableCell>
                    {item.categoria ? (
                        <>
                            {item.categoria.nombre}
                        </>
                    ) : (
                        "-"
                    )}
                </TableCell>
                {/* 4. Descripción */}
                <TableCell
                    sx={{
                        maxWidth: 250,           // Ancho máximo permitido para la columna
                        whiteSpace: "normal",    // Permite que el texto salte a múltiples líneas
                        wordBreak: "break-word"  // Rompe palabras muy largas si no caben
                    }}
                >
                    {item.descripcion || "-"}
                </TableCell>
                {/* 5. Precio */}
                <TableCell>{formatCurrency(item.precio)}</TableCell>

                {/* Acciones */}
                <TableCell align="right">
                    <Tooltip title="Editar">
                        <IconButton size="small" color="primary" onClick={() => handleEditarProducto(item)}>
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                        <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteClick(item.catalogoProductoId!, item.nombre, "PRODUCTO")}
                        >
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </TableCell>
            </TableRow>
        ));
    };

    // Render Tarjetas Productos (Aplica también la paginación para mantener consistencia)
    const renderCardsContent = () => {
        if (loading) return <TableSkeleton />;
        if (filteredProductos.length === 0) return <EmptyState />;

        const productosTarjetasPaginados = dataPaginada as ProductoCatalogoInterface[];

        return (
            <Grid container spacing={3}>
                {productosTarjetasPaginados.map((producto) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={producto.catalogoProductoId} sx={{ display: "flex" }}>
                        <Box
                            sx={{
                                border: "1px solid",
                                borderColor: "divider",
                                borderRadius: 2,
                                transition: "all 0.2s ease-in-out",
                                "&:hover": { borderColor: "primary.main", boxShadow: 3, transform: "translateY(-3px)" },
                                width: "100%",
                                display: "flex",
                                flexDirection: "column",
                                overflow: "hidden",
                                backgroundColor: "background.paper",
                                position: "relative",
                            }}
                        >
                            {/* Área de la Imagen en formato Avatar (100% de cobertura) */}
                            <Box
                                sx={{
                                    width: "100%",
                                    height: 180,
                                    borderBottom: "1px solid",
                                    borderColor: "divider",
                                    overflow: "hidden",
                                }}
                            >
                                <Avatar
                                    variant="square"
                                    alt={producto.nombre}
                                    src={getImagenUrl(producto.imagen)}
                                    sx={{
                                        width: "100%",
                                        height: "100%",
                                        borderRadius: 0,
                                        "& img": { objectFit: "cover" },
                                    }}
                                />
                            </Box>
                            <Box sx={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 0.5, bgcolor: "rgba(255,255,255,0.8)", borderRadius: 1 }}>
                                <IconButton size="small" color="primary" onClick={() => handleEditarProducto(producto)}>
                                    <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton size="small" color="error" onClick={() => handleDeleteClick(producto.catalogoProductoId!, producto.nombre, "PRODUCTO")}>
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Box>
                            <Box sx={{ p: 2, display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5, flexGrow: 1 }}>
                                <Typography variant="body2" align="center" sx={{ fontWeight: 600 }}>
                                    {producto.nombre}
                                </Typography>
                                {producto.categoria && (
                                    <Typography variant="caption" color="text.secondary">
                                        {producto.categoria.nombre}
                                    </Typography>
                                )}
                                <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 700 }}>
                                    {formatCurrency(producto.precio)}
                                </Typography>
                            </Box>
                        </Box>
                    </Grid>
                ))}
            </Grid>
        );
    };

    if (openFormProducto) {
        return (
            <FormularioAccesorio
                accesorioEdit={productoEdit}
                onSubmit={handleSaveProducto}
                onCancel={handleCancelProducto}
            />
        );
    }

    if (openFormCategoria) {
        return (
            <FormularioCategoria
                categoriaEdit={categoriaEdit}
                onSubmit={handleSaveCategoria}
                onCancel={handleCancelCategoria}
            />
        );
    }

    return (
        <Card sx={{ p: 2 }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2, px: 1 }}>
                <Tabs
                    value={currentTab}
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                        "& .MuiTabs-indicator": { display: "none" },
                        "& .MuiTab-root": {
                            textTransform: "none",
                            minHeight: 40,
                            borderRadius: "10px",
                            mr: 1.5,
                            mb: 1,
                            fontWeight: 600,
                            color: "text.secondary",
                            backgroundColor: "action.hover",
                            transition: "all 0.2s ease",
                            "&.Mui-selected": {
                                backgroundColor: "primary.main",
                                color: "primary.contrastText",
                                boxShadow: 1,
                            },
                        },
                    }}
                >
                    <Tab
                        value="PRODUCTOS_TABLA"
                        label={
                            <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
                                <TableChartIcon fontSize="small" />
                                <span>Productos - Tabla ({filteredProductos.length})</span>
                            </Box>
                        }
                    />
                    <Tab
                        value="PRODUCTOS_TARJETAS"
                        label={
                            <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
                                <ViewModuleIcon fontSize="small" />
                                <span>Productos - Tarjetas ({filteredProductos.length})</span>
                            </Box>
                        }
                    />
                    <Tab
                        value="CATEGORIAS"
                        label={
                            <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
                                <CategoryIcon fontSize="small" />
                                <span>Categorías ({filteredCategorias.length})</span>
                            </Box>
                        }
                    />
                </Tabs>
            </Box>

            {/*
                ToolbarTable se usa como componente CONTROLADO, igual que en
                NuevoCotizaciones.tsx (search={search} + setSearch). Al estar
                controlado de verdad, el input queda siempre sincronizado con
                el estado real del filtro sin necesitar lógica adicional en
                este componente (no hace falta resetear la búsqueda al cambiar
                de pestaña ni al volver del formulario: el valor mostrado
                siempre es el correcto). No se modificó ToolbarTable.tsx.
            */}
            <ToolbarTable
                errorCarga={errorCarga}
                search={search}
                setSearch={handleSearchChange}
                setOpenForm={handleCrearNuevo}
                placeHolderBuscador={"Nombre, descripción, etc..."}
                busquedaDescripcion={
                    currentTab === "CATEGORIAS"
                        ? "Filtra las categorías por nombre o descripción."
                        : "Filtra los productos por nombre o descripción."
                }
                agregarDescripcion={
                    currentTab === "CATEGORIAS"
                        ? "Agregar una nueva categoría al catálogo."
                        : "Agregar un nuevo producto al catálogo."
                }
            />

            <Box sx={{ mt: 2 }}>
                {errorCarga ? (
                    <ErrorDisplay
                        onRetry={fetchDatos}
                        title="Error al cargar información"
                        message="Ocurrió un error al intentar obtener la lista desde la API."
                    />
                ) : currentTab === "CATEGORIAS" ? (
                    <Box sx={{ overflowX: "auto" }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>ID</TableCell>
                                    <TableCell>Nombre</TableCell>
                                    <TableCell>Descripción</TableCell>
                                    <TableCell>Orden</TableCell>
                                    <TableCell>Estado</TableCell>
                                    <TableCell align="right">Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody sx={{ backgroundColor: "rgba(255, 255, 255, 0.6)" }}>
                                {renderCategoriasTableContent()}
                            </TableBody>
                            <TableFooter>
                                <PaginationTable
                                    count={filteredCategorias.length}
                                    page={page}
                                    rowsPerPage={rowsPerPage}
                                    onPageChange={handleChangePage}
                                    onRowsPerPageChange={handleChangeRowsPerPage}
                                />
                            </TableFooter>
                        </Table>
                    </Box>
                ) : currentTab === "PRODUCTOS_TABLA" ? (
                    <Box sx={{ overflowX: "auto" }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Imagen</TableCell>
                                    <TableCell>Nombre</TableCell>
                                    <TableCell>Categoría</TableCell>
                                    <TableCell>Descripción</TableCell>
                                    <TableCell>Precio</TableCell>
                                    <TableCell align="right">Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody sx={{ backgroundColor: "rgba(255, 255, 255, 0.6)" }}>
                                {renderProductosTableContent()}
                            </TableBody>
                            <TableFooter>
                                <PaginationTable
                                    count={filteredProductos.length}
                                    page={page}
                                    rowsPerPage={rowsPerPage}
                                    onPageChange={handleChangePage}
                                    onRowsPerPageChange={handleChangeRowsPerPage}
                                />
                            </TableFooter>
                        </Table>
                    </Box>
                ) : (
                    <Box sx={{ p: 1 }}>
                        {renderCardsContent()}
                        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                            <PaginationTable
                                count={filteredProductos.length}
                                page={page}
                                rowsPerPage={rowsPerPage}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                            />
                        </Box>
                    </Box>
                )}
            </Box>

            {/* Diálogo de Confirmación para Eliminar */}
            <Dialog
                maxWidth="sm"
                fullWidth
                open={dialogoEliminar}
                onClose={() => !deleting && setDialogoEliminar(false)}
            >
                <DialogTitle>
                    Eliminar {itemAEliminar?.tipo === "PRODUCTO" ? "Producto" : "Categoría"}
                </DialogTitle>
                <DialogContent sx={{ mt: 2, py: 2 }}>
                    <Alert severity="warning">
                        ¿Estás seguro de que deseas eliminar{" "}
                        {itemAEliminar?.tipo === "PRODUCTO" ? "el producto" : "la categoría"}{" "}
                        <strong>{itemAEliminar?.nombre}</strong>?
                        <br />
                        <br />
                        <strong>Esta acción no se puede deshacer.</strong>
                    </Alert>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setDialogoEliminar(false)}
                        color="primary"
                        variant="outlined"
                        disabled={deleting}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={confirmarEliminar}
                        color="error"
                        variant="contained"
                        disabled={deleting}
                        startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : null}
                    >
                        {deleting ? "Eliminando..." : "Eliminar"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Card>
    );
};