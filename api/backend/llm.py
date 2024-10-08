import joblib
import os
import numpy as np
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from requests.auth import HTTPBasicAuth
from typing import List, Dict
import torch
from transformers import BertTokenizer, BertModel, DistilBertTokenizer, DistilBertModel
from langchain_community.llms import Ollama
from langchain_core.prompts import PromptTemplate

# Load Mistral model
mistral_model = Ollama(model_name="mistral")

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure logging
logging.basicConfig(level=logging.INFO)

# Define the base directory for models
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Define paths to model files
MODEL_PATHS = {
    'ambiguity': os.path.join(BASE_DIR, 'models/svc_Ambiguous.joblib'),
    'well_formed': os.path.join(BASE_DIR, 'models/svc_wellFormed.joblib')
}

# Load models with error handling
def load_models() -> tuple:
    try:
        svc_ambiguity_model = joblib.load(MODEL_PATHS['ambiguity'])
        svc_well_formed_model = joblib.load(MODEL_PATHS['well_formed'])
        return svc_ambiguity_model, svc_well_formed_model
    except Exception as e:
        logging.error(f"Failed to load models: {e}")
        raise RuntimeError("Model loading failed. Please check the model paths and files.")

svc_ambiguity_model, svc_well_formed_model = load_models()

# Load BERT and DistilBERT tokenizers and models
def load_models_and_tokenizers() -> dict:
    return {
        'ambiguity': {
            'tokenizer': BertTokenizer.from_pretrained(os.path.join(BASE_DIR, 'models', 'ambiguityBert')),
            'model': BertModel.from_pretrained(os.path.join(BASE_DIR, 'models', 'ambiguityBert'))
        },
        'well_formed': {
            'tokenizer': DistilBertTokenizer.from_pretrained(os.path.join(BASE_DIR, 'models', 'wellFormedBert')),
            'model': DistilBertModel.from_pretrained(os.path.join(BASE_DIR, 'models', 'wellFormedBert'))
        }
    }

MODELS = load_models_and_tokenizers()

def extract_features(user_story: str, tokenizer, model) -> np.ndarray:
    inputs = tokenizer(user_story, return_tensors='pt', padding=True, truncation=True)
    outputs = model(**inputs)
    features = outputs.last_hidden_state.mean(dim=1).detach().numpy()
    return features

@app.route('/predict/well-formed', methods=['POST'])
def predict_well_formed():
    data = request.json
    user_story = data.get('user_story')

    if not user_story:
        return jsonify({'error': 'User story is required.'}), 400

    try:
        tokenizer = MODELS['well_formed']['tokenizer']
        model = MODELS['well_formed']['model']
        svc_model = svc_well_formed_model

        features = extract_features(user_story, tokenizer, model)
        prediction = svc_model.predict(features)[0]

        prediction = int(prediction) if isinstance(prediction, np.int64) else prediction
        outcome_text = 'Well-formed' if prediction == 1 else 'Not well-formed'
        logging.info(f"Prediction: {outcome_text}")

        return jsonify({'well_formed_prediction': prediction})

    except Exception as e:
        logging.error(f"Error during prediction: {e}")
        return jsonify({'error': 'Prediction failed.'}), 500

@app.route('/predict/ambiguity', methods=['POST'])
def predict_ambiguity():
    data = request.json
    user_story = data.get('user_story')

    if not user_story:
        return jsonify({'error': 'User story is required.'}), 400

    try:
        tokenizer = MODELS['ambiguity']['tokenizer']
        model = MODELS['ambiguity']['model']
        svc_model = svc_ambiguity_model

        features = extract_features(user_story, tokenizer, model)
        prediction = svc_model.predict(features)[0]

        prediction = int(prediction) if isinstance(prediction, np.int64) else prediction
        outcome_text = 'Unambiguous' if prediction == 1 else 'Ambiguous'
        logging.info(f"Prediction: {outcome_text}")

        return jsonify({'ambiguity_prediction': prediction})

    except Exception as e:
        logging.error(f"Error during prediction: {e}")
        return jsonify({'error': 'Prediction failed.'}), 500

@app.route('/suggestions', methods=['POST'])
def suggestions():
    data = request.json
    user_story = data.get('user_story')

    if not user_story:
        return jsonify({'error': 'User story is required.'}), 400

    suggestions = [
        "Make sure the user story is clear and concise.",
        "Avoid using vague terms such as 'some' or 'many'.",
        "Use complete sentences and standard formats."
    ]

    return jsonify({'suggestions': suggestions})

