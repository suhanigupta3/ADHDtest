import React from 'react';
import { Question } from './types';

interface SelfReportQuestionsProps {
  questions: Question[];
  currentQuestionIndex: number;
  questionResponses: { [key: string]: number };
  onQuestionResponse: (response: number) => void;
  onQuestionsComplete: () => void;
  onPreviousQuestion: () => void;
  onNextQuestion: () => void;
}

const SelfReportQuestions: React.FC<SelfReportQuestionsProps> = ({
  questions,
  currentQuestionIndex,
  questionResponses,
  onQuestionResponse,
  onQuestionsComplete,
  onPreviousQuestion,
  onNextQuestion
}) => {
  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isAnswered = questionResponses[currentQuestion.id];

  // Debug logging
  console.log('[SelfReportQuestions] Component rendered:', {
    currentQuestionIndex,
    totalQuestions: questions.length,
    currentQuestion: currentQuestion?.text,
    isLastQuestion,
    isAnswered,
    questionResponses
  });

  const handleNextQuestion = () => {
    console.log('[SelfReportQuestions] handleNextQuestion called');
    if (isLastQuestion) {
      console.log('[SelfReportQuestions] Completing assessment');
      onQuestionsComplete();
    } else {
      console.log('[SelfReportQuestions] Moving to next question');
      onNextQuestion();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full h-[700px] flex flex-col relative">
        {/* Close button */}
        <button
          onClick={onQuestionsComplete}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 text-2xl font-bold"
          aria-label="Close"
        >
          ×
        </button>
        
        <div className="text-center mb-6 flex-shrink-0">
          <h3 className="text-2xl font-bold text-emerald-700 mb-3">
            Final Assessment Questions
          </h3>
          <p className="text-gray-600 text-base">
            Question {currentQuestionIndex + 1} of {questions.length}
          </p>
        </div>
        
        <div className="mb-6 flex-grow overflow-y-auto min-h-0">
          <p className="text-gray-800 font-medium mb-6 text-xl leading-relaxed break-words">
            {currentQuestion.text}
          </p>
          
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((value) => (
              <label key={value} className="flex items-center space-x-4 cursor-pointer p-4 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-200 transition-colors">
                <input
                  type="radio"
                  name={`question-${currentQuestion.id}-${currentQuestionIndex}`}
                  value={value}
                  checked={questionResponses[currentQuestion.id] === value}
                  onChange={() => {
                    console.log(`[SelfReportQuestions] Selected answer ${value} for question ${currentQuestion.id}`);
                    onQuestionResponse(value);
                  }}
                  className="text-emerald-600 w-6 h-6"
                />
                <span className="text-gray-700 text-lg">
                  {value} - {
                    value === 1 ? 'Not at all' :
                    value === 2 ? 'Slightly' :
                    value === 3 ? 'Moderately' :
                    value === 4 ? 'Very' :
                    'Extremely'
                  }
                </span>
              </label>
            ))}
          </div>
        </div>
        
        {/* Navigation buttons - always visible at bottom */}
        <div 
          className="flex justify-between items-center mb-4 flex-shrink-0 pt-4 border-t border-gray-200 bg-gray-50 p-4 rounded-lg"
          style={{ 
            position: 'relative', 
            zIndex: 1000,
            backgroundColor: '#f9fafb',
            border: '2px solid #e5e7eb',
            borderRadius: '8px'
          }}
        >
          <button
            onClick={() => {
              console.log(`[SelfReportQuestions] Previous button clicked, current index: ${currentQuestionIndex}`);
              onPreviousQuestion();
            }}
            disabled={currentQuestionIndex === 0}
            className={`px-8 py-3 rounded-lg font-semibold text-lg transition-colors ${
              currentQuestionIndex === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gray-600 hover:bg-gray-700 text-white'
            }`}
            style={{ 
              minWidth: '140px',
              border: '2px solid currentColor'
            }}
          >
            ← Previous
          </button>
          
          <button
            onClick={() => {
              console.log(`[SelfReportQuestions] Next button clicked, current index: ${currentQuestionIndex}, isLast: ${isLastQuestion}, isAnswered: ${isAnswered}`);
              handleNextQuestion();
            }}
            disabled={isLastQuestion && !isAnswered}
            className={`px-8 py-3 rounded-lg font-semibold text-lg transition-colors ${
              (isLastQuestion && !isAnswered)
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
            style={{ 
              minWidth: '160px',
              border: '2px solid currentColor'
            }}
          >
            {isLastQuestion ? 'Complete Assessment' : 'Next →'}
          </button>
        </div>
        
        {/* Debug info - remove this in production */}
        <div className="text-sm text-gray-500 text-center mb-3 flex-shrink-0">
          Debug: Index {currentQuestionIndex + 1}/{questions.length} | Answered: {isAnswered ? 'Yes' : 'No'} | Last: {isLastQuestion ? 'Yes' : 'No'}
        </div>
        
        {/* Progress indicator */}
        <div className="w-full bg-gray-200 rounded-full h-3 flex-shrink-0">
          <div 
            className="bg-emerald-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default SelfReportQuestions;
