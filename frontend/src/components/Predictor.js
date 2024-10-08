import React, { useState } from 'react';
import axios from 'axios';
import { Card, Button, Alert, Form, Input, Tooltip, Typography, Tabs, Spin, Modal } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import styles from './Predictor.module.css';
import { Divider } from 'antd'; 
import { CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons'; 

const { TextArea } = Input;
const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;

const PREDICTION_UNAMBIGUOUS = 1;
const PREDICTION_AMBIGUOUS = 0;
const PREDICTION_WELLFORMED = 1;
const PREDICTION_POORLYFORMED = 0;

const Predictor = () => {
  const [userStory, setUserStory] = useState('');
  const [predictions, setPredictions] = useState({});
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const [hasFetchedSuggestions, setHasFetchedSuggestions] = useState(false); // Flag to track suggestion fetch
  const [selectedCriteria, setSelectedCriteria] = useState({ Unambiguous: false, Wellformed: false, FullSentence: false });
  const [errorMessage, setErrorMessage] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false); // State for Modal visibility
  const [activeTabKey, setActiveTabKey] = useState('results'); // State for active tab

  const handleBoxClick = (key) => {
    setSelectedCriteria((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const fetchSuggestions = async () => {
    if (hasFetchedSuggestions) return; // Prevent fetching if already fetched

    setIsFetchingSuggestions(true);
    try {
      const response = await axios.post('https://fostermoore-quality-evaluator.onrender.com/suggestions', {
        user_story: userStory,
        well_formed_prediction: predictions['well-formed'],
        ambiguity_prediction: predictions['ambiguity'],
      });

      if (response.data.suggestions && Array.isArray(response.data.suggestions)) {
        setSuggestions(response.data.suggestions);
        setHasFetchedSuggestions(true); // Mark suggestions as fetched
      } else {
        setErrorMessage('Received suggestions in an invalid format.');
      }
    } catch (error) {
      setErrorMessage('Failed to fetch suggestions. Please try again.');
    } finally {
      setIsFetchingSuggestions(false);
    }
  };

  const fetchPrediction = async (userStory, selectedKeys) => {
    const endpoints = {
      wellFormed: 'https://fostermoore-quality-evaluator.onrender.com/predict/well-formed',
      ambiguity: 'https://fostermoore-quality-evaluator.onrender.com/predict/ambiguity',
    };

    const predictionResults = {};
    
    if (selectedKeys.includes('Wellformed')) {
      const wellFormedResponse = await axios.post(endpoints.wellFormed, { user_story: userStory });
      predictionResults['well-formed'] = wellFormedResponse.data.well_formed_prediction;
    }
    
    if (selectedKeys.includes('Unambiguous')) {
      const ambiguityResponse = await axios.post(endpoints.ambiguity, { user_story: userStory });
      predictionResults['ambiguity'] = ambiguityResponse.data.ambiguity_prediction;
    }

    return predictionResults;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setErrorMessage('');
    setHasFetchedSuggestions(false); // Reset suggestion fetch flag

    if (!userStory.trim()) {
      setErrorMessage('Please enter a user story before submitting.');
      setLoading(false);
      return;
    }

    const selectedKeys = Object.keys(selectedCriteria).filter((key) => selectedCriteria[key]);

    if (selectedKeys.length === 0) {
      setErrorMessage('Please select at least one criterion.');
      setLoading(false);
      return;
    }

    try {
      const prediction = await fetchPrediction(userStory, selectedKeys);
      setPredictions(prediction);
      setSuggestions(null); // Clear previous suggestions when submitting a new story
    } catch (error) {
      setErrorMessage('Error during prediction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setUserStory('');
    setPredictions({});
    setSuggestions(null);
    setSelectedCriteria({ Unambiguous: false, Wellformed: false, FullSentence: false });
    setErrorMessage('');
    setHasFetchedSuggestions(false); // Reset suggestion fetch flag
  };

  // Function to show the instruction modal
  const showInstructions = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  // New function to handle tab change
  const handleTabChange = (key) => {
    setActiveTabKey(key);
    if (key === 'suggestions' && predictions && Object.keys(predictions).length > 0) {
      fetchSuggestions(); // Fetch suggestions when the Suggestions tab is activated
    }
  };

  return (
    <div className={styles.predictorContainer}>
      <Card className={styles.predictorCard}>
        <Button onClick={showInstructions} className={styles.instructionsButton}>
            Show Instructions
        </Button>

        <Title level={2} className={styles.predictorTitle}>Evaluate Quality</Title>
        
        <Form onFinish={handleSubmit} className={styles.predictorForm}>
          <Form.Item>
            <TextArea
              placeholder="Enter your user story here..."
              value={userStory}
              onChange={(e) => setUserStory(e.target.value)}
              className={styles.userStoryInput}
              rows={4}
              autoSize={{ minRows: 4, maxRows: 6 }}
              style={{ borderRadius: '8px', borderColor: '#e0e0e0' }}
            />
          </Form.Item>
          <div>
            {errorMessage && (
              <Alert message={errorMessage} type="error" showIcon className={styles.errorMessage} />
            )}
          </div>
          <Form.Item>
            <Title level={4}>Select Quality Criteria</Title>
            <div className={styles.criteriaContainer}>
              <div className={styles.clickableSections}>
                {['Unambiguous', 'Wellformed', 'Full Sentence'].map((key) => (
                  <Tooltip key={key} title={`Definition of ${key}`}>
                    <Button
                      onClick={() => handleBoxClick(key)}
                      type={selectedCriteria[key] ? 'primary' : 'default'}
                      className={`${styles.criteriaButton} ${selectedCriteria[key] ? styles.active : ''}`}
                      style={{
                        borderRadius: '8px',
                        margin: '0 10px',
                        width: '100px',
                      }}
                    >
                      {key} <QuestionCircleOutlined />
                    </Button>
                  </Tooltip>
                ))}
              </div>
              <div className={styles.underline} />
            </div>
          </Form.Item>
          <Form.Item>
          <Button 
              onClick={handleReset} 
              className={styles.resetButton} 
              style={{ borderRadius: '8px', width: '150px' }} 
            >
              Reset
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading} 
              className={styles.submitButton} 
              style={{ borderRadius: '8px',backgroundColor: 'green', width: '150px', marginRight: '10px' }} 
            >
              {loading ? 'Analysing...' : 'Analyse User Story'}
            </Button>
          </Form.Item>
        </Form>

        <Tabs defaultActiveKey="results" activeKey={activeTabKey} onChange={handleTabChange} className={styles.tabs}>
          <TabPane tab="Show Results" key="results">
            {Object.keys(predictions).length > 0 ? (
              <div className={styles.resultsContainer}>
                {selectedCriteria['Unambiguous'] && (
                  <Card
                    className={`${styles.resultCard} ${
                      predictions['ambiguity'] === PREDICTION_AMBIGUOUS ? styles.ambiguous : styles.unambiguous
                    }`}
                    style={{
                      borderRadius: '8px',
                      border: predictions['ambiguity'] === PREDICTION_AMBIGUOUS ? '1px solid #ff4d4f' : '1px solid #52c41a',
                      margin: '10px 0',
                    }}
                  >
                    <Title level={4}>
                      Ambiguity: {predictions['ambiguity'] === PREDICTION_AMBIGUOUS ? 'Ambiguous' : 'Unambiguous'}
                    </Title>
                    {predictions['ambiguity'] === PREDICTION_AMBIGUOUS && (
                      <Paragraph className={styles.predictionAdvice}>
                        <ExclamationCircleOutlined style={{ color: '#ff4d4f', marginRight: '5px' }} />
                        This user story is ambiguous. Consider clarifying it.
                      </Paragraph>
                    )}
                    {predictions['ambiguity'] === PREDICTION_UNAMBIGUOUS && (
                      <Paragraph className={styles.predictionAdvice}>
                        <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '5px' }} />
                        This user story is clear and unambiguous.
                      </Paragraph>
                    )}
                  </Card>
                )}
                {selectedCriteria['Wellformed'] && (
                  <Card
                    className={`${styles.resultCard} ${
                      predictions['well-formed'] === PREDICTION_POORLYFORMED ? styles.poorlyformed : styles.wellformed
                    }`}
                    style={{
                      borderRadius: '8px',
                      border: predictions['well-formed'] === PREDICTION_POORLYFORMED ? '1px solid #ff4d4f' : '1px solid #52c41a',
                      margin: '10px 0',
                    }}
                  >
                    <Title level={4}>
                      Well-Formedness: {predictions['well-formed'] === PREDICTION_POORLYFORMED ? 'Poorly Formed' : 'Well Formed'}
                    </Title>
                    {predictions['well-formed'] === PREDICTION_POORLYFORMED && (
                      <Paragraph className={styles.predictionAdvice}>
                        <ExclamationCircleOutlined style={{ color: '#ff4d4f', marginRight: '5px' }} />
                        This user story is poorly formed. Please rephrase.
                      </Paragraph>
                    )}
                    {predictions['well-formed'] === PREDICTION_WELLFORMED && (
                      <Paragraph className={styles.predictionAdvice}>
                        <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '5px' }} />
                        This user story is well formed.
                      </Paragraph>
                    )}
                  </Card>
                )}
              </div>
            ) : (
              <Paragraph className={styles.noResults}>No results available. Submit a user story to see predictions.</Paragraph>
            )}
          </TabPane>

          <TabPane tab="Suggestions" key="suggestions">
  {isFetchingSuggestions ? (
    <Spin size="large" />
  ) : (
    suggestions && suggestions.length > 0 && (
      <div className={styles.suggestionsContainer}>
        {/* Title for Suggestions */}
        <h2 style={{ textAlign: 'left', marginBottom: '20px' }}>Suggestions</h2>

        {suggestions.map((suggestion, index) => {
          // Use regex to split the suggestion text into sections
          const sections = suggestion.split(/(?=Enhancing clarity:|Increasing completeness:|Identifying vague terms or phrases:|Recommending specific language to replace ambiguous terms:|Clarifying the intent and scope of the user story:|Providing concrete examples or contexts:|Ensuring the user story is actionable and specific:)/);

          return (
            <Card key={index} className={styles.suggestionCard}>
              {sections.map((section, idx) => {
                // Get the title and content from the section
                const title = section.split(':')[0].trim();
                const content = section.substring(section.indexOf(':') + 1).trim();

                return (
                  <div key={idx} style={{ textAlign: 'left', marginBottom: '20px' }}>
                    <div style={{ marginBottom: '10px', marginTop: '20px' }}>
                      <strong>{title}</strong>
                    </div>
                    <div>{content}</div>
                  </div>
                );
              })}
            </Card>
          );
        })}
      </div>
    )
  )}
</TabPane>



        </Tabs>
      </Card>

      {/* Modal for instructions */}
      <Modal
        title="Instructions"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Paragraph>
          Enter your user story in the text area and select the quality criteria you'd like to evaluate. 
          Click 'Analyse User Story' to receive predictions and suggestions on how to improve it.
        </Paragraph>
        <Paragraph>
          You can switch between the 'Show Results' and 'Suggestions' tabs to view predictions and improvement suggestions respectively.
        </Paragraph>
      </Modal>
    </div>
  );
};

export default Predictor;