# Jira credentials from environment variables (optional)
JIRA_API_URL = os.getenv("JIRA_API_URL")
JIRA_API_EMAIL = os.getenv("JIRA_API_EMAIL")
JIRA_API_TOKEN = os.getenv("JIRA_API_TOKEN")

def fetch_jira_user_stories(jira_url: str, jira_project_key: str, username: str, api_token: str) -> List[Dict]:
    jira_api_url = f"{jira_url}/rest/api/3/search"
    jql_query = f"project = {jira_project_key} AND issuetype = Story ORDER BY created DESC"
    
    auth = HTTPBasicAuth(username, api_token)
    headers = {"Accept": "application/json"}
    
    user_stories = []
    start_at = 0
    max_results = 100  # Jira usually limits to 100 results per request
    
    while True:
        params = {
            "jql": jql_query,
            "fields": "summary,description,status",
            "maxResults": max_results,
            "startAt": start_at
        }
        
        try:
            response = requests.get(jira_api_url, params=params, auth=auth, headers=headers)
            response.raise_for_status()  # Raise an exception for bad status codes
            
            data = response.json()
            issues = data.get('issues', [])
            
            if not issues:
                break  # No more issues to fetch
            
            for issue in issues:
                user_story = {
                    "key": issue['key'],
                    "summary": issue['fields']['summary'],
                    "description": issue['fields'].get('description', ''),
                    "status": issue['fields']['status']['name']
                }
                user_stories.append(user_story)
            
            start_at += len(issues)
            if start_at >= data['total']:
                break
        
        except requests.exceptions.RequestException as e:
            logging.error(f"An error occurred while fetching stories: {e}")
            break  # Exit the loop if there's an error
    
    return user_stories

@app.route('/api/user-stories', methods=['GET'])
def get_user_stories():
    jira_url = request.args.get('jira_url')
    jira_project_key = request.args.get('jira_project_key')
    username = request.args.get('username')
    api_token = request.args.get('api_token')

    if not jira_url or not jira_project_key or not username or not api_token:
        return jsonify({"error": "Missing required parameters"}), 400

    try:
        user_stories = fetch_jira_user_stories(jira_url, jira_project_key, username, api_token)
        return jsonify(user_stories), 200
    except Exception as e:
        logging.error(f"Error fetching user stories: {e}")
        return jsonify({"error": "Failed to fetch user stories."}), 500

@app.route('/verify-credentials', methods=['POST'])
def verify_credentials():
    data = request.json
    email = data.get('email')
    api_token = data.get('apiToken')
    jira_domain = data.get('jiraDomain')

    if not email or not api_token or not jira_domain:
        return jsonify({"error": "Missing required credentials."}), 400

    try:
        response = requests.get(f"{jira_domain}/rest/api/3/myself", auth=HTTPBasicAuth(email, api_token))
        if response.status_code == 200:
            return jsonify({"success": True}), 200
        else:
            return jsonify({"success": False, "error": "Invalid credentials."}), 401
    except requests.exceptions.RequestException as e:
        logging.error(f"Error verifying credentials: {e}")
        return jsonify({"error": "Verification failed."}), 500

def get_unambiguous_suggestions(user_story: str):
    prompt = PromptTemplate(
        input_variables=["user_story"],
        template="""\
        You are an expert in improving user stories for software development. I need your help to make the following user story clearer and more actionable.

        Review the user story for any ambiguous or unclear elements. Provide specific ideas on how to transform it into an unambiguous user story.

        Here is the user story:

        "{user_story}"

        Please generate five suggestions that include ideas for improvement along with their justification for how they enhance clarity and functional requirements. Each suggestion should also indicate how it leaves room for further discussion or refinement with stakeholders.

        1. **Idea**: [Your idea for improving the user story]
           - **Justification**: [Explain why this improvement enhances clarity and functional requirements]
           - **Discussion Point**: [Highlight areas that may require further input or confirmation from stakeholders]
        2. ...
        """
    )

    llm = Ollama(model="llama2")
    suggestions = llm(prompt.format(user_story=user_story))
    return suggestions

@app.route('/api/improve-user-story', methods=['POST'])
def improve_user_story():
    data = request.json
    user_story = data.get('user_story')

    if not user_story:
        return jsonify({'error': 'User story is required.'}), 400

    try:
        suggestions = get_unambiguous_suggestions(user_story)
        return jsonify({'suggestions': suggestions}), 200
    except Exception as e:
        logging.error(f"Error generating suggestions: {e}")
        return jsonify({'error': 'Failed to generate suggestions.'}), 500

if __name__ == '__main__':
    app.run(debug=True)
