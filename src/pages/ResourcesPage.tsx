import React from 'react';
import { motion } from 'framer-motion';

const ResourcesPage: React.FC = () => {
  const managementStrategies = [
    {
      title: "1. Seek Professional Help",
      icon: "🏥",
      items: [
        "Get Diagnosed: Consult with a healthcare provider for a proper diagnosis",
        "Medication: Stimulants are commonly prescribed and can be very effective",
        "Nonstimulant medications and antidepressants may also help"
      ]
    },
    {
      title: "2. Utilize Therapy and Support",
      icon: "🤝",
      items: [
        "Cognitive Behavioral Therapy (CBT): Develop skills to improve organization and manage time",
        "Support Groups: Join groups for strategies and emotional support",
        "ADHD Coaching: Work with specialized coaches for personalized strategies"
      ]
    },
    {
      title: "3. Implement Healthy Habits",
      icon: "🌱",
      items: [
        "Regular Exercise: Physical activity helps manage hyperactivity and improve mood",
        "Healthy Diet: Eat balanced meals at regular intervals to maintain energy",
        "Adequate Sleep: Aim for 7-9 hours of sleep and establish a bedtime routine"
      ]
    },
    {
      title: "4. Develop Organizational Strategies",
      icon: "📋",
      items: [
        "Time Management Tools: Use planners, calendars, and apps to track tasks",
        "Declutter Your Space: Keep living and working areas organized",
        "Establish Routines: Create daily routines for structure and consistency"
      ]
    },
    {
      title: "5. Exercise and Yoga Benefits",
      icon: "🧘",
      items: [
        "Yoga improves attention and emotional control",
        "Yoga helps with impulsivity and overall ADHD symptoms",
        "Short-term aerobic exercises help with attention, hyperactivity, and anxiety"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-stone-50">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto"
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              ADHD Resources
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Navigating ADHD with Clarity - Comprehensive resources to support your ADHD journey
            </p>
          </div>

          {/* What is ADHD Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="bg-white rounded-lg shadow-lg p-8 mb-8"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="text-4xl mr-4">🧠</span>
              What is ADHD?
            </h2>
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              Attention-Deficit/Hyperactivity Disorder (ADHD) is a common, lifelong neurodevelopmental 
              disorder typically diagnosed in childhood. Symptoms such as inattention and hyperactivity 
              can significantly impact relationships and social life.
            </p>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-4">ADHD Types:</h3>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">Hyperactive/Impulsive</h4>
                <p className="text-blue-700 text-sm">Difficulty sitting still, excessive talking, acting without thinking</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">Inattentive</h4>
                <p className="text-green-700 text-sm">Short attention span, easily distracted, difficulty organizing</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="font-semibold text-purple-800 mb-2">Combined</h4>
                <p className="text-purple-700 text-sm">Combination of both inattentive and hyperactive symptoms</p>
              </div>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-amber-800 text-sm">
                <strong>Important:</strong> Research indicates genetic factors may contribute to ADHD. 
                It's more frequently diagnosed in biological males, but females with ADHD often have 
                the inattentive type, which can lead to underdiagnosis.
              </p>
            </div>
          </motion.div>

          {/* Symptoms Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="bg-white rounded-lg shadow-lg p-8 mb-8"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="text-4xl mr-4">👶</span>
              Symptoms in Children
            </h2>
            <p className="text-gray-700 mb-6">
              Symptoms tend to show before age 6 and will be present in more than one setting, 
              such as at school and home. Children may display a combination or just one type.
            </p>
            
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-blue-800 mb-4">Signs of Inattentiveness</h3>
                <ul className="space-y-2 text-blue-700">
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    Having a short attention span and being easily distracted
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    Making careless mistakes in schoolwork
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    Appearing forgetful or losing things
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    Unable to stick to tedious or time-consuming tasks
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    Appearing unable to listen to or carry out instructions
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    Constantly changing activity or task
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    Having difficulty organizing tasks
                  </li>
                </ul>
              </div>
              
              <div className="bg-red-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-red-800 mb-4">Signs of Hyperactivity & Impulsiveness</h3>
                <ul className="space-y-2 text-red-700">
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    Unable to sit still, especially in calm or quiet surroundings
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    Constantly fidgeting
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    Unable to concentrate on tasks
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    Excessive physical movement and talking
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    Unable to wait their turn
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    Acting without thinking
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    Interrupting conversations
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    Little or no sense of danger
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* ADHD Spectrum Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="bg-white rounded-lg shadow-lg p-8 mb-8"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="text-4xl mr-4">📊</span>
              ADHD Spectrum
            </h2>
            <p className="text-gray-700 mb-6">
              According to Children and Adults with Attention Deficit/Hyperactivity Disorder (CHADD), 
              the severity of ADHD can be classified into 3 types:
            </p>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-green-800 mb-3">Mild</h3>
                <p className="text-green-700 text-sm">
                  People do not have many other symptoms above the required number for diagnosis. 
                  ADHD symptoms only cause minor difficulties in social, school, or work settings.
                </p>
              </div>
              
              <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-yellow-800 mb-3">Moderate</h3>
                <p className="text-yellow-700 text-sm">
                  Symptoms or functional problems sit between mild and severe levels, requiring 
                  more structured support and interventions.
                </p>
              </div>
              
              <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-red-800 mb-3">Severe</h3>
                <p className="text-red-700 text-sm">
                  People have many additional symptoms beyond those necessary for diagnosis. 
                  Several symptoms cause significant problems in social, school, or work settings.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Management Strategies Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="bg-white rounded-lg shadow-lg p-8 mb-8"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="text-4xl mr-4">🌟</span>
              How to Manage Life With ADHD
            </h2>
            
            <div className="grid lg:grid-cols-2 gap-8">
              {managementStrategies.map((strategy, index) => (
                <motion.div
                  key={strategy.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.6 }}
                  className="bg-gradient-to-br from-darkforest-50 to-earth-50 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <h3 className="text-lg font-semibold text-darkforest-800 mb-4 flex items-center">
                    <span className="text-2xl mr-3">{strategy.icon}</span>
                    {strategy.title}
                  </h3>
                  <ul className="space-y-2">
                    {strategy.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start text-darkforest-700">
                        <span className="text-darkforest-500 mr-2 mt-1">•</span>
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Exercise Benefits Highlight */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8 mb-8"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="text-3xl mr-3">🏃‍♀️</span>
              Exercise & Yoga Benefits for ADHD
            </h3>
            <p className="text-gray-700 mb-4">
              Short-term aerobic exercises and yoga can significantly help with:
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {['Attention', 'Hyperactivity', 'Impulsivity', 'Anxiety', 'Executive Function', 'Social Disorders'].map((benefit, index) => (
                <div key={benefit} className="bg-white rounded-lg p-3 text-center shadow-sm">
                  <span className="text-sm font-medium text-gray-800">{benefit}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Research & Academic Resources */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="bg-white rounded-lg shadow-lg p-8 mb-8"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="text-4xl mr-4">🔬</span>
              Research & Academic Resources
            </h2>
            <p className="text-gray-700 mb-6">
              Access cutting-edge research and academic institutions advancing ADHD understanding and treatment.
            </p>
            
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div className="mb-4 md:mb-0">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      Jahanikia NeuroLab
                    </h3>
                    <p className="text-gray-600 mb-2">
                      Department of Computer Science
                    </p>
                    <p className="text-gray-600 text-sm">
                      Leading research in neurotechnology and adaptive assessment technologies for ADHD diagnosis
                    </p>
                  </div>
                  <a 
                    href="https://www.jneurolab.org/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Visit NeuroLab
                  </a>
                </div>
              </div>

            
            </div>
          </motion.div>

          {/* Crisis Resources */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="bg-red-50 border border-red-200 rounded-lg p-8 mb-8"
          >
            <h3 className="text-xl font-semibold text-red-800 mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Crisis Resources
            </h3>
            <p className="text-red-700 mb-4">
              If you're experiencing a mental health crisis, please reach out for immediate help:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4">
                <p className="font-semibold text-red-800">National Suicide Prevention Lifeline</p>
                <p className="text-red-700">988 or 1-800-273-8255</p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <p className="font-semibold text-red-800">Crisis Text Line</p>
                <p className="text-red-700">Text HOME to 741741</p>
              </div>
            </div>
          </motion.div>

          {/* Additional Resources */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="bg-amber-50 border border-amber-200 rounded-lg p-8 text-center"
          >
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-amber-800 mb-2">
              Professional Support Network
            </h3>
            <p className="text-amber-700">
              Remember: This information is educational. Always consult with qualified healthcare 
              providers for diagnosis, treatment, and personalized management strategies.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ResourcesPage; 