import { ChakraProvider, Box } from "@chakra-ui/react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Welcome from "./pages/Welcome";
import AboutADHD from "./pages/AboutADHD";
import AboutUs from "./pages/AboutUs";
import Games from "./pages/Games";
import Results from "./pages/Results";
import Consent from "./pages/Consent";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

const theme = {
  colors: {
    brand: {
      50: "#E6F6FF",
      100: "#BAE3FF",
      200: "#7CC4FA",
      300: "#47A3F3",
      400: "#2186EB",
      500: "#0967D2",
      600: "#0552B5",
      700: "#03449E",
      800: "#01337D",
      900: "#002159",
    },
  },
  fonts: {
    heading: '"Inter", sans-serif',
    body: '"Inter", sans-serif',
  },
};

function App() {
  console.log("App component rendering...");
  return (
    <ChakraProvider theme={theme}>
      <AuthProvider>
        <Router>
          <Box minH="100vh" bg="gray.50">
            <Routes>
              <Route path="/" element={<Welcome />} />
              <Route path="/about-adhd" element={<AboutADHD />} />
              <Route path="/about-us" element={<AboutUs />} />
              <Route path="/games" element={<Games />} />
              <Route path="/results" element={<Results />} />
              <Route path="/consent" element={<Consent />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
            </Routes>
          </Box>
        </Router>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App;
