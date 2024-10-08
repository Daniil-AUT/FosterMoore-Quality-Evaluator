import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Button,
  Card,
  Checkbox,
  Spin,
  Divider,
  Slider,
  Input,
  message,
  Collapse,
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useSpring, animated } from 'react-spring';
import styles from './Dashboard.module.css';

const { Meta } = Card;
const { Panel } = Collapse;

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [userStories, setUserStories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStories, setSelectedStories] = useState({});
  const [criteria, setCriteria] = useState({
    ambiguity: true,
    'well-formed': true,
  });
  const [storiesPerRow, setStoriesPerRow] = useState(3);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [activeButton, setActiveButton] = useState(null);
  const isEvaluateDisabled = Object.values(selectedStories).filter(Boolean).length === 0 || !Object.values(criteria).some(Boolean);

  const filterAnimation = useSpring({
    maxHeight: filtersVisible ? '500px' : '0px',
    opacity: filtersVisible ? 1 : 0,
    config: { tension: 200, friction: 20 },
  });

  // Fetch user stories from API
  useEffect(() => {
    const fetchUserStories = async () => {
      const { email, apiToken, domain } = location.state || {};
      if (!email || !apiToken || !domain) {
        navigate('/');
        return;
      }

      try {
        setIsLoading(true);
        const response = await axios.get('http://localhost:5000/api/user-stories', {
          params: { jira_url: domain, jira_project_key: 'SCRUM', username: email, api_token: apiToken },
          timeout: 30000,
        });
        setUserStories(response.data);
      } catch (err) {
        console.error('Error fetching user stories:', err);
        message.error('Failed to fetch user stories. Please check your credentials and try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserStories();
  }, [location.state, navigate]);

  // Toggle selection for a criterion
  const handleCriteriaChange = (criterionName) => {
    setCriteria((prev) => ({ ...prev, [criterionName]: !prev[criterionName] }));
  };

  // Handle selection of user stories
  const handleSelectAll = () => {
    const newSelection = userStories.reduce((acc, story) => {
      acc[story.key] = true;
      return acc;
    }, {});
    setSelectedStories(newSelection);
    setActiveButton('select');
  };

  const handleUnselectAll = () => {
    setSelectedStories({});
    setActiveButton('deselect');
  };

  const handleEvaluate = () => {
    const storiesToEvaluate = userStories.filter((story) => selectedStories[story.key]);
    navigate('/evaluation', { state: { selectedStories: storiesToEvaluate, criteria } });
  };

  const handleStoryClick = (key) => {
    setSelectedStories((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSliderChange = (value) => {
    setStoriesPerRow(value);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredUserStories = userStories.filter(story =>
    story.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (typeof story.description === 'string' && story.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const renderButtons = () => (
    <div>
      <Button
        onClick={handleSelectAll}
        style={getButtonStyle(activeButton === 'select')}
      >
        Select All
      </Button>
      <Button
        onClick={handleUnselectAll}
        style={getButtonStyle(activeButton === 'deselect')}
      >
        Deselect All
      </Button>
      <Button
          onClick={handleEvaluate}
          style={getEvaluateButtonStyle()}
          disabled={isEvaluateDisabled}
          onMouseEnter={handleButtonHover}
          onMouseLeave={handleButtonLeave}
      >
          Evaluate Selected Stories
      </Button>
    </div>
  );

  const getButtonStyle = (isActive) => ({
    margin: '0 8px',
    backgroundColor: isActive ? '#1890ff' : '#f5f5f5',
    color: isActive ? '#fff' : '#595959',
    border: '1px solid #d9d9d9',
    transition: 'background-color 0.3s, border-color 0.3s',
  });

  const getEvaluateButtonStyle = () => ({
    margin: '0 8px',
    backgroundColor: (Object.values(selectedStories).filter(Boolean).length === 0 || !Object.values(criteria).some(Boolean)) ? '#d9d9d9' : '#52c41a',
    color: (Object.values(selectedStories).filter(Boolean).length === 0 || !Object.values(criteria).some(Boolean)) ? '#7a7a7a' : '#fff',
    border: 'none',
    transition: 'background-color 0.3s',
    cursor: (Object.values(selectedStories).filter(Boolean).length === 0 || !Object.values(criteria).some(Boolean)) ? 'not-allowed' : 'pointer',
  });

  const handleButtonHover = (e) => {
    if (Object.values(selectedStories).filter(Boolean).length > 0 && Object.values(criteria).some(Boolean)) {
      e.currentTarget.style.backgroundColor = '#73d13d';
    }
  };

  const handleButtonLeave = (e) => {
    if (Object.values(selectedStories).filter(Boolean).length > 0 && Object.values(criteria).some(Boolean)) {
      e.currentTarget.style.backgroundColor = '#52c41a';
    }
  };

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <h1 className={styles.pageTitle}>User Story Evaluation</h1>
        {renderButtons()}
      </header>

      <div>
        <Collapse activeKey={filtersVisible ? ['1'] : []} onChange={(key) => setFiltersVisible(key.length > 0)}>
          <Panel header="Filter Stories" key="1">
            <Card style={filterCardStyle}>
              <Input
                placeholder="Search user stories..."
                prefix={<SearchOutlined />}
                value={searchTerm}
                onChange={handleSearchChange}
                style={inputStyle}
                aria-label="Search user stories input"
              />
              <CheckboxGroup criteria={criteria} handleCriteriaChange={handleCriteriaChange} />
              <Slider
                min={1}
                max={6}
                value={storiesPerRow}
                onChange={handleSliderChange}
                marks={{ 1: '1', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6' }}
                style={{ marginTop: '16px' }}
                aria-label="Number of stories per row"
              />
            </Card>
          </Panel>
        </Collapse>
        <Divider />
      </div>

      <div className={styles.storiesContainer}>
        {isLoading ? (
          <Spin size="large" tip="Loading user stories..." />
        ) : filteredUserStories.length > 0 ? (
          <div
            className={styles.userStoriesGrid}
            style={{
              gridTemplateColumns: `repeat(${storiesPerRow}, 1fr)`,
            }}
          >
            {filteredUserStories.map((story) => (
              <Card
                key={story.key}
                hoverable
                className={`${styles.storyCard} ${selectedStories[story.key] ? styles.selectedCard : ''}`}
                onClick={() => handleStoryClick(story.key)}
              >
                <Meta
                  title={`User Story ID: ${story.key}`}
                  description={<div className={styles.storyDescription}><p>{story.summary}</p></div>}
                />
                <p className={styles.storyStatus}>Status: {story.status}</p>
              </Card>
            ))}
          </div>
        ) : (
          <p className={styles.messageText}>No user stories available.</p>
        )}
      </div>
    </div>
  );
};

// Styles for the filter card
const filterCardStyle = {
  marginBottom: '24px',
  padding: '16px',
  borderRadius: '8px',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
};

// Styles for the input field
const inputStyle = {
  marginBottom: '16px',
};

// Checkbox group component
const CheckboxGroup = ({ criteria, handleCriteriaChange }) => {
  return (
    <div>
      {Object.entries(criteria).map(([criterion, checked]) => (
        <Checkbox
          key={criterion}
          checked={checked}
          onChange={() => handleCriteriaChange(criterion)}
        >
          {criterion}
        </Checkbox>
      ))}
    </div>
  );
};

export default Dashboard;
