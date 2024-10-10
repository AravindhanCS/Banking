import React, { useEffect, useState } from 'react';
import { Paper, Typography, CircularProgress, TextField, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/system';
import axios from 'axios';

// Styled components
const InfoSection = styled(Paper)(() => ({
  padding: '20px',
  textAlign: 'center',
  background: 'linear-gradient(135deg, #ffffff 0%, #f9f9f9 100%)',
  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
  borderRadius: '10px',
  marginBottom: '20px',
  transition: 'transform 0.3s ease',
  maxWidth: '400px',
  width: '100%',
  '&:hover': {
    transform: 'scale(1.05)',
  },
}));

const FormSection = styled(Paper)(() => ({
    padding: '20px',
    marginTop: '30px',
    background: '#f4f4f4',
    borderRadius: '10px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
  }));

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState([]);
  const [accounts2, setAccouts2] = useState([]);
  const [formData, setFormData] = useState({
    senderAccountNumber: '',
    receiverAccountNumber: '',
    ifscCode: '',
    amount: '',
  });

  const checkAccountStatus = async () => {
    const customerId = sessionStorage.getItem('customerId');

    if(customerId===0){
        alert("Please LoginIn to Continue!!");
        navigate('/'); // Redirect to SignIn page
    }
    else{
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
    
          const isBlock = response.data[0].document.fields.isBlock.booleanValue;
          const isApprove = response.data[0].document.fields.isApprove.booleanValue;
          const isDelete = response.data[0].document.fields.isDelete.booleanValue;
    
          if (!isBlock && isApprove && !isDelete) {
            // All conditions met
            await fetchAccounts(customerId);
            await fetchLoanAccounts(customerId);
          } else {
            // Condition not satisfied
            if (isDelete) alert('Your account is deleted or Account request is reject by admin.');
            else if (!isApprove) alert('Your account is not yet approved.');
            else if (isBlock) alert('Your account is blocked.');
            
            
            setLoading(false);
            navigate('/'); // Redirect to SignIn page
          }
        } catch (error) {
          console.error('Error fetching customer data:', error);
          alert('An error occurred while checking your account status.');
          setLoading(false);
          navigate('/'); // Redirect to SignIn page
        }
    }
  };

  const fetchAccounts = async (customerId) => {
    try {
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
                          field: { fieldPath: 'customerId' },
                          op: 'EQUAL',
                          value: { integerValue: customerId }
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

      const fetchedAccounts = response.data.map((doc) => ({
       
        accountNumber: doc.document.fields.accountNumber.integerValue,
        balance: doc.document.fields.Amount.integerValue,
        accountType: doc.document.fields.accountType.stringValue,
      }));

      setAccounts(fetchedAccounts);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      setLoading(false);
    }
  };

  //fetch loan accounts
  const fetchLoanAccounts = async (customerId) => {
    try {
        const response = await axios.post(
            'https://firestore.googleapis.com/v1/projects/banking-management-syste-72242/databases/(default)/documents:runQuery',
            {
              structuredQuery: {
                from: [{ collectionId: 'loanAccount' }],
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
                          field: { fieldPath: 'isDelete' },
                          op: 'EQUAL',
                          value: { booleanValue: false }
                        }
                      },
                      {
                        fieldFilter: {
                          field: { fieldPath: 'isApprove' },
                          op: 'EQUAL',
                          value: { booleanValue: true }
                        }
                      },
                      {
                        fieldFilter: {
                          field: { fieldPath: 'isHold' },
                          op: 'EQUAL',
                          value: { booleanValue: false }
                        }
                      },
                    ]
                  }
                }
              }
            }
          );

      const fetchedAccounts = response.data.map((doc) => ({
       
        accountNumber: doc.document.fields.accountNumber.integerValue,
        balance: doc.document.fields.loanAmount.integerValue,
        accountType: doc.document.fields.loanType.stringValue,
      }));

      setAccouts2(fetchedAccounts);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  
  const verifySenderAccountNumber = async (accountNumber,amount) => {

    const customerId = sessionStorage.getItem('customerId');

    console.log(customerId);
    console.log(accountNumber);

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
                      field: { fieldPath: 'customerId' },
                      op: 'EQUAL',
                      value: { integerValue: customerId }
                    }
                  },
                  {
                    fieldFilter: {
                      field: { fieldPath: 'accountNumber' },
                      op: 'EQUAL',
                      value: { integerValue: accountNumber }
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
  
      if(response.data[0].document===undefined){
        alert("Please enter correct account number !!");
        return false;
      }

      if(response.data[0].document.fields.isBlock.booleanValue){
        alert(`${accountNumber} is Block`);
        return false;
      }

      let accountType = response.data[0].document.fields.accountType.stringValue;

      if(accountType==="Current" || accountType==="Savings" ){
        let money = response.data[0].document.fields.Amount.integerValue;
        if(money<amount){
            alert("Insuffiecient Balance");
            return false;
        }
        return true;
      }
      else{
        alert(`Your can't send money from a ${accountType} account!!`);
        return false;
      }
};

const verifyReceiverAccountNumber = async (accountNumber) => {

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
                      value: { integerValue: accountNumber }
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
  
      if(response.data[0].document===undefined){
        alert("Please enter correct Sender account number !!");
        return false;
      }

      if(response.data[0].document.fields.isBlock.booleanValue){
        alert(`${accountNumber} is Block`);
        return false;
      }

      return true;
};


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

const updateBalance = async (accountNumber, balance) => {
  try {
    const documentId = await fetchDocumentIdUsingAccountNumber(accountNumber);

    let updateFields = `updateMask.fieldPaths=Amount`;
    const response = await fetch(`https://firestore.googleapis.com/v1/projects/banking-management-syste-72242/databases/(default)/documents/account/${documentId}?${updateFields}`, {
        method: 'PATCH',  // Use PATCH for partial updates
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            fields: {
                Amount: { integerValue: balance }
            }
        })
    });

    if (response.ok) {
      console.log("Transaction done!");
    } else {
        console.error('Error during transaction', response.statusText);
    }
  } catch (error) {
      console.error('Error during transaction:', error);
  }

};


  const handleTransfer = async (e) => {
    e.preventDefault();

    const { senderAccountNumber, receiverAccountNumber, ifscCode, amount } = formData;

    console.log(senderAccountNumber);
    console.log(receiverAccountNumber);
    console.log(ifscCode);
    console.log(amount);

    if(senderAccountNumber===receiverAccountNumber){
      alert("Sender and receiver account number should not be same!!");
      return;
    }

    if(amount<=0){
      alert("Amount should be greater than 0!!");
      return;
    }

    let transaction = false;

    if(await verifySenderAccountNumber(senderAccountNumber,amount)){
        if(ifscCode==="Aravind1234"){
            if(await verifyReceiverAccountNumber(receiverAccountNumber)){

              const senderRecord = await axios.post(
                'https://firestore.googleapis.com/v1/projects/banking-management-syste-72242/databases/(default)/documents:runQuery',
                {
                  structuredQuery: {
                    from: [{ collectionId: 'account' }], // Targeting the 'documents' collection
                    where: {
                      fieldFilter: {
                        field: { fieldPath: 'accountNumber' },
                        op: 'EQUAL',
                        value: { integerValue: senderAccountNumber } // Assuming customerId is stored as a string in Firestore
                      }
                    }
                  }
                }
              );  

              const receiverRecord = await axios.post(
                'https://firestore.googleapis.com/v1/projects/banking-management-syste-72242/databases/(default)/documents:runQuery',
                {
                  structuredQuery: {
                    from: [{ collectionId: 'account' }], // Targeting the 'documents' collection
                    where: {
                      fieldFilter: {
                        field: { fieldPath: 'accountNumber' },
                        op: 'EQUAL',
                        value: { integerValue: receiverAccountNumber } // Assuming customerId is stored as a string in Firestore
                      }
                    }
                  }
                }
              ); 

              let receiverAccountType = receiverRecord.data[0].document.fields.accountType.stringValue;

              let senderUpdatedBalance;
              let receiverUpdatedBalance;
              if(receiverAccountType!=="Loan"){
                senderUpdatedBalance=parseInt(senderRecord.data[0].document.fields.Amount.integerValue)-parseInt(amount);
                receiverUpdatedBalance=parseInt(receiverRecord.data[0].document.fields.Amount.integerValue)+parseInt(amount);
                console.log(senderUpdatedBalance);
                console.log(receiverUpdatedBalance);
              }
              else{
                senderUpdatedBalance=parseInt(senderRecord.data[0].document.fields.Amount.integerValue)-parseInt(amount);
                receiverUpdatedBalance=parseInt(receiverRecord.data[0].document.fields.Amount.integerValue)-parseInt(amount);
              }
              updateBalance(senderAccountNumber,senderUpdatedBalance);
              updateBalance(receiverAccountNumber,receiverUpdatedBalance);

              transaction=true;
            }
        }  
    }

    if(transaction){
      const transactionId = await fetchAndIncrementTransactionId();
    
      try {
        // Save the transaction to Firestore's 'transaction' collection
        await axios.post(
          'https://firestore.googleapis.com/v1/projects/banking-management-syste-72242/databases/(default)/documents/transactions',
          {
            fields: {
              transactionId: {integerValue: transactionId},
              senderAccountNumber: { integerValue: senderAccountNumber },
              receiverAccountNumber: { integerValue: receiverAccountNumber },
              senderIfscCode: { stringValue: "Aravind1234" },
              receiverIfscCode: {stringValue: ifscCode},
              amount: { integerValue: parseInt(amount) },
              transactionDate: { timestampValue: new Date().toISOString() },
            },
          }
        );

        alert('Transaction successful');
        setFormData({
          senderAccountNumber: '',
          receiverAccountNumber: '',
          ifscCode: '',
          amount: '',
        });
      } catch (error) {
        console.error('Error making transaction:', error);
        alert('Transaction failed.');
      }
    }

    else{
      alert("Transaction Failed!!");
    } 
  };

