import React from 'react';
import { motion } from 'framer-motion';
import { SelfReportQuestions } from '../shared';

interface PostGameSelfReportProps {
  gameTitle: string;
  gameIcon?: React.ReactNode;
  questions: any[];
  onComplete: (answers: { [key: string]: number }) => void;
  onCancel?: () => void;
  width?: string;
  height?: string;
}

const PostGameSelfReport: React.FC<PostGameSelfReportProps> = ({
  gameTitle,
  gameIcon,
  questions,
  onComplete,
  onCancel,
  width = "max-w-4xl",
  height = "max-h-[90vh]"
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
  const [questionResponses, setQuestionResponses] = React.useState<{ [key: string]: number }>({});

  const handleQuestionResponse = (response: number) => {
    const currentQuestion = questions[currentQuestionIndex];
    setQuestionResponses(prev => ({
      ...prev,
      [currentQuestion.id]: response
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleQuestionsComplete = () => {
    // Convert responses to object format with question IDs as keys
    const answers = questions.reduce((acc, question, index) => {
      acc[question.id] = questionResponses[question.id] || 0;
      return acc;
    }, {} as { [key: string]: number });
    
    onComplete(answers);
  };

  return (
    <motion.div
      className="card-dark overflow-hidden flex flex-col"
      style={{ width, height }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-sage-700 flex items-center justify-between bg-sage-800/50">
        <div className="flex items-center space-x-4">
          {gameIcon && (
            <div className="text-2xl">
              {gameIcon}
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold text-forest-200">{gameTitle} - Self-Report</h2>
            <p className="text-sm text-sage-300 mt-1">
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>
          </div>
        </div>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-sage-400 hover:text-white transition-colors focus-helper"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Self-Report Content */}
      <div className="flex-1 p-4">
        <div className="w-full h-full mx-auto">
          {/* Removed redundant messages */}
          
          <SelfReportQuestions
            questions={questions}
            currentQuestionIndex={currentQuestionIndex}
            questionResponses={questionResponses}
            onQuestionResponse={handleQuestionResponse}
            onQuestionsComplete={handleQuestionsComplete}
            onPreviousQuestion={handlePreviousQuestion}
            onNextQuestion={handleNextQuestion}
            title=""
            subtitle=""
            theme="dark"
            width="100%"
            height="auto"
          />
        </div>
      </div>

      {/* Self-Report Footer */}
      <div className="p-6 border-t border-sage-700 bg-sage-900/50">
        <div className="flex justify-between items-center">
          <button
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-2 rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sage-500 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: currentQuestionIndex === 0 ? '#6B7280' : '#4B5563',
              color: 'white'
            }}
          >
            Previous
          </button>
          
          <div className="text-sage-400 text-sm text-center">
            <p>Your responses help us understand your experience better.</p>
            <p className="mt-1">All data is anonymous and confidential.</p>
          </div>
          
          <button
            onClick={() => {
              if (currentQuestionIndex < questions.length - 1) {
                handleNextQuestion();
              } else {
                handleQuestionsComplete();
              }
            }}
            disabled={!questionResponses[questions[currentQuestionIndex]?.id]}
            className="px-6 py-2 rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: !questionResponses[questions[currentQuestionIndex]?.id] ? '#6B7280' : '#10B981',
              color: 'white'
            }}
          >
            {currentQuestionIndex < questions.length - 1 ? 'Next' : 'Complete'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default PostGameSelfReport;
