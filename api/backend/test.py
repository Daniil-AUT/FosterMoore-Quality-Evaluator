import unittest
from unittest.mock import patch, MagicMock
from app import app, fetch_jira_user_stories
from llm import get_unambiguous_suggestions

class TestApp(unittest.TestCase):
    def setUp(self):
        # Set up the Flask test client
        self.client = app.test_client()

    @patch('app.fetch_jira_user_stories')
    def test_get_user_stories(self, mock_fetch):
        # Mock fetch_jira_user_stories to return a sample response
        mock_fetch.return_value = [
            {"key": "STORY-1", "summary": "Sample story", "description": "Description", "status": "To Do"}
        ]

        # Simulate a GET request to the /api/user-stories endpoint
        response = self.client.get('/api/user-stories')
        
        # Check the status code
        self.assertEqual(response.status_code, 200)
        
        # Check the response data
        data = response.get_json()
        self.assertEqual(len(data['user_stories']), 1)
        self.assertEqual(data['user_stories'][0]['key'], 'STORY-1')

    @patch('app.fetch_jira_user_stories')
    def test_get_user_stories_empty(self, mock_fetch):
        # Mock fetch_jira_user_stories to return an empty list
        mock_fetch.return_value = []

        # Simulate a GET request to the /api/user-stories endpoint
        response = self.client.get('/api/user-stories')
        
        # Check the status code and ensure it handles empty results
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(len(data['user_stories']), 0)

    @patch('app.get_unambiguous_suggestions')
    def test_improve_user_story(self, mock_suggestions):
        # Mock the suggestion function to return sample data
        mock_suggestions.return_value = [
            {"Idea": "Clarify the goal", "Justification": "Better understanding", "Discussion Point": "Review with team"}
        ]

        # Simulate a POST request with a sample user story
        response = self.client.post('/api/improve-user-story', json={"user_story": "As a user, I want to login."})
        
        # Check the status code and response data
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn('suggestions', data)

    def test_improve_user_story_missing_story(self):
        # Simulate a POST request without providing a user_story
        response = self.client.post('/api/improve-user-story', json={})
        
        # Check the status code and error message for missing user_story
        self.assertEqual(response.status_code, 400)
        data = response.get_json()
        self.assertIn('error', data)
        self.assertEqual(data['error'], 'User story is required.')

# Run the unit tests
if __name__ == '__main__':
    unittest.main(argv=[''], exit=False)
