import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
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
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { dashboardAPI } from '../../services/api';
import socketService from '../../services/socket';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Charts = () => {
  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('all');
  const [timeRange, setTimeRange] = useState('24');

  const fetchTimeSeriesData = useCallback(async () => {
    try {
      const params = {
        hours: timeRange,
        ...(selectedDevice !== 'all' && { deviceId: selectedDevice }),
      };
      const data = await dashboardAPI.getTimeSeries(params);
      setTimeSeriesData(data.data);
    } catch (error) {
      console.error('Error fetching time series:', error);
    }
  }, [selectedDevice, timeRange]);

  useEffect(() => {
    fetchTimeSeriesData();
    
   
    const handleNewData = (data) => {
      fetchTimeSeriesData();
    };
    
    socketService.subscribe('device:data', handleNewData);
    
    return () => {
      socketService.unsubscribe('device:data', handleNewData);
    };
  }, [fetchTimeSeriesData]);

  const handleNewData = (data) => {
    // Update charts with new data in real-time
    fetchTimeSeriesData();
  };

  // Prepare line chart data
  const lineChartData = {
    labels: timeSeriesData.map(item => `${item._id.hour}:00`),
    datasets: [
      {
        label: 'Average Value',
        data: timeSeriesData.map(item => item.avgValue),
        borderColor: 'rgb(0, 188, 212)',
        backgroundColor: 'rgba(0, 188, 212, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Max Value',
        data: timeSeriesData.map(item => item.maxValue),
        borderColor: 'rgb(76, 175, 80)',
        borderDash: [5, 5],
        fill: false,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Time Series Analysis',
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

  // Prepare bar chart data 
  const barChartData = {
    labels: ['Temperature', 'Humidity', 'Light', 'Motion', 'Energy'],
    datasets: [
      {
        label: 'Device Count',
        data: [12, 8, 5, 3, 2],
        backgroundColor: [
          'rgba(33, 150, 243, 0.7)',
          'rgba(76, 175, 80, 0.7)',
          'rgba(255, 152, 0, 0.7)',
          'rgba(156, 39, 176, 0.7)',
          'rgba(244, 67, 54, 0.7)',
        ],
        borderColor: [
          'rgb(33, 150, 243)',
          'rgb(76, 175, 80)',
          'rgb(255, 152, 0)',
          'rgb(156, 39, 176)',
          'rgb(244, 67, 54)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Device Type Distribution',
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
    <Grid container spacing={3} sx={{ mt: 2 }}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6">Data Visualization</Typography>
              <Box display="flex" gap={2}>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Device</InputLabel>
                  <Select
                    value={selectedDevice}
                    label="Device"
                    onChange={(e) => setSelectedDevice(e.target.value)}
                  >
                    <MenuItem value="all">All Devices</MenuItem>
                    <MenuItem value="temp-sensor-001">Temperature Sensor 001</MenuItem>
                    <MenuItem value="humidity-sensor-001">Humidity Sensor 001</MenuItem>
                    <MenuItem value="light-sensor-001">Light Sensor 001</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Time Range</InputLabel>
                  <Select
                    value={timeRange}
                    label="Time Range"
                    onChange={(e) => setTimeRange(e.target.value)}
                  >
                    <MenuItem value="1">Last 1 hour</MenuItem>
                    <MenuItem value="6">Last 6 hours</MenuItem>
                    <MenuItem value="24">Last 24 hours</MenuItem>
                    <MenuItem value="168">Last 7 days</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12} lg={8}>
                <Box sx={{ height: 400 }}>
                  <Line data={lineChartData} options={lineChartOptions} />
                </Box>
              </Grid>
              
              <Grid item xs={12} lg={4}>
                <Box sx={{ height: 400 }}>
                  <Bar data={barChartData} options={barChartOptions} />
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default Charts;