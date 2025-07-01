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
          background: 'linear-gradient(135deg, #1c2912 0%, #2d4a22 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
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
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
            }} 
          />
          <Box>
            <Typography variant="h5" noWrap component="div" sx={{ fontWeight: 700, fontSize: '1.4rem', color: '#d4edda' }}>
              Sahara
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.8rem', color: '#a5b8a8' }}>
              Admin Dashboard
            </Typography>
          </Box>
        </Box>
      </Box>
      <Box sx={{ 
        flex: 1, 
        background: 'linear-gradient(180deg, #1c2912 0%, #2d4a22 100%)',
        backdropFilter: 'blur(20px)'
      }}>
        <List sx={{ px: 3, py: 3 }}>
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
                    ? 'linear-gradient(135deg, #3d5a2f 0%, #2d4a22 100%)' 
                    : 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: location.pathname === item.path ? '#d4edda' : '#c8d6cb',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: location.pathname === item.path 
                      ? 'linear-gradient(135deg, #3d5a2f 0%, #2d4a22 100%)' 
                      : 'rgba(255, 255, 255, 0.12)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.4)',
                    color: '#e8f5e8'
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 45,
                    color: location.pathname === item.path ? '#81c784' : '#a5b8a8',
                    '& svg': { fontSize: 24 }
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
        background: 'linear-gradient(135deg, rgba(28, 41, 18, 0.3) 0%, rgba(45, 74, 34, 0.2) 100%)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 3,
              px: 3,
              py: 1.5,
              background: 'rgba(244, 67, 54, 0.1)',
              border: '1px solid rgba(244, 67, 54, 0.2)',
              color: '#fc8181',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'linear-gradient(135deg, #e53e3e 0%, #c53030 100%)',
                color: 'white',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(244, 67, 54, 0.3)',
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
              background: 'linear-gradient(180deg, #1c2912 0%, #2d4a22 100%)',
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
              background: 'linear-gradient(180deg, #1c2912 0%, #2d4a22 100%)',
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