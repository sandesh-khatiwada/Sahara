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
  Alert
} from '@mui/material';
import axios from 'axios';

const Counsellors = () => {
  const [counsellors, setCounsellors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Counsellors
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Grid container spacing={3}>
        {counsellors.map((counsellor) => (
          <Grid item xs={12} sm={6} md={4} key={counsellor._id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="img"
                height="200"
                image={`http://localhost:5001/uploads/profile_photos/${counsellor.profilePhoto.filename}`}
                alt={counsellor.fullName}
                sx={{ objectFit: 'cover' }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h2">
                  {counsellor.fullName}
                </Typography>
                <Typography color="text.secondary" gutterBottom>
                  {counsellor.email}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {counsellor.designation}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Box display="flex" justifyContent="center" mt={4}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>
    </Container>
  );
};

export default Counsellors; 