import React from 'react';
import { Modal, Typography, List, Spin, Empty, Alert } from 'antd';
import { BulbOutlined } from '@ant-design/icons';
import styles from './SuggestionsModal.module.css';

const { Title, Paragraph } = Typography;

const SuggestionsModal = ({ visible, onClose, suggestions, isLoading, error }) => {
  return (
    <Modal
      title={
        <Title level={3}>
          <BulbOutlined /> AI Suggestions
        </Title>
      }
      visible={visible}
      onCancel={onClose}
      footer={null}
      className={styles.modal}
      centered
      width={800} // Set the width of the modal to make it wider
    >
      <div className={`${styles.scrollableContent} ${styles.scrollbar}`}>
        {isLoading ? (
          <div className={styles.loadingContainer}>
            <Spin size="large" />
            <Paragraph>Generating suggestions...</Paragraph>
          </div>
        ) : error ? (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
          />
        ) : (
          <>
            {console.log('Suggestions received in modal:', suggestions)}
            {suggestions.length > 0 ? (
              <List
                dataSource={suggestions}
                renderItem={(suggestion, index) => {
                  // Split the suggestion text into sections
                  const sections = suggestion.split(/(?=Enhancing clarity:|Increasing completeness:|Identifying vague terms or phrases:|Recommending specific language to replace ambiguous terms:|Clarifying the intent and scope of the user story:|Providing concrete examples or contexts:|Ensuring the user story is actionable and specific:)/);

                  return (
                    <List.Item className={styles.suggestionItem} key={index}>
                      <div style={{ textAlign: 'left', width: '100%' }}>
                        {sections.map((section, idx) => {
                          // Get the title and content from the section
                          const title = section.split(':')[0]?.trim();
                          const content = section.substring(section.indexOf(':') + 1).trim();

                          // Check for valid title and content
                          if (!title || !content) return null; // Skip if title or content is invalid

                          // Split the content by line breaks to handle multiple points
                          const bulletPoints = content.split('\n').filter(point => point.trim() !== '');

                          return (
                            <div key={idx} style={{ marginBottom: '20px' }}>
                              <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>
                                {title}
                              </div>
                              <div>
                                {bulletPoints.map((point, pointIdx) => (
                                  <div key={pointIdx} style={{ marginBottom: '5px' }}>
                                    {point.startsWith('*') ? (
                                      <span>&bull; {point.slice(1).trim()}</span> // Replace * with bullet
                                    ) : (
                                      point
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </List.Item>
                  );
                }}
              />
            ) : (
              <Empty
                description="No suggestions available"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </>
        )}
      </div>
    </Modal>
  );
};

export default SuggestionsModal;
