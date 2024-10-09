import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { UserProvider } from './UserContext'; // Import UserProvider
import NavBar from './NavBar';
import Login from './Login';
import Dashboard from './Dashboard';
import Predictor from './Predictor';
import EvaluationPage from './EvaluationPage';

// Error boundary component 
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Error captured in ErrorBoundary", error, info);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}

const App = () => {
  return (
    <UserProvider>
      <ErrorBoundary>
        <NavBar />
        <Routes>
          <Route path="/" element={<Predictor />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/evaluation" element={<EvaluationPage />} />
        </Routes>
      </ErrorBoundary>
    </UserProvider>
  );
};

export default App;
