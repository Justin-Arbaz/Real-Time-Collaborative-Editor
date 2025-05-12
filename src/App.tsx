import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import EditorPage from './pages/EditorPage';
import HomePage from './pages/HomePage';
import SettingsPage from './pages/SettingsPage';
import BasicRealtimeEditor from './pages/BasicRealtimeEditor';
import Layout from './components/Layout/Layout';

const App: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/" />} />
        <Route path="/" element={
          <Layout>
            <HomePage />
          </Layout>
        } />
        <Route path="/settings" element={
          <Layout>
            <SettingsPage />
          </Layout>
        } />
        <Route path="/document/:documentId" element={
          isAuthenticated ? (
            <Layout>
              <EditorPage />
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        } />
        <Route path="/demo" element={
          <Layout>
            <EditorPage />
          </Layout>
        } />
        <Route path="/basic-realtime" element={
          <Layout>
            <BasicRealtimeEditor />
          </Layout>
        } />
      </Routes>
    </Router>
  );
};

export default App;