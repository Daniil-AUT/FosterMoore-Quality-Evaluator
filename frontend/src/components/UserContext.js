// UserContext.js
import React, { createContext, useState, useContext } from 'react';

// Create the context
const UserContext = createContext();

// Custom hook to use UserContext
export const useUser = () => {
  return useContext(UserContext);
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null); // This will store user information after login

  const login = (userData) => {
    setUser(userData);
    // Optionally, store the user data in local storage if needed
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    // Clear local storage on logout
    localStorage.removeItem('user');
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};
