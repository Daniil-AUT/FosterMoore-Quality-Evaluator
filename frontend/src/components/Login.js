import React, { useState, useEffect } from 'react'; // Import useEffect here
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Form, Input, Button, Alert, Typography, Checkbox } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import styles from './Login.module.css';

const { Title } = Typography;

const Login = () => {
  const [email, setEmail] = useState('');
  const [apiToken, setApiToken] = useState('');
  const [domain, setDomain] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Moved the domain validation logic inside the component
  const isDomainValid = (domain) => /^https:\/\/[a-zA-Z0-9-]+\.atlassian\.net[\/\\]?$/.test(domain);

  const handleSubmit = async (values) => {
    const { email, apiToken, domain } = values;

    setIsLoading(true);
    setError('');
    setSuccess('');

    if (!isDomainValid(domain)) {
      setError('Invalid domain format. Use https://your-domain.atlassian.net');
      setIsLoading(false);
      return;
    }

    try {
      const verifyResponse = await axios.post('http://localhost:5000/verify-credentials', {
        email,
        apiToken,
        jiraDomain: domain,
      });

      if (verifyResponse.data.success) {
        setSuccess('Credentials verified successfully. Fetching user stories...');
        if (rememberMe) {
          localStorage.setItem('email', email);
          localStorage.setItem('apiToken', apiToken);
          localStorage.setItem('domain', domain);
        } else {
          localStorage.removeItem('email');
          localStorage.removeItem('apiToken');
          localStorage.removeItem('domain');
        }
        navigate('/dashboard', { state: { email, apiToken, domain } });
      } else {
        setError(verifyResponse.data.error || 'Invalid credentials, please try again.');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'An error occurred. Please try again.';
      console.error('API error:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const storedEmail = localStorage.getItem('email');
    const storedApiToken = localStorage.getItem('apiToken');
    const storedDomain = localStorage.getItem('domain');
    if (storedEmail && storedApiToken && storedDomain) {
      setEmail(storedEmail);
      setApiToken(storedApiToken);
      setDomain(storedDomain);
      setRememberMe(true);
    }
  }, []);

  return (
    <div className={styles.login}>
      <div className={styles.formWrapper}>
        <Title level={2}>Login to Jira</Title>
        {error && (
          <Alert message={error} type="error" showIcon style={{ marginBottom: '16px' }} />
        )}
        {success && (
          <Alert message={success} type="success" showIcon style={{ marginBottom: '16px' }} />
        )}
        <Form
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ email, apiToken, domain }}
          style={{ maxWidth: '500px', width: '100%' }}
        >
          <Form.Item
            label="Domain"
            name="domain"
            rules={[
              {
                required: true,
                message: 'Please input your domain!',
              },
              {
                validator: (_, value) =>
                  isDomainValid(value) ? Promise.resolve() : Promise.reject(new Error('Invalid domain format. Use https://your-domain.atlassian.net')),
              },
            ]}
          >
            <Input
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="https://your-domain.atlassian.net"
            />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: 'Please input your email!' }]}
          >
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your-email@example.com"
              prefix={<UserOutlined />}
            />
          </Form.Item>
          <Form.Item
            label="API Token"
            name="apiToken"
            rules={[{ required: true, message: 'Please input your API token!' }]}
          >
            <Input.Password
              value={apiToken}
              onChange={(e) => setApiToken(e.target.value)}
              placeholder="Enter your API token"
              prefix={<LockOutlined />}
            />
          </Form.Item>
          <Form.Item>
            <Checkbox 
              checked={rememberMe} 
              onChange={(e) => setRememberMe(e.target.checked)}
            >
              Remember me
            </Checkbox>
          </Form.Item>
          <Form.Item>
            <div className={styles.buttonContainer}>
            <Button type="default" className={styles.goBackButton} onClick={() => navigate('/')}>
                Go Back
              </Button>
              <Button type="primary" htmlType="submit" loading={isLoading} className={styles.loginButton}>
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Login;
