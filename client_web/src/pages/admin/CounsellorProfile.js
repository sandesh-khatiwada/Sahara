import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Chip,
  IconButton,
  Paper,
  Divider,
  Button,
  CircularProgress,
  Alert,
  useTheme,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Badge
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
  AttachMoney as AttachMoneyIcon,
  Psychology as PsychologyIcon,
  CalendarToday as CalendarIcon,
  Notifications as NotificationsIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Schedule as ScheduleIcon,
  Error as ErrorIcon,
  Verified as VerifiedIcon,
  Description as DescriptionIcon,
  AccountBalance as AccountBalanceIcon,
  Download as DownloadIcon,
  People as PeopleIcon,
  Star as StarIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

// StatCard component for session statistics
const StatCard = ({ title, value, icon, color, loading, delay = 0 }) => {
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
      <Paper
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
      </Paper>
    </motion.div>
  );
};

const CounsellorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [counsellor, setCounsellor] = useState(null);
  const [sessionInfo, setSessionInfo] = useState({
    completedSessions: 0,
    rejectedSessions: 0,
    usersServed: 0,
    averageRating: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    fetchCounsellorDetails();
    fetchSessionInfo();
  }, [id]);

  const fetchCounsellorDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/admin/counsellors/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      setCounsellor(response.data.data.counsellor);
    } catch (error) {
      console.error('Error fetching counsellor details:', error);
      setError('Failed to fetch counsellor details');
    }
  };

  const fetchSessionInfo = async () => {
    try {
      const response = await axios.post(
        'http://localhost:5000/api/admin/counsellor-session-information',
        { counsellorId: id },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`
          }
        }
      );
      setSessionInfo(response.data.data);
    } catch (error) {
      console.error('Error fetching session information:', error);
      setError('Failed to fetch session information');
    } finally {
      setLoading(false);
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const getProfileImageUrl = () => {
    if (!counsellor?.profilePhoto?.filename || imageError) {
      return null;
    }
    return `http://localhost:5000/uploads/profile_photos/${counsellor.profilePhoto.filename}`;
  };

  const handleDownload = (filename, originalName) => {
    const link = document.createElement('a');
    link.href = `http://localhost:5000/uploads/documents/${filename}`;
    link.download = originalName || filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
          >
            <CircularProgress size={60} thickness={4} />
          </motion.div>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Alert 
            severity="error" 
            sx={{ 
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)'
            }}
            icon={<ErrorIcon />}
          >
            {error}
          </Alert>
        </motion.div>
      </Container>
    );
  }

  if (!counsellor) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Alert 
            severity="warning" 
            sx={{ 
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.15)'
            }}
          >
            Counsellor not found
          </Alert>
        </motion.div>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header with back button */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 4,
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          borderRadius: 3,
          p: 3,
          border: '1px solid rgba(0, 0, 0, 0.05)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)'
        }}>
          <IconButton 
            onClick={() => navigate('/admin/counsellors')}
            sx={{ 
              mr: 2,
              background: 'rgba(59, 130, 246, 0.1)',
              color: '#3b82f6',
              '&:hover': {
                background: 'rgba(59, 130, 246, 0.2)',
                transform: 'translateY(-1px)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <PsychologyIcon sx={{ fontSize: 32, color: '#1e293b' }} />
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700, 
                color: '#1e293b',
                fontSize: { xs: '1.5rem', sm: '2rem' }
              }}
            >
              Counsellor Profile
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* Profile Card */}
          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Paper sx={{ 
                borderRadius: 4,
                overflow: 'hidden',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(0, 0, 0, 0.05)'
              }}>
                <Box sx={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  p: 3,
                  textAlign: 'center',
                  color: 'white'
                }}>
                  <Avatar
                    src={getProfileImageUrl()}
                    onError={handleImageError}
                    sx={{
                      width: 120,
                      height: 120,
                      mx: 'auto',
                      mb: 2,
                      border: '4px solid rgba(255, 255, 255, 0.3)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                    }}
                  >
                    <PersonIcon sx={{ fontSize: 60 }} />
                  </Avatar>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                    {counsellor.fullName}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
                    NMC No: {counsellor.nmcNo || ''}
                  </Typography>
                </Box>
                
                <CardContent sx={{ p: 3 }}>
                  <List sx={{ p: 0 }}>
                    <ListItem sx={{ px: 0, py: 1 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <EmailIcon sx={{ color: '#64748b', fontSize: 20 }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Email"
                        secondary={counsellor.email}
                        primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}
                        secondaryTypographyProps={{ fontSize: '0.875rem', color: '#6b7280' }}
                      />
                    </ListItem>
                    
                    <ListItem sx={{ px: 0, py: 1 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <PhoneIcon sx={{ color: '#64748b', fontSize: 20 }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Phone"
                        secondary={counsellor.phone}
                        primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}
                        secondaryTypographyProps={{ fontSize: '0.875rem', color: '#6b7280' }}
                      />
                    </ListItem>
                    
                    <ListItem sx={{ px: 0, py: 1 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <WorkIcon sx={{ color: '#64748b', fontSize: 20 }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Designation"
                        secondary={counsellor.designation}
                        primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}
                        secondaryTypographyProps={{ fontSize: '0.875rem', color: '#6b7280' }}
                      />
                    </ListItem>
                    
                    <ListItem sx={{ px: 0, py: 1 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <AttachMoneyIcon sx={{ color: '#64748b', fontSize: 20 }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Rate"
                        secondary={`Rs.${counsellor.chargePerHour}/hour`}
                        primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}
                        secondaryTypographyProps={{ fontSize: '0.875rem', color: '#6b7280' }}
                      />
                    </ListItem>

                    <ListItem sx={{ px: 0, py: 1 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <AccountBalanceIcon sx={{ color: '#64748b', fontSize: 20 }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="eSewa ID"
                        secondary={counsellor.esewaAccountId}
                        primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}
                        secondaryTypographyProps={{ fontSize: '0.875rem', color: '#6b7280' }}
                      />
                    </ListItem>
                    
                    <ListItem sx={{ px: 0, py: 1 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <CalendarIcon sx={{ color: '#64748b', fontSize: 20 }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Joined"
                        secondary={formatDate(counsellor.createdAt)}
                        primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}
                        secondaryTypographyProps={{ fontSize: '0.875rem', color: '#6b7280' }}
                      />
                    </ListItem>

                        
                    <ListItem sx={{ px: 0, py: 1 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <SchoolIcon sx={{ color: '#64748b', fontSize: 20 }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Qualification"
                        secondary={(counsellor.qualification)}
                        primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}
                        secondaryTypographyProps={{ fontSize: '0.875rem', color: '#6b7280' }}
                      />
                    </ListItem>
                    
                  </List>
                </CardContent>
              </Paper>
            </motion.div>
          </Grid>

          {/* Details Cards */}
          <Grid item xs={12} md={8}>
            <Grid container spacing={3}>
              {/* Sessions Card */}
              <Grid item xs={12}>
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <Paper sx={{ 
                    borderRadius: 3,
                    p: 3,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(0, 0, 0, 0.05)'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <ScheduleIcon sx={{ fontSize: 24, color: '#3b82f6', mr: 2 }} />
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                        Session Statistics
                      </Typography>
                    </Box>
                    <Grid container spacing={2}>
                      {[
                        { 
                          title: 'Completed Sessions', 
                          value: sessionInfo.completedSessions, 
                          icon: <CheckCircleIcon sx={{ fontSize: 28 }} />, 
                          color: '#10b981' 
                        },
                        { 
                          title: 'Rejected Sessions', 
                          value: sessionInfo.rejectedSessions, 
                          icon: <CancelIcon sx={{ fontSize: 28 }} />, 
                          color: '#ef4444' 
                        },
                        { 
                          title: 'Users Served', 
                          value: sessionInfo.usersServed, 
                          icon: <PeopleIcon sx={{ fontSize: 28 }} />, 
                          color: '#3b82f6' 
                        },
                        { 
                          title: 'Average Rating', 
                          value: sessionInfo.averageRating.toFixed(1), 
                          icon: <StarIcon sx={{ fontSize: 28 }} />, 
                          color: '#f59e0b' 
                        }
                      ].map((stat, index) => (
                        <Grid item xs={12} sm={6} key={index}>
                          <StatCard
                            title={stat.title}
                            value={stat.value}
                            icon={stat.icon}
                            color={stat.color}
                            loading={loading}
                            delay={index}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Paper>
                </motion.div>
              </Grid>

              {/* Documents Card */}
              <Grid item xs={12}>
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  <Paper sx={{ 
                    borderRadius: 3,
                    p: 3,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(0, 0, 0, 0.05)'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <DescriptionIcon sx={{ fontSize: 24, color: '#10b981', mr: 2 }} />
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                        Documents ({counsellor.documents?.length || 0})
                      </Typography>
                    </Box>
                    
                    {counsellor.documents && counsellor.documents.length > 0 ? (
                      <Grid container spacing={2}>
                        {counsellor.documents.map((doc, index) => (
                          <Grid item xs={12} sm={6} key={index}>
                            <Box sx={{ 
                              p: 2, 
                              borderRadius: 2,
                              background: 'rgba(248, 250, 252, 0.8)',
                              border: '1px solid rgba(0, 0, 0, 0.05)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 2
                            }}>
                              <DescriptionIcon sx={{ color: '#10b981', fontSize: 20 }} />
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#374151' }}>
                                  {doc.originalName}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#6b7280' }}>
                                  {(doc.size / 1024).toFixed(1)} KB
                                </Typography>
                              </Box>
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<DownloadIcon />}
                                onClick={() => handleDownload(doc.filename, doc.originalName)}
                                sx={{
                                  borderRadius: 2,
                                  textTransform: 'none',
                                  borderColor: '#10b981',
                                  color: '#10b981',
                                  '&:hover': {
                                    borderColor: '#0d8c6b',
                                    background: 'rgba(16, 185, 129, 0.1)',
                                    transform: 'translateY(-1px)'
                                  },
                                  transition: 'all 0.3s ease'
                                }}
                              >
                                Save
                              </Button>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    ) : (
                      <Typography variant="body2" sx={{ color: '#6b7280', fontStyle: 'italic', textAlign: 'center', py: 3 }}>
                        No documents uploaded
                      </Typography>
                    )}
                  </Paper>
                </motion.div>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </motion.div>
    </Container>
  );
};

export default CounsellorProfile;