import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Heading,
  Text,
  VStack,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Progress,
  Tooltip,
} from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';

interface Game {
  id: number;
  title: string;
  description: string;
  unityPath: string;
  instructions: string;
}

const games: Game[] = [
  {
    id: 1,
    title: "Attention Span Test",
    description: "Test your ability to maintain focus over time",
    unityPath: "/games/attention-test",
    instructions: "Click the button when it turns green. Stay focused!"
  },
  {
    id: 2,
    title: "Working Memory Challenge",
    description: "Evaluate your working memory capacity",
    unityPath: "/games/memory-test",
    instructions: "Remember the sequence of patterns and repeat them"
  },
  {
    id: 3,
    title: "Impulse Control",
    description: "Measure your impulse control abilities",
    unityPath: "/games/impulse-test",
    instructions: "Only click when the correct target appears"
  },
  {
    id: 4,
    title: "Task Switching",
    description: "Assess your ability to switch between tasks",
    unityPath: "/games/switch-test",
    instructions: "Switch between different rules as quickly as possible"
  }
];

export default function Games() {
  const { currentUser } = useAuth();
  const [completedGames, setCompletedGames] = useState<number[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    // Load completed games from Firebase
    // This is a placeholder - implement actual Firebase integration
    const loadProgress = async () => {
      if (currentUser) {
        // Load user's progress from Firebase
        // setCompletedGames(loadedGames);
      }
    };
    loadProgress();
  }, [currentUser]);

  const handleGameClick = (game: Game) => {
    const nextGameId = completedGames.length + 1;
    if (game.id === nextGameId) {
      setSelectedGame(game);
      onOpen();
    }
  };

  const handleGameComplete = async (gameId: number) => {
    setCompletedGames([...completedGames, gameId]);
    // Save progress to Firebase
    onClose();
  };

  return (
    <Box bg="gray.50" minH="calc(100vh - 64px)" py={10}>
      <Container maxW="1200px">
        <VStack spacing={8}>
          <Heading>ADHD Assessment Games</Heading>
          <Progress
            value={(completedGames.length / games.length) * 100}
            size="lg"
            colorScheme="blue"
            w="full"
            maxW="800px"
          />
          <Text>
            Completed {completedGames.length} of {games.length} games
          </Text>

          <Grid
            templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
            gap={8}
            w="full"
          >
            {games.map((game) => {
              const isAvailable = game.id === completedGames.length + 1;
              const isCompleted = completedGames.includes(game.id);

              return (
                <Tooltip
                  key={game.id}
                  label={!isAvailable ? "Complete previous games first" : game.instructions}
                  placement="top"
                >
                  <Box
                    bg="white"
                    p={6}
                    borderRadius="xl"
                    boxShadow="lg"
                    cursor={isAvailable ? "pointer" : "not-allowed"}
                    opacity={isAvailable ? 1 : 0.6}
                    onClick={() => isAvailable && handleGameClick(game)}
                    transition="all 0.2s"
                    _hover={isAvailable ? { transform: "translateY(-4px)" } : {}}
                  >
                    <VStack align="start" spacing={4}>
                      <Heading size="md">{game.title}</Heading>
                      <Text color="gray.600">{game.description}</Text>
                      {isCompleted && (
                        <Text color="green.500" fontWeight="bold">
                          Completed ✓
                        </Text>
                      )}
                    </VStack>
                  </Box>
                </Tooltip>
              );
            })}
          </Grid>
        </VStack>

        <Modal isOpen={isOpen} onClose={onClose} size="full">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{selectedGame?.title}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {selectedGame && (
                <iframe
                  src={selectedGame.unityPath}
                  style={{
                    width: "100%",
                    height: "calc(100vh - 100px)",
                    border: "none",
                  }}
                  title={selectedGame.title}
                />
              )}
            </ModalBody>
          </ModalContent>
        </Modal>
      </Container>
    </Box>
  );
} 