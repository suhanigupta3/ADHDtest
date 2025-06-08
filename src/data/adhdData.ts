export const adhdData = {
  centerNode: {
    id: "what-is-adhd",
    title: "What is ADHD?",
    color: "orange",
    colorClass: "from-orange-400 to-orange-600",
    icon: "brain",
    definition: "ADHD (Attention Deficit Hyperactivity Disorder) is a neurodevelopmental condition that affects how people focus, control impulses, and manage energy levels. It can present differently in children and adults.",
    keyFacts: [
      "Estimated to affect 5–7% of children and 2.5–4% of adults globally",
      "Not a behavioral problem, but a brain-based difference in attention and self-regulation",
      "It is not caused by bad parenting, diet, or laziness"
    ],
    resources: [
      {
        title: "CDC – What is ADHD?",
        url: "https://www.cdc.gov/ncbddd/adhd/facts.html",
        type: "external"
      },
      {
        title: "CHADD – Understanding ADHD",
        url: "https://chadd.org/understanding-adhd/",
        type: "external"
      },
      {
        title: "ADHD in Adults (Dr. Russell Barkley)",
        url: "https://youtube.com/watch?v=adhd-video",
        type: "video"
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
      overview: "This subtype is characterized by difficulty focusing, organizing, and completing tasks.",
      symptoms: [
        "Easily distracted or forgetful",
        "Struggles to follow instructions",
        "Poor time management",
        "Avoids tasks that require sustained mental effort"
      ],
      realLifeExample: {
        name: "Alex",
        story: "Alex often forgets assignments, loses keys, and daydreams during meetings despite trying hard to pay attention."
      },
      statistics: [
        "More common in girls than boys",
        "Often goes undiagnosed until adulthood",
        "30% of children with ADHD have primarily inattentive type"
      ],
      resources: [
        {
          title: "ADDA Guide to Inattentive ADHD",
          url: "https://add.org/inattentive-adhd/",
          type: "external"
        },
        {
          title: "Recognizing Inattentive ADHD in Adults",
          url: "/resources/inattentive-adhd-adults.pdf",
          type: "pdf"
        }
      ],
      myths: [
        {
          myth: "People with inattentive ADHD are just lazy",
          fact: "They actually work harder than others to maintain focus and often experience mental exhaustion"
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
      overview: "Marked by high energy, restlessness, and acting without thinking.",
      symptoms: [
        "Fidgeting, tapping, or inability to sit still",
        "Interrupting others",
        "Talking excessively",
        "Acting without considering consequences"
      ],
      realLifeExample: {
        name: "Jasmine",
        story: "Jasmine blurts out answers in class and often leaves her seat during meetings."
      },
      statistics: [
        "More commonly diagnosed in boys",
        "Symptoms often decrease with age",
        "25% of children with ADHD have primarily hyperactive-impulsive type"
      ],
      resources: [
        {
          title: "CHADD – Hyperactive-Impulsive Symptoms",
          url: "https://chadd.org/hyperactive-impulsive/",
          type: "external"
        },
        {
          title: "Recognizing Hyperactive ADHD",
          url: "https://youtube.com/watch?v=hyperactive-video",
          type: "video"
        }
      ],
      myths: [
        {
          myth: "Hyperactive children will outgrow ADHD",
          fact: "While hyperactivity may decrease, attention and impulse control challenges often persist into adulthood"
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
      overview: "The most common presentation — includes symptoms from both Inattentive and Hyperactive-Impulsive types.",
      symptoms: [
        "Trouble focusing and sitting still",
        "Impulsiveness and disorganization",
        "Emotional dysregulation",
        "Difficulty with time management and planning"
      ],
      realLifeExample: {
        name: "Liam",
        story: "Liam misses deadlines, interrupts conversations, and loses track of conversations frequently."
      },
      statistics: [
        "Most common type of ADHD (about 70% of cases)",
        "Often presents the most significant challenges",
        "Symptoms from both categories must be present"
      ],
      resources: [
        {
          title: "NIH ADHD Types Overview",
          url: "https://nimh.nih.gov/health/topics/attention-deficit-hyperactivity-disorder-adhd",
          type: "external"
        },
        {
          title: "Living with Combined Type ADHD",
          url: "/articles/combined-type-adhd",
          type: "article"
        }
      ],
      myths: [
        {
          myth: "Combined type is just severe ADHD",
          fact: "It's a distinct presentation with unique challenges, not simply more severe symptoms"
        }
      ]
    },
    {
      id: "causes",
      title: "Causes",
      color: "yellow",
      colorClass: "from-yellow-400 to-yellow-600",
      icon: "dna",
      position: { angle: 216, distance: 280 },
      overview: "ADHD has complex causes involving genetics, brain development, and environmental factors.",
      whatWeKnow: [
        "Largely genetic (runs in families)",
        "Brain imaging shows differences in structure/function",
        "Other contributing factors: premature birth, prenatal exposure to substances, environmental toxins"
      ],
      debunkedMyths: [
        "Not caused by sugar or video games",
        "Not a result of poor discipline",
        "Not caused by vaccines",
        "Not caused by excessive screen time alone"
      ],
      statistics: [
        "Heritability rate of 70-80%",
        "If one parent has ADHD, 30% chance for children",
        "Brain differences visible in neuroimaging studies"
      ],
      resources: [
        {
          title: "CDC – Causes and Risk Factors",
          url: "https://www.cdc.gov/ncbddd/adhd/causes.html",
          type: "external"
        },
        {
          title: "Genetic Basis of ADHD",
          url: "/resources/adhd-genetics-research.pdf",
          type: "pdf"
        }
      ],
      scientificEvidence: [
        "Multiple genes involved, each with small effect",
        "Dopamine and norepinephrine neurotransmitter differences",
        "Prefrontal cortex development delays"
      ]
    },
    {
      id: "diagnosis",
      title: "Diagnosis",
      color: "red",
      colorClass: "from-red-400 to-red-600",
      icon: "diagnosis",
      position: { angle: 288, distance: 280 },
      overview: "ADHD diagnosis requires comprehensive evaluation by qualified professionals using standardized criteria.",
      howDiagnosed: [
        "No single test — based on symptoms, behavior checklists, interviews",
        "Requires assessment by a licensed professional (psychologist, psychiatrist, neurologist)",
        "For adults, self-reports + third-party observations are useful"
      ],
      ageGroups: {
        children: "Observed at school/home, parent and teacher reports crucial",
        teens: "Self-advocacy becomes important, academic challenges more apparent",
        adults: "Often diagnosed later due to coping mechanisms, work/relationship impacts"
      },
      diagnosticCriteria: [
        "Symptoms present before age 12",
        "Symptoms in multiple settings (home, work, school)",
        "Significant impairment in functioning",
        "Symptoms not better explained by other conditions"
      ],
      statistics: [
        "Average age of diagnosis: 7 years old",
        "Many adults first diagnosed in their 30s-40s",
        "Girls often diagnosed later than boys"
      ],
      resources: [
        {
          title: "NIMH – ADHD Diagnosis Process",
          url: "https://nimh.nih.gov/health/topics/attention-deficit-hyperactivity-disorder-adhd",
          type: "external"
        },
        {
          title: "How ADHD is Diagnosed",
          url: "https://youtube.com/watch?v=diagnosis-video",
          type: "video"
        }
      ],
      commonMisunderstandings: [
        "ADHD can be diagnosed with a simple test",
        "Only children can be diagnosed with ADHD",
        "ADHD diagnosis is based on academic performance alone"
      ]
    }
  ]
}; 