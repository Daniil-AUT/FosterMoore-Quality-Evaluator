import React from 'react';
import { Spin, Typography, Alert } from 'antd';
import styles from './Suggestions.module.css';

const { Title } = Typography;

const Suggestions = ({ suggestions, isLoading }) => {
  return (
    <div className={styles.suggestionsContainer}>
      {isLoading ? (
        <div className={styles.loaderContainer}>
          <Spin size="large" />
          <Typography.Text className={styles.fetchingText}>Looking for suggestions...</Typography.Text>
        </div>
      ) : !suggestions || (Array.isArray(suggestions) && suggestions.length === 0) ? (
        <Alert
          message="No suggestions available"
          type="info"
          showIcon
          className={styles.noSuggestionsAlert}
        />
      ) : (
        <>
          <Title level={4} className={styles.suggestionsTitle}>
            Improvement Suggestions
          </Title>
          <div className={styles.suggestionList}>
            {suggestions.map((suggestion, index) => {
              // Use regex to split the suggestion text into sections
              const sections = suggestion.split(/(?=Enhancing clarity:|Increasing completeness:|Identifying vague terms or phrases:|Recommending specific language to replace ambiguous terms:|Clarifying the intent and scope of the user story:|Providing concrete examples or contexts:|Ensuring the user story is actionable and specific:)/);

              return (
                <div key={index} className={styles.suggestionItem}>
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
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default Suggestions;
