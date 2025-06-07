import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Grid,
  Image,
  Link,
  Icon,
} from '@chakra-ui/react';
import { FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa';

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  image: string;
  github?: string;
  linkedin?: string;
  email?: string;
}

const teamMembers: TeamMember[] = [
  {
    name: "Dr. Sarah Johnson",
    role: "Clinical Psychologist",
    bio: "Specializes in ADHD assessment and treatment with over 15 years of experience.",
    image: "/team/sarah.jpg",
    linkedin: "https://linkedin.com/in/sarah-johnson",
    email: "sarah@adhdtest.com"
  },
  {
    name: "Michael Chen",
    role: "Game Developer",
    bio: "Expert in creating engaging and scientifically-validated cognitive assessment games.",
    image: "/team/michael.jpg",
    github: "https://github.com/michael-chen",
    linkedin: "https://linkedin.com/in/michael-chen"
  },
  {
    name: "Dr. Emily Rodriguez",
    role: "Research Director",
    bio: "Leads our research team in developing and validating assessment tools.",
    image: "/team/emily.jpg",
    linkedin: "https://linkedin.com/in/emily-rodriguez",
    email: "emily@adhdtest.com"
  }
];

export default function AboutUs() {
  return (
    <Box bg="gray.50" minH="calc(100vh - 64px)" py={10}>
      <Container maxW="1200px">
        <VStack spacing={12}>
          <Box textAlign="center" maxW="800px">
            <Heading mb={4}>Our Mission</Heading>
            <Text fontSize="xl" color="gray.600">
              We're dedicated to making ADHD assessment more accessible and engaging
              through innovative technology and evidence-based approaches.
            </Text>
          </Box>

          <Box w="full">
            <Heading mb={8} textAlign="center">Our Team</Heading>
            <Grid
              templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
              gap={8}
            >
              {teamMembers.map((member) => (
                <Box
                  key={member.name}
                  bg="white"
                  p={6}
                  borderRadius="xl"
                  boxShadow="lg"
                  textAlign="center"
                >
                  <Image
                    src={member.image}
                    alt={member.name}
                    borderRadius="full"
                    boxSize="200px"
                    mx="auto"
                    mb={4}
                    objectFit="cover"
                  />
                  <Heading size="md" mb={2}>{member.name}</Heading>
                  <Text color="blue.500" mb={4}>{member.role}</Text>
                  <Text color="gray.600" mb={4}>{member.bio}</Text>
                  <Box display="flex" justifyContent="center" gap={4}>
                    {member.github && (
                      <Link href={member.github} isExternal>
                        <Icon as={FaGithub} w={6} h={6} />
                      </Link>
                    )}
                    {member.linkedin && (
                      <Link href={member.linkedin} isExternal>
                        <Icon as={FaLinkedin} w={6} h={6} />
                      </Link>
                    )}
                    {member.email && (
                      <Link href={`mailto:${member.email}`}>
                        <Icon as={FaEnvelope} w={6} h={6} />
                      </Link>
                    )}
                  </Box>
                </Box>
              ))}
            </Grid>
          </Box>

          <Box
            bg="white"
            p={8}
            borderRadius="xl"
            boxShadow="lg"
            w="full"
            maxW="800px"
          >
            <VStack spacing={4}>
              <Heading size="lg">Our Approach</Heading>
              <Text>
                We combine clinical expertise with cutting-edge technology to create
                an assessment experience that is both engaging and scientifically
                validated. Our team of experts works together to ensure that our
                tools provide accurate and meaningful insights while maintaining
                the highest standards of user experience and accessibility.
              </Text>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
} 