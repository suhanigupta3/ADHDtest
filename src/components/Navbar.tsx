import {
  Box,
  Flex,
  HStack,
  Image,
  Text,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

export default function Navbar() {
  return (
    <Flex
      as="nav"
      bg="#4b6043"
      color="#f6f1e7"
      px={[4, 8, 12]}
      py={4}
      align="center"
      justify="space-between"
      wrap="wrap"
      boxShadow="sm"
      fontWeight="medium"
      fontSize="md"
    >
      {/* LEFT SECTION: Logo + Home */}
      <HStack spacing={3} align="center">
        <Image
          src="/images/ADHDtestlogo.png"
          alt="ADHDR Logo"
          boxSize="36px"
          borderRadius="full"
          bg="transparent"
        />
        <Text fontWeight="bold" fontSize="xl" letterSpacing="0.05em">
          ADHDR
        </Text>
        <Box as={RouterLink} to="/" _hover={{ textDecoration: "underline" }}>
          Home
        </Box>
        <Box as={RouterLink} to="/about-adhd" _hover={{ textDecoration: "underline" }}>
          About ADHD
        </Box>
        <Box as={RouterLink} to="/about-us" _hover={{ textDecoration: "underline" }}>
          About Us
        </Box>
        <Box as={RouterLink} to="/assessment" _hover={{ textDecoration: "underline" }}>
          Assessment
        </Box>
        <Box as={RouterLink} to="/results" _hover={{ textDecoration: "underline" }}>
          Results
        </Box>
      </HStack>

      {/* RIGHT SECTION: Log In / Sign Up */}
      <HStack spacing={6}>
        <Box as={RouterLink} to="/login" _hover={{ textDecoration: "underline" }}>
          Log In
        </Box>
        <Box as={RouterLink} to="/signup" _hover={{ textDecoration: "underline" }}>
          Sign Up
        </Box>
      </HStack>
    </Flex>
  );
} 