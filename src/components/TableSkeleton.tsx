import { Skeleton, TableCell, TableRow } from "@mui/material";
import { FC } from "react";

export const TableSkeleton: FC = () => {
    return (
        <>
            {[...Array(5)].map((_, i) => (
                <TableRow key={`skeleton-row-${i}`}>
                    <TableCell colSpan={5}>
                        <Skeleton variant="text" width="100%" height={40} />
                    </TableCell>
                </TableRow>
            ))}
        </>
    );
};