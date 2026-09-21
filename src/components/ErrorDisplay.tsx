import { Alert, Box, Button, Paper, Typography } from "@mui/material";
import ErrorIcon from "@mui/icons-material/Error";
import RefreshIcon from "@mui/icons-material/Refresh";

interface ErrorDisplayProps {
    onRetry: () => void;
    title: string;
    message: string;
}

export const ErrorDisplay = ({ onRetry, title, message }: ErrorDisplayProps) => {
    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 4,
            gap: 2,
            minHeight: 300
        }}>
            <Paper elevation={3} sx={{ p: 3, textAlign: 'center', my: 3 }}>
                <ErrorIcon color="info" sx={{ fontSize: 60, mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                    {title}
                </Typography>
                <Alert severity="error" sx={{ mb: 3 }}>
                    {message}
                </Alert>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={onRetry}
                    startIcon={<RefreshIcon />}
                >
                    Volver a intentar
                </Button>
            </Paper>
        </Box>
    );
};