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
  AccountBalance as AccountBalanceIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const CounsellorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [counsellor, setCounsellor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    fetchCounsellorDetails();
  }, [id]);

  const fetchCounsellorDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/admin/counsellors/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      setCounsellor(response.data.data.counsellor);
    } catch (error) {
      console.error('Error fetching counsellor details:', error);
      setError('Failed to fetch counsellor details');
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getSessionStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#10b981';
      case 'scheduled':
        return '#3b82f6';
      case 'cancelled':
        return '#ef4444';
      default:
        return '#6b7280';
    }
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
                    ID: #{counsellor._id.slice(-6).toUpperCase()}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                    <Chip 
                      label={counsellor.isVerified ? "Verified" : "Unverified"}
                      size="small"
                      icon={counsellor.isVerified ? <VerifiedIcon /> : <CancelIcon />}
                      sx={{ 
                        bgcolor: counsellor.isVerified ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        color: counsellor.isVerified ? '#10b981' : '#ef4444',
                        fontWeight: 600
                      }}
                    />
                    <Chip 
                      label={counsellor.isActive ? "Active" : "Inactive"}
                      size="small"
                      sx={{ 
                        bgcolor: counsellor.isActive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        color: counsellor.isActive ? '#10b981' : '#ef4444',
                        fontWeight: 600
                      }}
                    />
                  </Box>
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
                        secondary={`$${counsellor.chargePerHour}/hour`}
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
                        Sessions ({counsellor.sessions?.length || 0})
                      </Typography>
                    </Box>
                    
                    {counsellor.sessions && counsellor.sessions.length > 0 ? (
                      <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                        {counsellor.sessions.map((session, index) => (
                          <Box key={session._id} sx={{ 
                            p: 2, 
                            mb: 2,
                            borderRadius: 2,
                            background: 'rgba(248, 250, 252, 0.8)',
                            border: '1px solid rgba(0, 0, 0, 0.05)'
                          }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: '#374151' }}>
                                {formatDate(session.sessionDate)}
                              </Typography>
                              <Chip 
                                label={session.status}
                                size="small"
                                sx={{ 
                                  bgcolor: `${getSessionStatusColor(session.status)}20`,
                                  color: getSessionStatusColor(session.status),
                                  fontWeight: 600,
                                  textTransform: 'capitalize'
                                }}
                              />
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2" sx={{ color: '#6b7280', fontStyle: 'italic', textAlign: 'center', py: 3 }}>
                        No sessions found
                      </Typography>
                    )}
                  </Paper>
                </motion.div>
              </Grid>

              {/* Notifications Card */}
              <Grid item xs={12}>
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
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
                      <NotificationsIcon sx={{ fontSize: 24, color: '#f59e0b', mr: 2 }} />
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                        Recent Notifications ({counsellor.notifications?.length || 0})
                      </Typography>
                    </Box>
                    
                    {counsellor.notifications && counsellor.notifications.length > 0 ? (
                      <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                        {counsellor.notifications.slice(0, 5).map((notification, index) => (
                          <Box key={notification._id} sx={{ 
                            p: 2, 
                            mb: 2,
                            borderRadius: 2,
                            background: notification.isRead ? 'rgba(248, 250, 252, 0.8)' : 'rgba(59, 130, 246, 0.05)',
                            border: `1px solid ${notification.isRead ? 'rgba(0, 0, 0, 0.05)' : 'rgba(59, 130, 246, 0.1)'}`
                          }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <Typography variant="body2" sx={{ fontWeight: 500, color: '#374151', flex: 1, mr: 2 }}>
                                {notification.message}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#6b7280', whiteSpace: 'nowrap' }}>
                                {formatDate(notification.createdAt)}
                              </Typography>
                            </Box>
                            {!notification.isRead && (
                              <Badge 
                                badgeContent="New" 
                                color="primary" 
                                sx={{ mt: 1 }}
                              />
                            )}
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2" sx={{ color: '#6b7280', fontStyle: 'italic', textAlign: 'center', py: 3 }}>
                        No notifications found
                      </Typography>
                    )}
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
