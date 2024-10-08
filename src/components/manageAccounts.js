import React, { useState } from 'react';
import { TextField, Button, MenuItem, Typography, Paper, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { styled } from '@mui/system';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const FIRESTORE_BASE_URL = 'https://firestore.googleapis.com/v1/projects/banking-management-syste-72242/databases/(default)/documents';

// Styled components
const FormWrapper = styled(Paper)(() => ({
  padding: '30px',
  maxWidth: '400px',
  margin: '50px auto',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  borderRadius: '10px',
}));

const Container = styled('div')(() => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  maxWidth: '1200px',
  margin: '0 auto',
}));

const ManageAccounts = () => {

  const navigate = useNavigate();

  const [accountType, setAccountType] = useState('');
  const [amount, setAmount] = useState('');
  const [deleteAccountNumber, setDeleteAccountNumber] = useState('');
  const [deleteAccountType, setDeleteAccountType] = useState('');
  const [error, setError] = useState('');
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

  const customerId = sessionStorage.getItem('customerId');

    if(customerId==0){
        alert("Please LoginIn to Continue!!");
        navigate('/'); // Redirect to SignIn page
    }

  const handleAccountTypeChange = (e) => {
    setAccountType(e.target.value);
  };

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
  };

  const handleDeleteAccountTypeChange = (e) => {
    setDeleteAccountType(e.target.value);
  };

  const handleDeleteAccountNumberChange = (e) => {
    setDeleteAccountNumber(e.target.value);
  };

  const handleSubmitCreate = async (e) => {
    e.preventDefault();

    // Validations for amount based on account type
    if ((accountType === 'Savings' || accountType === 'Current') && amount < 100000) {
      setError('Amount must be greater than 1 lakh for Savings and Current accounts.');
      return;
    } else if ((accountType === 'PPF' || accountType === 'FD' || accountType === 'RD') && amount < 1000) {
      setError('Amount must be at least 1000 for PPF, FD, and RD accounts.');
      return;
    }

    setError('');

    const customerId = sessionStorage.getItem('customerId');

    const newAccNumber = await fetchAndIncrementAccountNumber(); 
    
    try {
      // Save the new account data to Firestore
      const AccountData = {
        fields: {
          accountNumber: { integerValue: newAccNumber },
          customerId: { integerValue: customerId },
          accountType: { stringValue: accountType },
          Amount: { integerValue: amount },
          isDelete: { booleanValue: false },
          isBlock: { booleanValue: false },
          createdAt: { timestampValue: new Date().toISOString() },
        },
      };
  
      await axios.post(`${FIRESTORE_BASE_URL}/account`, AccountData);

      alert('Account successfully created!');
      setAccountType('');
      setAmount('');
    } catch (error) {
      console.error('Error creating account:', error);
      alert('Failed to create account. Please try again.');
    }
  };

  const handleSubmitDelete = (e) => {
    e.preventDefault();
    setOpenConfirmDialog(true);
  };

  const  handleDeleteConfirm = async () => {
    
    setOpenConfirmDialog(false);

    const response = await axios.post(
      'https://firestore.googleapis.com/v1/projects/banking-management-syste-72242/databases/(default)/documents:runQuery',
      {
        structuredQuery: {
          from: [{ collectionId: 'account' }],
          where: {
            compositeFilter: {
              op: 'AND',
              filters: [
                {
                  fieldFilter: {
                    field: { fieldPath: 'accountNumber' },
                    op: 'EQUAL',
                    value: { integerValue: deleteAccountNumber }
                  }
                },
                {
                  fieldFilter: {
                    field: { fieldPath: 'accountType' },
                    op: 'EQUAL',
                    value: { stringValue: deleteAccountType }
                  }
                },
                {
                  fieldFilter: {
                    field: { fieldPath: 'isBlock' },
                    op: 'EQUAL',
                    value: { booleanValue: false }
                  }
                },
                {
                  fieldFilter: {
                    field: { fieldPath: 'isDelete' },
                    op: 'EQUAL',
                    value: { booleanValue: false }
                  }
                }
              ]
            }
          }
        }
      }
    );

    if(response.data[0].document==undefined){
      alert("Please enter correct account number or account type!!\n(Note: You can't able to delete the blocked account)");
      return;
    }

    let documentId = await fetchDocumentIdUsingAccountNumber(deleteAccountNumber);
    
    try {
        let updateFields = `updateMask.fieldPaths=isDelete`;
        const response = await fetch(`https://firestore.googleapis.com/v1/projects/banking-management-syste-72242/databases/(default)/documents/account/${documentId}?${updateFields}`, {
            method: 'PATCH',  // Use PATCH for partial updates
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fields: {
                    isDelete: { booleanValue: true }
                }
            })
        });

        if (response.ok) {
          alert('Account successfully deleted!');
          setDeleteAccountNumber('');
          setDeleteAccountType('');
        } else {
            console.error('Error deleting account', response.statusText);
        }
      } catch (error) {
          console.error('Error deleting account:', error);
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

// Fetch the document Id with the accountNumber
const fetchDocumentIdUsingAccountNumber = async (accountNumber) => {

  try {
      const response = await axios.post(
          'https://firestore.googleapis.com/v1/projects/banking-management-syste-72242/databases/(default)/documents:runQuery',
          {
            structuredQuery: {
              from: [{ collectionId: 'account' }], // Targeting the 'documents' collection
              where: {
                fieldFilter: {
                  field: { fieldPath: 'accountNumber' },
                  op: 'EQUAL',
                  value: { integerValue: accountNumber } // Assuming customerId is stored as a string in Firestore
                }
              }
            }
          }
        );

      return response.data[0].document.name.split('/').pop();

  } catch (error) {
      console.error('Error fetching document ID:', error);
  }
};



  return (
    <Container>
      {/* Create New Account Form */}
    <FormWrapper>
      <Typography variant="h4" style={{ marginBottom: '30px', color: '#1e90ff', fontWeight: 'bold' }}>
        Create New Account
      </Typography>
      <form onSubmit={handleSubmitCreate}>
        <TextField
          select
          label="Account Type"
          value={accountType}
          onChange={handleAccountTypeChange}
          fullWidth
          margin="normal"
          required
        >
          <MenuItem value="Savings">Savings</MenuItem>
          <MenuItem value="Current">Current</MenuItem>
          <MenuItem value="PPF">PPF</MenuItem>
          <MenuItem value="FD">FD</MenuItem>
          <MenuItem value="RD">RD</MenuItem>
        </TextField>

        <TextField
          label="Amount"
          type="number"
          value={amount}
          onChange={handleAmountChange}
          fullWidth
          margin="normal"
          required
        />

        {error && (
          <Typography variant="body2" style={{ color: 'red', marginBottom: '10px' }}>
            {error}
          </Typography>
        )}

        <Button variant="contained" color="primary" type="submit" fullWidth>
          Submit
        </Button>
      </form>
    </FormWrapper>

     {/* Delete Account Form */}
     <FormWrapper>
        <Typography variant="h4" style={{ marginBottom: '30px', color: '#1e90ff', fontWeight: 'bold' }}>
          Delete Account
        </Typography>
        <form onSubmit={handleSubmitDelete}>
          <TextField
            label="Account Number"
            value={deleteAccountNumber}
            onChange={handleDeleteAccountNumberChange}
            fullWidth
            margin="normal"
            required
          />

          <TextField
            select
            label="Account Type"
            value={deleteAccountType}
            onChange={handleDeleteAccountTypeChange}
            fullWidth
            margin="normal"
            required
          >
            <MenuItem value="Savings">Savings</MenuItem>
            <MenuItem value="Current">Current</MenuItem>
            <MenuItem value="PPF">PPF</MenuItem>
            <MenuItem value="FD">FD</MenuItem>
            <MenuItem value="RD">RD</MenuItem>
          </TextField>

          <Button variant="contained" color="primary" type="submit" fullWidth>
            Delete Account
          </Button>
        </form>
      </FormWrapper>

       {/* Confirmation Dialog */}
       <Dialog
        open={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
        inert-labelledby="confirm-dialog-title"
        inert-describedby="confirm-dialog-description"
      >
        <DialogTitle id="confirm-dialog-title">Confirm Account Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-dialog-description">
            Are you sure you want to delete account number {deleteAccountNumber}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="primary" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ManageAccounts;
