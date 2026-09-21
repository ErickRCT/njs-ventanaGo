import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
} from '@mui/material';
import useWindowDimensions from '../hooks/useWindowDimensions';
import { Cliente } from '../components/service/inteface.ts';

interface ListaClientesCrearCotizacionProps {
  clientes: Cliente[];
  onSelectCliente: (cliente: Cliente) => void; // Callback para capturar el cliente seleccionado
}

export const ListaClientesCrearCotizacion: React.FC<ListaClientesCrearCotizacionProps> = ({
  clientes,
  onSelectCliente,
}) => {
  const { width } = useWindowDimensions();
  const isMobile = width <= 767;

  // Estado para saber cuál tarjeta está seleccionada
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);

  const handleSelectCliente = (cliente: Cliente) => {
    setSelectedCliente(cliente); // Marcar como seleccionada
    onSelectCliente(cliente); // Llamar al callback para selección
  };

  if (isMobile) {
    return (
      <Box sx={{ width: '100%' }}>
        {[...clientes].reverse().map((cliente) => (
          <Box
            key={cliente.clienteId}
            sx={{
              border: '1px solid #ccc',
              borderRadius: '8px',
              padding: 2,
              marginBottom: 2,
              cursor: 'pointer',
              width: '100%',
              transition: 'background-color 0.3s ease, box-shadow 0.3s ease', // Transición suave
              backgroundColor: selectedCliente?.rut === cliente.rut ? '#b0bec5' : 'transparent', // Fondo oscuro cuando seleccionado
              '&:hover': {
                backgroundColor: '#90a4ae', // Fondo oscuro en hover
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)', // Sombra más suave en hover
              },
            }}
            onClick={() => handleSelectCliente(cliente)} // Seleccionar cliente al hacer clic
          >
            <Typography variant="body2">
              <strong>RUT:</strong> {cliente.rut}
            </Typography>
            <Typography variant="body2">
              <strong>Nombre:</strong> {cliente.nombre}
            </Typography>
            <Typography variant="body2">
              <strong>Teléfono:</strong> {cliente.telefono}
            </Typography>
            <Typography variant="body2">
              <strong>Email:</strong> {cliente.email}
            </Typography>

          </Box>
        ))}
      </Box>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="tabla de clientes">
        <TableHead>
          <TableRow>
            <TableCell>RUT</TableCell>
            <TableCell>Nombre</TableCell>
            <TableCell>Teléfono</TableCell>
            <TableCell>Email</TableCell>

          </TableRow>
        </TableHead>
        <TableBody>
          {[...clientes].reverse().map((cliente) => (
            <TableRow
              key={cliente.clienteId}
              sx={{
                '&:last-child td, &:last-child th': { border: 0 },
                cursor: 'pointer',
                backgroundColor:
                  selectedCliente?.rut === cliente.rut ? '#b0bec5' : 'transparent', // Fondo oscuro cuando seleccionado
                '&:hover': {
                  backgroundColor: '#90a4ae', // Fondo oscuro en hover
                  boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)', // Sombra suave en hover
                },
              }}
              onClick={() => handleSelectCliente(cliente)} // Selección de cliente al hacer clic
            >
              <TableCell component="th" scope="row">
                {cliente.rut}
              </TableCell>
              <TableCell>{cliente.nombre}</TableCell>
              <TableCell>{cliente.telefono}</TableCell>
              <TableCell>{cliente.email}</TableCell>

            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
