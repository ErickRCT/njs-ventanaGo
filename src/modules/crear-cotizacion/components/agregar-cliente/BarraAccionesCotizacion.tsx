import {
    Box,
    Typography,
    Dialog,
    DialogContent,
    Autocomplete,
    TextField,
    IconButton,
    Alert,
    Button,
    Popover,
} from '@mui/material';
import {AddCircleOutline ,
    Info,
} from '@mui/icons-material';
import { useEffect, useState, useRef } from 'react';
import { getCliente, getClientes } from '../../service/apiClient.ts';
import { Cliente } from '../../../../components/service/inteface.ts';
import { FormularioCliente } from '../../../../components/FormularioCliente';

interface BarraCotizacionProps {
    setIdCliente: (idCliente: number | null) => void;
    setCliente: (cliente: Cliente | null) => void;
    idCotizacion: number | null;
    cliente: Cliente | null;
    nombreCotizacion: string;
    setNombreCotizacion: (value: string) => void;
    cotizacionCliente: Cliente | null;
    onDescargar: () => void;
}

export const BarraAccionesCotizacion: React.FC<BarraCotizacionProps> = ({
                                                                            setIdCliente,
                                                                            nombreCotizacion,
                                                                            setNombreCotizacion,
                                                                            setCliente,
                                                                            cliente,
                                                                            idCotizacion
                                                                        }) => {
    const [formVisible, setFormVisible] = useState<boolean>(false);
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [selectedClienteInfo, setSelectedClienteInfo] = useState<Cliente | null>(null);
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
    const [autoCompleteOpen, setAutoCompleteOpen] = useState(false);
    const autoCompleteRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        obtenerClientes();
    }, []);

    const obtenerClientes = async () => {
        try {
            const response = await getClientes();
            setClientes(response);
        } catch (error) {
            console.error('Error al obtener los clientes:', error);
        }
    };

    const handleNuevoClienteClick = () => {
        setFormVisible(true);
        setAutoCompleteOpen(false);
    };

    const handleSubmit = async (idCliente: number | null) => {
        try {
            if (idCliente) {
                const response = await getCliente(idCliente);
                setCliente(response);
                setIdCliente(idCliente);
            }
            setFormVisible(false);
        } catch (error) {
            console.error('Error al obtener el cliente:', error);
        }
    };

    const handleCancel = () => setFormVisible(false);

    const handleSelectClienteAutocomplete = (_event: any, newValue: Cliente | null) => {
        if (newValue && newValue.clienteId !== 0) {
            setCliente(newValue);
            setIdCliente(newValue.clienteId);
            setAutoCompleteOpen(false);
        } else if (newValue?.clienteId === 0) {
            handleNuevoClienteClick();
        }
    };

    const handleMouseEnter = (event: React.MouseEvent<HTMLElement>, cliente: Cliente) => {
        setSelectedClienteInfo(cliente);
        setAnchorEl(event.currentTarget);

        // Calcular posición del popover
        const rect = event.currentTarget.getBoundingClientRect();
        setPopoverPosition({
            top: rect.top + window.scrollY,
            left: rect.right + window.scrollX + 8 // 8px de margen
        });
    };

    const handleMouseLeave = () => {
        setAnchorEl(null);
        setSelectedClienteInfo(null);
    };

    const handleCambiarCliente = () => {
        setCliente(null);
        setIdCliente(null);
    };

    const handleAutocompleteOpen = () => {
        setAutoCompleteOpen(true);
    };

    const handleAutocompleteClose = () => {
        if (!anchorEl) { // Solo cerrar si no hay popover abierto
            setAutoCompleteOpen(false);
        }
    };

    const opciones: Cliente[] = [
        { clienteId: 0, nombre: 'Agregar nuevo cliente', rut: '', direccion: '', telefono: '' } as Cliente,
        ...clientes
    ];

    const popoverOpen = Boolean(anchorEl);

    return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2, width: '100%' }}>
            {cliente ? (
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        bgcolor: 'rgba(255,255,255,0.6)',
                        px: 2,
                        py: 1,
                        borderRadius: 1,
                        border: '1px solid #ccc',
                        flexGrow: 1,
                        minWidth: 300
                    }}
                >
                    <Box
                        sx={{
                            bgcolor: '#1976d2',
                            color: '#fff',
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            textTransform: 'uppercase'
                        }}
                    >
                        {cliente.nombre
                            .split(' ')
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join('')}
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                            {cliente.nombre}
                        </Typography>
                        <Typography variant="body2">{cliente.rut}</Typography>
                    </Box>
                    {idCotizacion === null ? (
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={handleCambiarCliente}
                            sx={{ whiteSpace: 'nowrap' }}
                        >
                            Cambiar
                        </Button>
                    ) : null}
                </Box>
            ) : (
                <Box sx={{ position: 'relative', flexGrow: 2, minWidth: 280 }} ref={autoCompleteRef}>
                    <Autocomplete
                        options={opciones}
                        getOptionLabel={(option) =>
                            option.clienteId === 0 ? option.nombre : `${option.nombre} - ${option.rut}`
                        }
                        onChange={handleSelectClienteAutocomplete}
                        value={null}
                        inputValue={inputValue}
                        onInputChange={(_event, newInputValue) => setInputValue(newInputValue)}
                        renderOption={(props, option) => (
                            <li
                                {...props}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    width: '100%'
                                }}
                            >
                                <span>
                                    {option.clienteId === 0 ? (
                                        <>
                                            <AddCircleOutline style={{ marginRight: 8 }} /> {option.nombre}
                                        </>
                                    ) : (
                                        `${option.nombre} - ${option.rut}`
                                    )}
                                </span>
                                {option.clienteId !== 0 && (
                                    <IconButton
                                        size="small"
                                        onMouseEnter={(e) => handleMouseEnter(e, option)}
                                        onMouseLeave={handleMouseLeave}
                                        sx={{
                                            marginLeft: 'auto',
                                            '&:hover': {
                                                backgroundColor: 'transparent'
                                            }
                                        }}
                                    >
                                        <Info fontSize="small" />
                                    </IconButton>
                                )}
                            </li>
                        )}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Buscar cliente"
                                variant="outlined"
                                onClick={() => setAutoCompleteOpen(true)}
                                InputLabelProps={{
                                    shrink: true,
                                }}

                            />
                        )}
                        isOptionEqualToValue={(option, value) => option.clienteId === value?.clienteId}
                        open={autoCompleteOpen}
                        onOpen={handleAutocompleteOpen}
                        onClose={handleAutocompleteClose}
                        sx={{
                            '& .MuiAutocomplete-listbox': {
                                maxHeight: 300
                            }
                        }}
                        componentsProps={{
                            popper: {
                                modifiers: [
                                    {
                                        name: 'preventOverflow',
                                        enabled: true,
                                        options: {
                                            altBoundary: true,
                                            tether: false,
                                            rootBoundary: 'document',
                                        },
                                    },
                                ],
                            },
                        }}
                    />
                </Box>
            )}

            <TextField
                label="Nombre de la cotización"
                variant="outlined"
                value={nombreCotizacion}
                onChange={(e) => setNombreCotizacion(e.target.value)}
                sx={{ flexGrow: 2, minWidth: 240 }}
            />

            <Dialog open={formVisible} onClose={handleCancel} fullWidth maxWidth="sm">
                <DialogContent>
                    <FormularioCliente onSubmit={handleSubmit} onCancel={handleCancel} />
                </DialogContent>
            </Dialog>

            <Popover
                open={popoverOpen}
                anchorEl={anchorEl}
                onClose={handleMouseLeave}
                anchorReference="anchorPosition"
                anchorPosition={{
                    top: popoverPosition.top,
                    left: popoverPosition.left
                }}
                transformOrigin={{
                    vertical: 'center',
                    horizontal: 'left'
                }}
                sx={{
                    '& .MuiPopover-paper': {
                        marginLeft: '8px',
                        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
                        pointerEvents: 'auto' // Permite interactuar con el contenido
                    },
                    ml:3
                }}
                disableRestoreFocus
                container={autoCompleteRef.current}

            >
                <Alert
                    severity="info"
                    sx={{ p: 2, maxWidth: 300 }}
                    onMouseEnter={() => setAnchorEl(anchorEl)}
                    onMouseLeave={handleMouseLeave}
                >
                    {selectedClienteInfo && (
                        <>
                            <Typography variant="subtitle2" gutterBottom>
                                <strong>Información del Cliente</strong>
                            </Typography>
                            <Typography variant="body2">
                                <strong>Teléfono:</strong> {selectedClienteInfo.telefono}
                            </Typography>
                            <Typography variant="body2">
                                <strong>Email:</strong> {selectedClienteInfo.email}
                            </Typography>
                            <Typography variant="body2">
                                <strong>Dirección:</strong> {selectedClienteInfo.direccion || '—'}
                            </Typography>
                        </>
                    )}
                </Alert>
            </Popover>
        </Box>
    );
};