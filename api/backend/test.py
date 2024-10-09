import unittest
import json
from app import app

class FlaskAppTests(unittest.TestCase):

    # Set up test client
    @classmethod
    def setUpClass(cls):
        cls.client = app.test_client()
        cls.client.testing = True

    # Test prediction for well-formed user stories
    def test_predict_well_formed_valid_story(self):
        # Sample payload
        payload = {
            'user_story': 'As a user, I want to log in to the platform so I can access my account.'
        }
        response = self.client.post('/predict/well-formed', data=json.dumps(payload), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn('well_formed_prediction', data)
        self.assertIn('outcome_text', data)

    def test_predict_well_formed_missing_story(self):
        payload = {}
        response = self.client.post('/predict/well-formed', data=json.dumps(payload), content_type='application/json')
        self.assertEqual(response.status_code, 400)
        data = response.get_json()
        self.assertIn('error', data)
    
    # Test prediction for ambiguity in user stories
    def test_predict_ambiguity_valid_story(self):
        # Sample payload
        payload = {
            'user_story': 'As a user, I want to reset my password when I forget it.'
        }
        response = self.client.post('/predict/ambiguity', data=json.dumps(payload), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn('ambiguity_prediction', data)
        self.assertIn('outcome_text', data)

    def test_predict_ambiguity_missing_story(self):
        payload = {}
        response = self.client.post('/predict/ambiguity', data=json.dumps(payload), content_type='application/json')
        self.assertEqual(response.status_code, 400)
        data = response.get_json()
        self.assertIn('error', data)
    
    # Test fetching user stories from Jira (mock test)
    def test_get_user_stories_missing_parameters(self):
        response = self.client.get('/api/user-stories')
        self.assertEqual(response.status_code, 400)
        data = response.get_json()
        self.assertIn('error', data)
    
    # Test verification of credentials (mock test)
    def test_verify_credentials_missing(self):
        payload = {}
        response = self.client.post('/verify-credentials', data=json.dumps(payload), content_type='application/json')
        self.assertEqual(response.status_code, 400)
        data = response.get_json()
        self.assertIn('error', data)

if __name__ == '__main__':
    unittest.main()
