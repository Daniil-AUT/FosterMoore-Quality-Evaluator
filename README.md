# Quality Evaluator

## Background
This project addresses the issue of high frequency of failed software builds, often resulting in costly rework and debugging effort. The goal is to reduce the frequency of build failures by improving some aspect of the product development process prior to the build.

## Our Objective
We aim to reduce the frequency of software build failures by improving the quality of user stories that are related to specific builds. The decision to use improving user story quality as a means of reducing build failure frequency was based on:
- The earlier in the SDLC the improvement is made, the less potential rework will be needed for changes.
- The perception that user stories were not always well written, and there is room for improvement.
- Evidence in published research literature that build failures are less likely with high-quality user stories.
- The evaluation of user story quality could be automated using machine learning, with the expectation that overall quality will improve over time with feedback.


Our software tool automates the evaluation of the quality of selected user stories and suggests how to re-write them to improve their quality. This would give the ability to test if high-quality stories could help reudce build failure frequency.


## Setup Instructions

### Prerequisites
- Node.js (version 14.x or later)
- Python (version 3.8 or later)
- npm (version 6.x or later)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/Daniil-AUT/FosterMoore-Quality-Evaluator.git
   ```
2. Open the terminal and Navigate to the Project's Root Folder:
   ```
   cd FosterMoore-Quality-Evaluator
   ```
4. Navigate to 'frontend' folder:
   ```
   cd frontend
   ``` 
5.Install JavaScript dependencies:
  ```
  npm install
  ```
6. Navigate to 'api/backend' folder:
  ```
  cd ../api/backend
  ```
7. Create Python environment:
   For Windows:
   ```
   python -m venv venv
   ```
   For MAC:
   ```
   python3 -m venv venv
   ```
8. Activate the environment:
   ```
   venv/Scripts/Activate
   ```
9. Install Python dependencies
  ```
  pip install -r requirements.txt
  ```

### Running the Application

1. Start the backend server:
  For Windows:
   ```
   python app.py
   ```
   For MAC:
   ```
   python3 app.py
   ```
2. Navigate to the frontend folder
   ```
   cd ../../frontend
   ```
3. Start the frontend development server:
   ```
   npm start
   ```
4. Open your browser and navigate to `http://localhost:3000` to view the application.

## Homepage
For more information, visit the project [homepage](https://foster-moore-quality-evaluator.vercel.app).
   





   
