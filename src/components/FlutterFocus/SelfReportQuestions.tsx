import React from 'react';

interface Question {
  id: string;
  text: string;
}

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

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: '100%',
      height: '100%',
      backgroundColor: '#1F2937',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      {/* Main Content Container */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        maxWidth: '600px',
        textAlign: 'center'
      }}>
        {/* Header */}
        <div style={{ 
          marginBottom: '40px',
          color: 'white',
          width: '100%'
        }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            margin: '0 0 16px 0',
            color: '#10B981'
          }}>
            Final Assessment Questions
          </h1>
          <p style={{
            fontSize: '18px',
            margin: 0,
            color: '#D1D5DB'
          }}>
            Question {currentQuestionIndex + 1} of {questions.length}
          </p>
        </div>

        {/* Question */}
        <div style={{ 
          width: '100%',
          marginBottom: '40px'
        }}>
          <p style={{
            color: 'white',
            fontSize: '20px',
            fontWeight: '500',
            lineHeight: '1.6',
            margin: '0 0 40px 0'
          }}>
            {currentQuestion.text}
          </p>

          {/* Answer Options */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '20px',
            alignItems: 'center',
            width: '100%'
          }}>
            {[1, 2, 3, 4, 5].map((value) => (
              <label key={value} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px',
                cursor: 'pointer',
                padding: '16px 24px',
                borderRadius: '12px',
                border: `3px solid ${questionResponses[currentQuestion.id] === value ? '#10B981' : '#4B5563'}`,
                backgroundColor: questionResponses[currentQuestion.id] === value ? '#064E3B' : '#374151',
                minWidth: '300px',
                maxWidth: '400px',
                transition: 'all 0.2s',
                color: 'white'
              }}>
                <input
                  type="radio"
                  name={`question-${currentQuestion.id}`}
                  value={value}
                  checked={questionResponses[currentQuestion.id] === value}
                  onChange={() => onQuestionResponse(value)}
                  style={{
                    width: '20px',
                    height: '20px',
                    accentColor: '#10B981',
                    flexShrink: 0
                  }}
                />
                <span style={{
                  fontSize: '18px',
                  fontWeight: '500',
                  flex: 1
                }}>
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

        {/* Navigation */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          maxWidth: '500px',
          marginBottom: '40px'
        }}>
          <button
            onClick={onPreviousQuestion}
            disabled={currentQuestionIndex === 0}
            style={{
              padding: '16px 32px',
              borderRadius: '12px',
              fontSize: '18px',
              fontWeight: '600',
              border: 'none',
              cursor: currentQuestionIndex === 0 ? 'not-allowed' : 'pointer',
              backgroundColor: currentQuestionIndex === 0 ? '#6B7280' : '#4B5563',
              color: currentQuestionIndex === 0 ? '#9CA3AF' : 'white',
              transition: 'all 0.2s',
              minWidth: '120px'
            }}
          >
            Previous
          </button>

          <button
            onClick={() => {
              if (isLastQuestion) {
                onQuestionsComplete();
              } else {
                onNextQuestion();
              }
            }}
            disabled={isLastQuestion && !isAnswered}
            style={{
              padding: '16px 32px',
              borderRadius: '12px',
              fontSize: '18px',
              fontWeight: '600',
              border: 'none',
              cursor: (isLastQuestion && !isAnswered) ? 'not-allowed' : 'pointer',
              backgroundColor: (isLastQuestion && !isAnswered) ? '#6B7280' : '#10B981',
              color: (isLastQuestion && !isAnswered) ? '#white' : 'white',
              transition: 'all 0.2s',
              minWidth: '120px'
            }}
          >
            {isLastQuestion ? 'Complete' : 'Next'}
          </button>
        </div>

        {/* Progress Bar */}
        <div style={{
          width: '100%',
          maxWidth: '500px',
          height: '8px',
          backgroundColor: '#374151',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            backgroundColor: '#10B981',
            width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>
    </div>
  );
};

export default SelfReportQuestions;
