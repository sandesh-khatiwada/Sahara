import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Paper,
  Typography,
  Box,
  useTheme,
  CircularProgress,
  Avatar,
  LinearProgress,
  Fade,
  Grow,
  Card,
  CardContent,
  Chip,
  IconButton
} from '@mui/material';
import {
  People as PeopleIcon,
  Group as GroupIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Psychology as PsychologyIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  Speed as SpeedIcon,
  Refresh as RefreshIcon,
  PersonAdd as PersonAddIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  CenterFocusStrong as TargetIcon,
  FlashOn as FlashOnIcon,
  Stars as StarsIcon,
  Error as ErrorIcon,
  Public as PublicIcon,
  StarRate as StarRateIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import axios from 'axios';

// Glassmorphism styled components using motion components
const MotionPaper = motion(Paper);

const StatCard = ({ title, value, icon, color, trend, loading, delay = 0, subtitle }) => {
  const theme = useTheme();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: delay * 0.1, duration: 0.6, ease: "easeOut" }}
      whileHover={{ 
        y: -8, 
        scale: 1.02,
        boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
      }}
    >
      <MotionPaper
        elevation={0}
        sx={{
          p: 3,
          height: '100%',
          borderRadius: 3,
          background: `linear-gradient(135deg, ${color}08 0%, ${color}04 100%)`,
          backdropFilter: 'blur(20px)',
          border: `1px solid ${color}20`,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: `linear-gradient(90deg, ${color}, ${color}80)`,
          }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography 
              variant="subtitle2" 
              gutterBottom
              sx={{ 
                fontSize: '0.75rem', 
                fontWeight: 500, 
                textTransform: 'uppercase', 
                letterSpacing: 1,
                color: 'rgba(55, 65, 81, 0.8)'
              }}
            >
              {title}
            </Typography>
            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                <CircularProgress size={24} sx={{ color }} />
                <Typography variant="body2" sx={{ color: 'rgba(55, 65, 81, 0.7)' }}>Loading...</Typography>
              </Box>
            ) : (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: (delay * 0.1) + 0.3, type: "spring", stiffness: 200 }}
              >
                <Typography 
                  variant="h3" 
                  component="div" 
                  sx={{ 
                    fontWeight: 700, 
                    mb: 0.5,
                    color: '#1f2937',
                    fontSize: { xs: '1.8rem', sm: '2.2rem' },
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  {typeof value === 'number' ? value.toLocaleString() : value}
                </Typography>
              </motion.div>
            )}
            {subtitle && (
              <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'rgba(55, 65, 81, 0.6)' }}>
                {subtitle}
              </Typography>
            )}
            {trend !== 0 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (delay * 0.1) + 0.5 }}
              >
                <Chip
                  icon={trend > 0 ? <TrendingUpIcon sx={{ fontSize: 14 }} /> : <TrendingDownIcon sx={{ fontSize: 14 }} />}
                  label={`${trend > 0 ? '+' : ''}${trend}%`}
                  size="small"
                  sx={{
                    mt: 1,
                    bgcolor: trend > 0 ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)',
                    color: trend > 0 ? '#4caf50' : '#f44336',
                    fontSize: '0.7rem',
                    height: '24px',
                    border: `1px solid ${trend > 0 ? 'rgba(76, 175, 80, 0.3)' : 'rgba(244, 67, 54, 0.3)'}`
                  }}
                />
              </motion.div>
            )}
          </Box>
          <motion.div
            initial={{ rotate: -180, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ delay: (delay * 0.1) + 0.2, duration: 0.6 }}
            whileHover={{ rotate: 15, scale: 1.1 }}
          >
            <Avatar
              sx={{
                bgcolor: `${color}15`,
                color: color,
                width: 56,
                height: 56,
                boxShadow: `0 8px 24px ${color}30`
              }}
            >
              {icon}
            </Avatar>
          </motion.div>
        </Box>
        
        {!loading && (
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: (delay * 0.1) + 0.7, duration: 0.8 }}
            style={{ originX: 0 }}
          >
            <LinearProgress
              variant="determinate"
              value={Math.min((value / 100) * 10, 100)}
              sx={{
                height: 4,
                borderRadius: 2,
                bgcolor: `${color}20`,
                '& .MuiLinearProgress-bar': {
                  bgcolor: color,
                  borderRadius: 2
                }
              }}
            />
          </motion.div>
        )}
      </MotionPaper>
    </motion.div>
  );
};

