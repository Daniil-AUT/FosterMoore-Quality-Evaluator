import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { UserProvider } from './UserContext'; // Import UserProvider
import NavBar from './NavBar';
import Login from './Login';
import Dashboard from './Dashboard';
import Predictor from './Predictor';
import EvaluationPage from './EvaluationPage';

const App = () => {
  return (
    <UserProvider>
      <NavBar />
      <Routes>
        <Route path="/" element={<Predictor />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/evaluation" element={<EvaluationPage />} />
      </Routes>
    </UserProvider>
  );
};

export default App;
