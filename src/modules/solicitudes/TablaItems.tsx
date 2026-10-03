import { Box, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { formatoPesos, totalItems, type ItemVentana } from "./tipos.ts";

/** Ventanas de una solicitud, con precios si la empresa ya los definió. */
export const TablaItems = ({ items }: { items: ItemVentana[] }) => {
    const total = totalItems(items);
    return (
        <Box sx={{ overflowX: "auto" }}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Ventana</TableCell>
                        <TableCell>Medidas (mm)</TableCell>
                        <TableCell>Color / Vidrio</TableCell>
                        <TableCell align="right">Cant.</TableCell>
                        <TableCell align="right">Precio unit.</TableCell>
                        <TableCell align="right">Subtotal</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {items.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell>
                                {item.descripcion}
                                {item.observaciones && <Box sx={{ fontSize: "0.75rem", color: "text.secondary" }}>{item.observaciones}</Box>}
                            </TableCell>
                            <TableCell>{item.anchoMm} × {item.altoMm}</TableCell>
                            <TableCell>{item.colorNombre} / {item.vidrioNombre}</TableCell>
                            <TableCell align="right">{item.cantidad}</TableCell>
                            <TableCell align="right">{item.precioUnitario === null ? "—" : formatoPesos(item.precioUnitario)}</TableCell>
                            <TableCell align="right">
                                {item.precioUnitario === null ? "—" : formatoPesos(item.precioUnitario * item.cantidad)}
                            </TableCell>
                        </TableRow>
                    ))}
                    {total !== null && (
                        <TableRow>
                            <TableCell colSpan={5} align="right" sx={{ fontWeight: 700 }}>Total</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700 }}>{formatoPesos(total)}</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </Box>
    );
};
