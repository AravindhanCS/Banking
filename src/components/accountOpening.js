import React, { useState, useEffect } from 'react';
import { Paper, Typography, Button, Grid, Avatar, Box, Dialog, DialogContent } from '@mui/material';
import { styled } from '@mui/system';
import axios from 'axios';

// Styled component for the information section with increased width
const InfoSection = styled(Paper)(({ theme }) => ({
  padding: '20px',
  textAlign: 'center',
  background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)',
  borderRadius: '15px',
  marginBottom: '20px',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
  },
  width: '100%', // Full width
  minWidth: '300px', // Minimum width to prevent overlap
  maxWidth: '400px', // Maximum width for better layout control
  minHeight: '300px', // Set a minimum height to ensure space for all content
  overflow: 'hidden', // Prevent overflow
  display: 'flex',
  flexDirection: 'column', // Stack items vertically
  justifyContent: 'space-between', // Space items evenly
 

}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 80,
  height: 80,
  margin: '0 auto 10px',
  border: '2px solid #1976d2', // Adding a border to the avatar
}));

const StyledTypography = styled(Typography)(({ theme }) => ({
  marginBottom: '8px',
  color: '#333', // Darker text color for better readability
  wordWrap: 'break-word', // Ensure long words wrap to the next line
}));

const StyledButton = styled(Button)(({ theme }) => ({
  margin: '5px 0', // Margin for spacing
  padding: '10px 15px',
  borderRadius: '20px', // Rounded edges for buttons
  transition: 'background-color 0.3s, transform 0.3s',
  '&:hover': {
    transform: 'scale(1.05)',
  },
}));

