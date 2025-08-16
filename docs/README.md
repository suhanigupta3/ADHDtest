# ADHD Assessment Platform

A comprehensive web-based platform for ADHD assessment through interactive games and cognitive tests. This platform combines React-based games with Unity integration to provide a complete assessment experience.

## 🎮 Games Included

- **Berry Blitz** - Unity-based reaction time and coordination game
- **Pattern Match** - React-based pattern recognition and memory game
- **Kitchen Quest** - Unity-based task management and organization game
- **Flutter Focus** - React-based rhythm and timing challenge
- **Bounce Back** - React-based paddle and ball physics game

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account (for data storage)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ADHDtest
```

2. Install dependencies:
```bash
npm install
```

3. Set up Firebase configuration (see [Firebase Setup Guide](docs/firebase-security-rules.md))

4. Start the development server:
```bash
npm start
```

The application will open at [http://localhost:3000](http://localhost:3000)

## 📚 Documentation

### Setup and Configuration
- **[Setup Guide](docs/SETUP.md)** - Complete setup instructions and environment configuration
- **[Firebase Security Rules](docs/firebase-security-rules.md)** - Firebase configuration and security setup

### Unity Integration
- **[Unity Integration Guide](docs/UNITY_INTEGRATION_GUIDE.md)** - How to integrate Unity games with the platform
- **[Unity Build Copy Guide](docs/UNITY_BUILD_COPY_GUIDE.md)** - Instructions for copying Unity builds to the project
- **[Unity Firebase Integration](docs/UNITY_FIREBASE_INTEGRATION.md)** - Unity-Firebase integration for data collection

### Game Development
- **[Pattern Match Game Guide](docs/PATTERN_MATCH_GAME_GUIDE.md)** - Development guide for the Pattern Match game
- **[Game Results Page Guide](docs/GAME_RESULTS_PAGE_GUIDE.md)** - Implementation guide for the results page

## 🛠️ Available Scripts

### Development
```bash
npm start          # Runs the app in development mode
npm test           # Launches the test runner
npm run build      # Builds the app for production
npm run eject      # Ejects from Create React App (one-way operation)
```

### Build and Deployment
```bash
npm run build      # Creates optimized production build
npm run deploy     # Deploys to Firebase Hosting (if configured)
```

## 🏗️ Project Structure

```
ADHDtest/
├── public/                 # Static assets and Unity builds
│   ├── unity-builds/      # Unity game builds
│   └── index.html         # Main HTML file
├── src/
│   ├── components/        # React components
│   │   ├── BounceBack/   # Bounce Back game module
│   │   ├── FlutterFocus/ # Flutter Focus game module
│   │   └── PatternMatch/ # Pattern Match game module
│   ├── contexts/          # React contexts
│   ├── firebase/          # Firebase configuration
│   └── utils/             # Utility functions
├── docs/                  # Documentation files
└── README.md             # This file
```

## 🎯 Features

### Assessment Games
- **Cognitive Testing**: Multiple games designed to assess different ADHD-related skills
- **Data Collection**: Comprehensive data collection for analysis
- **Progress Tracking**: User progress tracking across all games
- **Results Analysis**: Detailed results page with metrics and insights

### Technical Features
- **Responsive Design**: Works on desktop and mobile devices
- **Firebase Integration**: Real-time data storage and synchronization
- **Unity Integration**: Seamless Unity game embedding
- **Modular Architecture**: Clean, maintainable code structure

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:
```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

### Firebase Setup
1. Create a Firebase project
2. Enable Authentication and Firestore
3. Configure security rules (see [Firebase Security Rules](docs/firebase-security-rules.md))
4. Add your Firebase configuration to the environment variables

## 🚀 Deployment

### Firebase Hosting
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login to Firebase: `firebase login`
3. Initialize Firebase: `firebase init`
4. Build the project: `npm run build`
5. Deploy: `firebase deploy`

### Other Platforms
The built application can be deployed to any static hosting service:
- Netlify
- Vercel
- GitHub Pages
- AWS S3

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Test thoroughly
5. Commit your changes: `git commit -m 'Add feature'`
6. Push to the branch: `git push origin feature-name`
7. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the documentation in the `docs/` folder
- Review the setup guides for specific components
- Open an issue on GitHub for bugs or feature requests

## 🔗 Links

- [React Documentation](https://reactjs.org/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Unity Documentation](https://docs.unity3d.com/)
- [Create React App Documentation](https://facebook.github.io/create-react-app/docs/getting-started)
