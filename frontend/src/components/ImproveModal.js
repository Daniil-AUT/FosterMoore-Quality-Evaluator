import React, { useState, useEffect } from 'react';
import { Modal, Input, Button, Typography, Tabs, List, Spin, Alert } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import styles from './ImproveModal.module.css';
import SuggestionsModal from './SuggestionsModal';

const { TextArea } = Input;
const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;

const ImproveModal = ({ isOpen, onClose, story, storyId, onApply, tips }) => {
  const [editedStory, setEditedStory] = useState(story);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const [suggestionsGenerated, setSuggestionsGenerated] = useState(false);
  const [isSuggestionsModalOpen, setIsSuggestionsModalOpen] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isTextAltered, setIsTextAltered] = useState(false);
  const [error, setError] = useState(null);
  const [activeKey, setActiveKey] = useState("1");

  useEffect(() => {
    setEditedStory(story);
    resetState();
    setActiveKey("1");  // Always start at the "General" tab
  }, [story, isOpen]);

  const resetState = () => {
    setIsTextAltered(false);
    setSubmissionResult(null);
    setSuggestions([]);
    setError(null);
    setIsSuggestionsModalOpen(false);
    setSuggestionsGenerated(false);
    setHasSubmitted(false);
  };

  const handleTextChange = (e) => {
    setEditedStory(e.target.value);
    setIsTextAltered(true);
    setSuggestionsGenerated(false);
    setHasSubmitted(false);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const wellFormedResult = await fetch('https://fostermoore-quality-evaluator.onrender.com/predict/well-formed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_story: editedStory }),
      });

      const ambiguityResult = await fetch('https://fostermoore-quality-evaluator.onrender.com/predict/ambiguity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_story: editedStory }),
      });

      if (!wellFormedResult.ok || !ambiguityResult.ok) {
        throw new Error('Failed to fetch prediction results.');
      }

      const wellFormedData = await wellFormedResult.json();
      const ambiguityData = await ambiguityResult.json();

      const result = {
        criteria: [
          {
            name: 'Structure',
            passed: wellFormedData.well_formed_prediction === 1,
            message: wellFormedData.well_formed_prediction === 1 ? 'Well-Formed' : 'Poorly-Formed',
          },
          {
            name: 'Ambiguity',
            passed: ambiguityData.ambiguity_prediction === 1,
            message: ambiguityData.ambiguity_prediction === 1 ? 'Unambiguous' : 'Ambiguous',
          },
        ],
      };

      setSubmissionResult(result);
      setHasSubmitted(true);
      setIsTextAltered(false);
    } catch (err) {
      console.error(err);
      setError('Failed to submit the user story. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateSuggestions = async () => {
    setIsSuggestionsLoading(true);
    setError(null);
  
    try {
      // Fetch suggestions based on the current predictions
      const suggestionsResult = await fetch('https://fostermoore-quality-evaluator.onrender.com/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_story: editedStory,
          well_formed_prediction: submissionResult?.criteria[0].passed ? 1 : 0,
          ambiguity_prediction: submissionResult?.criteria[1].passed ? 1 : 0,
        }),
      });
  
      if (!suggestionsResult.ok) {
        throw new Error('Failed to fetch suggestions.');
      }
  
      const suggestionsData = await suggestionsResult.json();
      
      console.log('Suggestions Data:', suggestionsData);
  
      if (suggestionsData && Array.isArray(suggestionsData.suggestions)) {
        setSuggestions(suggestionsData.suggestions);
        setSuggestionsGenerated(true);
        
        if (suggestionsData.suggestions.length === 0) {
          setError('No improvements needed. Your user story meets all criteria.');
        }
      } else {
        setSuggestions([]);
        setError('No suggestions available from the server.');
      }
    } catch (err) {
      console.error('AI Suggestions Error:', err);
      setError('Failed to get suggestions. Please try again.');
    } finally {
      setIsSuggestionsLoading(false);
    }
};


  const handleApply = () => {
    if (onApply) {
      onApply(storyId, editedStory);
    }
    onClose();
  };

  const handleTabChange = (key) => {
    setActiveKey(key);
    if (key === "3" && !isSuggestionsLoading && !suggestionsGenerated) {
      handleGenerateSuggestions();
    }
  };

  const renderSubmissionResults = () => {
    if (isLoading) {
      return (
        <div className={styles.loadingMessage}>
          <Spin size="large" />
          <Paragraph>Analyzing user story...</Paragraph>
        </div>
      );
    }

    if (error) {
      return <Alert message={error} type="error" showIcon />;
    }

    if (!submissionResult) {
      return <Alert message="No results available. Please submit your story." type="info" showIcon />;
    }

    return (
      <div className={styles.resultContainer}>
        {submissionResult.criteria.map((criterion, index) => (
          <Alert
            key={index}
            message={criterion.name}
            description={criterion.message}
            type={criterion.passed ? "success" : "error"}
            showIcon
            icon={criterion.passed ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
          />
        ))}
      </div>
    );
  };

  const renderAISuggestions = () => {
    if (isSuggestionsLoading) {
      return (
        <div className={styles.aiLoadingMessage}>
          <Spin size="large" />
          <Paragraph>Generating AI suggestions, please wait...</Paragraph>
        </div>
      );
    }

    if (error) {
      return <Alert message={error} type="info" showIcon />;
    }

    if (suggestionsGenerated && suggestions.length > 0) {
      return (
        <Button
          type="primary"
          onClick={() => setIsSuggestionsModalOpen(true)}
        >
          Show Suggestions
        </Button>
      );
    }

    return null;
  };

  return (
    <Modal
      title="Improve User Story"
      visible={isOpen}
      onCancel={onClose}
      footer={null}
      className={styles.modal}
      centered
    >
      <TextArea
        value={editedStory}
        onChange={handleTextChange}
        placeholder="Edit user story here..."
        rows={4}
        className={styles.textarea}
      />

      <Tabs activeKey={activeKey} onChange={handleTabChange} className={styles.tabs}>
        <TabPane tab="General" key="1">
          <Title level={4}>Improvement Tips:</Title>
          {tips && tips.length > 0 ? (
            <List
              dataSource={tips}
              renderItem={(tip) => <List.Item>{tip}</List.Item>}
            />
          ) : (
            <Alert message="No improvement tips available." type="info" showIcon />
          )}
        </TabPane>
        <TabPane tab="Results" key="2">
          {renderSubmissionResults()}
        </TabPane>
        <TabPane tab="AI" key="3">
          <div className={styles.aiSuggestionsContainer}>
            {renderAISuggestions()}
          </div>
        </TabPane>
      </Tabs>

      <div className={styles.buttonContainer}>
        <Button
          type="primary"
          onClick={handleSubmit}
          disabled={!isTextAltered || !editedStory.trim() || hasSubmitted}
          className={styles.submitButton}
        >
          Submit
        </Button>
        <Button
          type="default"
          onClick={handleApply}
          disabled={!editedStory.trim() || !hasSubmitted}
        >
          Apply
        </Button>
      </div>

      <SuggestionsModal
        visible={isSuggestionsModalOpen}
        onClose={() => setIsSuggestionsModalOpen(false)}
        suggestions={suggestions}
        isLoading={isSuggestionsLoading}
        error={error}
      />
    </Modal>
  );
};

export default ImproveModal;