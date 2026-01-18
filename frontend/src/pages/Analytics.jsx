import React from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Analytics = () => {
  // Sample data for charts
  const lineChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Device Usage',
        data: [65, 59, 80, 81, 56, 55, 40],
        borderColor: 'rgb(0, 188, 212)',
        backgroundColor: 'rgba(0, 188, 212, 0.1)',
        fill: true,
      },
    ],
  };

  const barChartData = {
    labels: ['Temperature', 'Humidity', 'Light', 'Motion', 'Energy'],
    datasets: [
      {
        label: 'Data Points',
        data: [1200, 900, 750, 500, 300],
        backgroundColor: [
          'rgba(33, 150, 243, 0.7)',
          'rgba(76, 175, 80, 0.7)',
          'rgba(255, 152, 0, 0.7)',
          'rgba(156, 39, 176, 0.7)',
          'rgba(244, 67, 54, 0.7)',
        ],
      },
    ],
  };

  const pieChartData = {
    labels: ['Active', 'Inactive', 'Offline', 'Error'],
    datasets: [
      {
        data: [70, 15, 10, 5],
        backgroundColor: [
          'rgba(76, 175, 80, 0.7)',
          'rgba(255, 152, 0, 0.7)',
          'rgba(244, 67, 54, 0.7)',
          'rgba(156, 39, 176, 0.7)',
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
  };

  return (
    <Container maxWidth="xl">
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          Analytics
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Detailed analytics and insights from your IoT devices
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6">Monthly Usage Trend</Typography>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Time Period</InputLabel>
                  <Select label="Time Period" defaultValue="monthly">
                    <MenuItem value="daily">Daily</MenuItem>
                    <MenuItem value="weekly">Weekly</MenuItem>
                    <MenuItem value="monthly">Monthly</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ height: 300 }}>
                <Line data={lineChartData} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Data Distribution by Device Type
              </Typography>
              <Box sx={{ height: 300 }}>
                <Bar data={barChartData} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Device Status Distribution
              </Typography>
              <Box sx={{ height: 300 }}>
                <Pie data={pieChartData} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Key Metrics
              </Typography>
              <Grid container spacing={3}>
                {[
                  { label: 'Total Data Points', value: '3,245', change: '+12%' },
                  { label: 'Avg Response Time', value: '45ms', change: '-5%' },
                  { label: 'Success Rate', value: '99.8%', change: '+0.2%' },
                  { label: 'Active Sessions', value: '42', change: '+8%' },
                ].map((metric, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <Typography variant="h4" color="primary" gutterBottom>
                        {metric.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {metric.label}
                      </Typography>
                      <Typography
                        variant="caption"
                        color={metric.change.startsWith('+') ? 'success.main' : 'error.main'}
                      >
                        {metric.change} from last month
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Analytics;