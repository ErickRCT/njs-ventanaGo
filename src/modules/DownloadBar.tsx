import React from 'react';
import {
    Box,
    Tooltip,
    IconButton,
    Stack
} from '@mui/material';
import {
    RequestQuote as RequestQuoteIcon,
    Inventory2 as Inventory2Icon,
    Engineering as EngineeringIcon,
} from '@mui/icons-material';
import {CropFree , Download} from '@mui/icons-material';

// Colores de Google Material Design
const googleColors = {
    blue: '#4285F4',
    red: '#EA4335',
    yellow: '#FBBC05',
    green: '#34A853',
    grey: '#F1F3F4',
    darkGrey: '#5F6368',
    lightBlue: '#E8F0FE',
    lightRed: '#FCE8E6',
    lightYellow: '#FEF7E0',
    lightGreen: '#E6F4EA',
};

interface DownloadBarProps {
    onDownloadQuote?: () => void;
    onDownloadOptimization?: () => void;
    onDownloadMaterialList?: () => void;
    onDownloadWorkOrder?: () => void;
    onDownloadAll?: () => void;
    disabled?: boolean;
}

const DownloadBar: React.FC<DownloadBarProps> = ({
                                                     onDownloadQuote,
                                                     onDownloadOptimization,
                                                     onDownloadMaterialList,
                                                     onDownloadWorkOrder,
                                                     onDownloadAll,
                                                     disabled = false
                                                 }) => {

    const iconButtonStyle = (color: string) => ({
        backgroundColor: color + '14', // 8% opacity
        color: color,
        borderRadius: '50%',
        width: 40,
        height: 40,
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
            backgroundColor: color + '1F', // 12% opacity
            transform: 'translateY(-2px)'
        },
        '&:active': {
            transform: 'translateY(0)'
        },
        '&.Mui-disabled': {
            backgroundColor: googleColors.grey,
            color: googleColors.darkGrey + '80'
        }
    });

    return (
        <Box sx={{ p: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center">
                <Tooltip title="Descargar Cotización" arrow>
                    <IconButton
                        onClick={onDownloadQuote}
                        disabled={disabled}
                        sx={iconButtonStyle(googleColors.blue)}
                    >
                        <RequestQuoteIcon fontSize="small" />
                    </IconButton>
                </Tooltip>

                <Tooltip title="Descargar Optimización de Perfiles" arrow>
                    <IconButton
                        onClick={onDownloadOptimization}
                        disabled={disabled}
                        sx={iconButtonStyle(googleColors.green)}
                    >
                        <CropFree fontSize="small" />
                    </IconButton>
                </Tooltip>

                <Tooltip title="Descargar Lista de Materiales con Precio" arrow>
                    <IconButton
                        onClick={onDownloadMaterialList}
                        disabled={disabled}
                        sx={iconButtonStyle(googleColors.yellow)}
                    >
                        <Inventory2Icon fontSize="small" />
                    </IconButton>
                </Tooltip>

                <Tooltip title="Descargar Orden de Trabajo" arrow>
                    <IconButton
                        onClick={onDownloadWorkOrder}
                        disabled={disabled}
                        sx={iconButtonStyle('#9C27B0')} // Purple for variety
                    >
                        <EngineeringIcon fontSize="small" />
                    </IconButton>
                </Tooltip>

                <Tooltip title="Descargar todos los documentos" arrow>
                    <IconButton
                        onClick={onDownloadAll}
                        disabled={disabled}
                        sx={iconButtonStyle(googleColors.red)}
                    >
                        <Download fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Stack>
        </Box>
    );
};

export default DownloadBar;