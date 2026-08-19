const adjectives = [
  'Silent', 'Hidden', 'Shadow', 'Ghost', 'Mystic', 'Crystal', 'Neon', 'Cyber',
  'Quantum', 'Solar', 'Lunar', 'Stellar', 'Cosmic', 'Phantom', 'Swift',
  'Brave', 'Clever', 'Witty', 'Noble', 'Fierce', 'Gentle', 'Wild', 'Calm',
];

const nouns = [
  'Wolf', 'Fox', 'Hawk', 'Eagle', 'Raven', 'Bear', 'Tiger', 'Lion',
  'Dragon', 'Phoenix', 'Shark', 'Whale', 'Falcon', 'Owl', 'Panther', 'Cobra',
  'Ninja', 'Samurai', 'Viking', 'Knight', 'Ranger', 'Pilot', 'Coder',
];

export function generateUsername(): string {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 9999);
  return `${adj}${noun}${num}`;
}