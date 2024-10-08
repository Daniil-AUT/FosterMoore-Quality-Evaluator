import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { Layout, Typography, Card, List, Tag, Input, Select, Button, Spin, message, Empty, Collapse } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import ImproveModal from './ImproveModal';

const { Content } = Layout;
const { Title, Paragraph } = Typography;
const { Option } = Select;
const { Panel } = Collapse;

const EvaluationPage = () => {
  const location = useLocation();
  const [selectedStories, setSelectedStories] = useState([]);
  const [evaluatedStories, setEvaluatedStories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [criteria, setCriteria] = useState({ ambiguity: true, 'well-formed': true });
  const [filters, setFilters] = useState({ ambiguity: 'all', 'well-formed': 'all' });
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [storyToImprove, setStoryToImprove] = useState('');
  const [currentStoryId, setCurrentStoryId] = useState('');
  const [storiesPerRow, setStoriesPerRow] = useState(4);
  const [noStories, setNoStories] = useState(false);
  const [filterOpen, setFilterOpen] = useState(true);

  useEffect(() => {
      const stories = location.state?.selectedStories || [];
      const selectedCriteria = location.state?.criteria || {};
      setSelectedStories(stories);
      setCriteria(selectedCriteria);

      if (stories.length > 0 && evaluatedStories.length === 0) {
          evaluateStories(stories);
      } else {
          setIsLoading(false);
      }
  }, [location.state, evaluatedStories]);
  const areAllCriteriaGood = () => {
    return Object.values(criteria).every(value => value === true);
  };
  const evaluateStories = async (stories) => {
    setIsLoading(true);
    try {
      const evaluations = await Promise.all(
        stories.map(async (story, index) => {
          if (story.evaluation) return { ...story, id: index + 1 };

          const [ambiguityResponse, wellFormedResponse] = await Promise.all([
            axios.post('http://localhost:5000/predict/ambiguity', { user_story: story.summary }),
            axios.post('http://localhost:5000/predict/well-formed', { user_story: story.summary }),
          ]);

          return {
            id: index + 1,
            ...story,
            evaluation: {
              ambiguity: ambiguityResponse.data.ambiguity_prediction,
              'well-formed': wellFormedResponse.data.well_formed_prediction,
            },
          };
        })
      );
      setEvaluatedStories(evaluations);
    } catch (err) {
      message.error('Failed to evaluate user stories. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImprove = (story) => {
    setStoryToImprove(story.summary);
    setCurrentStoryId(story.id);
    setIsModalOpen(true);
  };

  const handleDismiss = (storyId) => {
    setEvaluatedStories((prevStories) => {
      const updatedStories = prevStories.filter((story) => story.id !== storyId);
      if (updatedStories.length === 0) {
        setNoStories(true);
      }
      return updatedStories;
    });
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setStoryToImprove('');
  };

  const handleApplyImprovement = async (storyId, newStory) => {
    try {
      const [ambiguityResponse, wellFormedResponse] = await Promise.all([
        axios.post('http://localhost:5000/predict/ambiguity', { user_story: newStory }),
        axios.post('http://localhost:5000/predict/well-formed', { user_story: newStory }),
      ]);

      setEvaluatedStories((prevStories) =>
        prevStories.map((story) =>
          story.id === storyId
            ? {
                ...story,
                summary: newStory,
                evaluation: {
                  ambiguity: ambiguityResponse.data.ambiguity_prediction,
                  'well-formed': wellFormedResponse.data.well_formed_prediction,
                },
              }
            : story
        )
      );
      message.success('Story updated successfully');
    } catch (err) {
      message.error('Failed to update story evaluation. Please try again.');
    }
  };

  const generateTips = (evaluation) => {
    if (!evaluation) return [];
    
    const tips = [];
    if (evaluation.ambiguity === 0) {
      tips.push('Ensure the user story clearly states who the user is and what they need.');
      tips.push('Avoid vague terms and be specific about the requirements.');
    }
    if (evaluation['well-formed'] === 0) {
      tips.push('Ensure that the user story follows the format: "As a [role], I want [goal] so that [reason]."');
    }
    return tips;
  };

  const filterEvaluatedStories = () => {
    return evaluatedStories.filter((story) => {
      const matchesAmbiguity =
        filters.ambiguity === 'all' ||
        (filters.ambiguity === 'ambiguous' && story.evaluation.ambiguity === 0) ||
        (filters.ambiguity === 'clear' && story.evaluation.ambiguity === 1);
      const matchesWellFormed =
        filters['well-formed'] === 'all' ||
        (filters['well-formed'] === 'not well-formed' && story.evaluation['well-formed'] === 0) ||
        (filters['well-formed'] === 'well-formed' && story.evaluation['well-formed'] === 1);
      return matchesAmbiguity && matchesWellFormed;
    });
  };

  const filteredStories = filterEvaluatedStories().filter((story) =>
    story.summary.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout style={{background:'white'}}>
      <Content style={{ padding: '24px', minWidth: '90%', maxWidth: '90%', margin: '0 auto', background: 'white' }}>
        <Title level={2} style={{ textAlign: 'center' }}>User Story Evaluations</Title>

        <Collapse activeKey={filterOpen ? ['1'] : []} onChange={(key) => setFilterOpen(key.length > 0)}>
          <Panel header="Filter Stories" key="1">
            <Card style={{ marginBottom: '24px', padding: '16px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)' }}>
              <Input
                placeholder="Search user stories"
                prefix={<SearchOutlined />}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ marginBottom: '16px', borderRadius: '4px' }}
              />
              <Select
                style={{ width: '200px', marginRight: '16px', borderRadius: '4px' }}
                placeholder="Filter by ambiguity"
                onChange={(value) => setFilters((prev) => ({ ...prev, ambiguity: value }))}
              >
                <Option value="all">All</Option>
                <Option value="clear">Clear</Option>
                <Option value="ambiguous">Ambiguous</Option>
              </Select>
              <Select
                style={{ width: '200px', marginRight: '16px', borderRadius: '4px' }}
                placeholder="Filter by well-formed"
                onChange={(value) => setFilters((prev) => ({ ...prev, 'well-formed': value }))}
              >
                <Option value="all">All</Option>
                <Option value="well-formed">Well-formed</Option>
                <Option value="not well-formed">Not well-formed</Option>
              </Select>
            </Card>
          </Panel>
        </Collapse>

        {isLoading ? (
          <Spin size="large" />
        ) : noStories ? (
          <Empty description="No stories available. Please add some." />
        ) : (
          <List
  grid={{ gutter: 16, column: storiesPerRow }}
  dataSource={filteredStories}
  renderItem={(story) => (
    <List.Item>
      <Card
        title={`User Story ID: ${story.key}`}
        style={{
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          height: '250px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          marginTop: '7%'
        }}
      >
        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <Paragraph style={{ color: 'grey', margin: 0 }}>
            {story.summary}
          </Paragraph>
          <div>
            {criteria.ambiguity && (
              <Tag color={story.evaluation.ambiguity === 1 ? 'green' : 'red'}>
                Ambiguity: {story.evaluation.ambiguity === 1 ? 'Clear' : 'Ambiguous'}
              </Tag>
            )}
            {criteria['well-formed'] && (
              <Tag color={story.evaluation['well-formed'] === 1 ? 'green' : 'red'}>
                Well-formed: {story.evaluation['well-formed'] === 1 ? 'Yes' : 'No'}
              </Tag>
            )}
          </div>
        </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          textAlign: 'left', 
          paddingTop: '8%' 
        }}>
          <Button type="danger" onClick={() => handleDismiss(story.id)}>
            Dismiss
          </Button>
           <Button
            type="primary"
            style={{ marginRight: '8px' }}
            onClick={() => handleImprove(story)}
            disabled={
              (criteria.ambiguity && story.evaluation.ambiguity === 1) && 
              (criteria['well-formed'] && story.evaluation['well-formed'] === 1)
            }
          >
            Improve
          </Button>
          
        </div>
      </Card>
    </List.Item>
  )}
/>
        )}

        <ImproveModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          story={storyToImprove}
          storyId={currentStoryId}
          onApply={handleApplyImprovement}
          tips={generateTips(evaluatedStories.find(s => s.id === currentStoryId)?.evaluation)}
        />
      </Content>
    </Layout>
  );
};

export default EvaluationPage;