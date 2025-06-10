export const adhdData = {
  centerNode: {
    id: "what-is-adhd",
    title: "What is ADHD?",
    color: "orange",
    colorClass: "from-orange-400 to-orange-600",
    icon: "brain",
    definition: "ADHD (Attention Deficit Hyperactivity Disorder) is a neurodevelopmental condition characterized by persistent patterns of inattention, hyperactivity, and impulsivity that interfere with functioning and development. It affects how the brain regulates attention, behavior, and emotions, impacting daily life across multiple settings including home, school, work, and relationships.",
    keyFacts: [
      "Affects approximately 6.1 million children (9.4%) and 4.4% of adults in the US",
      "Neurodevelopmental disorder with strong genetic component (heritability 70-80%)",
      "Not caused by poor parenting, diet, vaccines, or moral failings",
      "Brain differences are visible in neuroimaging studies",
      "Symptoms must be present before age 12 and in multiple settings",
      "More commonly diagnosed in males, but females are often underdiagnosed",
      "Symptoms often persist into adulthood, though may manifest differently"
    ],
    commonMisconceptions: [
      {
        myth: "ADHD is just an excuse for bad behavior or laziness",
        reality: "ADHD is a legitimate medical condition with neurobiological basis affecting executive function"
      },
      {
        myth: "Only hyperactive children have ADHD",
        reality: "ADHD includes inattentive presentation, often missed in girls and quiet children"
      },
      {
        myth: "ADHD medications are dangerous and addictive",
        reality: "When properly prescribed and monitored, ADHD medications are safe and effective"
      },
      {
        myth: "People with ADHD can't succeed academically or professionally",
        reality: "Many successful individuals have ADHD; proper support enables achievement"
      }
    ],
    lifeImpact: {
      academic: "Difficulty with sustained attention, organization, time management, completing assignments",
      social: "Challenges with social cues, impulsive behavior, maintaining friendships",
      occupational: "Problems with deadlines, organization, focus in meetings, job performance",
      emotional: "Higher rates of anxiety, depression, low self-esteem, emotional dysregulation"
    },
    resources: [
      {
        title: "CDC – What is ADHD?",
        url: "https://www.cdc.gov/adhd/about/?CDC_AAref_Val=https://www.cdc.gov/ncbddd/adhd/facts.html",
        type: "external",
        description: "Comprehensive overview from the Centers for Disease Control and Prevention"
      },
      {
        title: "CHADD – Understanding ADHD",
        url: "https://chadd.org/understanding-adhd/",
        type: "external",
        description: "Children and Adults with Attention-Deficit/Hyperactivity Disorder resource center"
      },
      {
        title: "NIMH – ADHD Information",
        url: "https://www.nimh.nih.gov/health/topics/attention-deficit-hyperactivity-disorder-adhd",
        type: "external",
        description: "National Institute of Mental Health comprehensive guide"
      },
      {
        title: "Dr. Russell Barkley on ADHD",
        url: "https://www.youtube.com/watch?v=BzhbAK1pdPM",
        type: "video",
        description: "Leading ADHD researcher explains the condition"
      },
      {
        title: "ADDitude Magazine",
        url: "https://www.additudemag.com/",
        type: "external",
        description: "Comprehensive resource for ADHD information and strategies"
      },
      {
        title: "Jahanikia NeuroLab",
        url: "https://www.jneurolab.org/",
        type: "external",
        description: "Leading research in neurotechnology and adaptive assessment technologies for ADHD"
      },
      {
        title: "NHA Blog Articles",
        url: "https://www.neurohealthalliance.org/articles",
        type: "external",
        description: "Neuro Health Alliance articles on ADHD, mental health, and neuroscience research"
      }
    ]
  },
  nodes: [
    {
      id: "inattentive-type",
      title: "Inattentive Type",
      color: "purple",
      colorClass: "from-purple-400 to-purple-600",
      icon: "focus",
      position: { angle: 0, distance: 280 },
      overview: "Inattentive ADHD (formerly called ADD) is characterized by persistent difficulties with sustained attention, organization, and task completion. Individuals may appear dreamy, forgetful, or disorganized, but are not necessarily hyperactive or disruptive.",
      detailedDescription: "People with inattentive ADHD struggle with the brain's executive functioning systems that control attention, working memory, and cognitive flexibility. This isn't about intelligence or effort—the brain simply processes attention and focus differently.",
      symptoms: [
        "Easily distracted by external stimuli or internal thoughts",
        "Difficulty sustaining attention in tasks or activities",
        "Frequently loses items necessary for tasks (keys, papers, tools)",
        "Forgets daily activities and appointments",
        "Struggles to follow through on instructions or finish tasks",
        "Avoids tasks requiring sustained mental effort",
        "Difficulty organizing tasks and activities",
        "Appears not to listen when spoken to directly",
        "Makes careless mistakes in work or activities"
      ],
      realLifeExamples: [
        {
          name: "Sarah, College Student",
          story: "Sarah starts multiple assignments but rarely finishes them. She loses track of time while reading, forgetting to eat or attend classes. Her backpack is always messy, and she frequently can't find her keys or phone."
        },
        {
          name: "Marcus, Software Developer",
          story: "Marcus is brilliant at solving complex problems but struggles with routine tasks like documentation. He misses meetings, forgets to respond to emails, and his desk is covered in sticky notes that he rarely refers to."
        },
        {
          name: "Elena, Parent and Teacher",
          story: "Elena hyperfocuses on lesson planning but forgets to pick up groceries or call the doctor. She starts organizing her house but gets distracted and leaves projects half-finished throughout the home."
        }
      ],
      cognitiveProfile: {
        strengths: [
          "Deep thinking and creativity",
          "Hyperfocus on interesting topics",
          "Innovative problem-solving",
          "Empathy and emotional sensitivity",
          "Ability to see big picture connections"
        ],
        challenges: [
          "Working memory difficulties",
          "Time blindness and poor time estimation",
          "Executive dysfunction",
          "Difficulty with routine tasks",
          "Problems with sustained attention"
        ]
      },
      statistics: [
        "More common in girls and women than hyperactive type",
        "Often diagnosed later in life, especially in females",
        "Represents about 30-40% of ADHD cases",
        "Frequently co-occurs with anxiety and depression",
        "May be underdiagnosed due to less disruptive behavior"
      ],
      copingStrategies: [
        "Use visual reminders and alarms",
        "Break large tasks into smaller, manageable steps",
        "Create consistent routines and stick to them",
        "Use organizational tools like planners and apps",
        "Find accountability partners",
        "Eliminate distractions when focusing is critical"
      ],
      resources: [
        {
          title: "ADDA – Inattentive ADHD Guide",
          url: "https://add.org/adhd-facts/inattentive-adhd/",
          type: "external",
          description: "Attention Deficit Disorder Association comprehensive guide"
        },
        {
          title: "Women with ADHD",
          url: "https://www.additudemag.com/women-with-adhd/",
          type: "external",
          description: "Understanding ADHD in women and girls"
        },
        {
          title: "Inattentive ADHD in Adults",
          url: "https://chadd.org/for-adults/overview/",
          type: "external",
          description: "CHADD resource for adult inattentive ADHD"
        }
      ],
      myths: [
        {
          myth: "People with inattentive ADHD are just lazy or unmotivated",
          fact: "They often work harder than others to maintain focus and frequently experience mental exhaustion from constant effort"
        },
        {
          myth: "Inattentive ADHD isn't as serious as hyperactive ADHD",
          fact: "It can be equally impairing and often goes unrecognized, leading to years of self-blame and underachievement"
        },
        {
          myth: "If you can focus on things you enjoy, you don't have ADHD",
          fact: "Hyperfocus on preferred activities is actually a common ADHD trait"
        }
      ]
    },
    {
      id: "hyperactive-impulsive-type",
      title: "Hyperactive-Impulsive Type",
      color: "blue",
      colorClass: "from-blue-400 to-blue-600",
      icon: "energy",
      position: { angle: 72, distance: 280 },
      overview: "Hyperactive-Impulsive ADHD is characterized by persistent patterns of hyperactivity and impulsivity that interfere with functioning. This presentation involves excessive energy, restlessness, and difficulty controlling impulses.",
      detailedDescription: "This type involves dysregulation of the brain's inhibitory control systems. The prefrontal cortex, responsible for self-control and impulse regulation, functions differently, leading to difficulties in controlling behavior and managing energy levels.",
      symptoms: [
        "Fidgets with hands or feet, or squirms in seat",
        "Unable to remain seated when expected to do so",
        "Runs or climbs in inappropriate situations",
        "Unable to play or engage in activities quietly",
        "Often 'on the go' or acts as if 'driven by a motor'",
        "Talks excessively without social awareness",
        "Blurts out answers before questions are completed",
        "Difficulty waiting turn in conversations or activities",
        "Interrupts or intrudes on others frequently",
        "Makes important decisions without considering consequences"
      ],
      realLifeExamples: [
        {
          name: "Jake, Elementary Student",
          story: "Jake can't sit still during story time, frequently gets up to sharpen his pencil, and calls out answers without raising his hand. He struggles with playground rules and often plays too roughly with classmates."
        },
        {
          name: "Maria, Sales Executive",
          story: "Maria talks over clients in meetings, makes impulsive business decisions, and struggles to sit through long presentations. She taps her feet constantly and often interrupts colleagues mid-sentence."
        },
        {
          name: "David, Teenager",
          story: "David can't wait his turn in conversations, frequently interrupts his family at dinner, and makes impulsive purchases. He struggles with video games that require patience and often acts without thinking about consequences."
        }
      ],
      developmentalChanges: {
        children: "High physical activity, difficulty with quiet activities, impulsive actions",
        adolescents: "Internal restlessness, risk-taking behaviors, social impulsivity",
        adults: "Feelings of restlessness, impulsive decision-making, difficulty with patience"
      },
      cognitiveProfile: {
        strengths: [
          "High energy and enthusiasm",
          "Spontaneity and creativity",
          "Quick thinking and rapid idea generation",
          "Risk-taking that can lead to innovation",
          "Ability to multitask effectively"
        ],
        challenges: [
          "Impulse control difficulties",
          "Social boundary issues",
          "Risk of accidents or injuries",
          "Difficulty with delayed gratification",
          "Problems with authority figures"
        ]
      },
      statistics: [
        "More commonly diagnosed in boys than girls (3:1 ratio)",
        "Symptoms often become less physically obvious with age",
        "Represents about 25-30% of ADHD cases",
        "Higher risk of accidental injuries and risky behaviors",
        "Often the first type recognized and diagnosed"
      ],
      managementStrategies: [
        "Regular physical exercise to channel energy",
        "Structured environments with clear expectations",
        "Mindfulness and self-awareness techniques",
        "Impulse control strategies and delay techniques",
        "Social skills training for appropriate interactions",
        "Sensory tools like fidget items for focus"
      ],
      resources: [
        {
          title: "CHADD – Hyperactive-Impulsive Symptoms",
          url: "https://chadd.org/about-adhd/overview/",
          type: "external",
          description: "Comprehensive overview of hyperactive-impulsive symptoms"
        },
        {
          title: "Impulsivity and ADHD",
          url: "https://www.additudemag.com/adhd-impulsivity/",
          type: "external",
          description: "Understanding and managing impulsivity in ADHD"
        },
        {
          title: "Managing Hyperactivity",
          url: "https://www.understood.org/en/articles/hyperactivity-in-kids-with-adhd",
          type: "external",
          description: "Strategies for managing hyperactive behavior"
        }
      ],
      myths: [
        {
          myth: "Hyperactive children will outgrow ADHD",
          fact: "While hyperactivity may become less physically obvious, attention and impulse control challenges often persist into adulthood"
        },
        {
          myth: "Hyperactive ADHD is just poor discipline or parenting",
          fact: "It's a neurobiological condition requiring understanding and appropriate interventions"
        },
        {
          myth: "People with hyperactive ADHD can't focus on anything",
          fact: "They can hyperfocus on activities that interest them, sometimes to an extreme degree"
        }
      ]
    },
    {
      id: "combined-type",
      title: "Combined Type",
      color: "green",
      colorClass: "from-green-400 to-green-600",
      icon: "combined",
      position: { angle: 144, distance: 280 },
      overview: "Combined ADHD is the most common presentation, featuring significant symptoms from both inattentive and hyperactive-impulsive categories. This comprehensive presentation often creates the most complex challenges across multiple life domains.",
      detailedDescription: "Combined type represents a complex interplay of attention, impulse control, and hyperactivity challenges. Individuals experience the full spectrum of ADHD symptoms, requiring comprehensive treatment approaches that address multiple symptom domains.",
      symptoms: [
        "Combination of inattentive symptoms (distractibility, forgetfulness, disorganization)",
        "Hyperactive symptoms (restlessness, excessive talking, difficulty sitting still)",
        "Impulsive behaviors (interrupting, difficulty waiting, hasty decisions)",
        "Emotional dysregulation and mood swings",
        "Difficulty with executive functioning across all domains",
        "Inconsistent performance in work or school",
        "Problems with time management and planning",
        "Social challenges due to multiple symptom types",
        "Higher likelihood of comorbid conditions"
      ],
      realLifeExamples: [
        {
          name: "Alex, High School Student",
          story: "Alex starts homework but gets distracted by social media, talks constantly in class, forgets assignments, and makes impulsive social decisions that affect friendships. They hyperfocus on video games but can't concentrate on homework."
        },
        {
          name: "Jordan, Marketing Manager",
          story: "Jordan generates creative ideas rapidly but struggles to follow through, interrupts colleagues in meetings, misses deadlines despite working long hours, and makes impulsive business decisions that sometimes pay off but often create problems."
        },
        {
          name: "Sam, Parent and Professional",
          story: "Sam juggles work deadlines while constantly multitasking, often forgetting school events, impulsively volunteering for activities they don't have time for, and struggling to maintain household organization while managing career demands."
        }
      ],
      complexityFactors: {
        symptomInteraction: "Inattentive and hyperactive symptoms can compound each other, creating unique challenges",
        variability: "Symptoms may fluctuate based on environment, stress, and interest level",
        masking: "Some symptoms may mask others, making accurate assessment challenging",
        compensation: "Individuals often develop complex coping strategies that may eventually break down"
      },
      cognitiveProfile: {
        strengths: [
          "High creativity and innovative thinking",
          "Ability to see connections others miss",
          "Adaptability and resilience",
          "Hyperfocus capabilities on preferred tasks",
          "High energy when engaged",
          "Empathy and emotional intuition"
        ],
        challenges: [
          "Executive function difficulties across all domains",
          "Emotional regulation problems",
          "Social relationship complexities",
          "Academic or work performance inconsistencies",
          "Higher stress levels from managing multiple symptoms"
        ]
      },
      statistics: [
        "Most common type of ADHD (approximately 70% of cases)",
        "Often presents the most significant functional impairment",
        "Higher rates of comorbid conditions (anxiety, depression, learning disabilities)",
        "More likely to be diagnosed in childhood due to obvious symptoms",
        "Requires comprehensive, multimodal treatment approaches"
      ],
      treatmentConsiderations: [
        "Medication often addresses multiple symptom domains",
        "Behavioral interventions need to target various symptom types",
        "Environmental modifications for both attention and hyperactivity",
        "Skills training for organization, impulse control, and social interaction",
        "Regular monitoring due to symptom complexity",
        "Family or relationship counseling often beneficial"
      ],
      resources: [
        {
          title: "NIMH ADHD Overview",
          url: "https://www.nimh.nih.gov/health/topics/attention-deficit-hyperactivity-disorder-adhd",
          type: "external",
          description: "Comprehensive government resource on ADHD types and treatment"
        },
        {
          title: "Combined Type ADHD Management",
          url: "https://www.additudemag.com/adhd-combined-type/",
          type: "external",
          description: "Strategies for managing combined presentation symptoms"
        },
        {
          title: "Adult ADHD Combined Type",
          url: "https://chadd.org/for-adults/diagnosis-treatment/",
          type: "external",
          description: "CHADD resources for adults with combined type ADHD"
        }
      ],
      myths: [
        {
          myth: "Combined type is just severe ADHD",
          fact: "It's a distinct presentation with unique challenges requiring specialized approaches, not simply more severe symptoms"
        },
        {
          myth: "Having more symptoms means the person is more difficult or problematic",
          fact: "It means the person needs more comprehensive support and understanding"
        },
        {
          myth: "Combined type is too complex to treat effectively",
          fact: "While complex, effective treatments exist that can significantly improve functioning across all symptom domains"
        }
      ]
    },
    {
      id: "causes",
      title: "Causes & Origins",
      color: "yellow",
      colorClass: "from-yellow-400 to-yellow-600",
      icon: "dna",
      position: { angle: 216, distance: 280 },
      overview: "ADHD has complex, multifactorial origins involving genetics, brain development, and environmental factors. Research shows it's a legitimate neurobiological condition with strong hereditary components and measurable brain differences.",
      detailedDescription: "ADHD arises from differences in brain structure and function, particularly in areas controlling executive function, attention regulation, and impulse control. These differences are largely genetically determined but can be influenced by environmental factors during critical developmental periods.",
      geneticFactors: {
        heritability: "ADHD is highly heritable (70-80%), making it one of the most genetic psychiatric conditions",
        familyPatterns: "If one parent has ADHD, children have 25-35% chance; if both parents have ADHD, risk increases to 75%",
        geneticComplexity: "No single 'ADHD gene' exists; instead, hundreds of genetic variants each contribute small effects",
        research: "Genome-wide association studies have identified multiple genetic loci associated with ADHD"
      },
      brainDifferences: {
        structure: [
          "Smaller prefrontal cortex (executive function)",
          "Differences in basal ganglia (movement and attention)",
          "Variations in cerebellum (motor control and cognition)",
          "Altered corpus callosum (hemisphere communication)"
        ],
        function: [
          "Reduced activity in frontal brain regions",
          "Differences in neurotransmitter systems (dopamine, norepinephrine)",
          "Altered brain network connectivity",
          "Different patterns of brain maturation"
        ],
        development: [
          "Brain maturation may be delayed by 2-3 years",
          "Some brain regions may remain smaller throughout life",
          "Neuroplasticity allows for compensation and improvement"
        ]
      },
      environmentalFactors: {
        prenatal: [
          "Maternal smoking during pregnancy",
          "Alcohol exposure in utero",
          "Premature birth or low birth weight",
          "Maternal stress during pregnancy",
          "Exposure to environmental toxins"
        ],
        early_childhood: [
          "Lead exposure",
          "Traumatic brain injury",
          "Severe early deprivation or trauma",
          "Certain infections affecting the brain"
        ],
        note: "Environmental factors typically interact with genetic vulnerability rather than causing ADHD independently"
      },
      whatWeKnow: [
        "ADHD is fundamentally a genetic, neurodevelopmental condition",
        "Brain imaging consistently shows structural and functional differences",
        "Neurotransmitter systems (especially dopamine and norepinephrine) function differently",
        "Environmental factors can influence expression but rarely cause ADHD alone",
        "Gene-environment interactions are complex and still being studied"
      ],
      debunkedMyths: [
        "Sugar or food additives cause ADHD (minimal evidence for dietary causes)",
        "Poor parenting or lack of discipline causes ADHD",
        "Vaccines cause ADHD (thoroughly debunked)",
        "Too much screen time causes ADHD (may worsen symptoms but doesn't cause the condition)",
        "ADHD is caused by modern lifestyle (symptoms documented throughout history)",
        "ADHD medications cause brain damage (no evidence; may actually normalize brain function)"
      ],
      statistics: [
        "Heritability rate of 70-80% (higher than height or weight)",
        "If one identical twin has ADHD, the other has 70-80% chance",
        "Brain differences visible in neuroimaging studies from early childhood",
        "Affects all ethnic groups and cultures worldwide",
        "Prevalence has remained stable over decades despite increased awareness"
      ],
      currentResearch: [
        "Epigenetic factors affecting gene expression",
        "Role of environmental toxins in ADHD development",
        "Precision medicine approaches based on genetic profiles",
        "Brain connectivity patterns and their relationship to symptoms",
        "Development of more targeted treatments based on neurobiological understanding"
      ],
      resources: [
        {
          title: "CDC – ADHD Causes and Risk Factors",
          url: "https://www.cdc.gov/adhd/about/",
          type: "external",
          description: "Evidence-based information on ADHD causes from the CDC"
        },
        {
          title: "NIMH – ADHD Research",
          url: "https://www.nimh.nih.gov/health/topics/attention-deficit-hyperactivity-disorder-adhd/research",
          type: "external",
          description: "Current research on ADHD causes and mechanisms"
        },
        {
          title: "Genetics of ADHD",
          url: "https://www.nature.com/articles/s41583-018-0090-3",
          type: "external",
          description: "Scientific review of genetic factors in ADHD"
        },
        {
          title: "Dr. Russell Barkley on ADHD Causes",
          url: "https://www.youtube.com/watch?v=q3d1SwUXMc0",
          type: "video",
          description: "Expert explanation of ADHD neurobiological origins"
        }
      ],
      scientificEvidence: [
        "Over 500 genes associated with ADHD identified through large-scale studies",
        "Consistent brain imaging findings across cultures and countries",
        "Dopamine transporter and receptor genes strongly implicated",
        "Prefrontal cortex maturation delayed by average of 3 years",
        "Functional MRI shows consistent patterns of underactivation in attention networks"
      ]
    },
    {
      id: "diagnosis",
      title: "Diagnosis & Assessment",
      color: "red",
      colorClass: "from-red-400 to-red-600",
      icon: "diagnosis",
      position: { angle: 288, distance: 280 },
      overview: "ADHD diagnosis requires comprehensive evaluation by qualified professionals using standardized criteria, clinical interviews, rating scales, and collateral information. There's no single test for ADHD; diagnosis is based on pattern recognition and clinical judgment.",
      detailedDescription: "ADHD diagnosis is a clinical process that relies on gathering detailed information about symptoms across multiple settings and time periods. Professionals use established criteria while considering developmental history, current functioning, and ruling out other possible explanations for symptoms.",
      diagnosticCriteria: {
        dsm5Requirements: [
          "6+ symptoms of inattention and/or hyperactivity-impulsivity",
          "Symptoms present before age 12",
          "Symptoms present in 2+ settings (home, school, work)",
          "Clear evidence of significant impairment in functioning",
          "Symptoms not better explained by another mental health condition"
        ],
        severityLevels: [
          "Mild: Few symptoms beyond required minimum, minor impairment",
          "Moderate: Symptoms and impairment between mild and severe",
          "Severe: Many symptoms beyond minimum, substantial impairment"
        ]
      },
      assessmentProcess: {
        clinicalInterview: [
          "Detailed developmental and medical history",
          "Current symptom assessment across settings",
          "Functional impairment evaluation",
          "Family history of ADHD and mental health conditions",
          "Treatment history and response"
        ],
        ratingScales: [
          "Conners Rating Scales (multiple versions)",
          "Vanderbilt Assessment Scales",
          "ADHD Rating Scale",
          "Adult ADHD Self-Report Scale (ASRS)",
          "Brown Executive Function/Attention Scales"
        ],
        collateralInformation: [
          "Teacher reports for children/adolescents",
          "Spouse/partner input for adults",
          "School records and report cards",
          "Work performance evaluations",
          "Previous psychological or medical evaluations"
        ],
        additionalTesting: [
          "Psychological testing to rule out learning disabilities",
          "Intelligence testing if indicated",
          "Continuous performance tests (optional)",
          "Medical examination to rule out other conditions"
        ]
      },
      qualifiedProfessionals: [
        "Psychiatrists (MD with mental health specialization)",
        "Psychologists (PhD/PsyD with ADHD expertise)",
        "Neurologists (especially pediatric neurologists)",
        "Developmental pediatricians",
        "Psychiatric nurse practitioners with ADHD training",
        "Family physicians with ADHD assessment training"
      ],
      ageSpecificConsiderations: {
        preschoolers: "Diagnosis difficult due to normal developmental variation; requires clear impairment",
        schoolAge: "Most commonly diagnosed age; school performance provides clear functional indicators",
        adolescents: "May require modified criteria; hormonal changes can complicate assessment",
        adults: "Retrospective assessment of childhood symptoms; current functioning primary focus",
        elderly: "Rare new diagnosis; usually involves recognizing lifelong, undiagnosed condition"
      },
      differentialDiagnosis: [
        "Anxiety disorders (can mimic inattention)",
        "Depression (concentration problems common)",
        "Learning disabilities (academic struggles)",
        "Sleep disorders (attention and behavioral problems)",
        "Thyroid disorders (hyperactivity symptoms)",
        "Substance use disorders (attention problems)",
        "Trauma/PTSD (concentration difficulties)",
        "Autism spectrum disorders (attention differences)"
      ],
      challengesInDiagnosis: {
        underdiagnosis: [
          "Girls and women often missed due to inattentive presentation",
          "High-functioning individuals may compensate well",
          "Adults may not recognize symptoms as ADHD",
          "Cultural biases in assessment tools"
        ],
        overdiagnosis: [
          "Normal childhood behavior mistaken for ADHD",
          "Situational problems misattributed to ADHD",
          "Inadequate differential diagnosis",
          "Pressure for quick solutions"
        ]
      },
      howDiagnosed: [
        "Comprehensive clinical interview with patient and family",
        "Standardized rating scales from multiple informants",
        "Review of developmental, medical, and academic history",
        "Assessment of current functional impairment",
        "Rule out other medical and psychiatric conditions",
        "Gathering information from multiple settings and sources"
      ],
      ageGroups: {
        children: "Parent and teacher reports essential; school observations crucial for functional assessment",
        teens: "Self-report becomes more important; academic challenges and social functioning key indicators",
        adults: "Retrospective childhood history important; current work and relationship functioning primary focus",
        seniors: "Usually involves recognizing lifelong patterns; medical conditions must be carefully ruled out"
      },
      statistics: [
        "Average age of diagnosis: 7 years old for combined type, 9-10 for inattentive type",
        "Many adults first diagnosed in their 30s-50s",
        "Girls diagnosed on average 2-3 years later than boys",
        "Only 50-60% of children with ADHD receive appropriate diagnosis",
        "Adult ADHD often recognized when their children are diagnosed"
      ],
      resources: [
        {
          title: "CHADD – ADHD Diagnosis",
          url: "https://chadd.org/about-adhd/diagnosis/",
          type: "external",
          description: "Comprehensive guide to ADHD diagnosis process"
        },
        {
          title: "NIMH – ADHD Diagnosis",
          url: "https://www.nimh.nih.gov/health/topics/attention-deficit-hyperactivity-disorder-adhd/diagnosis",
          type: "external",
          description: "Government resource on diagnostic criteria and process"
        },
        {
          title: "Adult ADHD Diagnosis",
          url: "https://www.additudemag.com/adult-adhd-diagnosis/",
          type: "external",
          description: "Guide to getting diagnosed with ADHD as an adult"
        },
        {
          title: "Finding Qualified Professionals",
          url: "https://chadd.org/professional-directory/",
          type: "external",
          description: "CHADD directory of ADHD specialists"
        }
      ],
      commonMisunderstandings: [
        "ADHD can be diagnosed with a simple questionnaire or online test",
        "Only children can be diagnosed with ADHD",
        "ADHD diagnosis is based solely on academic or work performance",
        "Brain scans or blood tests can diagnose ADHD",
        "If someone can focus on preferred activities, they don't have ADHD",
        "ADHD diagnosis is just an excuse for poor behavior or laziness"
      ]
    }
  ]
}; 