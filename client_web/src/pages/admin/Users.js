import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Avatar,
  Typography,
  Box,
  Pagination,
  CircularProgress,
  Alert,
  Paper,
  useTheme
} from '@mui/material';
import {
  Group as GroupIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { format } from 'date-fns';

const Users = () => {
  const theme = useTheme();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/admin/users?page=${page}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      setUsers(response.data.data.users);
      setTotalPages(Math.ceil(response.data.data.total / 10));
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
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
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <GroupIcon sx={{ fontSize: 36, color: '#1e293b' }} />
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
                Users
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ color: '#475569', mb: 1 }}>
              Manage and view all registered users
            </Typography>
            <Typography variant="body1" sx={{ color: '#64748b' }}>
              Total: {users.length} registered users
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
          {users.map((user, index) => (
            <Grid item xs={12} sm={6} md={4} key={user._id}>
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
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': {
                      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.12)',
                      border: '1px solid rgba(59, 130, 246, 0.15)',
                      transform: 'translateY(-2px)',
                    }
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Box display="flex" justifyContent="center" mb={2}>
                      <Avatar
                        sx={{
                          width: 100,
                          height: 100,
                          bgcolor: theme.palette.primary.main,
                          fontSize: '2rem',
                          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)'
                        }}
                      >
                        {getInitials(user.fullName)}
                      </Avatar>
                    </Box>
                    <Typography 
                      gutterBottom 
                      variant="h5" 
                      component="h2" 
                      align="center"
                      sx={{ fontWeight: 600, color: '#1e293b', mb: 1 }}
                    >
                      {user.fullName}
                    </Typography>
                    <Typography 
                      color="text.secondary" 
                      gutterBottom 
                      align="center"
                      sx={{ fontSize: '0.9rem', color: '#64748b', mb: 2 }}
                    >
                      {user.email}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      align="center"
                      sx={{ color: '#64748b' }}
                    >
                      Joined: {format(new Date(user.createdAt), 'MMMM d, yyyy')}
                    </Typography>
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

export default Users; 