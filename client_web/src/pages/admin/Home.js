import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  useTheme,
  CircularProgress
} from '@mui/material';
import {
  People as PeopleIcon,
  Group as GroupIcon
} from '@mui/icons-material';
import axios from 'axios';

const StatCard = ({ title, value, icon, color, loading }) => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      height: '100%',
      borderRadius: 2,
      border: '1px solid',
      borderColor: 'divider',
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      },
    }}
  >
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <Box>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        {loading ? (
          <CircularProgress size={24} sx={{ mt: 1 }} />
        ) : (
          <Typography variant="h4" component="div" sx={{ fontWeight: 600, mb: 1 }}>
            {value}
          </Typography>
        )}
      </Box>
      <Box
        sx={{
          p: 1.5,
          borderRadius: 2,
          bgcolor: `${color}15`,
          color: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </Box>
    </Box>
  </Paper>
);

const Home = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCounsellors: 0
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError('');

      const [usersResponse, counsellorsResponse] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/total-users', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`
          }
        }),
        axios.get('http://localhost:5000/api/admin/total-counsellors', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`
          }
        })
      ]);

      setStats({
        totalUsers: usersResponse.data.data.totalUsers,
        totalCounsellors: counsellorsResponse.data.data.totalCounsellors
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError('Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 600 }}>
        Dashboard Overview
      </Typography>
      
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <StatCard
            title="Total Counsellors"
            value={stats.totalCounsellors}
            icon={<PeopleIcon sx={{ fontSize: 28 }} />}
            color={theme.palette.primary.main}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={<GroupIcon sx={{ fontSize: 28 }} />}
            color={theme.palette.success.main}
            loading={loading}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Home; 