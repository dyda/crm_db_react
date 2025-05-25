import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/service/ProtectedRoute';

// Lazy load components
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const Login = lazy(() => import('./pages/Authentication/Login'));
const NotFound = lazy(() => import('./pages/NotFound/NotFound'));

// Employee management
const EmployeeList = lazy(() => import('./pages/Employee/Employee_list'));
const EmployeeRegister = lazy(() => import('./pages/Employee/Employee_register'));

// Customer management
const CustomerList = lazy(() => import('./pages/Customer/Customer_list'));
const CustomerRegister = lazy(() => import('./pages/Customer/Customer_register'));
const CustomerCategoryList = lazy(() => import('./pages/Customer/Category/CustomerCategory_list'));

// Warehouse management
const WarehouseManagement = lazy(() => import('./pages/Warehouse/WarehouseManagment'));

// Box money management
const BoxMoneyList = lazy(() => import('./pages/BoxMoney/BoxMoney_list'));
const BoxMoneyRegister = lazy(() => import('./pages/BoxMoney/BoxMoney_register'));

// Company management
const CompanyRegister = lazy(() => import('./pages/Company/Company_register'));

// City managment
const CityManagment = lazy(() => import('./pages/City/CityManagment'));
const ZoneManagment = lazy(() => import('./pages/Zone/ZoneManagment'));
const RegionManagment = lazy(() => import('./pages/Region/RegionManagment'));
const BranchManagment = lazy(() => import('./pages/Branch/BranchRegister'));
const BranchList = lazy(() => import('./pages/Branch/BranchList'));


const RoutesComponent = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        {/* Public route */}
        <Route path="/" element={<Login />} />

        {/* Protected routes */}
        <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />

        {/* Company management */}
        <Route path="/company" element={<ProtectedRoute element={<CompanyRegister />} />} />
        <Route path="/city" element={<ProtectedRoute element={<CityManagment />} />} />
        <Route path="/zone" element={<ProtectedRoute element={<ZoneManagment />} />} />
        <Route path="/region" element={<ProtectedRoute element={<RegionManagment />} />} />
        <Route path="/branch/register" element={<ProtectedRoute element={<BranchManagment />} />} />
        <Route path="/branch/edit/:id" element={<ProtectedRoute element={<BranchManagment />} />} />

        <Route path="/branch" element={<ProtectedRoute element={<BranchList />} />} />

        {/* Warehouse management */}
        <Route path="/warehouse" element={<ProtectedRoute element={<WarehouseManagement />} />} />
    
        {/* Box money management */}
        <Route path="/box_money" element={<ProtectedRoute element={<BoxMoneyList />} />} />
        <Route path="/box_money/register" element={<ProtectedRoute element={<BoxMoneyRegister />} />} />
        <Route path="/box_money/edit/:id" element={<ProtectedRoute element={<BoxMoneyRegister />} />} />

        {/* Customer category */}
        <Route path="/customer_category" element={<ProtectedRoute element={<CustomerCategoryList />} />} />

        {/* Customer management */}
        <Route path="/customer" element={<ProtectedRoute element={<CustomerList />} />} />
        <Route path="/customer/register" element={<ProtectedRoute element={<CustomerRegister />} />} />
        <Route path="/customer/edit/:id" element={<ProtectedRoute element={<CustomerRegister />} />} />
        <Route path="/customer/payment/register" element={<ProtectedRoute element={<CustomerRegister />} />} />
        <Route path="/customer/payment/edit/:id" element={<ProtectedRoute element={<CustomerRegister />} />} />

        {/* Employee management */}
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
