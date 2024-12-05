import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/service/ProtectedRoute'; // Import the ProtectedRoute component
import EmployeeList from './pages/Employee/Employee_list';
import EmployeeRegister from './pages/Employee/Employee_register';
import CustomerLoan from './pages/Customer/Customer_loan';

// Lazy load components
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const CustomerRegister = lazy(() => import('./pages/Customer/Customer_register'));
const CustomerList = lazy(() => import('./pages/Customer/Customer_list'));
const CompanyRegister = lazy(() => import('./pages/Company/Company_register'));
const WarehouseList = lazy(() => import('./pages/Warehouse/Warehouse_list'));
const WarehouseRegister = lazy(() => import('./pages/Warehouse/Warehouse_register'));
const BoxMoneyList = lazy(() => import('./pages/BoxMoney/BoxMoney_list'));
const BoxMoneyRegister = lazy(() => import('./pages/BoxMoney/BoxMoney_register'));

const CustomerCategoryList = lazy(() => import('./pages/Customer/Category/CustomerCategory_list'));

const Login = lazy(() => import('./pages/Authentication/Login'));
const NotFound = lazy(() => import('./pages/NotFound/NotFound'));

const RoutesComponent = () => {
  return (
    <Suspense fallback={
      <div>Loading...</div>
    }>
      <Routes>
        {/* Public route */}
        <Route path="/" element={<Login />} />
        
        {/* Protected routes */}
        <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />

      

        <Route path="/company" element={<ProtectedRoute element={<CompanyRegister />} />} />

        <Route path="/warehouse" element={<ProtectedRoute element={<WarehouseList />} />} />
        <Route path="/warehouse/register" element={<ProtectedRoute element={<WarehouseRegister />} />} />
        <Route path="/warehouse/edit/:id" element={<ProtectedRoute element={<WarehouseRegister />} />} />

          {/* box money  */}
        <Route path="/box_money" element={<ProtectedRoute element={<BoxMoneyList />} />} />
        <Route path="/box_money/register" element={<ProtectedRoute element={<BoxMoneyRegister />} />} />
        <Route path="/box_money/edit/:id" element={<ProtectedRoute element={<BoxMoneyRegister />} />} />

          {/* Customer Category  */}
          <Route path="/customer_category" element={<ProtectedRoute element={<CustomerCategoryList />} />} />

          {/* Customer  */}
          <Route path="/customer" element={<ProtectedRoute element={<CustomerList />} />} />
          <Route path="/customer/register" element={<ProtectedRoute element={<CustomerRegister />} />} />
          <Route path="/customer/edit/:id" element={<ProtectedRoute element={<CustomerRegister />} />} />

          <Route path="/customer/loan" element={<ProtectedRoute element={<CustomerLoan />} />} />  
          <Route path="/customer/payment/register" element={<ProtectedRoute element={<CustomerRegister />} />} />
          <Route path="/customer/payment/edit/:id" element={<ProtectedRoute element={<CustomerRegister />} />} />


          {/* Managment */}

          <Route path="/employee" element={<ProtectedRoute element={<EmployeeList />} />} />
          <Route path="/employee/register" element={<ProtectedRoute element={<EmployeeRegister />} />} />
          <Route path="/employee/edit/:id" element={<ProtectedRoute element={<EmployeeRegister />} />} />





        {/* 404 Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default RoutesComponent;
