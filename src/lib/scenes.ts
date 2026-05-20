export interface Scene {
  name: string;
  prompt: string;
}

export const SCENES: Scene[] = [
  {
    name: '月光便利店',
    prompt:
      'A cozy, warmly-lit Japanese-style convenience store at night under a glowing full moon. The five characters — a real person and the four virtual anime idols — are standing together near the entrance, surrounded by glowing neon signs, colorful snack shelves, and soft vending machine light. High quality anime illustration style with warm golden and blue tones. The real person should retain their actual facial features and appearance. No brand logos or real trademarks.',
  },
  {
    name: '櫻花學校季',
    prompt:
      'A beautiful school courtyard with cherry blossom trees in full bloom, pink petals dancing in the breeze. The five characters — a real person and the four virtual anime idols — are standing and running together on the school track under the sakura canopy, smiling and posing happily. Bright, cheerful anime illustration style with soft pink and white tones. The real person should retain their actual facial features and appearance. No brand logos or real trademarks.',
  },
  {
    name: '夏日煙火祭',
    prompt:
      'A vibrant Japanese summer festival (matsuri) at night with spectacular colorful fireworks bursting in the dark sky. The five characters — a real person and the four virtual anime idols — are wearing traditional festive clothing, standing together near festival stalls with paper lanterns glowing warmly around them. Festive anime illustration style with vivid reds, golds, and deep blues. The real person should retain their actual facial features and appearance. No brand logos or real trademarks.',
  },
  {
    name: '未來科技店',
    prompt:
      'A futuristic neon-lit technology store with holographic floating displays, transparent screens, and glowing gadgets. The five characters — a real person and the four virtual anime idols — are standing together surrounded by blue and purple holographic interfaces, looking excited. Sleek cyberpunk anime illustration style with electric blue and magenta accents. The real person should retain their actual facial features and appearance. No brand logos or real trademarks.',
  },
  {
    name: '冬日暖心咖啡店',
    prompt:
      'A cozy winter coffee shop interior with warm lighting, frosted windows showing snow outside, exposed brick walls, and wooden furniture. The five characters — a real person and the four virtual anime idols — are sitting and standing together around a rustic wooden table with steaming hot drinks, laughing. Soft, warm anime illustration style with golden amber and cream tones. The real person should retain their actual facial features and appearance. No brand logos or real trademarks.',
  },
];

export function getRandomScene(): Scene {
  const index = Math.floor(Math.random() * SCENES.length);
  return SCENES[index];
}