const AccountOpening = () => {
  const [customers, setCustomers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [documentImages, setDocumentImages] = useState({ aadhaarUrl: '', panUrl: '' });


  useEffect(() => {

    
    const fetchProfilePhoto = async (customerId) => {
        try {
          const response = await axios.get('https://firestore.googleapis.com/v1/projects/banking-management-syste-72242/databases/(default)/documents/documents');
          const DocumentsData = response.data.documents;
  
          const DocumentsPromises = DocumentsData
            .filter(document => 
              document.fields.customerId.integerValue === customerId && 
              document.fields.docType.stringValue === "personal"
            )
            return DocumentsPromises[0].fields.profilePhoto.stringValue;
        } catch (error) {
          console.error(`Error fetching profile photo for customerId ${customerId}:`, error);
          return ''; // Return empty on error
        }
      };

      const fetchCustomers = async () => {
        try {
          const response = await axios.get('https://firestore.googleapis.com/v1/projects/banking-management-syste-72242/databases/(default)/documents/customer');
          const customersData = response.data.documents;
  
          const customerPromises = customersData
            .filter(customer => 
              customer.fields.isDelete.booleanValue === false && 
              customer.fields.isApprove.booleanValue === false
            )
            .map(async customer => {
              const profilePhotoUrl = await fetchProfilePhoto(customer.fields.customerId.integerValue);
              return {
                id: customer.fields.customerId.integerValue,
                name: customer.fields.name.stringValue,
                email: customer.fields.email.stringValue,
                phoneNumber: customer.fields.phone.stringValue,
                dob: customer.fields.dob.stringValue,
                imageUrl: profilePhotoUrl, // Set profile photo URL
              };
            });
  
          const filteredCustomers = await Promise.all(customerPromises);

        setCustomers(filteredCustomers);
      } catch (error) {
        console.error('Error fetching customers:', error);
      }
    };

    fetchCustomers();
  }, []);

  const handleViewDocuments = async (customerId) => {
    try{
        const response = await axios.post(
            'https://firestore.googleapis.com/v1/projects/banking-management-syste-72242/databases/(default)/documents:runQuery',
            {
              structuredQuery: {
                from: [{ collectionId: 'documents' }],
                where: {
                  compositeFilter: {
                    op: 'AND',
                    filters: [
                      {
                        fieldFilter: {
                          field: { fieldPath: 'customerId' },
                          op: 'EQUAL',
                          value: { integerValue: customerId }
                        }
                      },
                      {
                        fieldFilter: {
                          field: { fieldPath: 'docType' },
                          op: 'EQUAL',
                          value: { stringValue: 'personal' }
                        }
                      }
                    ]
                  }
                }
              }
            }
          );
  
        const aadhaarDoc = response.data[0].document.fields.aadhaar.stringValue;
        const panDoc = response.data[0].document.fields.pan.stringValue;
        setDocumentImages({
          aadhaarUrl: aadhaarDoc,
          panUrl: panDoc,
        });
  
        setOpenDialog(true); // Open the modal to show documents
      } catch (error) {
        console.error('Error fetching documents:', error);
      }
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };


  const fetchDocumentIdUsingCustomerId = async (customerId) => {

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

        return response.data[0].document.name.split('/').pop();

    } catch (error) {
        console.error('Error fetching document ID:', error);
    }
};

  const handleApprove = async (customerId) => {

    let documentId = await fetchDocumentIdUsingCustomerId(customerId);
    
    try {
        let updateFields = `updateMask.fieldPaths=isApprove&updateMask.fieldPaths=isHold`;
        const response = await fetch(`https://firestore.googleapis.com/v1/projects/banking-management-syste-72242/databases/(default)/documents/customer/${documentId}?${updateFields}`, {
            method: 'PATCH',  // Use PATCH for partial updates
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fields: {
                    isApprove: { booleanValue: true },
                    isHold: { booleanValue: false }
                }
            })
        });

        if (response.ok) {
            alert('Customer approval successful!!');
            window.location.reload();
        } else {
            console.error('Error approving customer', response.statusText);
        }
    } catch (error) {
        console.error('Error approving customer:', error);
    }
  };

  const handleOnHold = async (customerId) => {

    let documentId = await fetchDocumentIdUsingCustomerId(customerId);
    
    try {
        let updateFields = `updateMask.fieldPaths=isHold`;
        const response = await fetch(`https://firestore.googleapis.com/v1/projects/banking-management-syste-72242/databases/(default)/documents/customer/${documentId}?${updateFields}`, {
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
            alert('Customer Put on Hold!!');
        } else {
            console.error('Error making customer hold: ', response.statusText);
        }
    } catch (error) {
        console.error('Error making customer hold: ', error);
    }
  };

  const handleReject = async (customerId) => {
    let documentId = await fetchDocumentIdUsingCustomerId(customerId);
    
    try {
        let updateFields = `updateMask.fieldPaths=isDelete`;
        const response = await fetch(`https://firestore.googleapis.com/v1/projects/banking-management-syste-72242/databases/(default)/documents/customer/${documentId}?${updateFields}`, {
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

        const response2 = await axios.post(
            'https://firestore.googleapis.com/v1/projects/banking-management-syste-72242/databases/(default)/documents:runQuery',
            {
              structuredQuery: {
                from: [{ collectionId: 'account' }], // Targeting the 'documents' collection
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

          for(let account=0;account<response2.data.length;account++){
            let documentId=response2.data[account].document.name.split('/').pop();

            let updateFields = `updateMask.fieldPaths=isDelete`;
            await fetch(`https://firestore.googleapis.com/v1/projects/banking-management-syste-72242/databases/(default)/documents/account/${documentId}?${updateFields}`, {
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

          }
        

        if (response.ok) {
            alert('Customer Request Rejected!!');
            window.location.reload();
        } else {
            console.error('Error rejecting customer request: ', response.statusText);
        }
    } catch (error) {
        console.error('Error rejecting customer request: ', error);
    }
  };


  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const ageDiff = Date.now() - birthDate.getTime();
    const ageDate = new Date(ageDiff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      flexDirection: 'column', // Align items vertically for smaller screens
      height: '100vh', // Full viewport height to center vertically
      p: 3, 
      marginTop: '-40px' 
      

    }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', marginBottom: '60px',marginTop: '-100px', textAlign: 'center' }}>
        Account Opening Requests
      </Typography>

      <Grid container spacing={3} justifyContent="center" alignItems="flex-start">
        {customers.map((customer) => (
          <Grid item xs={4} sm={7} md={7} lg={6} key={customer.id}>
            <InfoSection>
              <StyledAvatar alt={customer.name} src={customer.imageUrl} />
              <StyledTypography variant="h6" sx={{ fontWeight: 'bold' }}>{customer.name}</StyledTypography>
              <StyledTypography variant="body1">Email: {customer.email}</StyledTypography>
              <StyledTypography variant="body1">Phone: {customer.phoneNumber}</StyledTypography>
              <StyledTypography variant="body1">Age: {calculateAge(customer.dob)} years</StyledTypography>
              
              <StyledButton variant="outlined" color="primary" onClick={() => handleViewDocuments(customer.id)}>
                View Documents
              </StyledButton>
              <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center',  alignItems: 'center', gap: '10px' }}>
                <StyledButton variant="contained" color="success" onClick={() => handleApprove(customer.id)}>
                  Approve
                </StyledButton>
                <StyledButton variant="contained" color="warning" onClick={() => handleOnHold(customer.id)}>
                  On Hold
                </StyledButton>
                <StyledButton variant="contained" color="error" onClick={() => handleReject(customer.id)}>
                  Reject
                </StyledButton>
              </Box>
            </InfoSection>
          </Grid>
        ))}
      </Grid>
        {/* Dialog to show Aadhaar and PAN images */}
      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogContent>
          
          <Box>
          <Typography variant="h6" sx={{ marginBottom: '20px' }}>Aadhaar Card</Typography>
            {documentImages.aadhaarUrl && (
              <img src={documentImages.aadhaarUrl} alt="Aadhaar" style={{ width: '100%', marginBottom: '20px' }} />
            )}
            <Typography variant="h6" sx={{ marginBottom: '20px' }}>PAN Card</Typography>
            {documentImages.panUrl && (
              <img src={documentImages.panUrl} alt="PAN" style={{ width: '100%' }} />
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default AccountOpening;
