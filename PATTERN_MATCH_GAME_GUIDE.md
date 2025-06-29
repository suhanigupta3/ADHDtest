# Pattern Match: Signal Control - Game Guide

## Overview

Pattern Match: Signal Control is a React-based game designed to test pattern recognition, reaction time, and attention control. It replaces the previous Astrodrift game in the ADHD assessment suite.

## Game Mechanics

### Core Concept
- Players must match colored signals in the correct sequence as shown by a target pattern
- Signals appear randomly on a 3x3 grid
- Players have 60 seconds to score as many points as possible
- The game progressively increases in difficulty by adding more complex patterns

### Scoring System
- **Base Score**: 50 points per correct signal
- **Time Bonus**: Faster reactions earn additional points (up to 100 points for sub-1-second reactions)
- **Level Bonus**: Higher levels provide additional points (level × 10)
- **Penalty**: -25 points for incorrect signals
- **Level Progression**: Complete a pattern to advance to the next level

### Difficulty Progression
- **Level 1**: 3-signal patterns
- **Level 2**: 4-signal patterns
- **Level 3**: 5-signal patterns
- **Level 4+**: 6-signal patterns (maximum complexity)

## Game Features

### Visual Design
- Clean, modern interface with purple/blue gradient theme
- Color-coded signals (red, green, blue)
- Progress indicators and real-time feedback
- Responsive design that works on different screen sizes

### User Experience
- Clear instructions before game start
- Real-time score, level, and time display
- Visual progress bar showing pattern completion
- Hover effects and smooth animations
- Escape key support to end game early

## Integration Options

### 1. Embedded in Main App
The game is fully integrated into the ADHD assessment app and can be accessed through:
- Assessment page as the third game
- Uses the `GameWrapper` component for unified interface
- Automatically tracks completion and progress

### 2. Standalone Development
For faster development and testing, use the standalone version:
```
http://localhost:3000/pattern-match-standalone.html
```

## Technical Implementation

### React Component Structure
```typescript
interface PatternMatchGameProps {
  onGameComplete?: (score: number, accuracy: number, reactionTime: number) => void;
  onError?: (error: string) => void;
  width?: string;
  height?: string;
  isStandalone?: boolean;
  userId?: string;
}
```

### Key Components
- **PatternMatchGame**: Main game component
- **GameWrapper**: Unified wrapper for both React and Unity games
- **AssessmentPage**: Updated to include the new game

### Game State Management
```typescript
interface GameState {
  isPlaying: boolean;
  score: number;
  level: number;
  signals: Signal[];
  targetPattern: ('red' | 'green' | 'blue')[];
  currentPatternIndex: number;
  reactionTimes: number[];
  correctResponses: number;
  totalResponses: number;
  gameTime: number;
  maxGameTime: number;
}
```

## Development Workflow

### For Standalone Development
1. Open `public/pattern-match-standalone.html` in your browser
2. Make changes to the game logic in the script section
3. Refresh the page to see changes immediately
4. No build process required for quick iterations

### For App Integration
1. Modify `src/components/PatternMatchGame.tsx`
2. Test changes in the main app
3. Use the standalone version for rapid prototyping

## Performance Considerations

### Optimization Features
- Uses `requestAnimationFrame` for smooth game loop
- Efficient state updates with React hooks
- Automatic cleanup of game resources
- Minimal DOM manipulation

### Memory Management
- Automatic cleanup of game loops on unmount
- Signal cleanup after 3 seconds
- Efficient array operations for state updates

## Accessibility Features

### Keyboard Support
- Escape key to end game
- Tab navigation for interactive elements
- Screen reader friendly labels and titles

### Visual Accessibility
- High contrast color scheme
- Clear visual indicators for current pattern step
- Responsive design for different screen sizes

## Testing the Game

### Standalone Testing
1. Start the development server: `npm start`
2. Navigate to: `http://localhost:3000/pattern-match-standalone.html`
3. Test game mechanics and scoring
4. Check console for detailed performance metrics

### Integration Testing
1. Start the main app: `npm start`
2. Navigate to the assessment page
3. Complete previous games to unlock Pattern Match
4. Test game completion and progress tracking

## Customization Options

### Game Parameters
- **Game Duration**: Modify `maxGameTime` (default: 60 seconds)
- **Signal Frequency**: Adjust timing in game loop
- **Scoring**: Customize point values and bonuses
- **Difficulty**: Modify pattern length progression

### Visual Customization
- **Colors**: Update color schemes in `getSignalColor` and `getTargetColor`
- **Layout**: Modify grid size and spacing
- **Animations**: Adjust transition durations and effects

## Troubleshooting

### Common Issues
1. **Game not starting**: Check browser console for errors
2. **Performance issues**: Ensure `requestAnimationFrame` is working properly
3. **State synchronization**: Verify React state updates are working correctly

### Debug Mode
Enable detailed logging by adding console.log statements in key functions:
- `handleSignalClick`: Track user interactions
- `gameLoop`: Monitor game performance
- `endGame`: Verify completion logic

## Future Enhancements

### Potential Improvements
- Sound effects and audio feedback
- Multiple difficulty modes
- Persistent high scores
- Multiplayer support
- Additional pattern types (shapes, numbers, etc.)
- Analytics and detailed performance metrics

### Integration Possibilities
- Firebase integration for score tracking
- Advanced analytics for ADHD assessment
- Custom difficulty algorithms based on user performance
- Integration with other assessment tools

## File Structure

```
src/
├── components/
│   ├── PatternMatchGame.tsx      # Main game component
│   ├── GameWrapper.tsx           # Unified game wrapper
│   └── AssessmentPage.tsx        # Updated assessment page
public/
└── pattern-match-standalone.html # Standalone development version
```

## Conclusion

Pattern Match: Signal Control provides a modern, engaging way to test attention and pattern recognition skills. Its dual-mode operation (embedded/standalone) makes it ideal for both production use and rapid development iterations.

The game's design prioritizes user experience, performance, and accessibility while providing valuable data for ADHD assessment purposes. 