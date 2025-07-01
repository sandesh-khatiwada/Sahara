import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Pagination,
  CircularProgress,
  Alert,
  Avatar,
  Chip,
  IconButton,
  Paper,
  useTheme
} from '@mui/material';
import {
  Email as EmailIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  Visibility as VisibilityIcon,
  Phone as PhoneIcon,
  Psychology as PsychologyIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const Counsellors = () => {
  const theme = useTheme();
  const [counsellors, setCounsellors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [imageErrors, setImageErrors] = useState(new Set());

  useEffect(() => {
    fetchCounsellors();
  }, [page]);

  const fetchCounsellors = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5001/api/admin/counsellors?page=${page}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      setCounsellors(response.data.data.counsellors);
      setTotalPages(Math.ceil(response.data.data.total / 10));
    } catch (err) {
      setError('Failed to fetch counsellors');
    } finally {
      setLoading(false);
    }
  };

  const handleImageError = (counsellorId) => {
    setImageErrors(prev => new Set([...prev, counsellorId]));
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="60vh"
        sx={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          borderRadius: 3,
          m: 2
        }}
      >
        <motion.div
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <CircularProgress size={60} sx={{ color: theme.palette.primary.main }} />
        </motion.div>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Header */}
      <motion.div          initial={{ opacity: 0, y: -30 }}
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
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <PsychologyIcon sx={{ fontSize: 36, color: '#1e293b' }} />
              <Typography 
                variant="h2" 
                sx={{ 
                  fontWeight: 800, 
                  background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                  textShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  letterSpacing: '-0.02em'
                }}
              >
                Counsellors
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ color: '#475569', mb: 1 }}>
              Manage and view all registered counsellors
            </Typography>
            <Typography variant="body1" sx={{ color: '#64748b' }}>
              Total: {counsellors.length} verified professionals
            </Typography>
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <ErrorIcon sx={{ color: '#dc2626', fontSize: 20 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#dc2626' }}>
                Error
              </Typography>
            </Box>
            <Typography sx={{ color: '#64748b' }}>
              {error}
            </Typography>
          </Box>
        </motion.div>
      )}

      <Grid container spacing={3}>
        <AnimatePresence>
          {counsellors.map((counsellor, index) => (
            <Grid item xs={12} sm={6} lg={4} key={counsellor._id}>
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  delay: index * 0.08, 
                  duration: 0.6, 
                  ease: [0.22, 1, 0.36, 1] 
                }}
                whileHover={{ 
                  y: -6, 
                  scale: 1.02,
                  transition: { duration: 0.2, ease: "easeOut" }
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    height: '100%',
                    borderRadius: 4,
                    background: 'rgba(255, 255, 255, 0.98)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(0, 0, 0, 0.04)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)',
                    overflow: 'hidden',
                    transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    '&:hover': {
                      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.12)',
                      border: '1px solid rgba(59, 130, 246, 0.15)',
                      transform: 'translateY(-2px)',
                    }
                  }}
                >
                  <Box sx={{ position: 'relative' }}>
                    {counsellor.profilePhoto && !imageErrors.has(counsellor._id) ? (
                      <CardMedia
                        component="img"
                        height="200"
                        image={`http://localhost:5001/uploads/profile_photos/${counsellor.profilePhoto.filename}`}
                        alt={counsellor.fullName}
                        onError={() => handleImageError(counsellor._id)}
                        sx={{ 
                          objectFit: 'cover',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.05)'
                          }
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          height: 200,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                          position: 'relative'
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 80,
                            height: 80,
                            bgcolor: theme.palette.primary.main,
                            fontSize: '2rem'
                          }}
                        >
                          {counsellor.fullName.charAt(0).toUpperCase()}
                        </Avatar>
                      </Box>
                    )}
                    <Box sx={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: 2,
                      px: 1.5,
                      py: 0.5
                    }}>
                      <Chip 
                        label="Active" 
                        size="small" 
                        sx={{ 
                          bgcolor: '#10b981', 
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.7rem',
                          height: '22px'
                        }} 
                      />
                    </Box>
                  </Box>
                  
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: theme.palette.primary.main,
                          width: 48,
                          height: 48,
                          mr: 2,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                        }}
                      >
                        <PersonIcon />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 700, 
                            color: '#1e293b',
                            fontSize: '1.1rem',
                            mb: 0.5
                          }}
                        >
                          {counsellor.fullName}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: '#64748b',
                            fontSize: '0.85rem'
                          }}
                        >
                          Professional ID: #{counsellor._id.slice(-6).toUpperCase()}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                        <EmailIcon sx={{ fontSize: 18, color: '#64748b', mr: 1.5 }} />
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: '#475569',
                            fontSize: '0.9rem'
                          }}
                        >
                          {counsellor.email}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <WorkIcon sx={{ fontSize: 18, color: '#64748b', mr: 1.5 }} />
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: '#475569',
                            fontWeight: 500,
                            fontSize: '0.9rem'
                          }}
                        >
                          {counsellor.designation}
                        </Typography>
                      </Box>

                      <Chip 
                        label="Verified Professional" 
                        size="small" 
                        sx={{ 
                          bgcolor: 'rgba(16, 185, 129, 0.1)', 
                          color: '#10b981',
                          fontWeight: 600,
                          border: '1px solid rgba(16, 185, 129, 0.2)'
                        }} 
                      />
                    </Box>

                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<VisibilityIcon />}
                      sx={{
                        py: 1.2,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                          boxShadow: '0 6px 20px rgba(59, 130, 246, 0.4)',
                          transform: 'translateY(-1px)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      View Profile
                    </Button>
                  </CardContent>
                </Paper>
              </motion.div>
            </Grid>
          ))}
        </AnimatePresence>
      </Grid>

      {/* Pagination */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            mt: 6,
            p: 3,
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            borderRadius: 3,
            border: '1px solid rgba(0, 0, 0, 0.05)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)'
          }}
        >
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            size="large"
            sx={{
              '& .MuiPaginationItem-root': {
                fontWeight: 600,
                borderRadius: 2,
                '&.Mui-selected': {
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  color: 'white',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                }
              }
            }}
          />
        </Box>
      </motion.div>
    </Box>
  );
};

export default Counsellors; 