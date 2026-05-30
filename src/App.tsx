import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { Members } from './pages/Members';
import { Trainers } from './pages/Trainers';
import { Plans } from './pages/Plans';
import { Payments } from './pages/Payments';
import { Attendance } from './pages/Attendance';
import { Settings } from './pages/Settings';
import { Inventory } from './pages/Inventory';
import { Announcements } from './pages/Announcements';
import { MemberDetails } from './pages/MemberDetails';
import { Shop } from './pages/Shop';
import { AiZone } from './pages/AiZone';
import { ReportsCrm } from './pages/ReportsCrm';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" theme="dark" richColors />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/members" element={
            <ProtectedRoute allowedRoles={['admin', 'trainer']}>
              <Layout>
                <Members />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/members/:id" element={
            <ProtectedRoute allowedRoles={['admin', 'trainer']}>
              <Layout>
                <MemberDetails />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/trainers" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout>
                <Trainers />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/plans" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout>
                <Plans />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/payments" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout>
                <Payments />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/attendance" element={
            <ProtectedRoute allowedRoles={['admin', 'trainer']}>
              <Layout>
                <Attendance />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/inventory" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout>
                <Inventory />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/announcements" element={
            <ProtectedRoute allowedRoles={['admin', 'trainer', 'member']}>
              <Layout>
                <Announcements />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/shop" element={
            <ProtectedRoute allowedRoles={['admin', 'trainer', 'member']}>
              <Layout>
                <Shop />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/ai-zone" element={
            <ProtectedRoute allowedRoles={['admin', 'trainer', 'member']}>
              <Layout>
                <AiZone />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/reports-crm" element={
            <ProtectedRoute allowedRoles={['admin', 'trainer']}>
              <Layout>
                <ReportsCrm />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/settings" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout>
                <Settings />
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
