export function generateAvatar(seed: string): string {
  const encodedSeed = encodeURIComponent(seed);
  return `https://api.dicebear.com/7.x/bottts/svg?seed=${encodedSeed}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
}