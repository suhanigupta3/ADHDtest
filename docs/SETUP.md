# ADHD Assessment Platform Setup

## Overview
This is an interactive ADHD self-assessment platform built with React, TypeScript, Tailwind CSS, and Firebase.

## Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Firebase account

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Firebase Setup:**
   - Create a new Firebase project at https://console.firebase.google.com/
   - Enable Authentication with Email/Password and Google providers
   - Enable Firestore Database
   - Enable Storage
   - Copy your Firebase configuration

3. **Environment Configuration:**
   Create a `.env` file in the root directory with your Firebase configuration:
   ```
   REACT_APP_FIREBASE_API_KEY=your-api-key-here
   REACT_APP_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your-project-id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   REACT_APP_FIREBASE_APP_ID=your-app-id
   ```

4. **Start the development server:**
   ```bash
   npm start
   ```

## Features Implemented

### ✅ Welcome Page
- Engaging animated background with floating icons
- Brief introduction to the platform's purpose
- Feature highlights (Interactive Games, Educational Content, Personalized Results)
- Consent form with checkbox validation
- CTA buttons: "Start Assessment", "Learn About ADHD", "Log In / Sign Up"
- Modern, accessible design with Tailwind CSS

### ✅ Login/Signup Page
- Email/password authentication using Firebase Auth
- Google social login integration
- Form validation and error handling
- Password visibility toggle
- Forgot password functionality
- Seamless switching between login and signup modes
- Persistent session handling
- Responsive design with smooth animations

### ✅ Authentication System
- Firebase Authentication integration
- Protected routes for authenticated users
- Public routes that redirect authenticated users
- Context-based state management
- Automatic session persistence

### ✅ Dashboard (Basic)
- Welcome message with user information
- Navigation to assessment, results, and learning sections
- Logout functionality
- Responsive card-based layout

## Project Structure
```
src/
├── components/
│   ├── WelcomePage.tsx      # Landing page with animations
│   ├── AuthPage.tsx         # Login/Signup forms
│   └── Dashboard.tsx        # User dashboard
├── contexts/
│   └── AuthContext.tsx      # Authentication context
├── firebase/
│   └── config.ts           # Firebase configuration
├── App.tsx                 # Main app with routing
└── index.css              # Tailwind CSS styles
```

## Design Features
- **Color Scheme:** Primary blue, secondary purple, success green
- **Typography:** Inter font family
- **Animations:** Framer Motion for smooth transitions
- **Icons:** React Icons (Font Awesome, Material Design)
- **Responsive:** Mobile-first design approach
- **Accessibility:** Focus states, proper contrast, semantic HTML

## Next Steps
1. Integrate Unity games for assessment
2. Add educational content pages
3. Implement results tracking and analytics
4. Add user profile management
5. Create assessment progress tracking
6. Add professional referral system

## Technologies Used
- **Frontend:** React 18, TypeScript
- **Styling:** Tailwind CSS
- **Authentication:** Firebase Auth
- **Database:** Firestore
- **Storage:** Firebase Storage
- **Animations:** Framer Motion
- **Icons:** React Icons
- **Routing:** React Router DOM

## Development Commands
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App (not recommended)

## Firebase Security Rules
Remember to configure proper security rules for Firestore and Storage in your Firebase console.

## Support
This platform is designed for educational purposes and should not replace professional medical evaluation. 