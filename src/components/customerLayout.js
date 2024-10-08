import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, List, ListItem, ListItemText, Drawer } from '@mui/material';
import { styled, keyframes } from '@mui/system';
import HomeIcon from '@mui/icons-material/Home';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import HistoryIcon from '@mui/icons-material/History';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import logo from '../media/bankLogo.png';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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
});

const Sidebar = styled(Drawer)({
  width: '275px',
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
  marginTop: '50px',
  animation: `${fadeIn} 1s ease-in-out`,
  height: '100vh',
});

// Styled NavButton
const NavButton = styled(({ button, ...props }) => <ListItem {...props} />)(({ theme }) => ({
  '&:hover': {
    backgroundColor: '#87cefa',
    transform: 'scale(1.02)',
    transition: 'all 0.3s ease',
  },
}));



const CustomerLayout = () => {
    const navigate = useNavigate();
    const [customerName, setCustomerName] = useState('');
  
    useEffect(() => {
      const fetchCustomerName = async () => {
        const customerId = sessionStorage.getItem('customerId'); // Get customerId from session storage
        try {
            const response = await axios.post(
                'https://firestore.googleapis.com/v1/projects/banking-management-syste-72242/databases/(default)/documents:runQuery',
                {
                  structuredQuery: {
                    from: [{ collectionId: 'customer' }], // Targeting the 'documents' collection
                    where: {
                      fieldFilter: {
                        field: { fieldPath: 'customerId' },
                        op: 'EQUAL',
                        value: { integerValue: customerId } // Assuming customerId is stored as a string in Firestore
                      }
                    }
                  }
                }
              );
    
            
          setCustomerName(response.data[0].document.fields.name.stringValue); // Adjust based on your Firestore structure
        } catch (error) {
          console.error("Error fetching customer data:", error);
        }
      };
  
      fetchCustomerName();
    }, []);
  
    const handleLogout = () => {
        sessionStorage.setItem('customerId',0);
      navigate('/'); // Redirect to SignIn page
    };

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Header Section */}
      <HeaderBar position="fixed">
        {/* Logo */}
        <img src={logo} alt="Bank Logo" style={{ width: '100px', marginRight: '15px' }} />

        {/* Welcome Message */}
        <Typography variant="h6" sx={{ fontWeight: 'bold', marginRight: '20px' }}>
          Welcome {customerName}
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
          <NavButton onClick={() => navigate('/customerDashboard')}>
            <IconButton>
              <HomeIcon color="primary" />
            </IconButton>
            <ListItemText primary="Home" />
          </NavButton>

        {/* Create new Account */}
        <NavButton onClick={() => navigate('/manageAccounts')}>
            <IconButton>
            <AccountBalanceIcon color="primary" />
            </IconButton>
            <ListItemText primary="Manage Accounts" />
        </NavButton>

          {/*Loan Opening Request */}
          <NavButton onClick={() => navigate('/loanApply')}>
            <IconButton>
              <AttachMoneyIcon color="primary" />
            </IconButton>
            <ListItemText primary="Apply Loan" />
          </NavButton>

          {/* Investment */}
          <NavButton onClick={() => navigate('/investment')}>
            <IconButton>
              <TrendingUpIcon color="primary" />
            </IconButton>
            <ListItemText primary="Investment" />
          </NavButton>

          {/* Transaction History */}
          <NavButton onClick={() => navigate('/transacitonHistory')}>
            <IconButton>
              <HistoryIcon color="primary" />
            </IconButton>
            <ListItemText primary="Transaction History" />
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

export default CustomerLayout;
