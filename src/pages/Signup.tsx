import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  Link,
  FormErrorMessage,
  useToast
} from '@chakra-ui/react';

export default function Signup() {
  const { signup } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signup(email, password);
      toast({
        title: 'Account created!',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
      navigate('/games');
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxW="400px" mx="auto" mt={16} p={8} bg="white" borderRadius="xl" boxShadow="xl">
      <VStack spacing={6} as="form" onSubmit={handleSubmit}>
        <Heading size="lg">Create Account</Heading>
        <FormControl isRequired isInvalid={!!error}>
          <FormLabel>Email</FormLabel>
          <Input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
        </FormControl>
        <FormControl isRequired isInvalid={!!error}>
          <FormLabel>Password</FormLabel>
          <Input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter your password"
          />
          {error && <FormErrorMessage>{error}</FormErrorMessage>}
        </FormControl>
        <Button type="submit" colorScheme="blue" isLoading={loading} w="full">
          Sign Up
        </Button>
        <Text fontSize="sm">
          Already have an account?{' '}
          <Link as={RouterLink} to="/login" color="blue.500">
            Log In
          </Link>
        </Text>
      </VStack>
    </Box>
  );
} 