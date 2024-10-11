import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Form, Input, Button, Alert, Typography, Checkbox } from 'antd';
import { LockOutlined, UserOutlined, ProjectOutlined, GlobalOutlined } from '@ant-design/icons';
import styles from './Login.module.css';

const { Title } = Typography;

const Login = () => {
  const [form] = Form.useForm();
  const [email, setEmail] = useState('');
  const [apiToken, setApiToken] = useState('');
  const [domain, setDomain] = useState('');
  const [board, setBoard] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const isDomainValid = (domain) => /^https:\/\/[a-zA-Z0-9-]+\.atlassian\.net[\/\\]?$/.test(domain);

  const handleSubmit = async (values) => {
    const { email, apiToken, domain, board } = values;

    setIsLoading(true);
    setError('');
    setSuccess('');

    if (!isDomainValid(domain)) {
      setError('Invalid domain format. Use https://your-domain.atlassian.net');
      setIsLoading(false);
      return;
    }

    try {
      const verifyResponse = await axios.post('https://fostermoore-quality-evaluator.onrender.com/verify-credentials', {
        email,
        apiToken,
        jiraDomain: domain,
        board,
      });

      if (verifyResponse.data.success) {
        setSuccess(verifyResponse.data.message || 'Credentials verified successfully. Fetching user stories...');
        if (rememberMe) {
          localStorage.setItem('email', email);
          localStorage.setItem('apiToken', apiToken);
          localStorage.setItem('domain', domain);
          localStorage.setItem('board', board);
        } else {
          localStorage.removeItem('email');
          localStorage.removeItem('apiToken');
          localStorage.removeItem('domain');
          localStorage.removeItem('board');
        }
        navigate('/dashboard', { state: { email, apiToken, domain, board } });
      } else {
        setError(verifyResponse.data.error || 'Verification failed. Please check your credentials and try again.');
      }
    } catch (err) {
      let errorMessage = 'An error occurred. Please try again.';
      if (err.response) {
        switch (err.response.status) {
          case 400:
            errorMessage = 'Missing required credentials or board information.';
            break;
          case 401:
            errorMessage = 'Invalid user credentials. Please check your email and API token.';
            break;
          case 404:
            errorMessage = `Board '${board}' not found. Please check the board name and try again.`;
            break;
          case 500:
            errorMessage = 'Server error. Please try again later.';
            break;
          default:
            errorMessage = err.response.data?.error || errorMessage;
        }
      }
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
    const storedBoard = localStorage.getItem('board');
    if (storedEmail && storedApiToken && storedDomain && storedBoard) {
      form.setFieldsValue({
        email: storedEmail,
        apiToken: storedApiToken,
        domain: storedDomain,
        board: storedBoard,
      });
      setRememberMe(true);
    }
  }, [form]);

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
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ maxWidth: '500px', width: '100%' }}
        >
          <Form.Item
            name="domain"
            label="Jira Domain"
            rules={[
              { required: true, message: 'Please enter your Jira domain!' },
              { 
                validator: (_, value) =>
                  isDomainValid(value) 
                    ? Promise.resolve()
                    : Promise.reject(new Error('Invalid domain format. Use https://your-domain.atlassian.net'))
              }
            ]}
          >
            <Input 
              prefix={<GlobalOutlined />}
              placeholder="https://your-domain.atlassian.net"
            />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter your email!' },
              { type: 'email', message: 'Please enter a valid email address!' }
            ]}
          >
            <Input 
              prefix={<UserOutlined />}
              placeholder="your-email@example.com"
            />
          </Form.Item>
          <Form.Item
            name="apiToken"
            label="API Token"
            rules={[{ required: true, message: 'Please enter your API token!' }]}
          >
            <Input.Password 
              prefix={<LockOutlined />}
              placeholder="Enter your API token"
            />
          </Form.Item>
          <Form.Item
            name="board"
            label="Board Name"
            rules={[{ required: true, message: 'Please enter your board name!' }]}
          >
            <Input 
              prefix={<ProjectOutlined />}
              placeholder="Enter your board name"
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
              <Button 
                type="default" 
                className={styles.goBackButton} 
                onClick={() => navigate('/')}
              >
                Go Back
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={isLoading} 
                className={styles.loginButton}
              >
                {isLoading ? 'Verifying...' : 'Login'}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Login;