import { UserResults } from '../components/GameResultsPage';

export const mockUserResults: UserResults = {
  berryBlitz: {
    rounds: [
      {
        timeToTargetFruit: 5200,
        stepsTaken: 20,
        optimalSteps: 12,
        redundantMoves: 6,
        idleTime: 1200,
        collisionsWithShuriken: 1,
        transitionAdaptTime: 300
      },
      {
        timeToTargetFruit: 5000,
        stepsTaken: 26,
        optimalSteps: 12,
        redundantMoves: 6,
        idleTime: 1200,
        collisionsWithShuriken: 1,
        transitionAdaptTime: 300
      },
      {
        timeToTargetFruit: 4200,
        stepsTaken: 22,
        optimalSteps: 12,
        redundantMoves: 6,
        idleTime: 1200,
        collisionsWithShuriken: 1,
        transitionAdaptTime: 0
      }
    ],
    selfReport: {
      q1_focusDifficulty: 4,
      q2_forgetfulness: 3,
      q3_restlessness: 5,
      q4_impulsivity: 4,
      q5_followThrough: 5
    },
    scores: {
      inattention: 7.2,
      hyperactivity: 6.4,
      impulsivity: 8.5,
      executive_function: 7.1,
      adhd_composite: 7.3
    }
  },
  astrodrift: {
    rounds: [
      {
        timeToComplete: 45000,
        asteroidsAvoided: 12,
        asteroidsHit: 3,
        aliensDefeated: 8,
        questionsAnswered: 5,
        questionsCorrect: 4,
        reactionTime: 850,
        focusBreaks: 2,
        navigationErrors: 4,
        optimalPathDeviation: 15
      },
      {
        timeToComplete: 52000,
        asteroidsAvoided: 15,
        asteroidsHit: 2,
        aliensDefeated: 10,
        questionsAnswered: 5,
        questionsCorrect: 3,
        reactionTime: 920,
        focusBreaks: 3,
        navigationErrors: 6,
        optimalPathDeviation: 22
      },
      {
        timeToComplete: 48000,
        asteroidsAvoided: 18,
        asteroidsHit: 1,
        aliensDefeated: 12,
        questionsAnswered: 5,
        questionsCorrect: 5,
        reactionTime: 780,
        focusBreaks: 1,
        navigationErrors: 2,
        optimalPathDeviation: 8
      }
    ],
    selfReport: {
      q1_focusDifficulty: 5,
      q2_forgetfulness: 4,
      q3_restlessness: 6,
      q4_impulsivity: 5,
      q5_followThrough: 4
    },
    scores: {
      inattention: 6.8,
      hyperactivity: 7.2,
      impulsivity: 7.8,
      executive_function: 6.5,
      adhd_composite: 7.1
    }
  }
  // kitchenQuest removed to simulate incomplete progress
}; 