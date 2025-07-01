import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  IconButton,
  InputAdornment,
  Avatar,
  Stack
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  PhotoCamera,
  Upload as UploadIcon,
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import axios from 'axios';

const AddCounsellor = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    designation: '',
    chargePerHour: '',
    esewaAccountId: '',
    profilePhoto: null,
    documents: []
  });
  const [showPassword, setShowPassword] = useState(false);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleDocumentChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 3) {
      setError('You can only upload up to 3 documents');
      return;
    }
    setFormData({
      ...formData,
      documents: files
    });
    setError('');
    e.target.value = '';
  };

  const handleProfilePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        profilePhoto: file
      });
      setProfilePhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSingleDocumentChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (formData.documents.length >= 3) {
      setError('You can only upload up to 3 documents');
      return;
    }

    const isDuplicate = formData.documents.some(doc => doc.name === file.name);
    if (isDuplicate) {
      setError('This file has already been added');
      return;
    }

    setFormData({
      ...formData,
      documents: [...formData.documents, file]
    });
    setError('');
    e.target.value = '';
  };

  const removeDocument = (index) => {
    const newDocuments = formData.documents.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      documents: newDocuments
    });
    setError('');
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must be 10 digits';
    }

    if (!formData.designation.trim()) {
      newErrors.designation = 'Designation is required';
    }
    
    if (!formData.chargePerHour) {
      newErrors.chargePerHour = 'Charge per hour is required';
    } else if (isNaN(formData.chargePerHour) || formData.chargePerHour <= 0) {
      newErrors.chargePerHour = 'Charge per hour must be a positive number';
    }
    
    if (!formData.profilePhoto) {
      newErrors.profilePhoto = 'Profile photo is required';
    }
    
    if (formData.documents.length === 0) {
      newErrors.documents = 'At least one document is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('fullName', formData.fullName);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('designation', formData.designation);
      formDataToSend.append('chargePerHour', formData.chargePerHour);
      formDataToSend.append('esewaAccountId', formData.esewaAccountId);
      
      if (formData.profilePhoto) {
        formDataToSend.append('profilePhoto', formData.profilePhoto);
      }
      
      formData.documents.forEach((doc, index) => {
        formDataToSend.append(`documents`, doc);
      });

      const response = await axios.post(
        'http://localhost:5001/api/admin/counsellors',
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        setSuccess('Counsellor added successfully');
        setFormData({
          fullName: '',
          email: '',
          password: '',
          phone: '',
          designation: '',
          chargePerHour: '',
          esewaAccountId: '',
          profilePhoto: null,
          documents: []
        });
        setProfilePhotoPreview(null);
        document.getElementById('documents-bulk').value = '';
        document.getElementById('document-single').value = '';
      }
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: 2,
          background: 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)'
        }}
      >
        <Typography
          component="h1"
          variant="h5"
          gutterBottom
          sx={{ fontWeight: 600, color: 'primary.main', mb: 3 }}
        >
          Add New Counsellor
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3, textAlign: 'center' }}>
                <input
                  accept="image/jpeg,image/png"
                  style={{ display: 'none' }}
                  id="profile-photo"
                  type="file"
                  onChange={handleProfilePhotoChange}
                />
                <label htmlFor="profile-photo">
                  <Box
                    sx={{
                      position: 'relative',
                      display: 'inline-block',
                      cursor: 'pointer'
                    }}
                  >
                    <Avatar
                      src={profilePhotoPreview}
                      sx={{
                        width: 120,
                        height: 120,
                        mb: 1,
                        border: '2px solid',
                        borderColor: 'primary.main'
                      }}
                    />
                    <IconButton
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        bgcolor: 'primary.main',
                        color: 'white',
                        '&:hover': {
                          bgcolor: 'primary.dark'
                        }
                      }}
                      size="small"
                    >
                      <PhotoCamera />
                    </IconButton>
                  </Box>
                </label>
                <Typography variant="body2" color="text.secondary">
                  Upload Profile Photo
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                  <input
                    accept=".pdf,.jpg,.jpeg,.png"
                    style={{ display: 'none' }}
                    id="documents-bulk"
                    type="file"
                    multiple
                    onChange={handleDocumentChange}
                  />
                  <label htmlFor="documents-bulk">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<UploadIcon />}
                      sx={{ py: 1.5 }}
                    >
                      Upload Multiple Documents
                    </Button>
                  </label>

                  <input
                    accept=".pdf,.jpg,.jpeg,.png"
                    style={{ display: 'none' }}
                    id="document-single"
                    type="file"
                    onChange={handleSingleDocumentChange}
                  />
                  <label htmlFor="document-single">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<AddIcon />}
                      disabled={formData.documents.length >= 3}
                      sx={{ py: 1.5 }}
                    >
                      Add Single Document
                    </Button>
                  </label>
                </Stack>

                {formData.documents.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Selected Documents ({formData.documents.length}/3):
                    </Typography>
                    <Box sx={{ 
                      maxHeight: '200px', 
                      overflowY: 'auto',
                      bgcolor: 'background.paper',
                      borderRadius: 1,
                      p: 1,
                      border: '1px solid',
                      borderColor: 'divider'
                    }}>
                      {formData.documents.map((doc, index) => (
                        <Box
                          key={index}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            py: 0.5,
                            px: 1,
                            '&:not(:last-child)': {
                              borderBottom: '1px solid',
                              borderColor: 'divider'
                            }
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              flex: 1,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {doc.name}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ mx: 1 }}
                          >
                            {(doc.size / 1024).toFixed(1)} KB
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => removeDocument(index)}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ))}
                    </Box>
                    <Typography
                      variant="caption"
                      color={formData.documents.length === 3 ? 'error' : 'text.secondary'}
                      sx={{ display: 'block', mt: 1 }}
                    >
                      {formData.documents.length === 3
                        ? 'Maximum number of documents reached'
                        : `You can add ${3 - formData.documents.length} more document${3 - formData.documents.length === 1 ? '' : 's'}`}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                error={!!errors.fullName}
                helperText={errors.fullName}
                sx={{ mb: 2 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                sx={{ mb: 2 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                error={!!errors.password}
                helperText={errors.password}
                sx={{ mb: 2 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                error={!!errors.phone}
                helperText={errors.phone}
                sx={{ mb: 2 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label="Designation"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                error={!!errors.designation}
                helperText={errors.designation}
                sx={{ mb: 2 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label="Charge Per Hour"
                name="chargePerHour"
                type="number"
                value={formData.chargePerHour}
                onChange={handleChange}
                error={!!errors.chargePerHour}
                helperText={errors.chargePerHour}
                sx={{ mb: 2 }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Esewa Account ID"
                name="esewaAccountId"
                value={formData.esewaAccountId}
                onChange={handleChange}
                sx={{ mb: 3 }}
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading || !formData.profilePhoto || formData.documents.length === 0}
                sx={{
                  py: 1.5,
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderRadius: 2,
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  '&:hover': {
                    boxShadow: '0 6px 8px rgba(0, 0, 0, 0.15)'
                  }
                }}
              >
                {loading ? 'Adding Counsellor...' : 'Add Counsellor'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default AddCounsellor; 