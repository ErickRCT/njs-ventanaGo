import { useState, useEffect } from 'react';
import {
    Button,
    IconButton,
    Box,
    CircularProgress,
    useMediaQuery,
    useTheme,
    TextField,
    InputAdornment,
    Dialog,
    DialogTitle,
    DialogContent,

} from '@mui/material';
import {PhotoLibrary,Upload,ChevronLeft,ChevronRight,Search} from '@mui/icons-material';
import { getImagenesServidor , uploadImage } from "../service/apiClient.ts";

interface SelectorImagenAccesorioProps {
    imagenActual: string;
    onSeleccionar: (ruta: string) => void;
}

interface ImageData {
    url: string;
    name: string;
    rutaRelativa: string; // Nueva propiedad para almacenar la ruta relativa
}

export const SelectorImagenAccesorio: React.FC<SelectorImagenAccesorioProps> = ({ imagenActual, onSeleccionar }) => {
    const [open, setOpen] = useState(false);
    const [, setSelectedImage] = useState(imagenActual);
    const [selectedRelativePath, setSelectedRelativePath] = useState(imagenActual); // Para almacenar la ruta relativa
    const [images, setImages] = useState<ImageData[]>([]);
    const [filteredImages, setFilteredImages] = useState<ImageData[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // Función para extraer la ruta relativa de una URL completa
    const extraerRutaRelativa = (urlCompleta: string): string => {
        try {
            const url = new URL(urlCompleta);
            // Obtener la ruta completa (pathname) y eliminar el slash inicial si existe
            return url.pathname.startsWith('/') ? url.pathname.substring(1) : url.pathname;
        } catch (e) {
            console.error(e);
            // Si no es una URL válida, asumimos que ya es una ruta relativa
            return urlCompleta;
        }
    };

    const getImageName = (url: string) => {
        const rutaRelativa = extraerRutaRelativa(url);
        return rutaRelativa.split('/').pop()?.split('.')[0] || '';
    };

    const handleSeleccion = (index: number) => {
        setCurrentIndex(index);
        setSelectedImage(filteredImages[index].url);
        setSelectedRelativePath(filteredImages[index].rutaRelativa);
    };

    const handleConfirmar = () => {
        // Enviar solo la ruta relativa en lugar de la URL completa
        onSeleccionar(selectedRelativePath);
        setOpen(false);
    };

    const handleUpload = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {

        const file = event.target.files?.[0];

        console.log("ARCHIVO:", file);

        if (!file) return;

        try {

            // Enviar imagen al backend
            const rutaImagen = await uploadImage(file);

            console.log("Imagen guardada:", rutaImagen);

            // URL temporal para previsualización
            const url = URL.createObjectURL(file);

            const newImage = {
                url,
                name: file.name.split(".")[0],
                rutaRelativa: rutaImagen
            };

            setImages(prev => [...prev, newImage]);
            setFilteredImages(prev => [...prev, newImage]);

            setCurrentIndex(images.length);
            setSelectedImage(url);
            setSelectedRelativePath(rutaImagen);

        } catch (error) {
            console.error("Error al subir imagen:", error);
        }
    };

    const handlePrev = () => {
        const newIndex = (currentIndex - 1 + filteredImages.length) % filteredImages.length;
        handleSeleccion(newIndex);
    };

    const handleNext = () => {
        const newIndex = (currentIndex + 1) % filteredImages.length;
        handleSeleccion(newIndex);
    };

    useEffect(() => {
        if (searchTerm === '') {
            setFilteredImages(images);
            if (images.length > 0 && currentIndex >= images.length) {
                setCurrentIndex(0);
            }
        } else {
            const filtered = images.filter(img =>
                img.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredImages(filtered);
            setCurrentIndex(0);
        }
    }, [searchTerm, images]);

    useEffect(() => {
        const obtenerImagenes = async () => {
            try {
                const urls = await getImagenesServidor();
                const imagesData = urls.map(url => ({
                    url, // URL completa para visualización
                    name: getImageName(url),
                    rutaRelativa: extraerRutaRelativa(url) // Ruta relativa para almacenamiento
                }));
                setImages(imagesData);
                setFilteredImages(imagesData);

                // Si hay una imagen actual, buscar su índice
                if (imagenActual) {
                    const rutaActual = extraerRutaRelativa(imagenActual);
                    const index = imagesData.findIndex(img => img.rutaRelativa === rutaActual);
                    if (index !== -1) {
                        setCurrentIndex(index);
                        setSelectedImage(imagesData[index].url);
                        setSelectedRelativePath(imagesData[index].rutaRelativa);
                    }
                }
            } catch (error) {
                console.error("Error al obtener las imágenes:", error);
            } finally {
                setLoading(false);
            }
        };

        obtenerImagenes();
    }, [imagenActual]);

    useEffect(() => {
        if (open && filteredImages.length > 0) {
            // Asegura que al abrir el dialog, se sincronice la imagen seleccionada con la primera visible
            setCurrentIndex(0);
            setSelectedImage(filteredImages[0].url);
            setSelectedRelativePath(filteredImages[0].rutaRelativa);
        }
    }, [open, filteredImages]);

    if (loading) return <CircularProgress />;

    return (
        <>
            <Button
                variant="outlined"
                startIcon={<PhotoLibrary />}
                onClick={() => setOpen(true)}
                sx={{ mt: 2 }}
            >
                Seleccionar imagen
            </Button>

            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                fullWidth
                maxWidth="md"
                fullScreen={isMobile}
                sx={{
                    '& .MuiDialog-paper': {
                        height: isMobile ? '100%' : '80vh',
                        maxHeight: isMobile ? 'none' : '800px',
                        maxWidth: isMobile ? '100%' : 'calc(100% - 64px)'
                    }
                }}
            >
                <DialogTitle>Selecciona una Imagen</DialogTitle>
                <DialogContent
                    sx={{
                        padding: 0,
                        display: 'flex',
                        flexDirection: isMobile ? 'column' : 'row',
                        height: '100%',
                        overflow: 'hidden'
                    }}
                >
                    {/* Vista principal de la imagen */}
                    <Box
                        sx={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 3,
                            position: 'relative',
                            borderRight: isMobile ? 'none' : '1px solid',
                            borderBottom: isMobile ? '1px solid' : 'none',
                            borderColor: 'divider',
                            backgroundColor: 'background.default',
                            overflow: 'hidden'
                        }}
                    >
                        {filteredImages.length > 0 ? (
                            <Box
                                sx={{
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'relative'
                                }}
                            >
                                <img
                                    src={filteredImages[currentIndex]?.url}
                                    alt={`Imagen ${currentIndex + 1}`}
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '100%',
                                        objectFit: 'contain',
                                        borderRadius: 4,
                                        boxShadow: theme.shadows[2]
                                    }}
                                />
                            </Box>
                        ) : (
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: '100%',
                                    color: 'text.secondary'
                                }}
                            >
                                {searchTerm ?
                                    'No se encontraron imágenes que coincidan con la búsqueda' :
                                    'No hay imágenes disponibles'}
                            </Box>
                        )}
                    </Box>

                    {/* Lista de miniaturas con scroll */}
                    <Box
                        sx={{
                            width: isMobile ? '100%' : 200,
                            height: isMobile ? 150 : 'auto',
                            overflowY: 'auto',
                            padding: 2,
                            display: 'flex',
                            flexDirection: isMobile ? 'row' : 'column',
                            gap: 2,
                            flexShrink: 0,
                            backgroundColor: 'background.paper'
                        }}
                    >
                        {filteredImages.length > 0 ? (
                            filteredImages.map((img, index) => (
                                <Box
                                    key={index}
                                    onClick={() => handleSeleccion(index)}
                                    sx={{
                                        cursor: 'pointer',
                                        border: currentIndex === index ? '3px solid' : '1px solid',
                                        borderColor: currentIndex === index ? 'primary.main' : 'divider',
                                        borderRadius: 1,
                                        overflow: 'hidden',
                                        flexShrink: 0,
                                        width: isMobile ? 120 : '100%',
                                        height: isMobile ? 120 : 100,
                                        position: 'relative',
                                        transition: 'border-color 0.2s ease',
                                        '&:hover': {
                                            borderColor: currentIndex === index ? 'primary.main' : 'action.active'
                                        }
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: '100%',
                                            height: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            backgroundColor: 'background.default'
                                        }}
                                    >
                                        <img
                                            src={img.url}
                                            alt={`Miniatura ${index + 1}`}
                                            style={{
                                                maxWidth: '100%',
                                                maxHeight: '100%',
                                                objectFit: 'contain',
                                                padding: 4
                                            }}
                                        />
                                    </Box>
                                    {!isMobile && (
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                bottom: 0,
                                                left: 0,
                                                right: 0,
                                                backgroundColor: 'rgba(0,0,0,0.5)',
                                                color: 'white',
                                                fontSize: '0.75rem',
                                                padding: '2px 4px',
                                                textOverflow: 'ellipsis',
                                                overflow: 'hidden',
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            {img.name}
                                        </Box>
                                    )}
                                </Box>
                            ))
                        ) : (
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '100%',
                                    color: 'text.secondary',
                                    fontSize: '0.875rem'
                                }}
                            >
                                {searchTerm ?
                                    'No hay coincidencias' :
                                    'Sube tu primera imagen'}
                            </Box>
                        )}
                    </Box>
                </DialogContent>

                {/* Sección de acciones con buscador y flechas integradas */}
                <Box
                    sx={{
                        padding: 2,
                        borderTop: '1px solid',
                        borderColor: 'divider',
                        display: 'flex',
                        flexDirection: isMobile ? 'column' : 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: 'background.paper',
                        gap: isMobile ? 2 : 1
                    }}
                >
                    <TextField
                        size="small"
                        placeholder="Buscar imágenes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        sx={{
                            flex: isMobile ? 1 : 0.5,
                            minWidth: 150
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search />
                                </InputAdornment>
                            ),
                        }}
                    />

                    <Box display="flex" alignItems="center" gap={1}>
                        <Button
                            component="label"
                            startIcon={<Upload />}
                            size={isMobile ? 'small' : 'medium'}
                            variant="outlined"
                            sx={{ flexShrink: 0 }}
                        >
                            Subir Imagen
                            <input type="file" hidden accept="image/*" onChange={handleUpload} />
                        </Button>

                        {filteredImages.length > 1 && (
                            <>
                                <IconButton
                                    onClick={handlePrev}
                                    size="medium"
                                    sx={{
                                        backgroundColor: 'background.default',
                                        '&:hover': { backgroundColor: 'action.hover' }
                                    }}
                                >
                                    <ChevronLeft />
                                </IconButton>
                                <IconButton
                                    onClick={handleNext}
                                    size="medium"
                                    sx={{
                                        backgroundColor: 'background.default',
                                        '&:hover': { backgroundColor: 'action.hover' }
                                    }}
                                >
                                    <ChevronRight />
                                </IconButton>
                            </>
                        )}
                    </Box>

                    <Box display="flex" gap={1}>
                        <Button
                            onClick={() => setOpen(false)}
                            size={isMobile ? 'small' : 'medium'}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleConfirmar}
                            size={isMobile ? 'small' : 'medium'}
                            disabled={filteredImages.length === 0}
                        >
                            Seleccionar
                        </Button>
                    </Box>
                </Box>
            </Dialog>
        </>
    );
};