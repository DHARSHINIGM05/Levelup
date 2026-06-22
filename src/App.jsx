import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import LoginPage from './components/LoginPage';
import Layout from './components/Layout';
import Home from './pages/Home';
import Listening from './pages/Listening';
import ListeningActivity from './pages/ListeningActivity';
import Speaking from './pages/Speaking';
import SpeakingActivity from './pages/SpeakingActivity';
import Reading from './pages/Reading';
import ReadingActivity from './pages/ReadingActivity';
import Writing from './pages/Writing';
import WritingActivity from './pages/WritingActivity';
import Analytics from './pages/Analytics';
import diagram from './components/diagram';


function ProtectedLayout() {
  const { isLoggedIn } = useApp();
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return <Layout />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/home" element={<ProtectedLayout />}>
        <Route index element={<Home />} />
      </Route>
      <Route path="/listening" element={<ProtectedLayout />}>
        <Route index element={<Listening />} />
        <Route path="play" element={<ListeningActivity />} />
      </Route>
      <Route path="/speaking" element={<ProtectedLayout />}>
        <Route index element={<Speaking />} />
        <Route path="play" element={<SpeakingActivity />} />
      </Route>
      <Route path="/reading" element={<ProtectedLayout />}>
        <Route index element={<Reading />} />
        <Route path="play" element={<ReadingActivity />} />
      </Route>
      <Route path="/writing" element={<ProtectedLayout />}>
        <Route index element={<Writing />} />
        <Route path="play" element={<WritingActivity />} />
      </Route>
      <Route path="/analytics" element={<ProtectedLayout />}>
        <Route index element={<Analytics />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
