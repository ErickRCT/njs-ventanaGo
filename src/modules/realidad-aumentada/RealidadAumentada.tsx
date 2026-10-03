import { Card, CardContent } from "@mui/material";
import { VisorVentanaAR } from "./VisorVentanaAR.tsx";

export const RealidadAumentada = () => (
    <Card>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <VisorVentanaAR />
        </CardContent>
    </Card>
);
