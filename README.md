# FosterMoore Quality Evaluator

## Background and Rationale
The client is the customer education manager at Foster Moore, a 20-year-old medium-sized company specializing in managing a software-based registries product aimed at governments and regulators globally. For example, they manage the Companies Registry for the New Zealand government. The software team at Foster Moore has identified an issue with the high frequency of failed software builds, often resulting in costly rework and debugging effort. This project has grown out of their aim to reduce the frequency of build failures by improving some aspect of the product development process prior to the build.

## Objectives and Scope
This project aims at reducing the frequency of software build failures by improving the quality of user stories that are related to specific builds. The decision to use improving user story quality as a means of reducing build failure frequency was based on:
- The earlier in the SDLC the improvement is made, the less potential rework will be needed for changes.
- The perception at Foster Moore was that user stories were not always well written, and there is room for improvement.
- There is evidence in published research literature that build failures are less likely with high-quality user stories.
- The evaluation of user story quality could be automated using machine learning, with the expectation that overall quality will improve over time with feedback.

This project aimed at delivering a software tool that could automate the evaluation of the quality of selected user stories and suggest how to re-write them to improve their quality. This should give Foster Moore the ability to test if it improves build failure frequency, with their own data.

## Out of Scope
- Confirmation that improving user story quality decreases builds fail frequency (no access to Foster Moore data).
- Dashboard tracking the trends in user story quality and build pass/fail.

## Product Development Process
- Research
  - User Story Quality -> Improve build outcomes
  - How to measure User Story Quality
  - Potential AI algorithms for automation
  - How to evaluate the efficacy of AI algorithms for their task

- Experiment
  - Find user story data
  - Develop training data for the ML and LLMs
  - The efficacy of different LLMs and ML algorithms in evaluating user story quality (ambiguity and well-formed).
  - Use of local LLMs to protect the privacy of Foster Moore and their user stories

- Develop Product
  - APIs to Jira, models, LLMs
  - Front-end UI and workflow

## Technical
- Iterations, planning (iteration goals), monitoring progress, progress review with client
- QA - reviews, Risks

## Impact
Automated the identification and suggested improvements of user story quality, which would be difficult manually. This gave Foster Moore the ability to test their hypothesis that improving user story quality decreases build failure. Based on findings, this has the potential to save hundreds of person-hours each build.

## Product and Results
- Experimentation diagram
- Testing ML algorithm
  - Sourced user story training/testing data -> pre-processing
  - Training LLM for improvement recommendation
- Diagram of technical architecture of tool
- Diagram of product workflow (one screenshot)
- QR code to a video demonstrating a use case scenario

## Homepage
For more information, visit the project [homepage](https://foster-moore-quality-evaluator.vercel.app).
