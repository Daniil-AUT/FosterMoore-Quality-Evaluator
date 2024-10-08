import React, { useState } from 'react'; 
import ResultCSS from './Result.module.css';

const PREDICTION_UNAMBIGUOUS = 1; 
const PREDICTION_AMBIGUOUS = 0;
const PREDICTION_WELL_FORMED = 2; 
const PREDICTION_POORLY_FORMED = 3; 

const Result = ({ predictions }) => {
    const [isAmbiguityVisible, setIsAmbiguityVisible] = useState(false);
    const [isWellFormedVisible, setIsWellFormedVisible] = useState(false);
    const [isPoorlyFormedVisible, setIsPoorlyFormedVisible] = useState(false); 

    const getResultText = (prediction) => {
        switch (prediction) {
            case PREDICTION_UNAMBIGUOUS:
                return 'Unambiguous';
            case PREDICTION_AMBIGUOUS:
                return 'Ambiguous';
            case PREDICTION_WELL_FORMED:
                return 'Well-formed';
            case PREDICTION_POORLY_FORMED:
                return 'Poorly formed';
            default:
                return 'Unknown';
        }
    };

    const getResultClassName = (prediction) => {
        switch (prediction) {
            case PREDICTION_UNAMBIGUOUS:
            case PREDICTION_WELL_FORMED:
                return ResultCSS.goodResult; // Good results
            case PREDICTION_AMBIGUOUS:
            case PREDICTION_POORLY_FORMED:
                return ResultCSS.badResult; // Bad results
            default:
                return '';
        }
    };

    const ambiguityPrediction = predictions['ambiguity'];
    const wellFormedPrediction = predictions['well-formed'];
    const poorlyFormedPrediction = predictions['poorly-formed']; 

    return (
        <div className={ResultCSS.resultContainer}>
            <div className={ResultCSS.prediction}>
                <h2>
                    Ambiguity Prediction: <span className={getResultClassName(ambiguityPrediction)}>{getResultText(ambiguityPrediction)}</span>
                    <button 
                        className={ResultCSS.arrowButton} 
                        onClick={() => setIsAmbiguityVisible(!isAmbiguityVisible)}
                        aria-expanded={isAmbiguityVisible}
                    >
                        {isAmbiguityVisible ? '▲' : '▼'}
                    </button>
                </h2>
                <div className={`${ResultCSS.card} ${isAmbiguityVisible ? ResultCSS.visible : ''}`}>
                    <p className={ResultCSS.definition}>
                        <strong>Definition:</strong> A user story is considered ambiguous if it contains vague language or lacks clarity.
                    </p>
                </div>
            </div>

            <div className={ResultCSS.prediction}>
                <h2>
                    Well-formed Prediction: <span className={getResultClassName(wellFormedPrediction)}>{getResultText(wellFormedPrediction)}</span>
                    <button 
                        className={ResultCSS.arrowButton} 
                        onClick={() => setIsWellFormedVisible(!isWellFormedVisible)}
                        aria-expanded={isWellFormedVisible}
                    >
                        {isWellFormedVisible ? '▲' : '▼'}
                    </button>
                </h2>
                <div className={`${ResultCSS.card} ${isWellFormedVisible ? ResultCSS.visible : ''}`}>
                    <p className={ResultCSS.definition}>
                        <strong>Definition:</strong> Well-formed user stories adhere to the INVEST criteria and clearly communicate the user's needs.
                    </p>
                </div>
            </div>

            <div className={ResultCSS.prediction}>
                <h2>
                    Poorly formed Prediction: <span className={getResultClassName(poorlyFormedPrediction)}>{getResultText(poorlyFormedPrediction)}</span>
                    <button 
                        className={ResultCSS.arrowButton} 
                        onClick={() => setIsPoorlyFormedVisible(!isPoorlyFormedVisible)}
                        aria-expanded={isPoorlyFormedVisible}
                    >
                        {isPoorlyFormedVisible ? '▲' : '▼'}
                    </button>
                </h2>
                <div className={`${ResultCSS.card} ${isPoorlyFormedVisible ? ResultCSS.visible : ''}`}>
                    <p className={ResultCSS.definition}>
                        <strong>Definition:</strong> Poorly formed user stories do not follow the INVEST criteria and fail to communicate clear requirements.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Result;
