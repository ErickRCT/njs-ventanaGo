import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  CardActionArea,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  AttachMoney,
  PeopleAlt,
  GridView,
  ViewList
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// Colores de Google Material Design
const googleColors = {
  blue: '#4285F4',
  red: '#EA4335',
  yellow: '#FBBC05',
  green: '#34A853',
  grey: '#F1F3F4',
  darkGrey: '#5F6368',
  lightBlue: '#E8F0FE',
  lightRed: '#FCE8E6',
  lightYellow: '#FEF7E0',
  lightGreen: '#E6F4EA',
};

// Datos para los gráficos
const salesData = [
  { name: 'Ene', cotizaciones: 120, ventas: 98 },
  { name: 'Feb', cotizaciones: 210, ventas: 130 },
  { name: 'Mar', cotizaciones: 180, ventas: 110 },
  { name: 'Abr', cotizaciones: 280, ventas: 210 },
  { name: 'May', cotizaciones: 190, ventas: 150 },
  { name: 'Jun', cotizaciones: 240, ventas: 180 },
];

const clientData = [
  { name: 'Constructora ABC', value: 58 },
  { name: 'Inmobiliaria XYZ', value: 42 },
  { name: 'Arquitectos Asoc.', value: 35 },
  { name: 'Gobierno Local', value: 28 },
  { name: 'Otros', value: 45 },
];

const COLORS = ['#4285F4', '#34A853', '#FBBC05', '#EA4335', '#5F6368'];

const seriesData = [
  { name: 'Serie 1000', value: 45 },
  { name: 'Serie 2000', value: 78 },
  { name: 'Serie 3000', value: 65 },
  { name: 'Serie 4000', value: 92 },
  { name: 'Serie 5000', value: 125 },
];

