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
  }
  // astrodrift and kitchenQuest removed to simulate incomplete progress
}; 