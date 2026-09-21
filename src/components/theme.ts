import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      // El azul pizarra elegante e intermedio de los iconos de la propuesta visual
      main: '#2b4c7e',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#718096',
    },
    background: {
      default: '#f7fafc', // Gris muy claro y limpio para las vistas
      paper: '#ffffff',   // Blanco puro para las tarjetas y contenedores de tablas
    },
    text: {
      primary: '#2d3748',   // Texto principal oscuro pulcro (evita el negro puro)
      secondary: '#4a5568', // Subtítulos legibles pero sutiles
    },
  },
  components: {
    // 1. BOTONES: Bordes redondeados modernos, sin sombras rígidas y el color de la propuesta
    MuiButton: {
      defaultProps: {
        disableElevation: true, // Remueve la sombra pesada por defecto de MUI
      },
      styleOverrides: {
        root: {
          borderRadius: 8, // Esquinas redondeadas sofisticadas
          textTransform: 'none', // Evita que los textos se fuercen a mayúsculas
          fontWeight: 600,
          padding: '8px 18px',
          fontSize: '0.875rem',
          transition: 'all 0.2s ease',
        },
        containedPrimary: {
          backgroundColor: '#2b4c7e',
          '&:hover': {
            backgroundColor: '#1d355a', // Se oscurece de forma sutil y elegante en hover
          },
        },
        containedSecondary: {
          backgroundColor: '#e2e8f0',
          color: '#4a5568',
          '&:hover': {
            backgroundColor: '#cbd5e0',
          },
        },
      },
    },

    // 2. CAMPOS DE TEXTO / INPUTS: Bordes finos y enfoque con el azul de la propuesta
    MuiTextField: {
      defaultProps: {
        InputLabelProps: {
          shrink: true, // Mantiene los labels arriba de manera consistente
        },
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8, // Esquinas consistentes con los botones
            backgroundColor: '#ffffff',
            '& fieldset': {
              borderColor: '#e2e8f0', // Borde gris claro muy sutil que aporta ligereza
            },
            '&:hover fieldset': {
              borderColor: '#cbd5e0',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#2b4c7e', // Enfoque estilizado con el azul de la propuesta
              borderWidth: '1px', // Evita que la línea se engrose toscamente
            },
          },
        },
      },
    },

    // 3. TABLAS: Filas estilizadas, tamaño 'small' y efecto intercalado por COLUMNA automático
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #edf2f7',
          padding: '12px 16px',
          color: '#2d3748',
          // 🌟 NUEVO: Aplica un fondo gris azulado sutil a las columnas impares (1ª, 3ª, 5ª...)
          '&:nth-of-type(odd)': {
            backgroundColor: '#f8f9fa',
          },
          // 🌟 NUEVO: Asegura que las columnas pares (2ª, 4ª...) mantengan su fondo transparente/blanco
          '&:nth-of-type(even)': {
            backgroundColor: 'transparent',
          },
        },
        sizeSmall: {
          padding: '6px 12px',
          fontSize: '0.8125rem',
        },
        head: {
          fontWeight: 600,
          color: '#4a5568',
          fontSize: '0.875rem',
          borderBottom: '2px solid #edf2f7',
          // Forzamos que las cabeceras de las columnas impares también sigan el intercalado si lo deseas,
          // o puedes dejarlo en blanco puro comentando estas líneas:
          '&:nth-of-type(odd)': {
            backgroundColor: '#f1f3f5',
          },
          '&:nth-of-type(even)': {
            backgroundColor: '#ffffff',
          },
        },
      },
    },



    // 4. ICONOS DE ACCIÓN EN TABLAS (Editar, Eliminar, etc.)
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: '#2b4c7e', // Mismo azul de la propuesta
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: 'rgba(43, 76, 126, 0.06)', // Destello translúcido sutil en hover
            color: '#1d355a',
          },
        },
      },
    },
    MuiSvgIcon: {
      styleOverrides: {
        root: {
          fontSize: '1.2rem', // Tamaño estilizado para que se vea más fino que el estándar
        },
      },
    },

    // 5. DIÁLOGOS / MODALES: Encabezados integrados con el tono de la propuesta
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          backgroundColor: '#2b4c7e', // Encabezado a juego con la identidad visual
          color: '#ffffff',
          padding: '16px 24px',
          fontWeight: 600,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12, // Curvatura refinada para las ventanas emergentes
          boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.05)', // Sombra difuminada fina
        },
      },
    },

    // 6. PAGINACIÓN DE TABLAS: Estructura pulcra para los pies de página
    MuiTablePagination: {
      styleOverrides: {
        root: {
          width: '100%',
          overflow: 'hidden',
          borderTop: '1px solid #edf2f7',
          color: '#718096',
        },
        toolbar: {
          padding: '8px 16px',
          minHeight: 'auto',
        },
        selectLabel: {
          margin: 0,
          fontSize: '0.875rem',
        },
        displayedRows: {
          margin: 0,
          fontSize: '0.875rem',
          fontWeight: 500,
        },
        select: {
          marginRight: '8px',
          padding: '6px 12px',
        },
        actions: {
          marginLeft: '12px',
        },
      },
    },

    // 7. ICONO DE PASOS (STEPS / WIZARDS): Línea de tiempo estilizada
    MuiStepIcon: {
      styleOverrides: {
        root: {
          color: '#e2e8f0',
          '&.Mui-active': {
            color: '#2b4c7e',
          },
          '&.Mui-completed': {
            color: '#4CAF50',
          },
        },
      },
    },
  },
});