const FIRESTORE_BASE_URL = 'https://firestore.googleapis.com/v1/projects/banking-management-syste-72242/databases/(default)/documents';
  // Fetch the current Account number and increment it
const fetchAndIncrementTransactionId = async () => {
    const transactionIdCountersDocURL = `${FIRESTORE_BASE_URL}/counters/transactionIdCounter`;
    try {
      const response = await axios.get(transactionIdCountersDocURL);
      const lastTransactionId = response.data.fields.lastTransactionId.integerValue;
  
      const newTransactionId = parseInt(lastTransactionId, 10) + 1;
  
      // Update the counter in Firestore
      await axios.patch(transactionIdCountersDocURL, {
        fields: {
            lastTransactionId: { integerValue: newTransactionId },
        },
      });
  
      return newTransactionId;
    } catch (error) {
      console.error('Error fetching or incrementing Transaction Id:', error);
      throw new Error('Failed to get Transaction Id');
    }
  };


  useEffect(() => {
    checkAccountStatus();
  });

  return (
    <>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#fff' }}>
          <CircularProgress />
        </div>
      ) : (
        <>
          <Typography variant="h4" style={{ fontWeight: 'bold', color: '#1e90ff', marginBottom: '20px' }}>
            Customer Dashboard
          </Typography>
          <Typography variant="body1" style={{ color: '#555', marginBottom: '30px' }}>
            Welcome to the Banking Management System Customer Dashboard.
            <br />
            Use the navigation menu on the left to manage requests and settings.
          </Typography>

           {/* Flex container for account sections */}
           <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            {accounts.map((account, index) => (
              <InfoSection key={index}>
                <Typography variant="h6" style={{ fontWeight: 'bold', color: '#1e90ff' }}>
                  {account.accountType} Account
                </Typography>
                <Typography variant="body1">
                  Account Number:{account.accountNumber}
                </Typography>
                <Typography variant="body1">
                  Balance: ₹{account.balance}
                </Typography>
              </InfoSection>
            ))}
          </div>

          {/* Flex container for loan sections */}
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            {accounts2.map((account, index) => (
              <InfoSection key={index}>
                <Typography variant="h6" style={{ fontWeight: 'bold', color: '#1e90ff' }}>
                  {account.accountType} Account
                </Typography>
                <Typography variant="body1">
                  Account Number:{account.accountNumber}
                </Typography>
                <Typography variant="body1">
                  Balance: ₹{account.balance}
                </Typography>
              </InfoSection>
            ))}
          </div>

          {/* Transfer Money form */}
          <FormSection>
            <Typography variant="h6" style={{ marginBottom: '20px', fontWeight: 'bold', color: '#1e90ff', textAlign: 'center' }}>
              Transfer Money
            </Typography>
            <form onSubmit={handleTransfer}>
              <TextField
                label="Sender Account Number"
                name="senderAccountNumber"
                variant="outlined"
                fullWidth
                value={formData.senderAccountNumber}
                onChange={handleInputChange}
                style={{ marginBottom: '20px' }}
              />
              <TextField
                label="Receiver Account Number"
                name="receiverAccountNumber"
                variant="outlined"
                fullWidth
                value={formData.receiverAccountNumber}
                onChange={handleInputChange}
                style={{ marginBottom: '20px' }}
              />
              <TextField
                label="IFSC Code"
                name="ifscCode"
                variant="outlined"
                fullWidth
                value={formData.ifscCode}
                onChange={handleInputChange}
                style={{ marginBottom: '20px' }}
              />
              <TextField
                label="Amount"
                name="amount"
                variant="outlined"
                fullWidth
                type="number"
                value={formData.amount}
                onChange={handleInputChange}
                style={{ marginBottom: '20px' }}
              />
              <Button variant="contained" color="primary" type="submit">
                Send
              </Button>
            </form>
          </FormSection>
        </>
      )}
    </>
  );
};

export default CustomerDashboard;
