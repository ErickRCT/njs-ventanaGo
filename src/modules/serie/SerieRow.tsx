import { TableRow, TableCell, IconButton } from '@mui/material';
import {SerieInterface} from './service/interface.ts';

import {Edit} from '@mui/icons-material';

interface Props {
    serie: SerieInterface;
    onEdit: (serie: SerieInterface) => void;
}

const SerieRow: React.FC<Props> = ({ serie , onEdit }) => {
    return (
        <TableRow sx={{ '& > *': { borderBottom: '1px solid #e0e0e0' } }}>
            <TableCell>{serie.nombre}</TableCell>
            <TableCell>{serie.descripcion}</TableCell>
            <TableCell>
                <IconButton color="info" size="small" onClick={() => onEdit(serie)}>
                    <Edit />
                </IconButton>
            </TableCell>
        </TableRow>
    );
};

export default SerieRow;
