import React, { useState } from 'react';
import { TextField, Button, Container, Grid, Typography, Box, Select, MenuItem,FormControl, InputLabel, FormHelperText } from '@mui/material';
import { styled, keyframes } from '@mui/system';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Import axios for API requests
import app from './firebase'; // Adjust the path as necessary
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

//const storage = getStorage(app);


const FIRESTORE_BASE_URL = 'https://firestore.googleapis.com/v1/projects/banking-management-syste-72242/databases/(default)/documents';
//const STORAGE_BASE_URL = 'gs://banking-management-syste-72242.appspot.com'; // Replace with your Firebase Storage bucket


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

// Gradient background with subtle entrance animation
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
   // Adjusted maxWidth for a medium size
  width: '550px',
  animation: `${fadeIn} 1s ease-in-out`,
  '@media (max-width: 600px)': {
    padding: '20px',
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

const UploadButton = styled(Button)(({ uploaded }) => ({
  padding: '10px',
  border: uploaded ? '2px solid #76ff76' : '2px dashed #ff7676',
  color: uploaded ? '#76ff76' : '#ff7676',
  backgroundColor: uploaded ? '#d5ffd5' : 'transparent',
  '&:hover': {
    border: '2px solid #f54ea2',
    color: '#fff',
    backgroundColor: '#ff7676',
    transition: '0.4s ease',
    transform: 'scale(1.05)',
  },
}));

const SignUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [age, setAge] = useState(null);
  const [password, setPassword] = useState('');
  const [rePassword, setRePassword] = useState('');
  const [photo, setPhoto] = useState(null);
  const [aadhaar, setAadhaar] = useState(null);
  const [pan, setPan] = useState(null);
  const [photoName, setPhotoName] = useState('');
  const [aadhaarName, setAadhaarName] = useState('');
  const [panName, setPanName] = useState('');
  const [amount, setAmount] = useState('');
  const [accountType, setAccountType] = useState('');

  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [aadhaarUploaded, setAadhaarUploaded] = useState(false);
  const [panUploaded, setPanUploaded] = useState(false);

  const navigate = useNavigate();
  const storage = getStorage();

  const validatePassword = (password) => {
    const passwordPattern = /^(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/;
    return passwordPattern.test(password);
  };

  const handleSignUpWithFirebaseAuth = async (email, password) => {
    const API_KEY = 'AIzaSyBHyI-52LIsvfdDiyNdcggsUGkbRwcbJhk'; 
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`;

    try {
      await axios.post(url, {
        email,
        password,
        returnSecureToken: true, // Request the secure token from Firebase
      });
    } catch (error) {
      console.error('Error signing up with Firebase Auth:', error);
      alert('Sign-up failed. Please try again.');
    }
  };

  const handleSubmit = async () => {
    if (!name.match(/^[A-Za-z\s]+$/)) {
      alert("Name should contain only letters.");
      return;
    }
    if (!email.includes('@')) {
      alert("Email must contain '@'.");
      return;
    }
    if (!phone.match(/^[0-9]{10}$/)) {
      alert("Phone number should be exactly 10 digits.");
      return;
    }
    if (!dob || age <= 0) {
      alert("Please enter a valid Date of Birth.");
      return;
    }
    if (amount<100000) {
      alert("Minimum deposit amount is 1lakh.");
      return;
    }
    if (!password || !validatePassword(password)) {
      alert("Password must be at least 6 characters long and contain at least one special character.");
      return;
    }
    if (password !== rePassword) {
      alert("Passwords do not match.");
      return;
    }
    if (!photo) {
      alert("Please upload a photo.");
      return;
    }
    if (!aadhaar) {
      alert("Please upload Aadhaar card.");
      return;
    }
    if (!pan) {
      alert("Please upload PAN card.");
      return;
    }
  
    // Call the Firebase Auth API to save email and password
    await handleSignUpWithFirebaseAuth(email, password);
  
    // Proceed with Firestore operations
    try {
      
      const newCustomerId = await fetchAndIncrementCustomerId();
      const newDocumentId = await fetchAndIncrementDocumentId();
      const newAccNumber = await fetchAndIncrementAccountNumber();

      const photoURL = await uploadFileToStorage(photo, 'profilePhoto');
      const aadhaarURL = await uploadFileToStorage(aadhaar, 'aadhaar');
      const panURL = await uploadFileToStorage(pan, 'pan');
  
      const customerData = {
        fields: {
          name: { stringValue: name },
          email: { stringValue: email },
          phone: { stringValue: phone },
          dob: { stringValue: dob },
          age: { integerValue: age },
          customerId: { integerValue: newCustomerId },
          isDelete: { booleanValue: false },
          isBlock: { booleanValue: false },
          isApprove: { booleanValue: false },
          isHold: {booleanValue: false},
          createdAt: { timestampValue: new Date().toISOString() }
        },
      };
  
      await axios.post(`${FIRESTORE_BASE_URL}/customer`, customerData);

      let docType="personal";
  
      const documentData = {
        fields: {
          documentId: { integerValue: newDocumentId },
          customerId: { integerValue: newCustomerId },
          docType: { stringValue: docType },
          profilePhoto: { stringValue: photoURL },
          aadhaar: { stringValue: aadhaarURL },
          pan: { stringValue: panURL },
          isDelete: { booleanValue: false },
          createdAt: { timestampValue: new Date().toISOString() },
        },
      };
  
      await axios.post(`${FIRESTORE_BASE_URL}/documents`, documentData);

      const AccountData = {
        fields: {
          accountNumber: { integerValue: newAccNumber },
          customerId: { integerValue: newCustomerId },
          accountType: { stringValue: accountType },
          Amount: { integerValue: amount },
          isDelete: { booleanValue: false },
          isBlock: { booleanValue: false },
          createdAt: { timestampValue: new Date().toISOString() },
        },
      };
  
      await axios.post(`${FIRESTORE_BASE_URL}/account`, AccountData);
  
      alert(`Sign-up successful! Please Remeber this customer Id ${newCustomerId }`);
      navigate('/');
    } catch (error) {
      console.error('Error saving customer data:', error);
      alert('Sign-up failed. Please try again.');
    }
  };
  

  const calculateAge = (dateOfBirth) => {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      calculatedAge--;
    }

    return calculatedAge > 0 ? calculatedAge : null;
  };

  const handleDobChange = (event) => {
    const dobValue = event.target.value;
    setDob(dobValue);
    const calculatedAge = calculateAge(dobValue);
    setAge(calculatedAge);
  };

  const uploadFileToStorage = async (file, fileType) => {
    const storageRef = ref(storage, `uploads/${fileType}/${file.name}`);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  };

 // Fetch the current customer ID and increment it
 const fetchAndIncrementCustomerId = async () => {
  const countersDocURL = `${FIRESTORE_BASE_URL}/counters/customerCounter`;
  try {
    const response = await axios.get(countersDocURL);
    const lastCustomerId = response.data.fields.lastCustomerId.integerValue;

    const newCustomerId = parseInt(lastCustomerId, 10) + 1;

    // Update the counter in Firestore
    await axios.patch(countersDocURL, {
      fields: {
        lastCustomerId: { integerValue: newCustomerId },
      },
    });

    return newCustomerId;
  } catch (error) {
    console.error('Error fetching or incrementing customer ID:', error);
    throw new Error('Failed to get customer ID');
  }
};

// Fetch the current Document ID and increment it
const fetchAndIncrementDocumentId = async () => {
  const documentCountersDocURL = `${FIRESTORE_BASE_URL}/counters/documentCounter`;
  try {
    const response = await axios.get(documentCountersDocURL);
    const lastDocumentId = response.data.fields.lastDocumentId.integerValue;

    const newDocumentId = parseInt(lastDocumentId, 10) + 1;

    // Update the counter in Firestore
    await axios.patch(documentCountersDocURL, {
      fields: {
        lastDocumentId: { integerValue: newDocumentId },
      },
    });

    return newDocumentId;
  } catch (error) {
    console.error('Error fetching or incrementing document ID:', error);
    throw new Error('Failed to get document ID');
  }
};

// Fetch the current Account number and increment it
const fetchAndIncrementAccountNumber = async () => {
  const accNumberCountersDocURL = `${FIRESTORE_BASE_URL}/counters/accountNumberCounter`;
  try {
    const response = await axios.get(accNumberCountersDocURL);
    const lastAccNumber = response.data.fields.lastAccountNumber.integerValue;

    const newAccNumber = parseInt(lastAccNumber, 10) + 1;

    // Update the counter in Firestore
    await axios.patch(accNumberCountersDocURL, {
      fields: {
        lastAccountNumber: { integerValue: newAccNumber },
      },
    });

    return newAccNumber;
  } catch (error) {
    console.error('Error fetching or incrementing Account Number:', error);
    throw new Error('Failed to get Account Number');
  }
};



  return (
    <GradientBackground>
      <FormContainer>
        <Typography variant="h4" align="center" gutterBottom style={{ fontWeight: 'bold', color: '#2575fc' }}>
          Create Your Account
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Name"
              variant="outlined"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              helperText="Name should contain only letters"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email"
              variant="outlined"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              helperText="Email must contain '@' ('.com' is optional)"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Phone Number"
              variant="outlined"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              helperText="Phone number should be 10 digits"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Date of Birth"
              variant="outlined"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={dob}
              onChange={handleDobChange}
              required
              helperText={age !== null ? `Age: ${age}` : 'Enter a valid date'}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Age"
              variant="outlined"
              value={age || ''}
              disabled
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth variant="outlined" required>
              <InputLabel id="account-type-label">Account Type</InputLabel>
              <Select
                labelId="account-type-label"
                value={accountType}
                onChange={(e) => setAccountType(e.target.value)}
                label="Account Type"
              >
                <MenuItem value="Savings">Savings Account</MenuItem>
                <MenuItem value="Current">Current Account</MenuItem>
              </Select>
              <FormHelperText>Select the account type</FormHelperText>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
          <TextField
              fullWidth
              label="Amount"
              variant="outlined"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              helperText="Minimum amount is 100000"
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Password"
              variant="outlined"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              helperText="At least 6 characters, including one special character"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Re-enter Password"
              variant="outlined"
              type="password"
              value={rePassword}
              onChange={(e) => setRePassword(e.target.value)}
              required
              helperText="Should match the password"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12}>
            <UploadButton 
              fullWidth 
              component="label" 
              style={{ border: photoUploaded ? '2px solid #76ff76' : '2px dashed #ff7676', color: photoUploaded ? '#76ff76' : '#ff7676', backgroundColor: photoUploaded ? '#d5ffd5' : 'transparent' }}
            >
              {photoUploaded ? "Photo Uploaded" : "Upload Photo"}
              <input
                type="file"
                hidden
                onChange={(e) => {
                  setPhoto(e.target.files[0]);
                  setPhotoName(e.target.files[0].name);
                  setPhotoUploaded(true);
                }}
              />
            </UploadButton>
            {photoName && <Typography variant="body2">{photoName}</Typography>}
          </Grid>
          <Grid item xs={12}>
            <UploadButton 
              fullWidth 
              component="label" 
              style={{ border: aadhaarUploaded ? '2px solid #76ff76' : '2px dashed #ff7676', color: aadhaarUploaded ? '#76ff76' : '#ff7676', backgroundColor: aadhaarUploaded ? '#d5ffd5' : 'transparent' }}
            >
              {aadhaarUploaded ? "Aadhaar Uploaded" : "Upload Aadhaar Card"}
              <input
                type="file"
                hidden
                onChange={(e) => {
                  setAadhaar(e.target.files[0]);
                  setAadhaarName(e.target.files[0].name);
                  setAadhaarUploaded(true);
                }}
              />
            </UploadButton>
            {aadhaarName && <Typography variant="body2">{aadhaarName}</Typography>}
          </Grid>
          <Grid item xs={12}>
            <UploadButton 
              fullWidth 
              component="label" 
              style={{ border: panUploaded ? '2px solid #76ff76' : '2px dashed #ff7676', color: panUploaded ? '#76ff76' : '#ff7676', backgroundColor: panUploaded ? '#d5ffd5' : 'transparent' }}
            >
              {panUploaded ? "PAN Uploaded" : "Upload PAN Card"}
              <input
                type="file"
                hidden
                onChange={(e) => {
                  setPan(e.target.files[0]);
                  setPanName(e.target.files[0].name);
                  setPanUploaded(true);
                }}
              />
            </UploadButton>
            {panName && <Typography variant="body2">{panName}</Typography>}
          </Grid>
          <Grid item xs={12}>
            <StyledButton 
              variant="contained" 
              color="primary" 
              onClick={handleSubmit} 
              fullWidth
            >
              Submit
            </StyledButton>
          </Grid>
          <Grid item xs={12}>
            <Button 
              variant="text" 
              color="primary" 
              onClick={() => navigate('/')} 
              fullWidth
            >
              Already have an account? Sign In
            </Button>
          </Grid>
        </Grid>
      </FormContainer>
    </GradientBackground>
  );
};

export default SignUp;