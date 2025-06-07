import { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Grid,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
} from '@chakra-ui/react';

interface Topic {
  id: string;
  title: string;
  content: string;
  subtopics?: Topic[];
}

const adhdTopics: Topic = {
  id: 'root',
  title: 'ADHD Overview',
  content: 'Attention Deficit Hyperactivity Disorder (ADHD) is a neurodevelopmental disorder that affects both children and adults.',
  subtopics: [
    {
      id: 'types',
      title: 'Types of ADHD',
      content: 'There are three main types of ADHD: Predominantly Inattentive, Predominantly Hyperactive-Impulsive, and Combined Type.',
      subtopics: [
        {
          id: 'inattentive',
          title: 'Inattentive Type',
          content: 'Difficulty sustaining attention, following instructions, and organizing tasks.'
        },
        {
          id: 'hyperactive',
          title: 'Hyperactive-Impulsive Type',
          content: 'Excessive fidgeting, talking, and impulsive decision-making.'
        },
        {
          id: 'combined',
          title: 'Combined Type',
          content: 'Symptoms of both inattention and hyperactivity-impulsivity.'
        }
      ]
    },
    {
      id: 'symptoms',
      title: 'Common Symptoms',
      content: 'ADHD symptoms can vary widely between individuals and may change over time.',
      subtopics: [
        {
          id: 'attention',
          title: 'Attention Difficulties',
          content: 'Trouble focusing, easily distracted, forgetful in daily activities.'
        },
        {
          id: 'impulsivity',
          title: 'Impulsivity',
          content: 'Acting without thinking, interrupting others, difficulty waiting turns.'
        },
        {
          id: 'organization',
          title: 'Organization Issues',
          content: 'Problems with time management, planning, and completing tasks.'
        }
      ]
    },
    {
      id: 'treatment',
      title: 'Treatment Options',
      content: 'ADHD can be effectively managed through various treatment approaches.',
      subtopics: [
        {
          id: 'medication',
          title: 'Medication',
          content: 'Stimulant and non-stimulant medications can help manage symptoms.'
        },
        {
          id: 'therapy',
          title: 'Behavioral Therapy',
          content: 'Cognitive behavioral therapy and other forms of counseling can help develop coping strategies.'
        },
        {
          id: 'lifestyle',
          title: 'Lifestyle Changes',
          content: 'Regular exercise, healthy diet, and good sleep habits can help manage symptoms.'
        }
      ]
    }
  ]
};

export default function AboutADHD() {
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleTopicClick = (topic: Topic) => {
    setSelectedTopic(topic);
    onOpen();
  };

  const renderTopicCircle = (topic: Topic, level: number = 0) => {
    const colors = ['blue.500', 'purple.500', 'pink.500', 'teal.500'];
    const size = 120 - (level * 20);
    const isRoot = level === 0;

    return (
      <Box
        key={topic.id}
        position="relative"
        display="flex"
        flexDirection="column"
        alignItems="center"
        mb={8}
      >
        <Button
          w={size}
          h={size}
          borderRadius="full"
          bg={colors[level % colors.length]}
          color="white"
          fontSize={isRoot ? "xl" : "md"}
          fontWeight="bold"
          onClick={() => handleTopicClick(topic)}
          _hover={{ transform: 'scale(1.05)' }}
          transition="all 0.2s"
        >
          {topic.title}
        </Button>

        {topic.subtopics && (
          <Grid
            templateColumns={`repeat(${topic.subtopics.length}, 1fr)`}
            gap={8}
            mt={8}
            position="relative"
          >
            {topic.subtopics.map((subtopic) => (
              <Box key={subtopic.id}>
                {renderTopicCircle(subtopic, level + 1)}
              </Box>
            ))}
          </Grid>
        )}
      </Box>
    );
  };

  return (
    <Box bg="gray.50" minH="calc(100vh - 64px)" py={10}>
      <Container maxW="1200px">
        <VStack spacing={8}>
          <Heading>Understanding ADHD</Heading>
          <Text textAlign="center" maxW="800px" color="gray.600">
            Explore the different aspects of ADHD by clicking on the circles below.
            Each topic provides detailed information about various aspects of ADHD.
          </Text>

          <Box w="full" overflowX="auto" py={8}>
            {renderTopicCircle(adhdTopics)}
          </Box>
        </VStack>

        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{selectedTopic?.title}</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <Text>{selectedTopic?.content}</Text>
            </ModalBody>
          </ModalContent>
        </Modal>
      </Container>
    </Box>
  );
} 