import joblib
import os
import numpy as np
import logging
from flask import Flask, request, jsonify, Blueprint
from flask_cors import CORS
import requests
from requests.auth import HTTPBasicAuth
from typing import List, Dict
import torch
from transformers import BertTokenizer, BertModel, DistilBertTokenizer, DistilBertModel
from langchain_community.llms import Ollama
from langchain_core.prompts import PromptTemplate
from transformers import AutoModelForSequenceClassification, AutoTokenizer
from huggingface_hub import login
from huggingface_hub import InferenceClient



# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

access_token = "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"
login(access_token)

# Configure logging
logging.basicConfig(level=logging.INFO)

# Define the base directory for models
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Define model paths
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
print("SUCCESS!")

# Load BERT and DistilBERT tokenizers and models
def load_models_and_tokenizers() -> dict:
    models = {}
    try:
        models['ambiguity'] = {
            'tokenizer': BertTokenizer.from_pretrained("ryj5244/ambiguityCriteria"),
            'model': BertModel.from_pretrained("ryj5244/ambiguityCriteria")
        }
        print("Ambiguity model loaded successfully.")
    except Exception as e:
        print(f"Error loading ambiguity model: {e}")

    try:
        models['well_formed'] = {
            'tokenizer': DistilBertTokenizer.from_pretrained("ryj5244/wellFormedCriteria"),
            'model': DistilBertModel.from_pretrained("ryj5244/wellFormedCriteria")
        }
        print("Well-formed model loaded successfully.")
    except Exception as e:
        print(f"Error loading well-formed model: {e}")

    return models

# Load the models and tokenizers
MODELS = load_models_and_tokenizers()

def extract_features(user_story: str, tokenizer, model) -> np.ndarray:
    # Tokenize the input user story
    inputs = tokenizer(user_story, return_tensors='pt', padding=True, truncation=True)

    # Get the model outputs
    outputs = model(**inputs)

    # Use the mean of the last hidden states as features
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

        # Assuming the model outputs 0 for 'Not well-formed' and 1 for 'Well-formed'
        outcome_text = 'Well-formed' if prediction == 1 else 'Not well-formed'
        logging.info(f"Prediction: {outcome_text}")

        return jsonify({'well_formed_prediction': int(prediction), 'outcome_text': outcome_text})

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

        # Assuming the model outputs 0 for 'Ambiguous' and 1 for 'Unambiguous'
        outcome_text = 'Unambiguous' if prediction == 1 else 'Ambiguous'
        logging.info(f"Prediction: {outcome_text}")

        return jsonify({'ambiguity_prediction': int(prediction), 'outcome_text': outcome_text})

    except Exception as e:
        logging.error(f"Error during prediction: {e}")
        return jsonify({'error': 'Prediction failed.'}), 500



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
    
client = InferenceClient(api_key=access_token)

@app.route('/suggestions', methods=['POST'])
def suggestions():
    data = request.json
    user_story = data.get('user_story')

    if not user_story:
        return jsonify({'error': 'User story is required.'}), 400

    specific_suggestions = []
    well_formed_prediction = data.get('well_formed_prediction')
    ambiguity_prediction = data.get('ambiguity_prediction')

    # Initialize a counter for the number of criteria violated
    criteria_violated = 0

    # Suggestions for well-formed criteria
    if well_formed_prediction == 0:  # Not well-formed
        specific_suggestions.append(
            f"""
            You are an Agile expert with a deep understanding of the AQUSA framework, specifically the Well-Formed criteria for user stories in software development. 
            Evaluate the following user story and provide five main suggestions for improvement based on these criteria:

            User Story: '{user_story}'

            Your suggestions should focus on:

            1. Enhancing clarity (max 100 words).
            2. Increasing completeness (max 100 words).

            Please ensure that each section does not exceed the specified word limit and print each suggestion on a new line with the following format: 

            Enhancing clarity: [Your explanation here, max 100 words; do not exceed this limit]

            Increasing completeness: [Your explanation here, max 100 words; do not exceed this limit]

            Do not generate improved user stories; focus solely on providing suggestions."""
        )
        criteria_violated += 1  # Increment criteria violated count

    # Suggestions for ambiguity criteria
    if ambiguity_prediction == 0:  # Ambiguous
        specific_suggestions.append(
            f"""
            You are an Agile expert with a deep understanding of the AQUSA framework, specifically the criteria related to eliminating ambiguity in user stories within software development. 
            Evaluate the following user story and provide five main suggestions for improvement based on the ambiguity criteria:

            User Story: '{user_story}'

            Your suggestions should focus on:

            1. Identifying vague terms or phrases that could lead to misunderstandings (max 100 words).
            2. Recommending specific language to replace ambiguous terms to enhance clarity (max 100 words).
            3. Ensuring the user story is actionable and specific, allowing for clear development tasks (max 100 words).
            4. Clarifying the intent and scope of the user story to align stakeholders' expectations (max 100 words).
            5. Providing concrete examples or contexts that illustrate the desired outcome (max 100 words).

            Please ensure that each section does not exceed the specified word limit and print each suggestion on a new line with the following format: 

            Identifying vague terms or phrases: [Your explanation here, max 100 words; do not exceed this limit]

            Recommending specific language to replace ambiguous terms: [Your explanation here, max 100 words; do not exceed this limit]

            Ensuring the user story is actionable and specific: [Your explanation here, max 100 words; do not exceed this limit]

            Clarifying the intent and scope of the user story: [Your explanation here, max 100 words; do not exceed this limit]

            Providing concrete examples or contexts: [Your explanation here, max 100 words; do not exceed this limit]

            Do not generate improved user stories; focus solely on providing suggestions."""
        )
        criteria_violated += 1  # Increment criteria violated count

    # Process suggestions and generate response
    if specific_suggestions:
        try:
            print("GENERATING RESPONSE")
            # Join all specific suggestions into a single formatted prompt
            formatted_prompt = "\n".join(specific_suggestions)

            # Calculate max_new_tokens based on the number of criteria violated
            base_tokens = 200  # Base token count
            per_criterion_tokens = 50  # Tokens for each additional criterion
            max_suggestion_tokens = 100  # Estimated tokens per suggestion
            total_suggestions = criteria_violated * 5  # 5 suggestions per criterion
            estimated_response_length = total_suggestions * max_suggestion_tokens

            # Total token count ensuring room for response
            max_tokens = base_tokens + (criteria_violated * per_criterion_tokens) + estimated_response_length
            
            # Limit the max_tokens to a reasonable value (e.g., 400 or less)
            max_tokens = min(max_tokens, 700)

            # Use the Hugging Face Inference API to generate a response
            response = client.text_generation(
                model="mistralai/Mistral-7B-Instruct-v0.3",
                prompt=formatted_prompt,
                max_new_tokens=max_tokens
            )

            # Ensure the response is always an array
            if isinstance(response, str):
                response = [response]  # Wrap the string in an array

            # Log the specific suggestions and response format
            print("Specific Suggestions:", specific_suggestions)
            print("Response Format:", {'suggestions': response})

            return jsonify({'suggestions': response})  # Ensure response is returned correctly
        except Exception as e:
            return jsonify({"error": "Error generating suggestions", "details": str(e)}), 500

    return jsonify({'suggestions': []})  # Ensure no suggestions return an empty array




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

if __name__ == '__main__':
    app.run(debug=True)
