import React, { useState, useEffect } from 'react';
import { Paper, Typography, Button, Avatar, Box, CircularProgress } from '@mui/material';
import { styled } from '@mui/system';
import axios from 'axios';


const FIRESTORE_BASE_URL = 'https://firestore.googleapis.com/v1/projects/banking-management-syste-72242/databases/(default)/documents';

// Styled components
const LoanRequestContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
  padding: '20px',
  width: '100%',
  margin: '20px auto',
});

const LoanCard = styled(Paper)(({ theme }) => ({
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
    background: '#f9f9f9',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center', // Center the content
    alignItems: 'center', // Center content horizontally
    gap: '15px',
    width: '80%', // Reduce width for better centering
    margin: '0 auto', // Center the card itself
    [theme.breakpoints.down('sm')]: {
      padding: '10px',
    },
  }));

const LoanDetails = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  alignItems: 'center', // Center the details
  textAlign: 'center', // Center the text
});

const LoanActions = styled(Box)({
  display: 'flex',
  justifyContent: 'center', // Center the buttons
  gap: '5px', // Reduced gap between buttons
  width: '100%',
});

// LoanRequest component
const LoanRequest = () => {
  const [loanRequests, setLoanRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomerDetails = async (customerId) => {
      try {
        // Fetch the customer details from the 'customer' table
        const response = await axios.post(
          `${FIRESTORE_BASE_URL}:runQuery`,
          {
            structuredQuery: {
              from: [{ collectionId: 'customer' }],
              where: {
                fieldFilter: {
                  field: { fieldPath: 'customerId' },
                  op: 'EQUAL',
                  value: { integerValue: customerId },
                },
              },
            },
          }
        );

        if (response.data.length > 0 && response.data[0].document) {
          const customerData = response.data[0].document.fields;
          return {
            name: customerData.name.stringValue
          };
        }
      } catch (error) {
        console.error('Error fetching customer details:', error);
        return { name: 'Unknown', photoUrl: '' };
      }
    };

    const fetchLoanAccountDetails = async () => {
      try {
        // Firestore query to get loan details where isApprove is false
        const response = await axios.post(
          `${FIRESTORE_BASE_URL}:runQuery`,
          {
            structuredQuery: {
              from: [{ collectionId: 'loanAccount' }],
              where: {
                fieldFilter: {
                  field: { fieldPath: 'isApprove' },
                  op: 'EQUAL',
                  value: { booleanValue: false },
                },
              },
            }
          }
        );

        const loanAccounts = response.data
          .filter(doc => doc.document)
          .map(doc => ({
            loanId: doc.document.name.split('/').pop(), // Extract loan ID from document path
            ...doc.document.fields,
          }));

        // Fetch customer details for each loan account
        const loanRequestsWithCustomer = await Promise.all(
          loanAccounts.map(async loan => {
            const customerId = loan.customerId.integerValue; // Extract customerId from loan account
            const customerDetails = await fetchCustomerDetails(customerId); // Fetch customer details

            return {
              ...loan,
              customer: customerDetails, // Attach customer details
            };
          })
        );

        setLoanRequests(loanRequestsWithCustomer);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching loan account details:', error);
        setLoading(false);
      }
    };

    fetchLoanAccountDetails();
  }, []);

  const handleApprove = async (accountNumber) => {

    let documentId = await fetchDocumentIdUsingCustomerId(accountNumber);
    
    try {
        let updateFields = `updateMask.fieldPaths=isApprove`;
        const response = await fetch(`https://firestore.googleapis.com/v1/projects/banking-management-syste-72242/databases/(default)/documents/loanAccount/${documentId}?${updateFields}`, {
            method: 'PATCH',  // Use PATCH for partial updates
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fields: {
                    isApprove: { booleanValue: true }
                }
            })
        });

        if (response.ok) {
            alert('Loan approval successful!!');
            window.location.reload();
        } else {
            console.error('Error approving Loan', response.statusText);
        }
    } catch (error) {
        console.error('Error approving Loan:', error);
    }
  };


  const fetchDocumentIdUsingCustomerId = async (accountNumber) => {

    try {
        const response = await axios.post(
            'https://firestore.googleapis.com/v1/projects/banking-management-syste-72242/databases/(default)/documents:runQuery',
            {
              structuredQuery: {
                from: [{ collectionId: 'loanAccount' }], // Targeting the 'documents' collection
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


  const handleOnHold = async (accountNumber) => {

    let documentId = await fetchDocumentIdUsingCustomerId(accountNumber);
    
    try {
        let updateFields = `updateMask.fieldPaths=isHold`;
        const response = await fetch(`https://firestore.googleapis.com/v1/projects/banking-management-syste-72242/databases/(default)/documents/loanAccount/${documentId}?${updateFields}`, {
            method: 'PATCH',  // Use PATCH for partial updates
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fields: {
                    isHold: { booleanValue: true }
                }
            })
        });

        if (response.ok) {
            alert('Loan Put on Hold!!');
        } else {
            console.error('Error making Loan hold: ', response.statusText);
        }
    } catch (error) {
        console.error('Error making Loan hold: ', error);
    }
  };

  const handleReject = async (accountNumber) => {
    let documentId = await fetchDocumentIdUsingCustomerId(accountNumber);
    
    try {
        let updateFields = `updateMask.fieldPaths=isDelete`;
        const response = await fetch(`https://firestore.googleapis.com/v1/projects/banking-management-syste-72242/databases/(default)/documents/loanAccount/${documentId}?${updateFields}`, {
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
            alert('loan Request Rejected!!');
            window.location.reload();
        } else {
            console.error('Error rejecting loan: ', response.statusText);
        }
    } catch (error) {
        console.error('Error rejecting loan: ', error);
    }
  };
  

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LoanRequestContainer>
      <Typography variant="h4" style={{ marginBottom: '20px', textAlign: 'center', fontWeight: 'bold', color: '#1e90ff' }}>
        Loan Requests
      </Typography>

      {loanRequests.length > 0 ? (
        loanRequests.map((loan, index) => (
          <LoanCard key={index}>
            {/* Customer Profile and Name */}
            <Box display="flex" alignItems="center" gap="15px">
              <Typography variant="h6">{loan.customer?.name || 'Unknown Customer'}</Typography>
            </Box>

            {/* Loan Details */}
            <LoanDetails>
              <Typography variant="body2">Loan Type: {loan.loanType?.stringValue || 'N/A'}</Typography>
              <Typography variant="body2">Loan Amount: ₹{loan.loanAmount?.integerValue || 'N/A'}</Typography>
              <Typography variant="body2">EMI: ₹{loan.monthlyEmi?.doubleValue || 'N/A'}</Typography>
              <Typography variant="body2">Tenure: {loan.tenure?.integerValue || 'N/A'} years</Typography>
              <Typography variant="body2">Interest Rate: {loan.interestRate?.doubleValue || 'N/A'}%</Typography>
            </LoanDetails>

            {/* Loan Document Link */}
            <Button variant="outlined" color="primary" href={loan.loanDocument?.stringValue || '#'} target="_blank">
              View Document
            </Button>

            {/* Action Buttons */}
            <LoanActions>
              <Button variant="contained" color="success" onClick={() => handleApprove(loan.accountNumber?.integerValue)}>
                Accept
              </Button>
              <Button variant="contained" color="warning" onClick={() => handleOnHold(loan.accountNumber?.integerValue)}>
                Hold
              </Button>
              <Button variant="contained" color="error" onClick={() => handleReject(loan.accountNumber?.integerValue)}>
                Reject
              </Button>
            </LoanActions>
          </LoanCard>
        ))
      ) : (
        <Typography variant="h6" style={{ textAlign: 'center' }}>
          No loan requests found.
        </Typography>
      )}
    </LoanRequestContainer>
  );
};

export default LoanRequest;
