import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ResourcesPage: React.FC = () => {
  const [currentMood, setCurrentMood] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [showMoodMessage, setShowMoodMessage] = useState(false);

  // IMPORTANT MEDICAL DISCLAIMER
  const MedicalDisclaimer = () => (
    <div className="bg-amber-900/30 border border-amber-600 rounded-lg p-6 mb-8">
      <div className="flex items-start gap-3">
        <svg className="w-6 h-6 text-amber-400 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <div>
          <h3 className="text-amber-300 font-bold text-lg mb-2 tracking-tight">Medical Disclaimer</h3>
          <div className="text-sage-200 text-professional space-y-2">
            <p><strong>This website is for educational and informational purposes only.</strong> It is not intended to provide medical advice, diagnosis, or treatment.</p>
            <p><strong>Always consult with qualified healthcare professionals</strong> for proper diagnosis, treatment, and medical advice regarding ADHD or any other health condition.</p>
            <p><strong>The information provided here is not a substitute for professional medical care.</strong> Never disregard professional medical advice or delay seeking treatment because of information found on this website.</p>
            <p><strong>If you are experiencing a medical emergency, call emergency services immediately.</strong></p>
          </div>
        </div>
      </div>
    </div>
  );

  const moods = [
    { icon: 'smile', name: 'Happy', color: 'emerald', message: 'Great! Let\'s keep that positive energy flowing!' },
    { icon: 'heart', name: 'Calm', color: 'sage', message: 'Peaceful vibes! Perfect for learning and growth.' },
    { icon: 'lightbulb', name: 'Curious', color: 'sleek', message: 'Wonderful! Curiosity leads to amazing discoveries!' },
    { icon: 'alert-circle', name: 'Frustrated', color: 'amber', message: 'It\'s okay to feel this way. Let\'s find some helpful strategies together.' },
    { icon: 'moon', name: 'Tired', color: 'slate', message: 'Rest is important! Take it easy and be kind to yourself.' },
    { icon: 'target', name: 'Focused', color: 'emerald', message: 'Excellent focus! You\'re ready to tackle anything!' }
  ];

  const sections = [
    {
      id: 'what-is-adhd',
      title: 'What is ADHD?',
      icon: 'brain',
      color: 'emerald',
      description: 'Understanding the basics of ADHD'
    },
    {
      id: 'symptoms',
      title: 'Common Symptoms',
      icon: 'clipboard-list',
      color: 'sleek',
      description: 'Recognizing ADHD symptoms'
    },
    {
      id: 'diagnosis',
      title: 'Diagnosis & Assessment',
      icon: 'clipboard-check',
      color: 'sage',
      description: 'Professional evaluation process'
    },
    {
      id: 'treatment',
      title: 'Treatment Options',
      icon: 'medical-cross',
      color: 'emerald',
      description: 'Evidence-based interventions'
    },
    {
      id: 'management',
      title: 'Management Strategies',
      icon: 'tools',
      color: 'amber',
      description: 'Practical tips and strategies'
    },
    {
      id: 'exercise',
      title: 'Exercise & Wellness',
      icon: 'activity',
      color: 'sleek',
      description: 'Movement and mindfulness'
    },
    {
      id: 'nutrition',
      title: 'Nutrition & Diet',
      icon: 'food',
      color: 'sage',
      description: 'Dietary considerations for ADHD'
    },
    {
      id: 'sleep',
      title: 'Sleep & ADHD',
      icon: 'moon',
      color: 'emerald',
      description: 'Sleep hygiene and management'
    },
    {
      id: 'academic',
      title: 'Academic Support',
      icon: 'academic-cap',
      color: 'amber',
      description: 'Educational accommodations'
    },
    {
      id: 'workplace',
      title: 'Workplace Success',
      icon: 'briefcase',
      color: 'sleek',
      description: 'Professional strategies'
    },
    {
      id: 'relationships',
      title: 'Relationships & Social',
      icon: 'heart',
      color: 'sage',
      description: 'Building healthy connections'
    },
    {
      id: 'support',
      title: 'Getting Support',
      icon: 'users',
      color: 'emerald',
      description: 'Professional help and resources'
    }
  ];

  const getIcon = (iconName: string) => {
    const icons: { [key: string]: JSX.Element } = {
      smile: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      heart: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      lightbulb: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      'alert-circle': (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      moon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ),
      target: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      brain: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      'clipboard-list': (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      tools: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      activity: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      users: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      star: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
      calendar: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      home: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      clock: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      user: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      phone: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      rocket: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      sparkles: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
      'clipboard-check': (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 8l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      'medical-cross': (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      food: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
        </svg>
      ),
      'academic-cap': (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        </svg>
      ),
      briefcase: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
        </svg>
      )
    };
    return icons[iconName] || icons.star;
  };

  const handleMoodSelect = (mood: typeof moods[0]) => {
    setCurrentMood(mood.name);
    setShowMoodMessage(true);
    setTimeout(() => setShowMoodMessage(false), 3000);
  };

  const getMoodColor = (moodName: string) => {
    const mood = moods.find(m => m.name === moodName);
    return mood ? mood.color : 'emerald';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-950 via-sleek-950 to-emerald-950">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <motion.h1 
              className="text-4xl md:text-5xl font-bold text-white mb-6 breathe tracking-tight"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              ADHD Resources
            </motion.h1>
            <motion.p 
              className="text-xl text-sage-200 max-w-3xl mx-auto leading-relaxed text-professional-large"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              Your friendly guide to understanding and managing ADHD
            </motion.p>
          </div>

          {/* How's Your Day Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="bg-gradient-to-r from-sleek-800/50 to-emerald-800/50 rounded-2xl p-8 mb-8 border border-sleek-700 shadow-lg"
          >
            <div className="text-center mb-6">
              <motion.div
                className="text-6xl mb-4 text-amber-300"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                {getIcon('star')}
              </motion.div>
              <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">How's your day going?</h2>
              <p className="text-sage-200 text-professional">Take a moment to check in with yourself</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
              {moods.map((mood, index) => (
                <motion.button
                  key={mood.name}
                  onClick={() => handleMoodSelect(mood)}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                    currentMood === mood.name
                      ? `border-${mood.color}-400 bg-${mood.color}-800/50`
                      : 'border-sage-600 bg-sage-800/30 hover:border-sage-400'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
                >
                  <div className="flex justify-center mb-3">
                    <div className="text-3xl text-white">{getIcon(mood.icon)}</div>
                  </div>
                  <div className="text-sm font-medium text-white tracking-tight text-center">{mood.name}</div>
                </motion.button>
              ))}
            </div>

            <AnimatePresence>
              {showMoodMessage && currentMood && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className={`text-center p-4 rounded-xl bg-${getMoodColor(currentMood)}-800/50 border border-${getMoodColor(currentMood)}-600`}
                >
                  <p className="text-white font-medium text-professional">
                    {moods.find(m => m.name === currentMood)?.message}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Interactive Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mb-8"
          >
            <h3 className="text-2xl font-bold text-white mb-6 text-center tracking-tight">What would you like to explore?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sections.map((section, index) => (
                <motion.button
                  key={section.id}
                  onClick={() => setSelectedSection(selectedSection === section.id ? null : section.id)}
                  className={`p-6 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                    selectedSection === section.id
                      ? `border-${section.color}-400 bg-${section.color}-800/50`
                      : 'border-sage-600 bg-sage-800/30 hover:border-sage-400'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                >
                  <div className="flex justify-center mb-4">
                    <div className="text-4xl text-white">{getIcon(section.icon)}</div>
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-3 tracking-tight text-center">{section.title}</h4>
                  <p className="text-sm text-sage-200 text-professional text-center">{section.description}</p>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Dynamic Content Sections */}
          <AnimatePresence mode="wait">
            {selectedSection && (
              <motion.div
                key={selectedSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-r from-sleek-800/50 to-emerald-800/50 rounded-2xl p-8 border border-sleek-700 shadow-lg"
              >
                {selectedSection === 'what-is-adhd' && (
                  <div>
                    <div className="flex items-center mb-6">
                      <div className="text-4xl mr-6 text-emerald-300 flex-shrink-0">{getIcon('brain')}</div>
                      <h3 className="text-2xl font-bold text-white tracking-tight">What is ADHD?</h3>
                    </div>
                    <p className="text-sage-200 mb-6 leading-relaxed text-professional">
                      ADHD (Attention-Deficit/Hyperactivity Disorder) is a neurodevelopmental condition that affects how your brain works. 
                      It's like having a super-powered brain that sometimes works a bit differently!
                    </p>
                    
                    <div className="grid md:grid-cols-3 gap-4 mb-6">
                      <motion.div 
                        className="bg-emerald-800/50 rounded-lg p-4 border border-emerald-700"
                        whileHover={{ scale: 1.02 }}
                      >
                        <h4 className="font-semibold text-emerald-300 mb-2 flex items-center gap-2 tracking-tight">
                          <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          Inattentive Type
                        </h4>
                        <p className="text-sage-300 text-sm text-professional">Difficulty focusing, easily distracted, forgetful</p>
                      </motion.div>
                      <motion.div 
                        className="bg-sleek-800/50 rounded-lg p-4 border border-sleek-700"
                        whileHover={{ scale: 1.02 }}
                      >
                        <h4 className="font-semibold text-sleek-300 mb-2 tracking-tight flex items-center gap-2">
                          <svg className="w-4 h-4 text-sleek-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          Hyperactive Type
                        </h4>
                        <p className="text-sage-300 text-sm text-professional">Always moving, talking a lot, impulsive</p>
                      </motion.div>
                      <motion.div 
                        className="bg-sage-800/50 rounded-lg p-4 border border-sage-700"
                        whileHover={{ scale: 1.02 }}
                      >
                        <h4 className="font-semibold text-sage-300 mb-2 tracking-tight flex items-center gap-2">
                          <svg className="w-4 h-4 text-sage-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Combined Type
                        </h4>
                        <p className="text-sage-300 text-sm text-professional">Mix of both inattentive and hyperactive symptoms</p>
                      </motion.div>
                    </div>
                  </div>
                )}

                {selectedSection === 'symptoms' && (
                  <div>
                    <div className="flex items-center mb-6">
                      <div className="text-4xl mr-6 text-sleek-300 flex-shrink-0">{getIcon('clipboard-list')}</div>
                      <h3 className="text-2xl font-bold text-white tracking-tight">Common ADHD Symptoms</h3>
                    </div>
                    
                    <div className="grid lg:grid-cols-2 gap-6">
                      <motion.div 
                        className="bg-sleek-800/50 rounded-lg p-6 border border-sleek-700"
                        whileHover={{ scale: 1.01 }}
                      >
                        <h4 className="text-xl font-semibold text-sleek-300 mb-4 flex items-center gap-2 tracking-tight">
                          <svg className="w-5 h-5 text-sleek-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          Focus Challenges
                        </h4>
                        <ul className="space-y-2 text-sage-200">
                  <li className="flex items-start">
                            <span className="text-sleek-400 mr-2">•</span>
                            <span className="text-professional">Getting easily distracted</span>
                  </li>
                  <li className="flex items-start">
                            <span className="text-sleek-400 mr-2">•</span>
                            <span className="text-professional">Difficulty staying on task</span>
                  </li>
                  <li className="flex items-start">
                            <span className="text-sleek-400 mr-2">•</span>
                            <span className="text-professional">Forgetting things easily</span>
                  </li>
                  <li className="flex items-start">
                            <span className="text-sleek-400 mr-2">•</span>
                            <span className="text-professional">Making careless mistakes</span>
                  </li>
                </ul>
                      </motion.div>
                      
                      <motion.div 
                        className="bg-emerald-800/50 rounded-lg p-6 border border-emerald-700"
                        whileHover={{ scale: 1.01 }}
                      >
                        <h4 className="text-xl font-semibold text-emerald-300 mb-4 tracking-tight flex items-center gap-2">
                          <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          Energy & Impulse
                        </h4>
                        <ul className="space-y-2 text-sage-200">
                  <li className="flex items-start">
                            <span className="text-emerald-400 mr-2">•</span>
                            <span className="text-professional">Feeling restless or fidgety</span>
                  </li>
                  <li className="flex items-start">
                            <span className="text-emerald-400 mr-2">•</span>
                            <span className="text-professional">Talking a lot or interrupting</span>
                  </li>
                  <li className="flex items-start">
                            <span className="text-emerald-400 mr-2">•</span>
                            <span className="text-professional">Acting without thinking</span>
                  </li>
                  <li className="flex items-start">
                            <span className="text-emerald-400 mr-2">•</span>
                            <span className="text-professional">Difficulty waiting your turn</span>
                  </li>
                </ul>
                      </motion.div>
              </div>
            </div>
                )}

                {selectedSection === 'management' && (
                  <div>
                    <div className="flex items-center mb-6">
                      <div className="text-4xl mr-6 text-sage-300 flex-shrink-0">{getIcon('tools')}</div>
                      <h3 className="text-2xl font-bold text-white tracking-tight">Management Strategies</h3>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      {[
                        {
                          title: "Create Routines",
                          icon: "calendar",
                          content: "Set up daily schedules and stick to them. Routines help your brain know what to expect!",
                          color: "emerald"
                        },
                        {
                          title: "Break Tasks Down",
                          icon: "target",
                          content: "Big tasks can feel overwhelming. Break them into smaller, manageable pieces.",
                          color: "sleek"
                        },
                        {
                          title: "Organize Your Space",
                          icon: "home",
                          content: "A tidy environment helps reduce distractions and makes it easier to focus.",
                          color: "sage"
                        },
                        {
                          title: "Use Timers",
                          icon: "clock",
                          content: "Set timers for work periods and breaks. The Pomodoro technique works great!",
                          color: "amber"
                        }
                      ].map((strategy, index) => (
          <motion.div
                          key={strategy.title}
                          className={`bg-${strategy.color}-800/50 rounded-lg p-6 border border-${strategy.color}-700`}
                          whileHover={{ scale: 1.02 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1, duration: 0.5 }}
                        >
                          <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-3 tracking-tight">
                            <div className="flex-shrink-0">{getIcon(strategy.icon)}</div>
                            <span>{strategy.title}</span>
                          </h4>
                          <p className="text-sage-200 text-professional">{strategy.content}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedSection === 'exercise' && (
                  <div>
                    <div className="flex items-center mb-6">
                      <div className="text-4xl mr-6 text-amber-300 flex-shrink-0">{getIcon('activity')}</div>
                      <h3 className="text-2xl font-bold text-white tracking-tight">Exercise & Wellness</h3>
                    </div>
                    
                    <p className="text-sage-200 mb-6 text-professional">
                      Movement is like medicine for your brain! Here are some activities that can help:
                    </p>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <motion.div 
                        className="bg-emerald-800/50 rounded-lg p-6 border border-emerald-700"
                        whileHover={{ scale: 1.02 }}
                      >
                        <h4 className="text-xl font-semibold text-emerald-300 mb-4 tracking-tight flex items-center gap-2">
                          <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          Mindfulness & Yoga
                        </h4>
                        <ul className="space-y-2 text-sage-200">
                          <li className="text-professional">• Improves focus and attention</li>
                          <li className="text-professional">• Reduces stress and anxiety</li>
                          <li className="text-professional">• Helps with emotional regulation</li>
                          <li className="text-professional">• Builds self-awareness</li>
                        </ul>
                      </motion.div>
                      
                      <motion.div 
                        className="bg-sleek-800/50 rounded-lg p-6 border border-sleek-700"
                        whileHover={{ scale: 1.02 }}
                      >
                        <h4 className="text-xl font-semibold text-sleek-300 mb-4 tracking-tight flex items-center gap-2">
                          <svg className="w-5 h-5 text-sleek-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          Physical Exercise
                        </h4>
                        <ul className="space-y-2 text-sage-200">
                          <li className="text-professional">• Boosts dopamine and serotonin</li>
                          <li className="text-professional">• Improves executive function</li>
                          <li className="text-professional">• Reduces hyperactivity</li>
                          <li className="text-professional">• Better sleep quality</li>
                        </ul>
                      </motion.div>
                    </div>
                  </div>
                )}

                {selectedSection === 'diagnosis' && (
                  <div>
                    <div className="flex items-center mb-6">
                      <div className="text-4xl mr-6 text-sage-300 flex-shrink-0">{getIcon('clipboard-check')}</div>
                      <h3 className="text-2xl font-bold text-white tracking-tight">Diagnosis & Assessment</h3>
                    </div>
                    
                    <p className="text-sage-200 mb-6 leading-relaxed text-professional">
                      ADHD diagnosis requires a comprehensive evaluation by qualified healthcare professionals. The process involves multiple assessments and should follow established clinical guidelines.
                    </p>
                    
                    <div className="grid lg:grid-cols-2 gap-6 mb-6">
                      <motion.div 
                        className="bg-sage-800/50 rounded-lg p-6 border border-sage-700"
                        whileHover={{ scale: 1.01 }}
                      >
                        <h4 className="text-xl font-semibold text-sage-300 mb-4 tracking-tight">Professional Evaluation Process</h4>
                        <ul className="space-y-2 text-sage-200">
                          <li className="text-professional">• Clinical interview and history taking</li>
                          <li className="text-professional">• Behavioral rating scales and questionnaires</li>
                          <li className="text-professional">• Cognitive and neuropsychological testing</li>
                          <li className="text-professional">• Medical examination to rule out other conditions</li>
                          <li className="text-professional">• Input from family, teachers, or employers</li>
                        </ul>
                      </motion.div>
                      
                      <motion.div 
                        className="bg-emerald-800/50 rounded-lg p-6 border border-emerald-700"
                        whileHover={{ scale: 1.01 }}
                      >
                        <h4 className="text-xl font-semibold text-emerald-300 mb-4 tracking-tight">DSM-5 Criteria</h4>
                        <p className="text-sage-200 text-professional mb-3">
                          ADHD diagnosis follows the Diagnostic and Statistical Manual of Mental Disorders (DSM-5) criteria:
                        </p>
                        <ul className="space-y-2 text-sage-200">
                          <li className="text-professional">• Persistent pattern of inattention and/or hyperactivity-impulsivity</li>
                          <li className="text-professional">• Symptoms present before age 12</li>
                          <li className="text-professional">• Symptoms present in two or more settings</li>
                          <li className="text-professional">• Clear evidence of functional impairment</li>
                        </ul>
                      </motion.div>
              </div>
              
                    <div className="bg-sleek-800/30 border border-sleek-600 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-sleek-300 mb-3 tracking-tight">Trusted Resources</h4>
                      <div className="space-y-3 text-sage-200">
                        <div>
                          <p className="font-semibold text-sleek-300">American Academy of Pediatrics (AAP)</p>
                          <p className="text-professional">Clinical practice guidelines for ADHD diagnosis and treatment</p>
                        </div>
                        <div>
                          <p className="font-semibold text-sleek-300">American Psychiatric Association</p>
                          <p className="text-professional">DSM-5 diagnostic criteria and clinical guidelines</p>
                        </div>
                        <div>
                          <p className="font-semibold text-sleek-300">CHADD (Children and Adults with ADHD)</p>
                          <p className="text-professional">Evidence-based information and support resources</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedSection === 'treatment' && (
                  <div>
                    <div className="flex items-center mb-6">
                      <div className="text-4xl mr-6 text-emerald-300 flex-shrink-0">{getIcon('medical-cross')}</div>
                      <h3 className="text-2xl font-bold text-white tracking-tight">Treatment Options</h3>
              </div>
              
                    <p className="text-sage-200 mb-6 leading-relaxed text-professional">
                      ADHD treatment typically involves a multimodal approach combining medication, behavioral therapy, and lifestyle modifications. Treatment plans should be individualized and monitored by healthcare professionals.
                    </p>
                    
                    <div className="grid lg:grid-cols-2 gap-6 mb-6">
                      <motion.div 
                        className="bg-emerald-800/50 rounded-lg p-6 border border-emerald-700"
                        whileHover={{ scale: 1.01 }}
                      >
                        <h4 className="text-xl font-semibold text-emerald-300 mb-4 tracking-tight">Medication Options</h4>
                        <div className="space-y-3 text-sage-200">
                          <div>
                            <p className="font-semibold text-emerald-300">Stimulant Medications</p>
                            <p className="text-professional">Methylphenidate (Ritalin, Concerta) and amphetamines (Adderall, Vyvanse) are first-line treatments with 70-80% effectiveness rates.</p>
                          </div>
                          <div>
                            <p className="font-semibold text-emerald-300">Non-Stimulant Medications</p>
                            <p className="text-professional">Atomoxetine (Strattera), guanfacine (Intuniv), and clonidine (Kapvay) for those who don't respond to or tolerate stimulants.</p>
              </div>
            </div>
          </motion.div>

          <motion.div
                        className="bg-sleek-800/50 rounded-lg p-6 border border-sleek-700"
                        whileHover={{ scale: 1.01 }}
                      >
                        <h4 className="text-xl font-semibold text-sleek-300 mb-4 tracking-tight">Behavioral Therapies</h4>
                        <ul className="space-y-2 text-sage-200">
                          <li className="text-professional">• Cognitive Behavioral Therapy (CBT)</li>
                          <li className="text-professional">• Parent training and family therapy</li>
                          <li className="text-professional">• Social skills training</li>
                          <li className="text-professional">• Organizational skills training</li>
                          <li className="text-professional">• Mindfulness-based interventions</li>
                  </ul>
                </motion.div>
                    </div>

                    <div className="bg-amber-800/30 border border-amber-600 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-amber-300 mb-3 tracking-tight">Evidence-Based Resources</h4>
                      <div className="space-y-3 text-sage-200">
                        <div>
                          <p className="font-semibold text-amber-300">National Institute of Mental Health (NIMH)</p>
                          <p className="text-professional">Research-based information on ADHD treatments and clinical trials</p>
                        </div>
                        <div>
                          <p className="font-semibold text-amber-300">Cochrane Reviews</p>
                          <p className="text-professional">Systematic reviews of treatment effectiveness and safety</p>
                        </div>
                        <div>
                          <p className="font-semibold text-amber-300">American Academy of Child and Adolescent Psychiatry</p>
                          <p className="text-professional">Practice parameters for ADHD treatment in children and adolescents</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedSection === 'nutrition' && (
                  <div>
                    <div className="flex items-center mb-6">
                      <div className="text-4xl mr-6 text-sage-300 flex-shrink-0">{getIcon('food')}</div>
                      <h3 className="text-2xl font-bold text-white tracking-tight">Nutrition & Diet</h3>
                    </div>
                    
                    <p className="text-sage-200 mb-6 leading-relaxed text-professional">
                      While no specific diet cures ADHD, certain nutritional strategies may help manage symptoms. Research suggests that diet quality, meal timing, and specific nutrients can impact ADHD symptoms and overall brain function.
                    </p>
                    
                    <div className="grid lg:grid-cols-2 gap-6 mb-6">
                      <motion.div 
                        className="bg-sage-800/50 rounded-lg p-6 border border-sage-700"
                        whileHover={{ scale: 1.01 }}
                      >
                        <h4 className="text-xl font-semibold text-sage-300 mb-4 tracking-tight">Evidence-Based Dietary Approaches</h4>
                        <div className="space-y-3 text-sage-200">
                          <div>
                            <p className="font-semibold text-sage-300">Omega-3 Fatty Acids</p>
                            <p className="text-professional">Studies show modest benefits for attention and hyperactivity. Found in fatty fish, flaxseeds, and walnuts.</p>
                          </div>
                          <div>
                            <p className="font-semibold text-sage-300">Protein-Rich Breakfast</p>
                            <p className="text-professional">High-protein meals may improve focus and reduce medication side effects.</p>
                          </div>
                          <div>
                            <p className="font-semibold text-sage-300">Complex Carbohydrates</p>
                            <p className="text-professional">Whole grains provide steady energy and may help with mood stability.</p>
                          </div>
            </div>
          </motion.div>

          <motion.div
                        className="bg-emerald-800/50 rounded-lg p-6 border border-emerald-700"
                        whileHover={{ scale: 1.01 }}
                      >
                        <h4 className="text-xl font-semibold text-emerald-300 mb-4 tracking-tight">Foods to Limit</h4>
                        <ul className="space-y-2 text-sage-200">
                          <li className="text-professional">• High-sugar foods and beverages</li>
                          <li className="text-professional">• Artificial food colorings and preservatives</li>
                          <li className="text-professional">• Excessive caffeine</li>
                          <li className="text-professional">• Processed foods high in additives</li>
                        </ul>
                        <p className="text-sage-200 text-professional mt-3">
                          <strong>Note:</strong> Individual responses vary. Consult with healthcare providers before making significant dietary changes.
                        </p>
                      </motion.div>
                    </div>

                    <div className="bg-sleek-800/30 border border-sleek-600 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-sleek-300 mb-3 tracking-tight">Scientific Resources</h4>
                      <div className="space-y-3 text-sage-200">
                        <div>
                          <p className="font-semibold text-sleek-300">Journal of Attention Disorders</p>
                          <p className="text-professional">Peer-reviewed research on nutrition and ADHD</p>
                        </div>
                        <div>
                          <p className="font-semibold text-sleek-300">Academy of Nutrition and Dietetics</p>
                          <p className="text-professional">Evidence-based nutrition guidelines and resources</p>
                        </div>
                      </div>
                    </div>
                </div>
                )}

                {selectedSection === 'sleep' && (
                  <div>
                    <div className="flex items-center mb-6">
                      <div className="text-4xl mr-6 text-emerald-300 flex-shrink-0">{getIcon('moon')}</div>
                      <h3 className="text-2xl font-bold text-white tracking-tight">Sleep & ADHD</h3>
            </div>
                    
                    <p className="text-sage-200 mb-6 leading-relaxed text-professional">
                      Sleep problems are common in individuals with ADHD, with up to 70% experiencing sleep difficulties. Poor sleep can worsen ADHD symptoms, while good sleep hygiene can significantly improve attention, mood, and behavior.
                    </p>
                    
                    <div className="grid lg:grid-cols-2 gap-6 mb-6">
                      <motion.div 
                        className="bg-emerald-800/50 rounded-lg p-6 border border-emerald-700"
                        whileHover={{ scale: 1.01 }}
                      >
                        <h4 className="text-xl font-semibold text-emerald-300 mb-4 tracking-tight">Common Sleep Issues</h4>
                        <ul className="space-y-2 text-sage-200">
                          <li className="text-professional">• Difficulty falling asleep (insomnia)</li>
                          <li className="text-professional">• Restless sleep and frequent waking</li>
                          <li className="text-professional">• Sleep-disordered breathing</li>
                          <li className="text-professional">• Restless legs syndrome</li>
                          <li className="text-professional">• Delayed sleep phase syndrome</li>
                        </ul>
          </motion.div>

          <motion.div
                        className="bg-sleek-800/50 rounded-lg p-6 border border-sleek-700"
                        whileHover={{ scale: 1.01 }}
                      >
                        <h4 className="text-xl font-semibold text-sleek-300 mb-4 tracking-tight">Sleep Hygiene Strategies</h4>
                        <ul className="space-y-2 text-sage-200">
                          <li className="text-professional">• Consistent sleep schedule (even on weekends)</li>
                          <li className="text-professional">• Cool, dark, quiet bedroom environment</li>
                          <li className="text-professional">• Avoid screens 1-2 hours before bedtime</li>
                          <li className="text-professional">• Relaxation techniques (deep breathing, meditation)</li>
                          <li className="text-professional">• Regular exercise (but not close to bedtime)</li>
                        </ul>
                      </motion.div>
                    </div>

                    <div className="bg-amber-800/30 border border-amber-600 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-amber-300 mb-3 tracking-tight">Professional Resources</h4>
                      <div className="space-y-3 text-sage-200">
                        <div>
                          <p className="font-semibold text-amber-300">American Academy of Sleep Medicine</p>
                          <p className="text-professional">Clinical guidelines for sleep disorders and ADHD</p>
                        </div>
                        <div>
                          <p className="font-semibold text-amber-300">Sleep Foundation</p>
                          <p className="text-professional">Evidence-based sleep hygiene recommendations</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedSection === 'academic' && (
                  <div>
                    <div className="flex items-center mb-6">
                      <div className="text-4xl mr-6 text-amber-300 flex-shrink-0">{getIcon('academic-cap')}</div>
                      <h3 className="text-2xl font-bold text-white tracking-tight">Academic Support</h3>
                    </div>
                    
                    <p className="text-sage-200 mb-6 leading-relaxed text-professional">
                      Students with ADHD are entitled to educational accommodations under federal law. These supports can help level the playing field and enable academic success.
                    </p>
                    
                    <div className="grid lg:grid-cols-2 gap-6 mb-6">
                      <motion.div 
                        className="bg-amber-800/50 rounded-lg p-6 border border-amber-700"
                        whileHover={{ scale: 1.01 }}
                      >
                        <h4 className="text-xl font-semibold text-amber-300 mb-4 tracking-tight">Legal Rights & Accommodations</h4>
                        <div className="space-y-3 text-sage-200">
                          <div>
                            <p className="font-semibold text-amber-300">Section 504 (Rehabilitation Act)</p>
                            <p className="text-professional">Protects students with disabilities from discrimination and ensures equal access to education.</p>
                          </div>
                          <div>
                            <p className="font-semibold text-amber-300">Individuals with Disabilities Education Act (IDEA)</p>
                            <p className="text-professional">Provides special education services and Individualized Education Programs (IEPs).</p>
                          </div>
                          <div>
                            <p className="font-semibold text-amber-300">Americans with Disabilities Act (ADA)</p>
                            <p className="text-professional">Protects against discrimination in higher education and employment.</p>
                          </div>
                        </div>
                      </motion.div>
                      
                      <motion.div 
                        className="bg-sleek-800/50 rounded-lg p-6 border border-sleek-700"
                        whileHover={{ scale: 1.01 }}
                      >
                        <h4 className="text-xl font-semibold text-sleek-300 mb-4 tracking-tight">Common Accommodations</h4>
                        <ul className="space-y-2 text-sage-200">
                          <li className="text-professional">• Extended time on tests and assignments</li>
                          <li className="text-professional">• Preferential seating and reduced distractions</li>
                          <li className="text-professional">• Note-taking assistance or recorded lectures</li>
                          <li className="text-professional">• Breaks during long tasks</li>
                          <li className="text-professional">• Use of assistive technology</li>
                          <li className="text-professional">• Modified assignments and grading</li>
                        </ul>
                      </motion.div>
                    </div>

                    <div className="bg-emerald-800/30 border border-emerald-600 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-emerald-300 mb-3 tracking-tight">Educational Resources</h4>
                      <div className="space-y-3 text-sage-200">
                        <div>
                          <p className="font-semibold text-emerald-300">U.S. Department of Education</p>
                          <p className="text-professional">Information on disability rights and educational accommodations</p>
                        </div>
                        <div>
                          <p className="font-semibold text-emerald-300">Wrightslaw</p>
                          <p className="text-professional">Comprehensive information on special education law and advocacy</p>
                        </div>
                        <div>
                          <p className="font-semibold text-emerald-300">Understood.org</p>
                          <p className="text-professional">Resources for learning and thinking differences</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedSection === 'workplace' && (
                  <div>
                    <div className="flex items-center mb-6">
                      <div className="text-4xl mr-6 text-sleek-300 flex-shrink-0">{getIcon('briefcase')}</div>
                      <h3 className="text-2xl font-bold text-white tracking-tight">Workplace Success</h3>
                    </div>
                    
                    <p className="text-sage-200 mb-6 leading-relaxed text-professional">
                      ADHD can present unique challenges in the workplace, but with the right strategies and accommodations, individuals with ADHD can excel in their careers and contribute valuable skills like creativity, problem-solving, and hyperfocus.
                    </p>
                    
                    <div className="grid lg:grid-cols-2 gap-6 mb-6">
                      <motion.div 
                        className="bg-sleek-800/50 rounded-lg p-6 border border-sleek-700"
                        whileHover={{ scale: 1.01 }}
                      >
                        <h4 className="text-xl font-semibold text-sleek-300 mb-4 tracking-tight">Workplace Accommodations</h4>
                        <ul className="space-y-2 text-sage-200">
                          <li className="text-professional">• Flexible work schedules and remote work options</li>
                          <li className="text-professional">• Quiet workspace or noise-canceling headphones</li>
                          <li className="text-professional">• Task management software and organizational tools</li>
                          <li className="text-professional">• Regular check-ins and clear communication</li>
                          <li className="text-professional">• Written instructions and project timelines</li>
                        </ul>
                      </motion.div>
                      
                      <motion.div 
                        className="bg-emerald-800/50 rounded-lg p-6 border border-emerald-700"
                        whileHover={{ scale: 1.01 }}
                      >
                        <h4 className="text-xl font-semibold text-emerald-300 mb-4 tracking-tight">Professional Strengths</h4>
                        <ul className="space-y-2 text-sage-200">
                          <li className="text-professional">• Creative problem-solving and innovative thinking</li>
                          <li className="text-professional">• Ability to hyperfocus on tasks of interest</li>
                          <li className="text-professional">• High energy and enthusiasm for projects</li>
                          <li className="text-professional">• Quick thinking and adaptability</li>
                          <li className="text-professional">• Empathy and understanding of diverse perspectives</li>
                        </ul>
                      </motion.div>
                    </div>

                    <div className="bg-amber-800/30 border border-amber-600 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-amber-300 mb-3 tracking-tight">Professional Development</h4>
                      <div className="space-y-3 text-sage-200">
                        <div>
                          <p className="font-semibold text-amber-300">Job Accommodation Network (JAN)</p>
                          <p className="text-professional">Free guidance on workplace accommodations and disability employment</p>
                        </div>
                        <div>
                          <p className="font-semibold text-amber-300">ADHD Coaches Organization</p>
                          <p className="text-professional">Professional coaching for workplace success and career development</p>
                        </div>
                        <div>
                          <p className="font-semibold text-amber-300">Society for Human Resource Management</p>
                          <p className="text-professional">Resources for employers on inclusive workplace practices</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedSection === 'relationships' && (
                  <div>
                    <div className="flex items-center mb-6">
                      <div className="text-4xl mr-6 text-sage-300 flex-shrink-0">{getIcon('heart')}</div>
                      <h3 className="text-2xl font-bold text-white tracking-tight">Relationships & Social</h3>
                    </div>
                    
                    <p className="text-sage-200 mb-6 leading-relaxed text-professional">
                      ADHD can impact relationships through communication challenges, emotional regulation difficulties, and executive function issues. However, with understanding and effective strategies, individuals with ADHD can build and maintain healthy, fulfilling relationships.
                    </p>
                    
                    <div className="grid lg:grid-cols-2 gap-6 mb-6">
                      <motion.div 
                        className="bg-sage-800/50 rounded-lg p-6 border border-sage-700"
                        whileHover={{ scale: 1.01 }}
                      >
                        <h4 className="text-xl font-semibold text-sage-300 mb-4 tracking-tight">Communication Strategies</h4>
                        <ul className="space-y-2 text-sage-200">
                          <li className="text-professional">• Active listening and eye contact</li>
                          <li className="text-professional">• Using "I" statements and clear expression</li>
                          <li className="text-professional">• Setting aside dedicated time for important conversations</li>
                          <li className="text-professional">• Using visual aids and written reminders</li>
                          <li className="text-professional">• Practicing emotional regulation techniques</li>
                        </ul>
                      </motion.div>
                      
                      <motion.div 
                        className="bg-emerald-800/50 rounded-lg p-6 border border-emerald-700"
                        whileHover={{ scale: 1.01 }}
                      >
                        <h4 className="text-xl font-semibold text-emerald-300 mb-4 tracking-tight">Building Healthy Relationships</h4>
                        <ul className="space-y-2 text-sage-200">
                          <li className="text-professional">• Open communication about ADHD challenges</li>
                          <li className="text-professional">• Setting realistic expectations and boundaries</li>
                          <li className="text-professional">• Regular check-ins and quality time together</li>
                          <li className="text-professional">• Seeking couples or family therapy when needed</li>
                          <li className="text-professional">• Celebrating strengths and achievements</li>
                        </ul>
                      </motion.div>
                    </div>

                    <div className="bg-sleek-800/30 border border-sleek-600 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-sleek-300 mb-3 tracking-tight">Support Resources</h4>
                      <div className="space-y-3 text-sage-200">
                        <div>
                          <p className="font-semibold text-sleek-300">ADHD & Marriage</p>
                          <p className="text-professional">Resources and support for couples affected by ADHD</p>
                        </div>
                        <div>
                          <p className="font-semibold text-sleek-300">American Association for Marriage and Family Therapy</p>
                          <p className="text-professional">Directory of qualified family therapists</p>
                        </div>
                        <div>
                          <p className="font-semibold text-sleek-300">Psychology Today</p>
                          <p className="text-professional">Articles and resources on relationships and ADHD</p>
                        </div>
                      </div>
                </div>
              </div>
                )}

                {selectedSection === 'support' && (
                  <div>
                    <div className="flex items-center mb-6">
                      <div className="text-4xl mr-6 text-emerald-300 flex-shrink-0">{getIcon('users')}</div>
                      <h3 className="text-2xl font-bold text-white tracking-tight">Getting Support</h3>
                    </div>
                    
                    <p className="text-sage-200 mb-6 text-professional">
                      You don't have to navigate ADHD alone! There are many people and resources ready to help.
                    </p>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <motion.div 
                        className="bg-emerald-800/50 rounded-lg p-6 border border-emerald-700"
                        whileHover={{ scale: 1.02 }}
                      >
                        <h4 className="text-xl font-semibold text-emerald-300 mb-4 flex items-center gap-3 tracking-tight">
                          <div className="flex-shrink-0">{getIcon('user')}</div>
                          <span>Professional Help</span>
                        </h4>
                        <ul className="space-y-2 text-sage-200">
                          <li className="text-professional">• Talk to your doctor</li>
                          <li className="text-professional">• Find a therapist or counselor</li>
                          <li className="text-professional">• Consider ADHD coaching</li>
                          <li className="text-professional">• Join support groups</li>
                        </ul>
                      </motion.div>
                      
                      <motion.div 
                        className="bg-sleek-800/50 rounded-lg p-6 border border-sleek-700"
                        whileHover={{ scale: 1.02 }}
                      >
                        <h4 className="text-xl font-semibold text-sleek-300 mb-4 flex items-center gap-3 tracking-tight">
                          <div className="flex-shrink-0">{getIcon('phone')}</div>
                          <span>Crisis Resources</span>
                        </h4>
                        <div className="space-y-3 text-sage-200">
                          <div>
                            <p className="font-semibold text-sleek-300 tracking-tight">National Suicide Prevention Lifeline</p>
                            <p className="text-professional">988 or 1-800-273-8255</p>
                          </div>
                          <div>
                            <p className="font-semibold text-sleek-300 tracking-tight">Crisis Text Line</p>
                            <p className="text-professional">Text HOME to 741741</p>
                          </div>
            </div>
          </motion.div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Encouragement Section */}
          {!selectedSection && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
              className="text-center"
            >
              <div className="bg-gradient-to-r from-sleek-800/50 to-emerald-800/50 rounded-2xl p-8 border border-sleek-700">
                <motion.div
                  className="text-6xl mb-4 text-amber-300"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                >
                  {getIcon('sparkles')}
                </motion.div>
                <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">You're doing great!</h3>
                <p className="text-sage-200 mb-6 text-professional">
                  Remember, ADHD is just one part of who you are. You have unique strengths and talents that make you special!
                </p>
                <motion.button
                  onClick={() => setSelectedSection('what-is-adhd')}
                  className="bg-gradient-to-r from-emerald-600 to-sleek-600 text-white px-8 py-3 rounded-full font-semibold hover:scale-105 transition-transform"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="flex items-center gap-3">
                    <span>Start Exploring!</span>
                    <div className="flex-shrink-0">{getIcon('rocket')}</div>
                  </span>
                </motion.button>
            </div>
          </motion.div>
          )}

          {/* Medical Disclaimer - Bottom of Page */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6, duration: 0.6 }}
            className="mt-16"
          >
            <MedicalDisclaimer />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ResourcesPage; 