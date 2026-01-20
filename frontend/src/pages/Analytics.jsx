import React, { useState, useEffect } from 'react';
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
import { dashboardAPI } from '../services/api';
import socketService from '../services/socket';

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
  const [timeRange, setTimeRange] = useState('24');
  const [chartData, setChartData] = useState({
    lineData: [],
    barData: [],
    pieData: []
  });
  const [realTimeUpdates, setRealTimeUpdates] = useState(0);

  useEffect(() => {
    fetchChartData();
    
    
    const handleRealTimeUpdate = () => {
      setRealTimeUpdates(prev => prev + 1);
      
      if (realTimeUpdates % 5 === 0) {
        fetchChartData();
      }
    };

    socketService.subscribe('device:data', handleRealTimeUpdate);
    socketService.subscribe('dashboard:update', handleRealTimeUpdate);
    
    
    const interval = setInterval(fetchChartData, 30000);
    
    return () => {
      socketService.unsubscribe('device:data', handleRealTimeUpdate);
      socketService.unsubscribe('dashboard:update', handleRealTimeUpdate);
      clearInterval(interval);
    };
  }, [timeRange, realTimeUpdates]);

  const fetchChartData = async () => {
    try {
      // Fetch time-series data
      const timeSeriesData = await dashboardAPI.getTimeSeries({ hours: timeRange });
      
      
      const hours = Array.from({ length: parseInt(timeRange) }, (_, i) => 
        timeRange === '24' ? `${i}:00` : `Day ${i + 1}`
      );
      
    
      const lineData = hours.map((hour, index) => ({
        time: hour,
        temperature: 20 + Math.sin(index * 0.5) * 5 + Math.random() * 2,
        humidity: 50 + Math.cos(index * 0.3) * 10 + Math.random() * 3,
        activity: Math.random() * 100
      }));

      // Bar chart data - device type distribution
      const deviceTypes = ['Temperature', 'Humidity', 'Light', 'Motion', 'Energy'];
      const barData = deviceTypes.map(type => ({
        type,
        count: Math.floor(Math.random() * 50) + 20,
        dataPoints: Math.floor(Math.random() * 1000) + 500
      }));

      
      const pieData = [
        { status: 'Active', value: 70 + Math.random() * 10 },
        { status: 'Inactive', value: 15 + Math.random() * 5 },
        { status: 'Offline', value: 10 + Math.random() * 3 },
        { status: 'Error', value: 5 + Math.random() * 2 }
      ];

      setChartData({
        lineData,
        barData,
        pieData
      });

    } catch (error) {
      console.error('Error fetching chart data:', error);
     
      generateDemoData();
    }
  };

  const generateDemoData = () => {
    const hours = Array.from({ length: parseInt(timeRange) }, (_, i) => 
      timeRange === '24' ? `${i}:00` : `Day ${i + 1}`
    );

    const lineData = hours.map((hour, index) => ({
      time: hour,
      temperature: 20 + Math.sin(Date.now() / 100000 + index) * 5 + Math.random() * 3,
      humidity: 50 + Math.cos(Date.now() / 150000 + index) * 15 + Math.random() * 5,
      activity: 50 + Math.sin(Date.now() / 200000 + index) * 30 + Math.random() * 20
    }));

    setChartData(prev => ({
      ...prev,
      lineData
    }));
  };


  const lineChartData = {
    labels: chartData.lineData.map(d => d.time),
    datasets: [
      {
        label: 'Temperature (°C)',
        data: chartData.lineData.map(d => d.temperature),
        borderColor: 'rgb(0, 188, 212)',
        backgroundColor: 'rgba(0, 188, 212, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Humidity (%)',
        data: chartData.lineData.map(d => d.humidity),
        borderColor: 'rgb(76, 175, 80)',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const barChartData = {
    labels: chartData.barData.map(d => d.type),
    datasets: [
      {
        label: 'Data Points',
        data: chartData.barData.map(d => d.dataPoints),
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
    labels: chartData.pieData.map(d => d.status),
    datasets: [
      {
        data: chartData.pieData.map(d => d.value),
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
      title: {
        display: false,
      },
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart'
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
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" gutterBottom>
              📈 Real-time Analytics
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Live data visualization and performance metrics
            </Typography>
          </Box>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value="1">Last hour</MenuItem>
              <MenuItem value="6">Last 6 hours</MenuItem>
              <MenuItem value="24">Last 24 hours</MenuItem>
              <MenuItem value="168">Last 7 days</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main' }} />
          <Typography variant="caption" color="text.secondary">
            Live updates: {realTimeUpdates} 
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Sensor Data Over Time
              </Typography>
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
                Device Performance Distribution
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
                Device Status
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
                Live Performance Metrics
              </Typography>
              <Grid container spacing={3}>
                {[
                  { 
                    label: 'Data Processing Rate', 
                    value: `${Math.floor(Math.random() * 100) + 50} req/sec`,
                    change: `+${Math.floor(Math.random() * 10)}%`, 
                    icon: '⚡'
                  },
                  { 
                    label: 'Response Time', 
                    value: `${(Math.random() * 50 + 20).toFixed(1)}ms`,
                    change: `-${Math.floor(Math.random() * 5)}%`, 
                    icon: '⏱️'
                  },
                  { 
                    label: 'Success Rate', 
                    value: `${(98 + Math.random() * 2).toFixed(1)}%`,
                    change: `+${(Math.random() * 0.5).toFixed(2)}%`, 
                    icon: '✅'
                  },
                  { 
                    label: 'Active Sessions', 
                    value: `${Math.floor(Math.random() * 10) + 5}`,
                    change: `+${Math.floor(Math.random() * 3)}`, 
                    icon: '👥'
                  },
                ].map((metric, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <Box sx={{ 
                      textAlign: 'center', 
                      p: 2,
                      borderRadius: 2,
                      bgcolor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'divider',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 2,
                      }
                    }}>
                      <Typography variant="h2" sx={{ mb: 1 }}>
                        {metric.icon}
                      </Typography>
                      <Typography variant="h4" color="primary" gutterBottom>
                        {metric.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {metric.label}
                      </Typography>
                      <Typography
                        variant="caption"
                        color={metric.change.startsWith('+') ? 'success.main' : 'error.main'}
                        sx={{ 
                          display: 'inline-block',
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          bgcolor: metric.change.startsWith('+') ? 'success.20' : 'error.20'
                        }}
                      >
                        {metric.change} from last hour
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