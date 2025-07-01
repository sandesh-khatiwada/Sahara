import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  useTheme,
  useMediaQuery,
  Avatar,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  PersonAdd as PersonAddIcon,
  People as PeopleIcon,
  Group as GroupIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountIcon
} from '@mui/icons-material';
import axios from 'axios';

const drawerWidth = 280;

const menuItems = [
  { text: 'Home', icon: <HomeIcon />, path: '/admin/dashboard' },
  { text: 'Add Counsellor', icon: <PersonAddIcon />, path: '/admin/add-counsellor' },
  { text: 'Counsellors', icon: <PeopleIcon />, path: '/admin/counsellors' },
  { text: 'Users', icon: <GroupIcon />, path: '/admin/users' }
];

const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/admin/profile', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      if (response.data.data.admin.profilePhoto) {
        setProfilePhoto(`http://localhost:5001/${response.data.data.admin.profilePhoto.path}`);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          background: 'linear-gradient(135deg, hsl(219, 48%, 8%) 0%, hsl(219, 48%, 12%) 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.12)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
          }
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
          <img 
            src="/logo.png" 
            alt="Sahara Logo" 
            style={{ 
              height: '45px',
              width: 'auto',
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
              opacity: 0.95
            }} 
          />
          <Box>
            <Typography variant="h5" noWrap component="div" sx={{ fontWeight: 700, fontSize: '1.4rem', color: '#f1f5f9' }}>
              Sahara
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.85, fontSize: '0.8rem', color: '#cbd5e1' }}>
              Admin Dashboard
            </Typography>
          </Box>
        </Box>
      </Box>
      <Box sx={{ 
        flex: 1, 
        background: 'linear-gradient(180deg, hsl(219, 48%, 8%) 0%, hsl(219, 48%, 12%) 35%, hsl(219, 48%, 16%) 100%)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(45deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.02) 100%)',
          pointerEvents: 'none',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 80%, rgba(59,130,246,0.1) 0%, transparent 50%)',
          pointerEvents: 'none',
        }
      }}>
        <List sx={{ px: 3, py: 3, position: 'relative', zIndex: 1 }}>
          {menuItems.map((item, index) => (
            <ListItem key={item.text} disablePadding sx={{ mb: 2 }}>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) handleDrawerToggle();
                }}
                sx={{
                  borderRadius: 3,
                  px: 3,
                  py: 1.5,
                  background: location.pathname === item.path 
                    ? 'rgba(255, 255, 255, 0.15)' 
                    : 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  border: location.pathname === item.path 
                    ? '1px solid rgba(255, 255, 255, 0.25)' 
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  color: location.pathname === item.path ? '#ffffff' : '#e2e8f0',
                  boxShadow: location.pathname === item.path 
                    ? '0 4px 20px rgba(0, 0, 0, 0.15)' 
                    : 'none',
                  transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.18)',
                    transform: 'translateX(8px)',
                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 45,
                    color: location.pathname === item.path ? '#ffffff' : '#cbd5e1',
                    '& svg': { 
                      fontSize: 24,
                      transition: 'all 0.3s ease',
                      filter: location.pathname === item.path 
                        ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' 
                        : 'none'
                    },
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: location.pathname === item.path ? 600 : 500,
                    fontSize: '0.95rem'
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
      <Box sx={{ 
        p: 3,
        background: 'linear-gradient(135deg, hsla(219, 48%, 8%, 0.8) 0%, hsla(219, 48%, 12%, 0.6) 100%)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        position: 'relative',
        zIndex: 1
      }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 3,
              px: 3,
              py: 1.5,
              background: 'rgba(239, 68, 68, 0.12)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fecaca',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'rgba(239, 68, 68, 0.2)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(239, 68, 68, 0.3)',
                color: '#fef2f2',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 45, color: 'inherit' }}>
              <LogoutIcon sx={{ fontSize: 24 }} />
            </ListItemIcon>
            <ListItemText 
              primary="Sign Out"
              primaryTypographyProps={{ fontWeight: 600, fontSize: '0.95rem' }}
            />
          </ListItemButton>
        </ListItem>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              background: 'linear-gradient(180deg, hsl(219, 48%, 8%) 0%, hsl(219, 48%, 12%) 35%, hsl(219, 48%, 16%) 100%)',
              backdropFilter: 'blur(20px)',
              border: 'none',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              background: 'linear-gradient(180deg, hsl(219, 48%, 8%) 0%, hsl(219, 48%, 12%) 35%, hsl(219, 48%, 16%) 100%)',
              backdropFilter: 'blur(20px)',
              border: 'none',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 0,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #ffffff 100%)',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(circle at 20% 80%, rgba(99, 179, 237, 0.04) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(52, 211, 153, 0.04) 0%, transparent 50%),
              radial-gradient(circle at 40% 40%, rgba(168, 85, 247, 0.03) 0%, transparent 50%)
            `,
            animation: 'float 8s ease-in-out infinite',
          },
          '@keyframes float': {
            '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
            '50%': { transform: 'translateY(-10px) rotate(1deg)' }
          }
        }}
      >
        <AppBar
          position="fixed"
          sx={{
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            ml: { sm: `${drawerWidth}px` },
            boxShadow: 'none',
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(20px)',
            border: 'none',
            borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
            color: '#1e293b',
          }}
        >
          <Toolbar sx={{ px: 4 }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h5" noWrap component="div" sx={{ fontWeight: 700, mb: 0.5, color: '#1e293b' }}>
                {menuItems.find(item => item.path === location.pathname)?.text || 'Dashboard'}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.7, color: '#64748b' }}>
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Typography>
            </Box>
            <IconButton
              onClick={handleProfileMenuOpen}
              sx={{ 
                ml: 2,
                background: 'rgba(255, 255, 255, 0.5)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.8)',
                }
              }}
            >
              {profilePhoto ? (
                <Avatar
                  src={profilePhoto}
                  alt="Profile"
                  sx={{ width: 35, height: 35 }}
                />
              ) : (
                <AccountIcon sx={{ color: '#1e293b' }} />
              )}
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleProfileMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              PaperProps={{
                sx: {
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  borderRadius: 2,
                  mt: 1
                }
              }}
            >
              <MenuItem onClick={handleLogout} sx={{ color: 'error.main', fontWeight: 600 }}>
                Logout
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>
        <Box sx={{ position: 'relative', zIndex: 1, p: 4, pt: 12 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout; 