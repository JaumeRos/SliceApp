// Sport-specific assessment questions

export interface Question {
  id: string;
  question: string;
  options: Array<{ label: string; value: number }>;
}

export const sportQuestions: { [sport: string]: Question[] } = {
  tennis: [
    {
      id: 'experience',
      question: 'How many years have you been playing tennis?',
      options: [
        { label: 'I have never played before', value: 0 },
        { label: 'Less than a year', value: 1 },
        { label: 'Between 1 and 3 years', value: 2 },
        { label: 'Between 3 and 5 years', value: 3 },
        { label: 'More than 5 years', value: 4 },
      ],
    },
    {
      id: 'competitive',
      question: 'What is the level at which you compete?',
      options: [
        { label: 'Only games between friends', value: 0 },
        { label: 'Friendly tournaments', value: 1 },
        { label: 'Amateur leagues', value: 2 },
        { label: 'Federated competitions', value: 3 },
      ],
    },
    {
      id: 'serve',
      question: 'How would you describe your serve and net play?',
      options: [
        { label: 'I rarely go to the net', value: 0 },
        { label: 'I don\'t feel safe at the net, I make mistakes', value: 1 },
        { label: 'I can volley forehand and backhand with some difficulty', value: 2 },
        { label: 'I have good net positioning and volley confidently', value: 3 },
        { label: 'I volley with depth and power', value: 4 },
      ],
    },
    {
      id: 'returns',
      question: 'How would you describe your baseline game?',
      options: [
        { label: 'I struggle to return serves consistently', value: 0 },
        { label: 'I can return serves but have difficulty in rallies', value: 1 },
        { label: 'I maintain baseline rallies with consistent depth', value: 2 },
        { label: 'I control rallies with spin and placement', value: 3 },
        { label: 'I dominate from the baseline with power and precision', value: 4 },
      ],
    },
    {
      id: 'skill',
      question: 'Overall, how would you rate your tennis level?',
      options: [
        { label: 'Beginner', value: 0 },
        { label: 'Intermediate', value: 1 },
        { label: 'Advanced', value: 2 },
        { label: 'Professional', value: 3 },
      ],
    },
  ],

  padel: [
    {
      id: 'experience',
      question: 'How many years have you been playing padel?',
      options: [
        { label: 'I have never played before', value: 0 },
        { label: 'Less than a year', value: 1 },
        { label: 'Between 1 and 3 years', value: 2 },
        { label: 'Between 3 and 5 years', value: 3 },
        { label: 'More than 5 years', value: 4 },
      ],
    },
    {
      id: 'competitive',
      question: 'What level do you play at?',
      options: [
        { label: 'Recreational with friends', value: 0 },
        { label: 'Club level tournaments', value: 1 },
        { label: 'Regional competitions', value: 2 },
        { label: 'National/Professional level', value: 3 },
      ],
    },
    {
      id: 'walls',
      question: 'How well do you use the walls in your game?',
      options: [
        { label: 'I struggle with wall shots', value: 0 },
        { label: 'I can hit basic wall shots', value: 1 },
        { label: 'I use walls strategically in rallies', value: 2 },
        { label: 'I control wall shots with spin and angles', value: 3 },
        { label: 'I master complex wall combinations', value: 4 },
      ],
    },
    {
      id: 'net',
      question: 'How comfortable are you at the net?',
      options: [
        { label: 'I prefer staying back', value: 0 },
        { label: 'I can volley but make errors', value: 1 },
        { label: 'I volley consistently and move well', value: 2 },
        { label: 'I dominate at the net with smashes and volleys', value: 3 },
        { label: 'I control the net with power and precision', value: 4 },
      ],
    },
    {
      id: 'skill',
      question: 'Overall, how would you rate your padel level?',
      options: [
        { label: 'Beginner', value: 0 },
        { label: 'Intermediate', value: 1 },
        { label: 'Advanced', value: 2 },
        { label: 'Professional', value: 3 },
      ],
    },
  ],

  pickleball: [
    {
      id: 'experience',
      question: 'How many years have you been playing pickleball?',
      options: [
        { label: 'I have never played before', value: 0 },
        { label: 'Less than a year', value: 1 },
        { label: 'Between 1 and 3 years', value: 2 },
        { label: 'Between 3 and 5 years', value: 3 },
        { label: 'More than 5 years', value: 4 },
      ],
    },
    {
      id: 'competitive',
      question: 'What level do you compete at?',
      options: [
        { label: 'Recreational play', value: 0 },
        { label: 'Local tournaments', value: 1 },
        { label: 'Regional competitions', value: 2 },
        { label: 'National/Professional level', value: 3 },
      ],
    },
    {
      id: 'dinking',
      question: 'How would you describe your dinking game?',
      options: [
        { label: 'I struggle with soft shots at the kitchen', value: 0 },
        { label: 'I can dink but lack consistency', value: 1 },
        { label: 'I dink consistently with good control', value: 2 },
        { label: 'I control dink rallies with spin and placement', value: 3 },
        { label: 'I dominate the kitchen with advanced dinking', value: 4 },
      ],
    },
    {
      id: 'serve',
      question: 'How would you rate your serve and third shot?',
      options: [
        { label: 'I struggle with consistent serves', value: 0 },
        { label: 'I serve consistently but third shot is weak', value: 1 },
        { label: 'I have a good serve and decent third shot', value: 2 },
        { label: 'I use serve and third shot strategically', value: 3 },
        { label: 'I have a powerful serve and excellent third shot', value: 4 },
      ],
    },
    {
      id: 'skill',
      question: 'Overall, how would you rate your pickleball level?',
      options: [
        { label: 'Beginner (1.0-2.5)', value: 0 },
        { label: 'Intermediate (3.0-3.5)', value: 1 },
        { label: 'Advanced (4.0-4.5)', value: 2 },
        { label: 'Professional (5.0+)', value: 3 },
      ],
    },
  ],

  squash: [
    {
      id: 'experience',
      question: 'How many years have you been playing squash?',
      options: [
        { label: 'I have never played before', value: 0 },
        { label: 'Less than a year', value: 1 },
        { label: 'Between 1 and 3 years', value: 2 },
        { label: 'Between 3 and 5 years', value: 3 },
        { label: 'More than 5 years', value: 4 },
      ],
    },
    {
      id: 'competitive',
      question: 'What level do you play at?',
      options: [
        { label: 'Recreational with friends', value: 0 },
        { label: 'Club competitions', value: 1 },
        { label: 'Regional tournaments', value: 2 },
        { label: 'National/Professional level', value: 3 },
      ],
    },
    {
      id: 'movement',
      question: 'How would you describe your court movement?',
      options: [
        { label: 'I struggle to reach the ball', value: 0 },
        { label: 'I can move but lack efficiency', value: 1 },
        { label: 'I move well and return to the T', value: 2 },
        { label: 'I have excellent court coverage', value: 3 },
        { label: 'I dominate with speed and anticipation', value: 4 },
      ],
    },
    {
      id: 'shots',
      question: 'How varied is your shot selection?',
      options: [
        { label: 'I mainly hit straight drives', value: 0 },
        { label: 'I can hit drives and some drops', value: 1 },
        { label: 'I use drops, boasts, and volleys', value: 2 },
        { label: 'I have a full range of attacking shots', value: 3 },
        { label: 'I master deceptive and power shots', value: 4 },
      ],
    },
    {
      id: 'skill',
      question: 'Overall, how would you rate your squash level?',
      options: [
        { label: 'Beginner', value: 0 },
        { label: 'Intermediate', value: 1 },
        { label: 'Advanced', value: 2 },
        { label: 'Professional', value: 3 },
      ],
    },
  ],

  badminton: [
    {
      id: 'experience',
      question: 'How many years have you been playing badminton?',
      options: [
        { label: 'I have never played before', value: 0 },
        { label: 'Less than a year', value: 1 },
        { label: 'Between 1 and 3 years', value: 2 },
        { label: 'Between 3 and 5 years', value: 3 },
        { label: 'More than 5 years', value: 4 },
      ],
    },
    {
      id: 'competitive',
      question: 'What level do you compete at?',
      options: [
        { label: 'Recreational play', value: 0 },
        { label: 'Club tournaments', value: 1 },
        { label: 'Regional competitions', value: 2 },
        { label: 'National/Professional level', value: 3 },
      ],
    },
    {
      id: 'smash',
      question: 'How would you describe your smash and attacking game?',
      options: [
        { label: 'I rarely smash effectively', value: 0 },
        { label: 'I can smash but lack power', value: 1 },
        { label: 'I have a decent smash and attack', value: 2 },
        { label: 'I have a powerful smash and good angles', value: 3 },
        { label: 'I dominate with explosive smashes', value: 4 },
      ],
    },
    {
      id: 'net',
      question: 'How comfortable are you with net play and drops?',
      options: [
        { label: 'I struggle with net shots', value: 0 },
        { label: 'I can play basic net shots', value: 1 },
        { label: 'I play tight net shots and drops', value: 2 },
        { label: 'I control the net with deception', value: 3 },
        { label: 'I master net kills and spinning shots', value: 4 },
      ],
    },
    {
      id: 'skill',
      question: 'Overall, how would you rate your badminton level?',
      options: [
        { label: 'Beginner', value: 0 },
        { label: 'Intermediate', value: 1 },
        { label: 'Advanced', value: 2 },
        { label: 'Professional', value: 3 },
      ],
    },
  ],

  'table-tennis': [
    {
      id: 'experience',
      question: 'How many years have you been playing table tennis?',
      options: [
        { label: 'I have never played before', value: 0 },
        { label: 'Less than a year', value: 1 },
        { label: 'Between 1 and 3 years', value: 2 },
        { label: 'Between 3 and 5 years', value: 3 },
        { label: 'More than 5 years', value: 4 },
      ],
    },
    {
      id: 'competitive',
      question: 'What level do you play at?',
      options: [
        { label: 'Recreational play', value: 0 },
        { label: 'Club level', value: 1 },
        { label: 'Regional competitions', value: 2 },
        { label: 'National/Professional level', value: 3 },
      ],
    },
    {
      id: 'spin',
      question: 'How well do you use spin in your game?',
      options: [
        { label: 'I struggle with spin control', value: 0 },
        { label: 'I can generate basic topspin', value: 1 },
        { label: 'I use topspin and backspin effectively', value: 2 },
        { label: 'I control various spins strategically', value: 3 },
        { label: 'I master advanced spin techniques', value: 4 },
      ],
    },
    {
      id: 'serve',
      question: 'How would you rate your serve and return game?',
      options: [
        { label: 'I struggle with consistent serves', value: 0 },
        { label: 'I serve consistently but lack variety', value: 1 },
        { label: 'I have varied serves and good returns', value: 2 },
        { label: 'I use deceptive serves strategically', value: 3 },
        { label: 'I dominate with advanced serves', value: 4 },
      ],
    },
    {
      id: 'skill',
      question: 'Overall, how would you rate your table tennis level?',
      options: [
        { label: 'Beginner', value: 0 },
        { label: 'Intermediate', value: 1 },
        { label: 'Advanced', value: 2 },
        { label: 'Professional', value: 3 },
      ],
    },
  ],
};

// Sport-specific level names
export const sportLevelNames: { [sport: string]: string[] } = {
  tennis: ['Beginner', 'Intermediate', 'Advanced', 'Pro'],
  padel: ['Beginner', 'Intermediate', 'Advanced', 'Pro'],
  pickleball: ['1.0-2.5', '3.0-3.5', '4.0-4.5', '5.0+'],
  squash: ['Beginner', 'Club', 'Advanced', 'Pro'],
  badminton: ['Beginner', 'Intermediate', 'Advanced', 'Pro'],
  'table-tennis': ['Beginner', 'Intermediate', 'Advanced', 'Pro'],
};