const ChartCard = ({ title, children, height = 300, delay = 0 }) => {
  const theme = useTheme();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1, duration: 0.6 }}
    >
      <MotionPaper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(55, 65, 81, 0.1)',
          height: '100%'
        }}
      >
        <Typography 
          variant="h6" 
          gutterBottom 
          sx={{ 
            fontWeight: 600, 
            mb: 3,
            color: '#1f2937'
          }}
        >
          {title}
        </Typography>
        <Box sx={{ height, width: '100%' }}>
          {children}
        </Box>
      </MotionPaper>
    </motion.div>
  );
};

const Home = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCounsellors: 0
  });
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Data based on actual backend data with some realistic mock data
  const userGrowthData = [
    { month: 'Jan', users: Math.floor(stats.totalUsers * 0.2) || 12, counsellors: Math.floor(stats.totalCounsellors * 0.1) || 2 },
    { month: 'Feb', users: Math.floor(stats.totalUsers * 0.35) || 22, counsellors: Math.floor(stats.totalCounsellors * 0.3) || 3 },
    { month: 'Mar', users: Math.floor(stats.totalUsers * 0.5) || 35, counsellors: Math.floor(stats.totalCounsellors * 0.5) || 5 },
    { month: 'Apr', users: Math.floor(stats.totalUsers * 0.7) || 48, counsellors: Math.floor(stats.totalCounsellors * 0.7) || 7 },
    { month: 'May', users: Math.floor(stats.totalUsers * 0.85) || 58, counsellors: Math.floor(stats.totalCounsellors * 0.85) || 8 },
    { month: 'Jun', users: stats.totalUsers || 68, counsellors: stats.totalCounsellors || 10 }
  ];

  const sessionData = [
    { name: 'Active Sessions', value: Math.floor(stats.totalUsers * 0.1) || 8, color: '#10b981' },
    { name: 'Completed Sessions', value: Math.floor(stats.totalUsers * 0.3) || 25, color: '#3b82f6' },
    { name: 'Cancelled Sessions', value: Math.floor(stats.totalUsers * 0.05) || 3, color: '#ef4444' },
    { name: 'Pending Sessions', value: Math.floor(stats.totalUsers * 0.08) || 6, color: '#f59e0b' }
  ];

  const activityData = [
    { time: '00:00', activity: Math.floor(Math.random() * 5) + 1 },
    { time: '04:00', activity: Math.floor(Math.random() * 3) + 1 },
    { time: '08:00', activity: Math.floor(Math.random() * 15) + 5 },
    { time: '12:00', activity: Math.floor(Math.random() * 20) + 10 },
    { time: '16:00', activity: Math.floor(Math.random() * 25) + 15 },
    { time: '20:00', activity: Math.floor(Math.random() * 18) + 8 },
    { time: '24:00', activity: Math.floor(Math.random() * 8) + 2 }
  ];

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError('');

      const [usersResponse, counsellorsResponse] = await Promise.all([
        axios.get('http://localhost:5001/api/admin/total-users', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`
          }
        }),
        axios.get('http://localhost:5001/api/admin/total-counsellors', {
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

  const handleQuickAction = (action) => {
    switch (action) {
      case 'Add Counsellor':
        navigate('/admin/add-counsellor');
        break;
      case 'View Users':
        navigate('/admin/users');
        break;
      case 'Analytics':
        // Navigate to analytics page when implemented
        console.log('Analytics page not implemented yet');
        break;
      case 'Settings':
        // Navigate to settings page when implemented
        console.log('Settings page not implemented yet');
        break;
      default:
        break;
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Box sx={{ position: 'relative' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 6,
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            borderRadius: 4,
            p: 4,
            border: '1px solid rgba(0, 0, 0, 0.05)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.03 }}>
              <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </Box>
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography 
                variant="h2" 
                sx={{ 
                  fontWeight: 800, 
                  mb: 2,
                  background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                  textShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  letterSpacing: '-0.02em'
                }}
              >
                🚀 Command Center
              </Typography>
              <Typography variant="h6" sx={{ color: '#475569', mb: 1 }}>
                Welcome back, Administrator! 
              </Typography>
              <Typography variant="body1" sx={{ color: '#64748b' }}>
                Monitor your mental health platform's performance in real-time
              </Typography>
            </Box>
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <IconButton
                onClick={handleRefresh}
                disabled={refreshing}
                sx={{
                  background: 'rgba(59, 130, 246, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(59, 130, 246, 0.2)',
                  color: '#3b82f6',
                  width: 60,
                  height: 60,
                  '&:hover': {
                    background: 'rgba(59, 130, 246, 0.2)',
                    transform: 'scale(1.05)',
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <motion.div
                  animate={{ rotate: refreshing ? 360 : 0 }}
                  transition={{ duration: 1, repeat: refreshing ? Infinity : 0, ease: "linear" }}
                >
                  <RefreshIcon sx={{ fontSize: 28 }} />
                </motion.div>
              </IconButton>
            </Box>
          </Box>
        </motion.div>
        
        {error && (
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Box sx={{ 
              mb: 4, 
              p: 3, 
              background: 'rgba(255, 255, 255, 0.9)', 
              backdropFilter: 'blur(20px)',
              borderRadius: 3,
              border: '1px solid rgba(244, 67, 54, 0.2)',
              boxShadow: '0 8px 32px rgba(244, 67, 54, 0.1)',
              color: '#dc2626'
            }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: '#dc2626' }}>
                ⚠️ Connection Error
              </Typography>
              <Typography sx={{ color: '#64748b' }}>
                {error}
              </Typography>
            </Box>
          </motion.div>
        )}
        
        {/* Quick Actions Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <Box sx={{ 
            mb: 4,
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            borderRadius: 3,
            p: 3,
            border: '1px solid rgba(0, 0, 0, 0.05)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <TargetIcon sx={{ color: '#1e293b', fontSize: 24 }} />
              <Typography variant="h6" sx={{ color: '#1e293b', fontWeight: 600 }}>
                Quick Actions
              </Typography>
            </Box>
            <Grid container spacing={2}>
              {[
                { label: 'Add Counsellor', icon: <PersonAddIcon />, color: '#10b981' },
                { label: 'View Users', icon: <PeopleIcon />, color: '#3b82f6' },
                { label: 'Analytics', icon: <AnalyticsIcon />, color: '#f59e0b' },
                { label: 'Settings', icon: <SettingsIcon />, color: '#8b5cf6' }
              ].map((action, index) => (
                <Grid item xs={6} sm={3} key={index}>
                  <Box sx={{
                    p: 2,
                    background: `${action.color}10`,
                    borderRadius: 2,
                    border: `1px solid ${action.color}20`,
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: `${action.color}20`,
                      transform: 'translateY(-2px)',
                      boxShadow: `0 8px 25px ${action.color}30`
                    }
                  }}
                  onClick={() => handleQuickAction(action.label)}
                  >
                    <Box sx={{ mb: 1, color: action.color }}>
                      {React.cloneElement(action.icon, { sx: { fontSize: 32 } })}
                    </Box>
                    <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500 }}>
                      {action.label}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        </motion.div>
        
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Users"
              value={stats.totalUsers}
              icon={<GroupIcon sx={{ fontSize: 28 }} />}
              color={theme.palette.primary.main}
              trend={Math.floor(Math.random() * 15) + 8}
              loading={loading}
              delay={0}
              subtitle="Active platform users"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Counsellors"
              value={stats.totalCounsellors}
              icon={<PeopleIcon sx={{ fontSize: 28 }} />}
              color={theme.palette.success.main}
              trend={Math.floor(Math.random() * 12) + 5}
              loading={loading}
              delay={1}
              subtitle="Verified professionals"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Active Sessions"
              value={Math.floor(stats.totalUsers * 0.1) || 8}
              icon={<PsychologyIcon sx={{ fontSize: 28 }} />}
              color={theme.palette.info.main}
              trend={Math.floor(Math.random() * 20) + 5}
              loading={loading}
              delay={2}
              subtitle="Currently ongoing"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Success Rate"
              value={`${Math.floor(85 + Math.random() * 10)}%`}
              icon={<AssessmentIcon sx={{ fontSize: 28 }} />}
              color={theme.palette.warning.main}
              trend={Math.floor(Math.random() * 8) + 2}
              loading={loading}
              delay={3}
              subtitle="Session completion"
            />
          </Grid>
        </Grid>

        {/* Charts Row */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} lg={8}>
            <ChartCard title="User & Counsellor Growth" height={350} delay={4}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={userGrowthData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorCounsellors" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.palette.success.main} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={theme.palette.success.main} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#64748b"
                    fontSize={12}
                    fontWeight={500}
                  />
                  <YAxis 
                    stroke="#64748b"
                    fontSize={12}
                    fontWeight={500}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: '1px solid rgba(0, 0, 0, 0.1)', 
                      borderRadius: '8px',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                      color: '#1e293b'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="users" 
                    stroke={theme.palette.primary.main} 
                    fillOpacity={1} 
                    fill="url(#colorUsers)" 
                    strokeWidth={3}
                    name="Users"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="counsellors" 
                    stroke={theme.palette.success.main} 
                    fillOpacity={1} 
                    fill="url(#colorCounsellors)" 
                    strokeWidth={3}
                    name="Counsellors"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>
          <Grid item xs={12} lg={4}>
            <ChartCard title="Session Distribution" height={350} delay={5}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sessionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {sessionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: '1px solid rgba(0, 0, 0, 0.1)', 
                      borderRadius: '8px',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                      color: '#1e293b'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>
        </Grid>

        {/* Activity Chart */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <ChartCard 
              title={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUpIcon sx={{ color: '#1e293b', fontSize: 20 }} />
                  <span>Daily Activity Pattern</span>
                </Box>
              } 
              height={300} 
              delay={6}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                  <XAxis 
                    dataKey="time" 
                    stroke="#64748b"
                    fontSize={12}
                    fontWeight={500}
                  />
                  <YAxis 
                    stroke="#64748b"
                    fontSize={12}
                    fontWeight={500}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: '1px solid rgba(0, 0, 0, 0.1)', 
                      borderRadius: '8px',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                      color: '#1e293b'
                    }} 
                  />
                  <Bar 
                    dataKey="activity" 
                    fill={theme.palette.info.main}
                    radius={[4, 4, 0, 0]}
                    name="Active Users"
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>
        </Grid>

        {/* Recent Activity & System Status */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              <MotionPaper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(0, 0, 0, 0.05)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)',
                  height: '400px'
                }}
              >
                <Typography variant="h6" sx={{ color: '#1e293b', mb: 3, fontWeight: 600 }}>
                  🕒 Recent Activity
                </Typography>
                <Box sx={{ maxHeight: '320px', overflow: 'auto' }}>
                  {[
                    { time: '2 mins ago', action: 'New user registered', type: 'success' },
                    { time: '5 mins ago', action: 'Counsellor session completed', type: 'info' },
                    { time: '12 mins ago', action: 'Payment processed', type: 'success' },
                    { time: '18 mins ago', action: 'New counsellor application', type: 'warning' },
                    { time: '25 mins ago', action: 'System backup completed', type: 'info' },
                    { time: '32 mins ago', action: 'User profile updated', type: 'info' },
                    { time: '45 mins ago', action: 'Session scheduled', type: 'success' },
                  ].map((activity, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                    >
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        p: 2,
                        mb: 2,
                        background: 'rgba(248, 250, 252, 0.8)',
                        borderRadius: 2,
                        border: '1px solid rgba(0, 0, 0, 0.05)',
                        '&:hover': {
                          background: 'rgba(241, 245, 249, 0.9)',
                        }
                      }}>
                        <Box sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: activity.type === 'success' ? '#4CAF50' : 
                                   activity.type === 'warning' ? '#FF9800' : '#2196F3',
                          mr: 2
                        }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ color: '#1e293b', fontWeight: 500 }}>
                            {activity.action}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748b' }}>
                            {activity.time}
                          </Typography>
                        </Box>
                      </Box>
                    </motion.div>
                  ))}
                </Box>
              </MotionPaper>
            </motion.div>
          </Grid>
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <MotionPaper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(0, 0, 0, 0.05)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)',
                  height: '400px'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <FlashOnIcon sx={{ color: '#1e293b', fontSize: 24 }} />
                  <Typography variant="h6" sx={{ color: '#1e293b', fontWeight: 600 }}>
                    System Status
                  </Typography>
                </Box>
                <Box>
                  {[
                    { name: 'Server Health', status: 'Excellent', percentage: 98, color: '#4CAF50' },
                    { name: 'Database Performance', status: 'Good', percentage: 85, color: '#2196F3' },
                    { name: 'API Response Time', status: 'Optimal', percentage: 92, color: '#4CAF50' },
                    { name: 'Storage Usage', status: 'Normal', percentage: 67, color: '#FF9800' },
                    { name: 'Network Latency', status: 'Low', percentage: 95, color: '#4CAF50' },
                  ].map((system, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9 + index * 0.1 }}
                    >
                      <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" sx={{ color: '#1e293b', fontWeight: 500 }}>
                            {system.name}
                          </Typography>
                          <Typography variant="body2" sx={{ color: system.color }}>
                            {system.status}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={system.percentage}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            bgcolor: 'rgba(0, 0, 0, 0.05)',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: system.color,
                              borderRadius: 4
                            }
                          }}
                        />
                        <Typography variant="caption" sx={{ color: '#64748b', mt: 0.5 }}>
                          {system.percentage}%
                        </Typography>
                      </Box>
                    </motion.div>
                  ))}
                </Box>
              </MotionPaper>
            </motion.div>
          </Grid>
        </Grid>

        {/* Footer Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <Box sx={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: 3,
            p: 3,
            border: '1px solid rgba(0, 0, 0, 0.05)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)',
            textAlign: 'center'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, justifyContent: 'center' }}>
              <StarsIcon sx={{ color: '#1e293b', fontSize: 24 }} />
              <Typography variant="h6" sx={{ color: '#1e293b', fontWeight: 600 }}>
                Platform Impact
              </Typography>
            </Box>
            <Grid container spacing={3}>
              {[
                { label: 'Lives Impacted', value: `${Math.floor((stats.totalUsers || 68) * 1.5)}+`, icon: <PeopleIcon /> },
                { label: 'Sessions Completed', value: `${Math.floor((stats.totalUsers || 68) * 0.8)}+`, icon: <AssessmentIcon /> },
                { label: 'Countries Served', value: '15+', icon: <PublicIcon /> },
                { label: 'Satisfaction Rate', value: `${Math.floor(88 + Math.random() * 10)}%`, icon: <StarRateIcon /> }
              ].map((impact, index) => (
                <Grid item xs={6} md={3} key={index}>
                  <Box sx={{ color: '#475569', mb: 1 }}>
                    {React.cloneElement(impact.icon, { sx: { fontSize: 36 } })}
                  </Box>
                  <Typography variant="h5" sx={{ color: '#1e293b', fontWeight: 700, mb: 0.5 }}>
                    {impact.value}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    {impact.label}
                  </Typography>
                </Grid>
              ))}
            </Grid>
          </Box>
        </motion.div>
      </Box>
    </motion.div>
  );
};

export default Home; 
