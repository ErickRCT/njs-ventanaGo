import {
    TablePagination,
    TablePaginationProps,
    TableRow,
    TableCell
} from '@mui/material';

type PaginacionTablaProps = {
    count: number;
    page: number;
    rowsPerPage: number;
    onPageChange: TablePaginationProps['onPageChange'];
    onRowsPerPageChange: TablePaginationProps['onRowsPerPageChange'];
    colSpan?: number;
};

export const PaginationTable = ({
                                    count,
                                    page,
                                    rowsPerPage,
                                    onPageChange,
                                    onRowsPerPageChange,
                                    colSpan = 6
                                }: PaginacionTablaProps) => {
    return (
        <TableRow>
            <TableCell colSpan={colSpan}>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25, { label: 'Todos', value: -1 }]}
                    component="div"
                    count={count}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onPageChange={onPageChange}
                    onRowsPerPageChange={onRowsPerPageChange}
                    labelRowsPerPage="Filas por página"
                    labelDisplayedRows={({ from, to, count }) =>
                        `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
                    }
                />
            </TableCell>
        </TableRow>
    );
};
