import React from 'react';

export interface Question {
  id: string;
  text: string;
  category?: string;
}

export interface SelfReportQuestionsProps {
  questions: Question[];
  currentQuestionIndex: number;
  questionResponses: { [key: string]: number };
  onQuestionResponse: (response: number) => void;
  onQuestionsComplete: () => void;
  onPreviousQuestion: () => void;
  onNextQuestion: () => void;
  // Optional customization props
  title?: string;
  subtitle?: string;
  theme?: 'default' | 'dark' | 'light';
  width?: string;
  height?: string;
  isModal?: boolean;
}

const SelfReportQuestions: React.FC<SelfReportQuestionsProps> = ({
  questions,
  currentQuestionIndex,
  questionResponses,
  onQuestionResponse,
  onQuestionsComplete,
  onPreviousQuestion,
  onNextQuestion,
  title = 'Final Assessment Questions',
  subtitle,
  theme = 'default',
  width = '100%',
  height = '100%',
  isModal = false
}) => {
  console.log('[SelfReportQuestions] Received questions prop:', questions);
  console.log('[SelfReportQuestions] Questions type:', typeof questions);
  console.log('[SelfReportQuestions] Questions length:', questions?.length);
  console.log('[SelfReportQuestions] Questions array:', questions);
  console.log('[SelfReportQuestions] First question:', questions?.[0]);
  // Theme configurations
  const themes = {
    default: {
      background: '#1F2937',
      primary: '#10B981',
      secondary: '#4B5563',
      text: 'white',
      cardBg: '#374151',
      border: '#4B5563'
    },
    dark: {
      background: '#111827',
      primary: '#3B82F6',
      secondary: '#6B7280',
      text: 'white',
      cardBg: '#1F2937',
      border: '#374151'
    },
    light: {
      background: '#F9FAFB',
      primary: '#10B981',
      secondary: '#6B7280',
      text: '#111827',
      cardBg: 'white',
      border: '#E5E7EB'
    }
  };

  const currentTheme = themes[theme];

  // Safety check for questions array
  if (!questions || questions.length === 0) {
    console.log('[SelfReportQuestions] Questions array is empty or undefined:', questions);
    console.log('[SelfReportQuestions] Questions type:', typeof questions);
    console.log('[SelfReportQuestions] Questions length:', questions?.length);
    return (
      <div style={{
        width,
        height,
        backgroundColor: currentTheme.background,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        boxSizing: 'border-box'
      }}>
        <div style={{ color: currentTheme.text, textAlign: 'center' }}>
          <h2>No questions available</h2>
          <p>Please try refreshing the page or contact support.</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  
  // Safety check for current question
  if (!currentQuestion || !currentQuestion.id) {
    console.log('[SelfReportQuestions] Current question is invalid:', currentQuestion);
    console.log('[SelfReportQuestions] Current question index:', currentQuestionIndex);
    console.log('[SelfReportQuestions] Questions array:', questions);
    return (
      <div style={{
        width,
        height,
        backgroundColor: currentTheme.background,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        boxSizing: 'border-box'
      }}>
        <div style={{ color: currentTheme.text, textAlign: 'center' }}>
          <h2>Question not found</h2>
          <p>Please try refreshing the page or contact support.</p>
        </div>
      </div>
    );
  }

  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isAnswered = questionResponses[currentQuestion.id];

  // Response labels
  const responseLabels = {
    1: 'Not at all',
    2: 'Slightly',
    3: 'Moderately',
    4: 'Very',
    5: 'Extremely'
  };

  const containerStyle = isModal ? {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    backgroundColor: currentTheme.background,
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0',
    boxSizing: 'border-box' as const
  } : {
    width: '100%',
    height: '100%',
    backgroundColor: currentTheme.background,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0',
    boxSizing: 'border-box' as const
  };

  return (
    <div style={containerStyle}>
      {/* Main Content Container */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        maxWidth: '100%',
        textAlign: 'center',
        padding: '20px'
      }}>
        

        {/* Question */}
        <div style={{ 
          width: '100%',
          marginBottom: '40px'
        }}>
          <p style={{
            color: currentTheme.text,
            fontSize: '32px',
            fontWeight: '700',
            lineHeight: '1.4',
            margin: '0 0 40px 0'
          }}>
            {currentQuestion.text}
          </p>

          {/* Answer Options */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'row', 
            gap: '8px',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            flexWrap: 'wrap'
          }}>
            {[1, 2, 3, 4, 5].map((value) => (
              <label key={value} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                padding: '8px 12px',
                borderRadius: '8px',
                backgroundColor: questionResponses[currentQuestion.id] === value ? 
                  (theme === 'light' ? '#ECFDF5' : '#064E3B') : 
                  'transparent',
                minWidth: '80px',
                transition: 'all 0.2s',
                color: currentTheme.text,
                border: 'none'
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
                    accentColor: currentTheme.primary,
                    flexShrink: 0
                  }}
                />
                <span style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  textAlign: 'center',
                  whiteSpace: 'nowrap'
                }}>
                  {value} - {responseLabels[value as keyof typeof responseLabels]}
                </span>
              </label>
            ))}
          </div>
        </div>



        {/* Progress Bar */}
        <div style={{
          width: '100%',
          maxWidth: '500px',
          height: '8px',
          backgroundColor: currentTheme.cardBg,
          borderRadius: '4px',
          overflow: 'hidden',
          marginBottom: '40px'
        }}>
          <div style={{
            height: '100%',
            backgroundColor: currentTheme.primary,
            width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
            transition: 'width 0.3s ease'
          }} />
        </div>


      </div>
    </div>
  );
};

export default SelfReportQuestions;
