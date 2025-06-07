import { Box, Container, Heading, Text, Button, HStack, Flex, Image, Grid } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

// Cute, thick-outlined brain icon
const BrainIcon = ({ size = 110 }) => (
  <svg width={size} height={size} viewBox="0 0 110 110" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="55" cy="55" r="50" fill="#e6ddc4" stroke="#6b7c4c" strokeWidth="6"/>
    <path d="M38 75 Q30 55 38 40 Q46 25 55 35 Q64 25 72 40 Q80 55 72 75 Q64 95 55 85 Q46 95 38 75 Z" fill="#a26b4c" stroke="#6b7c4c" strokeWidth="5"/>
    <ellipse cx="48" cy="65" rx="6" ry="6" fill="#6b7c4c"/>
    <ellipse cx="62" cy="65" rx="6" ry="6" fill="#6b7c4c"/>
    <path d="M50 78 Q55 83 60 78" stroke="#6b7c4c" strokeWidth="3" strokeLinecap="round"/>
  </svg>
);

export default function Welcome() {
  // Color palette
  const bg = '#e6ddc4'; // soft beige
  const brown = '#a26b4c';
  const green = '#6b7c4c';
  const cardBg = '#dbe7d2'; // soft green (no white)
  const cardShadow = '0 4px 24px 0 rgba(75, 96, 67, 0.08)';
  const cardBorder = '#b7c4a3';
  const fontFamily = '"Inter", "Nunito", "Quicksand", Arial, sans-serif';

  return (
    <Box minH="100vh" bg={bg} fontFamily={fontFamily} px={[2, 4, 8]}>
      {/* NAV BAR */}
      <Flex as="nav" bg={green} color="#f6f1e7" px={[6, 12]} py={3} align="center" fontWeight="600" fontSize={["md", "lg"]} borderRadius="0 0 2xl 2xl">
        <HStack spacing={3} align="center">
          <Image src="/logo.png" alt="ADHDR Logo" boxSize="38px" borderRadius="full" mr={2} />
          <Text fontWeight="bold" fontSize={["2xl", "2xl", "2xl"]} letterSpacing="0.04em">
            ADHDR
          </Text>
          <Box as={RouterLink} to="/" _hover={{ color: brown, textDecoration: 'underline' }} ml={6} pr={2}>
            Home
          </Box>
        </HStack>
        <Flex ml="auto">
          <HStack spacing={[8, 12]}>
            <Box as={RouterLink} to="/about-adhd" _hover={{ color: brown, textDecoration: 'underline' }}>
              About ADHD
            </Box>
            <Box as={RouterLink} to="/about-us" _hover={{ color: brown, textDecoration: 'underline' }}>
              About Us
            </Box>
            <Box as={RouterLink} to="/games" _hover={{ color: brown, textDecoration: 'underline' }}>
              Assessment
            </Box>
            <Box as={RouterLink} to="/results" _hover={{ color: brown, textDecoration: 'underline' }}>
              Results
            </Box>
            <Box as={RouterLink} to="/signup" _hover={{ color: brown, textDecoration: 'underline' }}>
              Sign Up
            </Box>
            <Box as={RouterLink} to="/login" _hover={{ color: brown, textDecoration: 'underline' }}>
              Log In
            </Box>
          </HStack>
        </Flex>
      </Flex>

      {/* MAIN CONTENT: fill the page with padding */}
      <Box minH="calc(100vh - 64px)" display="flex" flexDirection="column" justifyContent="center" alignItems="center" px={[2, 4, 8]} py={[8, 12, 16]}>
        {/* HERO SECTION */}
        <Flex direction={["column", "row"]} align="center" justify="center" w="full" maxW="1200px" mb={[10, 16]}>
          {/* Left: Headline and CTA */}
          <Box flex="1" minW="320px" maxW="600px" pr={[0, 10]} mb={[10, 0]}>
            <Heading
              fontSize={["3xl", "5xl", "6xl"]}
              color={green}
              fontWeight="bold"
              mb={2}
              lineHeight={1.2}
            >
              Dynamic ADHD Assessment
            </Heading>
            <Heading as="h2" fontSize={["2xl", "3xl", "4xl"]} color={brown} fontWeight="bold" mb={4} lineHeight={1.1}>
              Discover your strengths
            </Heading>
            <Text fontSize={["md", "lg", "xl"]} color={green} fontWeight="500" mb={8}>
              A modern, science-backed tool for personalized ADHD insights. Get started with engaging, interactive games designed for you.
            </Text>
            <Button
              as={RouterLink}
              to="/consent"
              size="lg"
              bg={brown}
              color="#fff"
              _hover={{ bg: '#7d4e2d', boxShadow: 'lg' }}
              px={10}
              py={6}
              borderRadius="full"
              fontWeight="bold"
              fontSize={["lg", "xl"]}
              boxShadow="md"
            >
              Get started
            </Button>
          </Box>
          {/* Right: Logo with fully curved background */}
          <Box
            flex="1"
            minW="300px"
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <Image
              src="/images/ADHDtestlogo.png"
              alt="ADHDR Logo"
              boxSize={["160px", "220px", "260px"]}
              objectFit="contain"
              borderRadius="full"
              bg="transparent"
              fallbackSrc="https://via.placeholder.com/150?text=ADHDR"
            />
          </Box>
        </Flex>

        {/* CARD SECTION */}
        <Grid
          templateColumns={["1fr", null, "1fr 1fr"]}
          gap={[10, 12, 16]}
          mt={[16, 20]}
        >
          <Box
            bg={cardBg}
            borderRadius="xl"
            p={[8, 10]}
            boxShadow="base"
            border={`1px solid ${cardBorder}`}
            maxW="100%"
            minH="180px"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            mb={[6, 0]}
          >
            <Heading
              fontSize={["lg", "2xl"]}
              mb={3}
              color={green}
              fontWeight="bold"
            >
              What is this?
            </Heading>
            <Text fontSize={["md", "lg"]} color={green} fontWeight="medium">
              A dynamic, interactive ADHD assessment using short, engaging games. Get a snapshot of your attention and executive function, tailored to you.
            </Text>
          </Box>

          <Box
            bg={cardBg}
            borderRadius="xl"
            p={[8, 10]}
            boxShadow="base"
            border={`1px solid ${cardBorder}`}
            maxW="100%"
            minH="180px"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            mt={[6, 0]}
          >
            <Heading
              fontSize={["lg", "2xl"]}
              mb={3}
              color={green}
              fontWeight="bold"
            >
              Why take it?
            </Heading>
            <Text fontSize={["md", "lg"]} color={green} fontWeight="medium">
              Receive personalized insights and resources. This tool is friendly, non-judgmental, and helpful for anyone curious about their cognitive patterns.
            </Text>
          </Box>
        </Grid>

        {/* DISCLAIMER */}
        <Text
          mt={[12, 16]}
          textAlign="center"
          fontWeight="bold"
          fontSize="md"
          color={green}
        >
          <Box
            as="span"
            background={cardBg}
            px={4}
            py={2}
            borderRadius="xl"
            border={`1px solid ${cardBorder}`}
          >
            <b>Disclaimer:</b> This is not a diagnostic tool.
          </Box>
        </Text>
      </Box>
    </Box>
  );
} 