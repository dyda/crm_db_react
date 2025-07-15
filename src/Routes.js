import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/service/ProtectedRoute';

// Lazy load components
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const Login = lazy(() => import('./pages/Authentication/Login'));
const NotFound = lazy(() => import('./pages/NotFound/NotFound'));

// User management
const UserManagment = lazy(() => import('./pages/User/UserManagment'));
const SalaryManagment = lazy(() => import('./pages/Salary/SalaryManagment'));

// Expenses managment
const ExpensesManagment = lazy(() => import('./pages/Expenses/ExpensesManagment'));
const ExpensesCategoryManagment = lazy(() => import('./pages/Expenses/ExpensesCategoryManagment'));

// Customer management
const CustomerList = lazy(() => import('./pages/Customer/Customer_list'));
const CustomerRegister = lazy(() => import('./pages/Customer/Customer_register'));
const CustomerCategoryList = lazy(() => import('./pages/Customer/Category/CustomerCategory_list'));

// Warehouse management
const WarehouseManagement = lazy(() => import('./pages/Warehouse/WarehouseManagment'));

 // Currency management
const CurrencyManagment = lazy(() => import('./pages/Currency/CurrencyManagment'));

// Currency rate management
const CurrencyRateManagment = lazy(() => import('./pages/CurrencyRate/CurrencyRateManagment'));

// Company management
const CompanyManagment = lazy(() => import('./pages/Company/CompanyManagment'));

// City managment
const CityManagment = lazy(() => import('./pages/City/CityManagment'));
const ZoneManagment = lazy(() => import('./pages/Zone/ZoneManagment'));
const RegionManagment = lazy(() => import('./pages/Region/RegionManagment'));
const BranchManagment = lazy(() => import('./pages/Branch/BranchRegister'));
const BranchList = lazy(() => import('./pages/Branch/BranchList'));



// item management

const ItemManagment = lazy(() => import('./pages/Item/ItemManagment'));
const ItemCategoryManagment = lazy(() => import('./pages/Item/ItemCategoryManagment'));
const ItemBrandManagment = lazy(() => import('./pages/Item/ItemBrandManagment'));
const ItemUnitManagment = lazy(() => import('./pages/Item/ItemUnitManagment'));
const ItemTypePriceManagment = lazy(() => import('./pages/Item/ItemTypePriceManagment'));
const ItemTransaction = lazy(() => import('./pages/Item/ItemTransactionManagment'));
const ItemDamage = lazy(() => import('./pages/Item/ItemDamageManagment'));


const RoutesComponent = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        {/* Public route */}
        <Route path="/" element={<Login />} />

        {/* Protected routes */}
        <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />

        {/* Company management */}
        <Route path="/company" element={<ProtectedRoute element={<CompanyManagment />} />} />
        <Route path="/city" element={<ProtectedRoute element={<CityManagment />} />} />
        <Route path="/zone" element={<ProtectedRoute element={<ZoneManagment />} />} />
        <Route path="/region" element={<ProtectedRoute element={<RegionManagment />} />} />
        <Route path="/branch/register" element={<ProtectedRoute element={<BranchManagment />} />} />
        <Route path="/branch/edit/:id" element={<ProtectedRoute element={<BranchManagment />} />} />

        <Route path="/branch" element={<ProtectedRoute element={<BranchList />} />} />

        {/* Warehouse management */}
        <Route path="/warehouse" element={<ProtectedRoute element={<WarehouseManagement />} />} />
        {/* Currency management */}
        <Route path="/currency" element={<ProtectedRoute element={<CurrencyManagment />} />} />
        <Route path="/currency-rate" element={<ProtectedRoute element={<CurrencyRateManagment />} />} />

        {/* Customer category */}
        <Route path="/customer_category" element={<ProtectedRoute element={<CustomerCategoryList />} />} />

        {/* Customer management */}
        <Route path="/customer" element={<ProtectedRoute element={<CustomerList />} />} />
        <Route path="/customer/register" element={<ProtectedRoute element={<CustomerRegister />} />} />
        <Route path="/customer/edit/:id" element={<ProtectedRoute element={<CustomerRegister />} />} />
        <Route path="/customer/payment/register" element={<ProtectedRoute element={<CustomerRegister />} />} />
        <Route path="/customer/payment/edit/:id" element={<ProtectedRoute element={<CustomerRegister />} />} />

        {/* Employee management */}
        <Route path="/user" element={<ProtectedRoute element={<UserManagment />} />} />
        {/* Salary management */}
        <Route path="/salary" element={<ProtectedRoute element={<SalaryManagment />} />} />

    {/* Expenses managment */}

        <Route path="/expenses" element={<ProtectedRoute element={<ExpensesManagment />} />} />
        <Route path="/expenses/category" element={<ProtectedRoute element={<ExpensesCategoryManagment />} />} />

        {/* Item management */}
        <Route path="/item" element={<ProtectedRoute element={<ItemManagment />} />} />
        <Route path="/item/category" element={<ProtectedRoute element={<ItemCategoryManagment />} />} />
        <Route path="/item/brand" element={<ProtectedRoute element={<ItemBrandManagment />} />} />
        <Route path="/item/unit" element={<ProtectedRoute element={<ItemUnitManagment />} />} />
        <Route path="/item/price/type" element={<ProtectedRoute element={<ItemTypePriceManagment />} />} />
        <Route path="/item/transaction" element={<ProtectedRoute element={<ItemTransaction />} />} />
        <Route path="/item/damage" element={<ProtectedRoute element={<ItemDamage />} />} />

        {/* 404 Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default RoutesComponent;
