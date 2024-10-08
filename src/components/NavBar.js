import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Typography } from 'antd';
import { HomeOutlined, LoginOutlined, DashboardOutlined, SunOutlined, MoonOutlined } from '@ant-design/icons';
import NavbarCSS from './NavBar.module.css';
import { useUser } from './UserContext'; // Import the custom hook

const { Title } = Typography;

const NavBar = () => {
  const [darkTheme, setDarkTheme] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useUser(); // Use the UserContext

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleBackClick = () => {
    navigate('/dashboard'); // Always navigate to dashboard if authenticated
  };

  const handleLogoutClick = () => {
    logout(); // Use logout from context
    navigate('/login');
  };

  const handleTitleClick = () => {
    navigate('/');
  };

  const toggleTheme = () => {
    setDarkTheme((prev) => !prev);
  };

  return (
    <nav className={`${NavbarCSS.navbar} ${darkTheme ? NavbarCSS.dark : NavbarCSS.light}`}>
      <div className={NavbarCSS.titleContainer} onClick={handleTitleClick}>
        <Title className={`${NavbarCSS.title} ${darkTheme ? NavbarCSS.darkText : NavbarCSS.lightText}`} level={3}>
          User Story Quality Evaluator
        </Title>
      </div>

      <div className={NavbarCSS.navbarContent}>
        {/* Theme toggle switch */}
        <div className={NavbarCSS.themeToggle} onClick={toggleTheme} style={{ marginRight: '20px' }}>
          <div className={`${NavbarCSS.switch} ${darkTheme ? NavbarCSS.darkSwitch : NavbarCSS.lightSwitch}`}>
            <div className={NavbarCSS.switchIcon}>
              {darkTheme ? (
                <SunOutlined className={`${NavbarCSS.icon} ${NavbarCSS.sunIcon}`} />
              ) : (
                <MoonOutlined className={`${NavbarCSS.icon} ${NavbarCSS.moonIcon}`} />
              )}
            </div>
          </div>
        </div>

        {location.pathname === '/evaluation' ? (
          // Only show Back to Dashboard button on evaluation page
          <Button
            type="default"
            className={`${NavbarCSS.backButton} ${darkTheme ? NavbarCSS.darkButton : NavbarCSS.lightButton}`}
            onClick={handleBackClick}
            icon={<DashboardOutlined />}
            style={{ marginRight: '20px' }}
          >
            Back to Dashboard
          </Button>
        ) : location.pathname === '/login' ? (
          // Show Go Back Home button when on login page
          <Button
            type="default"
            icon={<HomeOutlined />}
            onClick={handleTitleClick}
            className={`${NavbarCSS.iconButton} ${darkTheme ? NavbarCSS.darkButton : NavbarCSS.lightButton}`}
            style={{ marginRight: '20px' }}
          >
            Go Back Home
          </Button>
        ) : location.pathname === '/dashboard' ? (
          // Show Logout button only on dashboard
          <Button
            type="primary"
            danger
            className={`${NavbarCSS.logoutButton} ${darkTheme ? NavbarCSS.darkButton : NavbarCSS.lightButton}`}
            onClick={handleLogoutClick}
            style={{ marginRight: '20px' }}
          >
            Logout
          </Button>
        ) : (
          // Render Login button unless on login or dashboard page
          <Button
            type="primary"
            icon={<LoginOutlined />}
            className={`${NavbarCSS.loginButton} ${darkTheme ? NavbarCSS.darkButton : NavbarCSS.lightButton}`}
            onClick={handleLoginClick}
          >
            Login
          </Button>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
