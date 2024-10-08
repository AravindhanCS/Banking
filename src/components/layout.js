import React from 'react';
import { Outlet } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, List, ListItem, ListItemText, Drawer } from '@mui/material';
import { styled, keyframes } from '@mui/system';
import HomeIcon from '@mui/icons-material/Home';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import PercentIcon from '@mui/icons-material/Percent';
import LogoutIcon from '@mui/icons-material/Logout';
import logo from '../media/bankLogo.png';
import { useNavigate } from 'react-router-dom';

// Animation keyframes for fade-in effect
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Styled components
const HeaderBar = styled(AppBar)({
  background: 'linear-gradient(135deg, #87cefa 0%, #1e90ff 100%)',
  padding: '10px 20px',
  animation: `${fadeIn} 1s ease-in-out`,
  zIndex: 1201,
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
});

const Sidebar = styled(Drawer)({
  width: '20vw',
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: '240px',
    background: 'linear-gradient(135deg, #f0f9ff 0%, #cfd9df 100%)',
    borderRight: 'none',
    marginTop: '24px',
    height: 'calc(100vh - 24px)',
  },
});

const ContentArea = styled(Box)({
  flexGrow: 1,
  background: 'linear-gradient(135deg, #f9f9f9 0%, #ffffff 100%)',
  padding: '20px',
  marginTop: '10%',
  '@media (max-width:300px)': {
    marginTop: '10%',
  },
  animation: `${fadeIn} 1s ease-in-out`
});

// Styled NavButton
const NavButton = styled(({ button, ...props }) => <ListItem {...props} />)(({ theme }) => ({
  '&:hover': {
    backgroundColor: '#87cefa',
    transform: 'scale(1.02)',
    transition: 'all 0.3s ease',
  },
}));



const Layout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/adminLogin'); // Redirect to Admin Login page
  };

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Header Section */}
      <HeaderBar>
        {/* Logo */}
        <img src={logo} alt="Bank Logo" style={{ width: '100px', marginRight: '15px' }} />

        {/* Welcome Message */}
        <Typography variant="h6" sx={{ fontWeight: 'bold', marginRight: '20px' }}>
          Welcome Aravindhan (Admin)
        </Typography>

        {/* Logout Button */}
        <Button variant="contained" color="error" onClick={handleLogout} startIcon={<LogoutIcon />}>
          Logout
        </Button>
      </HeaderBar>

      {/* Sidebar Navigation */}
      <Sidebar variant="permanent">
        <Toolbar /> {/* Empty toolbar to space out header */}
        <List>
          {/* Home Button */}
          <NavButton onClick={() => navigate('/adminDashboard')}>
            <IconButton>
              <HomeIcon color="primary" />
            </IconButton>
            <ListItemText primary="Home" />
          </NavButton>

          {/* Account Opening Request */}
          <NavButton onClick={() => navigate('/accountOpening')}>
            <IconButton>
              <AccountCircleIcon color="primary" />
            </IconButton>
            <ListItemText primary="Account Opening Request" />
          </NavButton>

          {/* Loan Request */}
          <NavButton onClick={() => navigate('/loanRequest')}>
            <IconButton>
              <LocalAtmIcon color="primary" />
            </IconButton>
            <ListItemText primary="Loan Request" />
          </NavButton>

          {/* Interest Rate Management */}
          <NavButton onClick={() => navigate('/interestRateManagement')}>
            <IconButton>
              <PercentIcon color="primary" />
            </IconButton>
            <ListItemText primary="Interest Rate Management" />
          </NavButton>
        </List>
      </Sidebar>

      {/* Main Content Area (Dynamic) */}
      <ContentArea>
        <Toolbar />
        <Outlet /> {/* Dynamically render the component based on the route */}
      </ContentArea>
    </Box>
  );
};

export default Layout;
