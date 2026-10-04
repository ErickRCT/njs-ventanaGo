import React, { useState } from "react";
import {
    Alert,
    Box,
    Button,
    IconButton,
    Popover,
    TextField,
    Toolbar,
    Typography,
} from "@mui/material";
import { Search, InfoOutlined } from "@mui/icons-material";
import { ReactNode } from 'react';

interface ToolbarTableProps {
    errorCarga: Error | null;
    setSearch: (value: string) => void;
    setOpenForm: (value: boolean) => void;
    search?: string;
    busquedaDescripcion: ReactNode;
    agregarDescripcion: ReactNode;
    placeHolderBuscador: string;
}

const ToolbarTable: React.FC<ToolbarTableProps> = ({
                                                       errorCarga,
                                                       setSearch,
                                                       setOpenForm,
                                                       busquedaDescripcion,
                                                       agregarDescripcion,
                                                       search,
                                                       placeHolderBuscador,
                                                   }) => {

    const [searchAnchorEl, setSearchAnchorEl] = useState<HTMLElement | null>(null);
    const [infoAnchorEl, setInfoAnchorEl] = useState<HTMLElement | null>(null);

    const handleSearchPopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
        setSearchAnchorEl(event.currentTarget);
    };

    const handleSearchPopoverClose = () => {
        setSearchAnchorEl(null);
    };

    // Handlers para el popover de información
    const handleInfoPopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
        setInfoAnchorEl(event.currentTarget);
    };

    const handleInfoPopoverClose = () => {
        setInfoAnchorEl(null);
    };

    return (
        <Toolbar
            sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                py: "16px"
            }}
        >
            {/* Sección de búsqueda */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <TextField
                    value={search}
                    variant="outlined"
                    size="small"
                    label="Buscar"
                    placeholder={placeHolderBuscador}
                    sx={{ width: { xs: 'auto', md: '300px' } }}
                    onChange={(e) => setSearch(e.target.value)}
                    disabled={!!errorCarga}
                />

                <IconButton
                    disabled={!!errorCarga}
                    aria-label="información del buscador"
                    onMouseEnter={handleSearchPopoverOpen}
                    onMouseLeave={handleSearchPopoverClose}
                >
                    <Search />
                </IconButton>

                <Popover
                    open={Boolean(searchAnchorEl)}
                    anchorEl={searchAnchorEl}
                    onClose={handleSearchPopoverClose}
                    anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "center",
                    }}
                    transformOrigin={{
                        vertical: "top",
                        horizontal: "center",
                    }}
                    disableRestoreFocus
                    sx={{
                        pointerEvents: 'none', // Permite interactuar con el contenido debajo
                    }}
                >
                    <Box>
                        <Alert severity="info">
                            <Typography fontWeight="bold">🔍 Buscador en vivo</Typography>
                            <Typography variant="body2" sx={{ mb: 2 }}>
                                {busquedaDescripcion}
                            </Typography>
                        </Alert>
                    </Box>
                </Popover>
            </Box>

            {/* Sección de acciones */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Button
                    disabled={!!errorCarga}
                    onClick={() => setOpenForm(true)}
                    variant="contained"
                    color="primary"
                >
                    AGREGAR
                </Button>

                <IconButton
                    disabled={!!errorCarga}
                    aria-label="información general"
                    onMouseEnter={handleInfoPopoverOpen}
                    onMouseLeave={handleInfoPopoverClose}
                >
                    <InfoOutlined />
                </IconButton>

                <Popover
                    open={Boolean(infoAnchorEl)}
                    anchorEl={infoAnchorEl}
                    onClose={handleInfoPopoverClose}
                    anchorOrigin={{
                        vertical: "top",
                        horizontal: "center",
                    }}
                    transformOrigin={{
                        vertical: "bottom",
                        horizontal: "center",
                    }}
                    disableRestoreFocus
                    sx={{
                        pointerEvents: 'none',
                    }}

                >
                    <Box>
                        <Alert severity="info">
                            <Typography fontWeight="bold">➕ Botón "AGREGAR"</Typography>
                            <Typography variant="body2" sx={{ mb: 2 }}>
                                {agregarDescripcion}
                            </Typography>
                        </Alert>
                    </Box>
                </Popover>
            </Box>
        </Toolbar>
    );
};

export default ToolbarTable;