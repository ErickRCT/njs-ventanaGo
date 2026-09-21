import {Alert, TableCell, TableRow} from "@mui/material";
import { FC } from "react";

export const EmptyState: FC = () => {
    return (
        <TableRow>
            <TableCell colSpan={6} align="center">
                <Alert severity="warning" sx={{ mt: 2 }}>
                    No se encontraron coincidencias, por favor inténtelo nuevamente
                </Alert>
            </TableCell>
        </TableRow>
    );
};