import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignUp from './components/signUp';
import SignIn from './components/signIn';
import AdminLogin from './components/adminLogin';
import AdminDashboard from './components/adminDashboard';
import AccountOpening from './components/accountOpening';
import LoanRequest from './components/loanRequest';
// import InterestRateManagement from './components/interestRateManagement';
import Layout from './components/layout'; // Import Admin Layout component
import CustomerLayout from './components/customerLayout'; // Import Customer Layout component
import CustomerDashboard from './components/customerDashboard'; // Import Customer Dashboard component
import ManageAccounts from './components/manageAccounts';
import LoanApply from './components/loanApply';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/signUp" element={<SignUp />} />
        <Route path="/adminLogin" element={<AdminLogin />} />

        {/* Protected routes under Admin Layout */}
        <Route element={<Layout />}>
          <Route path="/adminDashboard" element={<AdminDashboard />} /> 
          <Route path="/accountOpening" element={<AccountOpening />} /> 
          <Route path="/loanRequest" element={<LoanRequest />} /> 
          
          {/* <Route path="loanRequest" element={<LoanRequest />} />
          <Route path="interestRateManagement" element={<InterestRateManagement />} /> */}
        </Route>

        {/* Protected routes under Customer Layout */}
        <Route element={<CustomerLayout />}>
          <Route path="/customerDashboard" element={<CustomerDashboard />} />
          <Route path="/manageAccounts" element={<ManageAccounts />} /> 
          <Route path="/loanApply" element={<LoanApply />} /> 
          {/* Add more customer routes here as needed */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
