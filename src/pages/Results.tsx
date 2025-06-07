import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Progress,
  Button,
  Link,
  useToast,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface GameResult {
  gameId: number;
  score: number;
  metrics: {
    [key: string]: number;
  };
}

interface AssessmentResult {
  overallScore: number;
  gameResults: GameResult[];
  recommendations: string[];
}

export default function Results() {
  const [results, setResults] = useState<AssessmentResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();
  const { currentUser } = useAuth();

  useEffect(() => {
    const loadResults = async () => {
      if (!currentUser) {
        navigate('/login');
        return;
      }

      try {
        // Load results from Firebase
        // This is a placeholder - implement actual Firebase integration
        const mockResults: AssessmentResult = {
          overallScore: 75,
          gameResults: [
            {
              gameId: 1,
              score: 80,
              metrics: {
                attention: 85,
                reactionTime: 75,
              },
            },
            {
              gameId: 2,
              score: 70,
              metrics: {
                memory: 65,
                accuracy: 75,
              },
            },
            {
              gameId: 3,
              score: 75,
              metrics: {
                impulseControl: 80,
                consistency: 70,
              },
            },
            {
              gameId: 4,
              score: 75,
              metrics: {
                taskSwitching: 70,
                adaptability: 80,
              },
            },
          ],
          recommendations: [
            "Consider consulting with a healthcare professional for a comprehensive evaluation",
            "Practice mindfulness and meditation techniques",
            "Implement organizational strategies in daily life",
            "Consider cognitive behavioral therapy",
          ],
        };

        setResults(mockResults);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load results. Please try again.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadResults();
  }, [currentUser, navigate, toast]);

  if (isLoading) {
    return (
      <Box bg="gray.50" minH="calc(100vh - 64px)" py={10}>
        <Container maxW="800px">
          <VStack spacing={8}>
            <Heading>Loading Results</Heading>
            <Progress size="lg" isIndeterminate w="full" />
          </VStack>
        </Container>
      </Box>
    );
  }

  if (!results) {
    return (
      <Box bg="gray.50" minH="calc(100vh - 64px)" py={10}>
        <Container maxW="800px">
          <VStack spacing={8}>
            <Heading>No Results Available</Heading>
            <Text>Please complete all games to view your results.</Text>
            <Button colorScheme="blue" onClick={() => navigate('/games')}>
              Return to Games
            </Button>
          </VStack>
        </Container>
      </Box>
    );
  }

  return (
    <Box bg="gray.50" minH="calc(100vh - 64px)" py={10}>
      <Container maxW="800px">
        <VStack spacing={8}>
          <Heading>Your Assessment Results</Heading>

          <Box bg="white" p={8} borderRadius="xl" boxShadow="lg" w="full">
            <VStack spacing={6} align="stretch">
              <Heading size="md">Overall Score</Heading>
              <Progress
                value={results.overallScore}
                size="lg"
                colorScheme="blue"
                borderRadius="full"
              />
              <Text textAlign="center" fontSize="xl" fontWeight="bold">
                {results.overallScore}%
              </Text>
            </VStack>
          </Box>

          <Box bg="white" p={8} borderRadius="xl" boxShadow="lg" w="full">
            <VStack spacing={6} align="stretch">
              <Heading size="md">Game Results</Heading>
              {results.gameResults.map((game) => (
                <Box key={game.gameId} p={4} borderWidth={1} borderRadius="md">
                  <Text fontWeight="bold" mb={2}>
                    Game {game.gameId}
                  </Text>
                  <Progress
                    value={game.score}
                    size="md"
                    colorScheme="blue"
                    mb={2}
                  />
                  <Text>Score: {game.score}%</Text>
                  {Object.entries(game.metrics).map(([key, value]) => (
                    <Text key={key} fontSize="sm" color="gray.600">
                      {key}: {value}%
                    </Text>
                  ))}
                </Box>
              ))}
            </VStack>
          </Box>

          <Box bg="white" p={8} borderRadius="xl" boxShadow="lg" w="full">
            <VStack spacing={6} align="stretch">
              <Heading size="md">Recommendations</Heading>
              {results.recommendations.map((recommendation, index) => (
                <Text key={index}>• {recommendation}</Text>
              ))}
            </VStack>
          </Box>

          <Box textAlign="center">
            <Text mb={4}>
              Remember, this assessment is not a diagnostic tool. Please consult
              with a healthcare professional for a proper evaluation.
            </Text>
            <Link
              href="https://www.psychiatry.org/patients-families/adhd"
              isExternal
              color="blue.500"
            >
              Learn more about ADHD diagnosis and treatment
            </Link>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
} 