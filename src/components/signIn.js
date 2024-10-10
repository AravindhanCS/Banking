import React, { useState } from 'react';
import { TextField, Button, Container, Typography, Box, Link, Modal } from '@mui/material';
import { styled, keyframes } from '@mui/system';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Animation keyframes for the form
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const GradientBackground = styled(Box)({
  background: 'linear-gradient(135deg, #f7f8fc 0%, #e3fdfd 100%)',
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px',
  animation: `${fadeIn} 1.5s ease-in-out`,
});

const FormContainer = styled(Container)({
  backgroundColor: '#fff',
  padding: '40px',
  borderRadius: '15px',
  boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.1)',
  width: '450px',
  animation: `${fadeIn} 1s ease-in-out`,
});

const AdminButton = styled(Button)({
    marginTop: '10px',
    backgroundColor: '#007BFF',
    color: '#fff',
    '&:hover': {
      backgroundColor: '#6a11cb',
    },
  });

const StyledButton = styled(Button)({
  padding: '12px 20px',
  backgroundColor: '#2575fc',
  color: '#fff',
  fontWeight: 'bold',
  '&:hover': {
    backgroundColor: '#6a11cb',
    transform: 'scale(1.02)',
    transition: 'all 0.3s ease',
  },
});

const SignIn = () => {
  const [customerId, setCustomerId] = useState('');
  const [password, setPassword] = useState('');
  const [openForgotPassword, setOpenForgotPassword] = useState(false); // Modal state
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSignIn = async () => {
    if (!customerId || !password) {
      alert("Please enter both Customer ID and Password.");
      return;
    }

    // Here you would typically call your authentication API
    try {

         // 1. Query Firestore to get the email ID based on Customer ID
         const firestoreQueryURL = `https://firestore.googleapis.com/v1/projects/banking-management-syste-72242/databases/(default)/documents:runQuery`;

         const queryPayload = {
           structuredQuery: {
             from: [{ collectionId: "customer" }], // Collection name
             where: {
               fieldFilter: {
                 field: { fieldPath: "customerId" }, // The field we're filtering by
                 op: "EQUAL",
                 value: { integerValue: customerId }, // Customer ID entered by user
               },
             },
           },
         };

      const customerResponse = await axios.post(firestoreQueryURL, queryPayload);

       // Check if any document was returned
       if (customerResponse.data.length > 0 && customerResponse.data[0].document) {
        const emailId = customerResponse.data[0].document.fields.email.stringValue;

        // 2. Authenticate using email and password via Firebase REST API
        const authURL = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyBHyI-52LIsvfdDiyNdcggsUGkbRwcbJhk`;
        const authResponse = await axios.post(authURL, {
          email: emailId,
          password: password,
          returnSecureToken: true,
        });
        
            if (authResponse.data.idToken) {
                sessionStorage.setItem('customerId',customerId);
                navigate('/customerDashboard'); // Redirect to home page
              }
            } else {
              alert("Invalid Customer ID.");
            }
    } catch (error) {
      console.error('Sign in error:', error);
      alert("An error occurred during sign in. Please try again.");
    }
  };

  const handleForgotPassword = async () => {
    try {
      await axios.post(
        `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=AIzaSyBHyI-52LIsvfdDiyNdcggsUGkbRwcbJhk`,
        {
          requestType: 'PASSWORD_RESET',
          email: email,
        }
      );
      alert('Password reset email sent!');
      setOpenForgotPassword(false);
    } catch (error) {
      console.error('Error sending reset email:', error);
      alert('Failed to send reset email.');
    }
  };

  return (
    <GradientBackground>
      <FormContainer>
        <Typography variant="h4" align="center" gutterBottom style={{ fontWeight: 'bold', color: '#2575fc' }}>
          Sign In
        </Typography>
        <TextField
          fullWidth
          label="Customer ID"
          variant="outlined"
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
          required
          InputLabelProps={{ shrink: true }}
          style={{ marginBottom: '20px' }}
        />
        <TextField
          fullWidth
          label="Password"
          variant="outlined"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          InputLabelProps={{ shrink: true }}
          style={{ marginBottom: '20px' }}
        />
        <StyledButton
          variant="contained"
          onClick={handleSignIn}
          fullWidth
        >
          Sign In
        </StyledButton>

          {/* Forgot Password Link */}
          <Typography variant="body2" align="center" style={{ marginTop: '20px' }}>
          <Link href="#" onClick={() => setOpenForgotPassword(true)} style={{ color: '#2575fc', fontWeight: 'bold' }}>
            Forgot Password?
          </Link>
        </Typography>

        <Typography variant="body2" align="center" style={{ marginTop: '20px' }}>
          Don't have an account?{' '}
          <Link href="#" onClick={() => navigate('signUp')} style={{ color: '#2575fc', fontWeight: 'bold' }}>
            Register
          </Link>
        </Typography>

        <AdminButton
          variant="contained"
          onClick={() => navigate('/adminLogin')}
          fullWidth
        >
          Admin Login
        </AdminButton>
        
      </FormContainer>
       {/* Forgot Password Modal */}
       <Modal open={openForgotPassword} onClose={() => setOpenForgotPassword(false)}>
        <div style={{ padding: '20px', backgroundColor: '#fff', margin: 'auto', width: '300px' }}>
          <Typography variant="h6">Reset Password</Typography>
          <TextField
            label="Enter your email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ marginBottom: '20px' }}
          />
          <Button variant="contained" color="primary" onClick={handleForgotPassword}>
            Submit
          </Button>
        </div>
      </Modal>
    </GradientBackground>
  );
};

export default SignIn;
