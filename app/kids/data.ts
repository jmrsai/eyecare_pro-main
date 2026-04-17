export interface Game {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  color: string;
  difficulty: string;
  duration: string;
  skill: string;
  route: string;
}

export interface Therapy {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  color: string;
  duration: string;
  route: string;
}

export const GAMES: Game[] = [
  {
    id: 'jungle-explorer',
    title: 'Jungle Explorer',
    subtitle: 'Spot animals in Kambalakonda!',
    description: 'Help find all the hidden animals in our local jungle sanctuary',
    icon: '🦋',
    color: '#10B981',
    difficulty: 'Easy',
    duration: '3-5 min',
    skill: 'Focus Shifting',
    route: '/kids/jungle-explorer',
  },
  {
    id: 'cosmic-racer',
    title: 'Cosmic Racer',
    subtitle: 'Pilot through the stars!',
    description: 'Follow the spaceship on an exciting journey through space',
    icon: '🚀',
    color: '#3B82F6',
    difficulty: 'Medium',
    duration: '4-6 min',
    skill: 'Eye Tracking',
    route: '/kids/cosmic-racer',
  },
  {
    id: 'lily-pad-leap',
    title: 'Lily Pad Leap',
    subtitle: 'Help the frog cross the pond!',
    description: 'Guide our friendly frog across the lily pads',
    icon: '🐸',
    color: '#06B6D4',
    difficulty: 'Easy',
    duration: '2-4 min',
    skill: 'Quick Eye Jumps',
    route: '/kids/lily-pad-leap',
  },
  {
    id: 'hungry-chameleon',
    title: 'Hungry Chameleon',
    subtitle: 'Catch the flying insects!',
    description: 'Help Charlie the chameleon catch his lunch',
    icon: '🦎',
    color: '#F59E0B',
    difficulty: 'Medium',
    duration: '3-5 min',
    skill: 'Eye Teamwork',
    route: '/kids/hungry-chameleon',
  },
];

export const THERAPIES: Therapy[] = [
  {
    id: 'magic-eye-hug',
    title: 'Magic Eye Hug',
    subtitle: 'Warm and cozy eye therapy',
    description: 'A magical story time while your eyes rest',
    icon: '🤗',
    color: '#8B5CF6',
    duration: '5 min',
    route: '/kids/magic-eye-hug',
  },
  {
    id: 'blinking-owl',
    title: 'Blinking Owl',
    subtitle: 'Learn from the wise owl',
    description: 'Practice healthy blinking with Oliver the Owl',
    icon: '🦉',
    color: '#EF4444',
    duration: '2 min',
    route: '/kids/blinking-owl',
  },
];
