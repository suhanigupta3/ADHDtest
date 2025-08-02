# Game Results Page - Comprehensive Guide

## Overview

The GameResultsPage component provides a comprehensive view of ADHD assessment results across multiple games. It displays both individual game results and combined results with detailed analytics and insights.

## Features

### 1. Combined Results View
- **Overall ADHD Composite Score**: Displays the average score across all completed games
- **Individual Domain Scores**: Shows scores for Inattention, Hyperactivity, Impulsivity, and Executive Function
- **Score Interpretation**: Color-coded levels (Low, Mild, Moderate, High) with descriptions
- **Game Performance Summary**: Quick overview of each game's performance

### 2. Individual Game Results
- **Game-Specific Scores**: Detailed breakdown of ADHD domains for each game
- **Performance Tables**: Detailed round-by-round performance data
- **Self-Report Analysis**: Visual representation of user responses to game-specific questions
- **Game Insights**: Calculated metrics and performance analysis

### 3. Interactive Navigation
- **Tab-based Navigation**: Easy switching between combined results and individual games
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Loading States**: Proper loading and error handling

## Firebase Schema

The component expects user results to be stored in Firebase with the following structure:

```typescript
interface UserResults {
  berryBlitz?: GameData;
  astrodrift?: GameData;
  kitchenQuest?: GameData;
  [key: string]: GameData | undefined;
}

interface GameData {
  rounds: GameRound[];
  selfReport: SelfReport;
  scores: GameScores;
}

interface GameScores {
  inattention: number;
  hyperactivity: number;
  impulsivity: number;
  executive_function: number;
  adhd_composite: number;
}
```

### Example Data Structure

```json
{
  "berryBlitz": {
    "rounds": [
      {
        "timeToTargetFruit": 5200,
        "stepsTaken": 20,
        "optimalSteps": 12,
        "redundantMoves": 6,
        "idleTime": 1200,
        "collisionsWithShuriken": 1,
        "transitionAdaptTime": 300
      }
    ],
    "selfReport": {
      "q1_focusDifficulty": 4,
      "q2_forgetfulness": 3,
      "q3_restlessness": 5,
      "q4_impulsivity": 4,
      "q5_followThrough": 5
    },
    "scores": {
      "inattention": 7.2,
      "hyperactivity": 6.4,
      "impulsivity": 8.5,
      "executive_function": 7.1,
      "adhd_composite": 7.3
    }
  }
}
```

## Score Interpretation

The component uses the following scoring system:

- **Low (0-3)**: Minimal ADHD symptoms
- **Mild (3-6)**: Some ADHD symptoms present
- **Moderate (6-8)**: Moderate ADHD symptoms
- **High (8-10)**: Significant ADHD symptoms

## Component Structure

### Main Components

1. **GameResultsPage**: Main component that orchestrates the entire results view
2. **Score Cards**: Individual cards displaying domain scores with interpretations
3. **Performance Tables**: Detailed tables showing round-by-round performance
4. **Self-Report Visualizations**: Interactive displays of user questionnaire responses
5. **Game Insights**: Calculated metrics and performance analysis

### Key Functions

- `calculateCombinedScores()`: Computes average scores across all games
- `getScoreInterpretation()`: Provides color-coded interpretations of scores
- `renderScoreCard()`: Creates individual score display cards
- `renderGameRoundsTable()`: Generates performance tables
- `renderSelfReportTable()`: Creates self-report visualizations
- `renderGameInsights()`: Provides game-specific performance insights

## Usage

### Basic Implementation

```tsx
import GameResultsPage from './components/GameResultsPage';

// In your App.tsx or router
<Route 
  path="/results" 
  element={
    <ProtectedRoute>
      <GameResultsPage />
    </ProtectedRoute>
  } 
/>
```

### Testing with Mock Data

```tsx
import { mockUserResults } from './utils/mockResults';

// For testing purposes, you can modify the component to use mock data
const [userResults, setUserResults] = useState(mockUserResults);
```

## Styling

The component uses Tailwind CSS with custom color schemes:

- **Primary Colors**: darkforest (green tones)
- **Secondary Colors**: earth (brown tones)
- **Status Colors**: 
  - Green: Low scores
  - Yellow: Mild scores
  - Orange: Moderate scores
  - Red: High scores

### CSS Classes Used

- `.card`: Main container styling
- `.btn-primary`: Primary button styling
- `.btn-secondary`: Secondary button styling
- Custom color classes: `darkforest-*`, `earth-*`

## Responsive Design

The component is fully responsive with:

- **Mobile**: Single column layout with stacked cards
- **Tablet**: Two-column grid for score cards
- **Desktop**: Four-column grid for score cards and side-by-side charts

## Error Handling

The component includes comprehensive error handling:

- **Loading States**: Spinner and loading messages
- **Error States**: Error messages with retry options
- **Empty States**: Helpful messages when no results are available
- **Data Validation**: Proper null checks and fallbacks

## Future Enhancements

### Planned Features

1. **Chart Integration**: Add Chart.js for visual data representation
2. **Export Functionality**: PDF/CSV export of results
3. **Progress Tracking**: Historical results comparison
4. **Recommendations**: Personalized recommendations based on scores
5. **Sharing**: Social sharing of results (anonymized)

### Chart Types to Add

- **Radar Charts**: For combined ADHD profile visualization
- **Line Charts**: For performance trends over rounds
- **Bar Charts**: For game comparison
- **Doughnut Charts**: For score distribution

## Integration with Unity Games

The component is designed to work with Unity games that send data to Firebase. Each game should:

1. **Track Performance Metrics**: Record round-by-round performance data
2. **Collect Self-Reports**: Gather user responses to ADHD-related questions
3. **Calculate Scores**: Compute ADHD domain scores using game-specific algorithms
4. **Store Results**: Save data to Firebase under the user's document

## Security Considerations

- **Authentication Required**: Results are only accessible to authenticated users
- **Data Privacy**: User data is protected and not shared
- **Input Validation**: All data is validated before processing
- **Error Boundaries**: Graceful handling of malformed data

## Performance Optimization

- **Lazy Loading**: Data is fetched only when needed
- **Memoization**: Expensive calculations are memoized
- **Virtual Scrolling**: For large datasets (future enhancement)
- **Image Optimization**: Efficient loading of visual elements

## Accessibility

- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Keyboard Navigation**: Full keyboard accessibility
- **Color Contrast**: WCAG compliant color schemes
- **Focus Management**: Proper focus indicators and management

## Browser Compatibility

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **Mobile Browsers**: iOS Safari, Chrome Mobile
- **Progressive Enhancement**: Graceful degradation for older browsers

This comprehensive game results page provides users with detailed insights into their ADHD assessment performance while maintaining a clean, accessible, and responsive user interface. 