const Inicio = () => {
  const navigate = useNavigate();

  const handleCardClick = (ruta: string) => {
    navigate(ruta);
  };

  // Estilo común de las tarjetas
  const cardStyle = {
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    color: '#202124',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    backgroundColor: '#ffffff',
    border: '1px solid #dadce0',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      borderColor: googleColors.blue,
    },
  };

  // Estilo para los iconos de las tarjetas
  const iconStyle = {
    backgroundColor: googleColors.lightBlue,
    color: googleColors.blue,
    padding: '8px',
    borderRadius: '50%',
    fontSize: '24px',
  };

  return (
      <Box sx={{ p: 3 }}>
        <Typography
            variant="h4"
            sx={{
              mb: 3,
              color: googleColors.darkGrey,
              fontWeight: 500,
            }}
        >
          ¡Bienvenido a tu Panel de Control!
        </Typography>

        <Typography
            variant="subtitle1"
            sx={{
              mb: 4,
              color: googleColors.darkGrey,
            }}
        >
          Encuentra las opciones que necesitas para empezar a gestionar tu trabajo de manera rápida y fácil.
        </Typography>

        {/* Gráfico principal de rendimiento */}
        <Card sx={{ ...cardStyle, mb: 3, p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, color: googleColors.darkGrey }}>
            Rendimiento Mensual
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke={googleColors.darkGrey} />
              <YAxis stroke={googleColors.darkGrey} />
              <Tooltip />
              <Legend />
              <Line
                  type="monotone"
                  dataKey="cotizaciones"
                  stroke={googleColors.blue}
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                  name="Cotizaciones"
              />
              <Line
                  type="monotone"
                  dataKey="ventas"
                  stroke={googleColors.green}
                  strokeWidth={2}
                  name="Ventas"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Grid container spacing={3}>
          {/* COTIZACIONES */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={cardStyle}>
              <CardActionArea
                  onClick={() => handleCardClick('/cotizaciones')}
                  sx={{ p: 2, height: '100%' }}
              >
                <CardContent sx={{ p: 0 }}>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Box sx={{ ...iconStyle, bgcolor: googleColors.lightBlue }}>
                      <AttachMoney fontSize="small" />
                    </Box>
                    <Typography variant="h6" fontWeight={500}>
                      Cotizaciones
                    </Typography>
                  </Box>
                  <Typography variant="h5" fontWeight={600} sx={{ color: googleColors.blue, mb: 1 }}>
                    342
                  </Typography>
                  <Typography variant="body2" sx={{ color: googleColors.darkGrey, mb: 2 }}>
                    Últimos 30 días
                  </Typography>
                  <Box sx={{ height: 100 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={salesData.slice(-3)}>
                        <Bar dataKey="cotizaciones" fill={googleColors.blue} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>

          {/* CLIENTES */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={cardStyle}>
              <CardActionArea
                  onClick={() => handleCardClick('/clientes')}
                  sx={{ p: 2, height: '100%' }}
              >
                <CardContent sx={{ p: 0 }}>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Box sx={{ ...iconStyle, bgcolor: googleColors.lightGreen }}>
                      <PeopleAlt fontSize="small" sx={{ color: googleColors.green }} />
                    </Box>
                    <Typography variant="h6" fontWeight={500}>
                      Clientes
                    </Typography>
                  </Box>
                  <Box sx={{ height: 180 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                            data={clientData}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={60}
                            paddingAngle={2}
                            dataKey="value"
                        >
                          {clientData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                  <Typography variant="caption" sx={{ textAlign: 'center', display: 'block', color: googleColors.darkGrey }}>
                    Distribución por cliente
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>

          {/* SERIE */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={cardStyle}>
              <CardActionArea
                  onClick={() => handleCardClick('/series')}
                  sx={{ p: 2, height: '100%' }}
              >
                <CardContent sx={{ p: 0 }}>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Box sx={{ ...iconStyle, bgcolor: '#F3E5F5' }}>
                      <ViewList fontSize="small" sx={{ color: '#9C27B0' }} />
                    </Box>
                    <Typography variant="h6" fontWeight={500}>
                      Series
                    </Typography>
                  </Box>
                  <Box sx={{ height: 180 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                          data={seriesData}
                          layout="vertical"
                          margin={{ left: 30 }}
                      >
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={80} />
                        <Bar dataKey="value" fill="#9C27B0" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                  <Typography variant="caption" sx={{ textAlign: 'center', display: 'block', color: googleColors.darkGrey }}>
                    Cotizaciones por serie
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>

          {/* VIDRIO */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={cardStyle}>
              <CardActionArea
                  onClick={() => handleCardClick('/vidrios')}
                  sx={{ p: 2, height: '100%' }}
              >
                <CardContent sx={{ p: 0 }}>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Box sx={{ ...iconStyle, bgcolor: '#E0F7FA' }}>
                      <GridView fontSize="small" sx={{ color: '#00BCD4' }} />
                    </Box>
                    <Typography variant="h6" fontWeight={500}>
                      Vidrios
                    </Typography>
                  </Box>
                  <Box sx={{ height: 180 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                            data={[
                              { name: 'DVH 4-12-4', value: 78 },
                              { name: 'DVH 6-12-6', value: 45 },
                              { name: 'Monolítico 8mm', value: 32 },
                              { name: 'Laminado 6.38', value: 28 },
                              { name: 'Otros', value: 22 },
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={70}
                            paddingAngle={2}
                            dataKey="value"
                        >
                          <Cell fill="#00BCD4" />
                          <Cell fill="#0097A7" />
                          <Cell fill="#00838F" />
                          <Cell fill="#006064" />
                          <Cell fill="#B2EBF2" />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                  <Typography variant="caption" sx={{ textAlign: 'center', display: 'block', color: googleColors.darkGrey }}>
                    Preferencia de vidrios
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        </Grid>

        {/* Gráfico adicional de comparación */}
        <Card sx={{ ...cardStyle, mt: 3, p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, color: googleColors.darkGrey }}>
            Comparación de Series
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
                data={seriesData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke={googleColors.darkGrey} />
              <YAxis stroke={googleColors.darkGrey} />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#9C27B0" name="Cotizaciones" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </Box>
  );
};

export default Inicio;