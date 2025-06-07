import { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Checkbox,
  Button,
  useToast,
  Link,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Consent() {
  const [consentGiven, setConsentGiven] = useState(false);
  const [dataConsent, setDataConsent] = useState(false);
  const [researchConsent, setResearchConsent] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  const { signup } = useAuth();

  const handleSubmit = async () => {
    if (!consentGiven || !dataConsent) {
      toast({
        title: "Consent Required",
        description: "Please provide consent to continue.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      // Create a temporary account for the assessment
      const email = `temp_${Date.now()}@adhdtest.com`;
      const password = Math.random().toString(36).slice(-8);
      await signup(email, password);
      
      navigate('/games');
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error creating your account. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box bg="gray.50" minH="calc(100vh - 64px)" py={10}>
      <Container maxW="800px">
        <VStack spacing={8} align="stretch">
          <Heading textAlign="center">Informed Consent</Heading>
          
          <Box bg="white" p={8} borderRadius="xl" boxShadow="lg">
            <VStack spacing={6} align="stretch">
              <Heading size="md">About This Assessment</Heading>
              <Text>
                This ADHD assessment tool is designed to provide preliminary insights
                into cognitive patterns that may be associated with ADHD. It is not
                a diagnostic tool and should not be used as a substitute for
                professional medical advice, diagnosis, or treatment.
              </Text>

              <Heading size="md">What to Expect</Heading>
              <Text>
                The assessment consists of four interactive games that evaluate
                different aspects of attention and executive function. The process
                takes approximately 30-45 minutes to complete. You can take breaks
                between games if needed.
              </Text>

              <Heading size="md">Data Collection and Privacy</Heading>
              <Text>
                We collect anonymous data about your performance in the games to
                improve our assessment tools and contribute to ADHD research. Your
                personal information is protected and will never be shared with
                third parties without your explicit consent.
              </Text>

              <Box borderWidth={1} p={4} borderRadius="md">
                <VStack spacing={4} align="stretch">
                  <Checkbox
                    isChecked={consentGiven}
                    onChange={(e) => setConsentGiven(e.target.checked)}
                  >
                    I understand that this is not a diagnostic tool and that I should
                    consult with a healthcare professional for a proper diagnosis.
                  </Checkbox>

                  <Checkbox
                    isChecked={dataConsent}
                    onChange={(e) => setDataConsent(e.target.checked)}
                  >
                    I consent to the collection and anonymous use of my assessment
                    data for improving the tool and contributing to research.
                  </Checkbox>

                  <Checkbox
                    isChecked={researchConsent}
                    onChange={(e) => setResearchConsent(e.target.checked)}
                  >
                    I agree to participate in research studies related to ADHD
                    assessment (optional).
                  </Checkbox>
                </VStack>
              </Box>

              <Text fontSize="sm" color="gray.600">
                By proceeding, you acknowledge that you have read and understood
                this consent form. If you have any questions, please contact us at{' '}
                <Link color="blue.500" href="mailto:support@adhdtest.com">
                  support@adhdtest.com
                </Link>
                .
              </Text>

              <Button
                colorScheme="blue"
                size="lg"
                onClick={handleSubmit}
                isDisabled={!consentGiven || !dataConsent}
              >
                Begin Assessment
              </Button>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
} 