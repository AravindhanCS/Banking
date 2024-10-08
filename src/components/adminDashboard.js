import React from 'react';
import { Paper, Typography, Grid } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { styled } from '@mui/system';

// Styled components
const InfoSection = styled(Paper)({
  padding: '20px',
  textAlign: 'center',
  background: 'linear-gradient(135deg, #ffffff 0%, #f9f9f9 100%)',
  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
  borderRadius: '10px',
  marginBottom: '20px',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
  },
});

const AdminDashboard = () => {
  return (
    <>
      <Typography variant="h4" style={{ fontWeight: 'bold', color: '#1e90ff', marginBottom: '20px' }}>
        Admin Dashboard
      </Typography>
      <Typography variant="body1" style={{ color: '#555', marginBottom: '30px' }}>
        Welcome to the Banking Management System Admin Dashboard.
        <br />
        Use the navigation menu on the left to manage requests and settings.
      </Typography>

      {/* New Sections for Requests and User Info */}
      <Grid container spacing={4}>
        {/* Request Section */}
        <Grid item xs={12} md={6}>
          <InfoSection>
            <AccountBalanceIcon color="primary" style={{ fontSize: '40px' }} />
            <Typography variant="h6" color="primary">
              Total Account Requests
            </Typography>
            <Typography variant="h4" color="textPrimary">
              120
            </Typography>
            <AttachMoneyIcon color="primary" style={{ fontSize: '40px', marginTop: '20px' }} />
            <Typography variant="h6" color="primary" style={{ marginTop: '20px' }}>
              Total Loan Requests
            </Typography>
            <Typography variant="h4" color="textPrimary">
              80
            </Typography>
          </InfoSection>
        </Grid>

        {/* User and Funds Section */}
        <Grid item xs={12} md={6}>
          <InfoSection>
            <PeopleIcon color="primary" style={{ fontSize: '40px' }} />
            <Typography variant="h6" color="primary">
              Total Users
            </Typography>
            <Typography variant="h4" color="textPrimary">
              540
            </Typography>
            <MonetizationOnIcon color="primary" style={{ fontSize: '40px', marginTop: '20px' }} />
            <Typography variant="h6" color="primary" style={{ marginTop: '20px' }}>
              Total Funds
            </Typography>
            <Typography variant="h4" color="textPrimary">
              $1,200,000
            </Typography>
          </InfoSection>
        </Grid>
      </Grid>
    </>
  );
};

export default AdminDashboard;
