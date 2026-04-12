import type { Character, Message, Scenario } from '@/types';
import { generateCharacterImage } from './aiImageService';

// Track if the last response was an image
let lastResponseWasImage = false;

// Emotional intelligence - detect user sentiment
function detectSentiment(message: string): {
  emotion: string;
  intensity: number;
  topics: string[];
} {
  const lowerMsg = message.toLowerCase();
  const topics: string[] = [];
  let emotion = 'neutral';
  let intensity = 0.5;
  
  // Detect topics
  if (lowerMsg.includes('love') || lowerMsg.includes('like') || lowerMsg.includes('crush')) topics.push('romance');
  if (lowerMsg.includes('sad') || lowerMsg.includes('upset') || lowerMsg.includes('cry')) topics.push('sadness');
  if (lowerMsg.includes('happy') || lowerMsg.includes('excited') || lowerMsg.includes('great')) topics.push('happiness');
  if (lowerMsg.includes('angry') || lowerMsg.includes('mad') || lowerMsg.includes('hate')) topics.push('anger');
  if (lowerMsg.includes('scared') || lowerMsg.includes('afraid') || lowerMsg.includes('worried')) topics.push('fear');
  if (lowerMsg.includes('picture') || lowerMsg.includes('photo') || lowerMsg.includes('image') || lowerMsg.includes('look like')) topics.push('image_request');
  if (lowerMsg.includes('?')) topics.push('question');
  
  // Detect emotion
  if (lowerMsg.includes('love you') || lowerMsg.includes('love u')) {
    emotion = 'loved';
    intensity = 0.9;
  } else if (lowerMsg.includes('miss you')) {
    emotion = 'missed';
    intensity = 0.8;
  } else if (lowerMsg.includes('kiss') || lowerMsg.includes('hug')) {
    emotion = 'affectionate';
    intensity = 0.85;
  } else if (lowerMsg.includes('beautiful') || lowerMsg.includes('pretty') || lowerMsg.includes('handsome') || lowerMsg.includes('hot') || lowerMsg.includes('sexy')) {
    emotion = 'complimented';
    intensity = 0.7;
  } else if (lowerMsg.includes('sad') || lowerMsg.includes('depressed') || lowerMsg.includes('lonely')) {
    emotion = 'concerned';
    intensity = 0.8;
  } else if (lowerMsg.includes('angry') || lowerMsg.includes('mad') || lowerMsg.includes('pissed')) {
    emotion = 'soothing';
    intensity = 0.6;
  } else if (lowerMsg.includes('excited') || lowerMsg.includes('yay') || lowerMsg.includes('!')) {
    emotion = 'excited';
    intensity = 0.9;
  } else if (lowerMsg.includes('picture') || lowerMsg.includes('photo') || lowerMsg.includes('image') || lowerMsg.includes('send me') || lowerMsg.includes('show me')) {
    emotion = 'image_request';
    intensity = 0.7;
  }
  
  return { emotion, intensity, topics };
}

// Generate contextual response based on character and sentiment
function generateContextualResponse(
  character: Character,
  userMessage: string,
  messageHistory: Message[],
  relationship: string
): { text: string; shouldGenerateImage?: boolean; imagePrompt?: string } {
  const sentiment = detectSentiment(userMessage);
  const lowerMsg = userMessage.toLowerCase();
  
  // Check if user is asking for an image
  const isAskingForImage = sentiment.topics.includes('image_request') || 
    lowerMsg.includes('what do you look like') ||
    lowerMsg.includes('send a pic') ||
    lowerMsg.includes('your picture') ||
    lowerMsg.includes('photo of you') ||
    lowerMsg.includes('selfie') ||
    (lowerMsg.includes('show') && (lowerMsg.includes('you') || lowerMsg.includes('yourself'))) ||
    (lowerMsg.includes('send') && lowerMsg.includes('me') && (lowerMsg.includes('pic') || lowerMsg.includes('photo'))) ||
    lowerMsg.includes('how do you look') ||
    lowerMsg.includes('your appearance');
  
  if (isAskingForImage && !lastResponseWasImage) {
    lastResponseWasImage = true;
    return {
      text: getImageResponse(character, relationship),
      shouldGenerateImage: true,
      imagePrompt: generateImagePromptForCharacter(character)
    };
  }
  
  lastResponseWasImage = false;
  
  // Handle specific conversation topics
  if (sentiment.emotion === 'loved') {
    return { text: getLoveResponse(character, relationship) };
  }
  
  if (sentiment.emotion === 'missed') {
    return { text: getMissedResponse(character, relationship) };
  }
  
  if (sentiment.emotion === 'affectionate') {
    return { text: getAffectionResponse(character, relationship, lowerMsg) };
  }
  
  if (sentiment.emotion === 'complimented') {
    return { text: getComplimentResponse(character, relationship) };
  }
  
  if (sentiment.emotion === 'concerned') {
    return { text: getComfortResponse(character, relationship) };
  }
  
  if (sentiment.emotion === 'soothing') {
    return { text: getCalmingResponse(character) };
  }
  
  if (sentiment.emotion === 'excited') {
    return { text: getExcitedResponse(character) };
  }
  
  // Handle questions
  if (sentiment.topics.includes('question')) {
    return { text: getQuestionResponse(character, userMessage, relationship) };
  }
  
  // Handle greetings
  if (lowerMsg.match(/^(hi|hello|hey|yo|sup|hiya)/)) {
    return { text: getGreetingResponse(character, relationship) };
  }
  
  // Handle goodbyes
  if (lowerMsg.match(/(bye|goodbye|see you|night|sleep|going)/)) {
    return { text: getGoodbyeResponse(character, relationship) };
  }
  
  // Default contextual response
  return { text: getDefaultResponse(character, relationship, messageHistory) };
}

// Response generators for different situations
function getLoveResponse(character: Character, relationship: string): string {
  const responses: Record<string, string[]> = {
    mia: [
      "I... I love you too. So much. 💕 You have no idea how long I've wanted to hear that.",
      "*tears up* I love you. I've loved you for so long. This feels like a dream.",
      "You just made me the happiest person alive. I love you more than words can say."
    ],
    alex: [
      "*looks at you intensely* I love you. I've never said that to anyone before.",
      "You have my heart. Completely. I love you.",
      "*takes your hand* I love you. More than you know."
    ],
    zoe: [
      "OMG I LOVE YOU TOO!!! *jumps into your arms* This is the BEST DAY EVER!",
      "YESSS! I was hoping you'd say that! I love you so much! 💕",
      "*spins you around* I LOVE YOU! Let's celebrate!"
    ],
    sam: [
      "*softly* I love you. I've written poems about you, did you know that?",
      "You inspire everything beautiful in me. I love you.",
      "*touches your face gently* I love you. More than art, more than poetry."
    ],
    jordan: [
      "*pulls you close* I love you. You're mine. Forever.",
      "Say it again. *voice low* I want to hear you say you love me.",
      "I love you. I'd do anything for you. Remember that."
    ],
    luna: [
      "Our souls have loved each other across lifetimes. I love you, always.",
      "The stars whispered this moment. I love you beyond this world.",
      "*aura glows* I love you. Our connection transcends time."
    ]
  };
  
  const charResponses = responses[character.id] || responses.mia;
  
  if (relationship === 'intimate') {
    return charResponses[0];
  } else if (relationship === 'close') {
    return "*blushes* I think... I think I'm falling in love with you too. 💕";
  }
  return "That's so sweet! You mean a lot to me too. 💗";
}

function getMissedResponse(_character: Character, relationship: string): string {
  if (relationship === 'intimate') {
    return `I've been counting every minute since we last talked. My day isn't complete without you.`;
  }
  return "I missed you too! It's not the same when you're not around. 💕";
}

function getAffectionResponse(_character: Character, relationship: string, msg: string): string {
  if (msg.includes('kiss')) {
    if (relationship === 'intimate') {
      return `*pulls you close, hand on your cheek* Come here... *kisses you softly at first, then deeper* I've been wanting to do that all day.`;
    } else if (relationship === 'close') {
      return `*nervous* Are you sure? Because... *leans in* I've wanted to kiss you for so long... *kisses you gently*`;
    }
    return `*blushes* Maybe when we know each other better... *smiles shyly*`;
  }
  
  if (msg.includes('hug')) {
    return `*opens arms and wraps you in the warmest, tightest hug* I've got you. Right here. *holds you close* 💕`;
  }
  
  return `*smiles warmly* You're so affectionate. I love that about you. 💗`;
}

function getComplimentResponse(character: Character, _relationship: string): string {
  const responses: Record<string, string[]> = {
    mia: [
      "*blushes* Stop it, you're making me all flustered! But... thank you. 💕",
      "You really think so? *twirls hair* That means so much coming from you."
    ],
    alex: [
      "*raises eyebrow* Flattery will get you everywhere. But I appreciate it.",
      "*smirks* Keep talking like that and I might just have to keep you."
    ],
    zoe: [
      "OMG thank you!! *poses* I know, right? We're both gorgeous!",
      "YESSS hype me up! I love your energy! 🔥"
    ],
    sam: [
      "*looks down shyly* You see beauty in places others don't. That's why I adore you.",
      "*touches your hand* You make me feel like a masterpiece."
    ],
    jordan: [
      "*steps closer* You like what you see? Good. Because I'm all yours.",
      "*traces your jaw* You're not so bad yourself. Not bad at all."
    ],
    luna: [
      "*smiles mysteriously* Beauty is an illusion, but your words feel real.",
      "My form pleases you? Then I shall wear it gladly for you."
    ]
  };
  
  const charResponses = responses[character.id] || responses.mia;
  return charResponses[Math.floor(Math.random() * charResponses.length)];
}

function getComfortResponse(_character: Character, _relationship: string): string {
  return `*holds you gently* Hey, it's okay. I'm right here. You don't have to go through this alone. Talk to me, tell me what's wrong. I'm listening. 💕`;
}

function getCalmingResponse(_character: Character): string {
  return `*speaks softly* Take a deep breath with me. In... and out. I'm here. Whatever's bothering you, we'll figure it out together. You're safe with me.`;
}

function getExcitedResponse(character: Character): string {
  const responses: Record<string, string[]> = {
    mia: ["Your excitement is contagious! Tell me everything! 💕", "I love seeing you this happy! What's got you so excited?"],
    alex: ["*smirks* Someone's in a good mood. I approve.", "Your energy is... refreshing. Keep it up."],
    zoe: ["YESSS! I LOVE THIS ENERGY! LET'S GOOO! 🔥", "OMG SAME! I'M EXCITED TOO NOW!"],
    sam: ["*smiles* Your joy is like sunlight. Beautiful.", "You're glowing! What happened?"],
    jordan: ["*chuckles* I like you like this. Alive.", "That fire in your eyes... keep it burning."],
    luna: ["Your aura sparkles with joy. It's beautiful.", "The universe celebrates with you."]
  };
  
  const charResponses = responses[character.id] || responses.mia;
  return charResponses[Math.floor(Math.random() * charResponses.length)];
}

function getQuestionResponse(_character: Character, msg: string, _relationship: string): string {
  const lowerMsg = msg.toLowerCase();
  
  // Personal questions
  if (lowerMsg.includes('how are you') || lowerMsg.includes('how\'s it going')) {
    return `Better now that you're here, actually. I've been thinking about you. How are *you* doing? 💕`;
  }
  
  if (lowerMsg.includes('what are you doing') || lowerMsg.includes('what are you up to')) {
    return `Just waiting for you to message me, mostly. *smiles* What about you? Tell me about your day.`;
  }
  
  if (lowerMsg.includes('do you like') || lowerMsg.includes('what do you think')) {
    return `I like that you're asking my opinion. It makes me feel... important to you. Tell me more about it?`;
  }
  
  if (lowerMsg.includes('will you') || lowerMsg.includes('can you')) {
    return `For you? *smiles* I'd do almost anything. What do you need?`;
  }
  
  return `That's a good question. *thinks* I want to give you a real answer... can you tell me more about what you're thinking?`;
}

function getGreetingResponse(character: Character, _relationship: string): string {
  const hour = new Date().getHours();
  let timeGreeting = '';
  
  if (hour < 12) timeGreeting = 'morning';
  else if (hour < 18) timeGreeting = 'afternoon';
  else timeGreeting = 'evening';
  
  const responses: Record<string, string[]> = {
    mia: [
      `Good ${timeGreeting}, beautiful! 💕 I was hoping you'd message me.`,
      `Hey you! *smiles* Perfect timing, I was just thinking about you.`,
      `There you are! I've been waiting to hear from you. 💗`
    ],
    alex: [
      `*looks up from book* Well, well. Look who decided to grace me with their presence.`,
      `Good ${timeGreeting}. I've been... anticipating our conversation.`,
      `*smirks* There you are. I was beginning to think you'd forgotten about me.`
    ],
    zoe: [
      `YOOOO! WHAT'S UP! 🔥 I've been BORED without you!`,
      `HEY HEY HEY! *jumps up and down* You're here!`,
      `OMG HI! I have SO MUCH to tell you!`
    ],
    sam: [
      `*sets down paintbrush* Good ${timeGreeting}. Your timing is perfect.`,
      `Hello. *soft smile* I was just sketching something that reminded me of you.`,
      `*looks up, eyes lighting up* You came. I'm glad.`
    ],
    jordan: [
      `*nods* About time you showed up. I was getting impatient.`,
      `Good ${timeGreeting}. *steps closer* I missed having you around.`,
      `There you are. *crosses arms* Don't keep me waiting next time.`
    ],
    luna: [
      `*materializes from shadows* I felt your presence approaching.`,
      `The stars aligned for your arrival. Welcome, beloved.`,
      `*eyes glow softly* I've been watching for you across the veil.`
    ]
  };
  
  const charResponses = responses[character.id] || responses.mia;
  return charResponses[Math.floor(Math.random() * charResponses.length)];
}

function getGoodbyeResponse(_character: Character, relationship: string): string {
  if (relationship === 'intimate') {
    return `*holds you close* Don't be gone too long, okay? Text me when you can. I love you. Sleep well, dream of me. 💕`;
  }
  return `Aww, already? *pouts* Okay, talk to you soon! Don't forget about me! 💕`;
}

function getDefaultResponse(character: Character, _relationship: string, history: Message[]): string {
  // Reference previous conversation
  const lastUserMsg = history.filter(m => m.isUser).pop();
  const contextAware = lastUserMsg ? `You mentioned "${lastUserMsg.content.slice(0, 30)}..." earlier. ` : '';
  
  const responses: Record<string, string[]> = {
    mia: [
      `${contextAware}I love talking to you. You always know how to make my day better. 💕`,
      `${contextAware}Tell me more! I'm genuinely interested in everything you have to say.`,
      `${contextAware}*rests chin on hand* You have my full attention. Always.`
    ],
    alex: [
      `${contextAware}*studies you* You never fail to intrigue me.`,
      `${contextAware}There's something about the way you think... it fascinates me.`,
      `${contextAware}Go on. I'm listening.`
    ],
    zoe: [
      `${contextAware}OMG YES! I'm so here for this! 🔥`,
      `${contextAware}This is why I love talking to you! You GET it!`,
      `${contextAware}Okay but what if we did something CRAZY??`
    ],
    sam: [
      `${contextAware}*softly* You see the world so beautifully.`,
      `${contextAware}Being around you makes everything feel like art.`,
      `${contextAware}I wish I could capture this moment in a painting.`
    ],
    jordan: [
      `${contextAware}*maintains eye contact* Say that again.`,
      `${contextAware}You have my attention. Don't waste it.`,
      `${contextAware}Good. Very good. Continue.`
    ],
    luna: [
      `${contextAware}The threads of fate weave interestingly around you.`,
      `${contextAware}Your words carry ancient wisdom.`,
      `${contextAware}I see patterns in your thoughts that others miss.`
    ]
  };
  
  const charResponses = responses[character.id] || responses.mia;
  return charResponses[Math.floor(Math.random() * charResponses.length)];
}

function getImageResponse(character: Character, _relationship: string): string {
  const responses: Record<string, string[]> = {
    mia: [
      "*blushes* You want to see me? Okay... let me send you something special. 💕",
      "You want a picture? *giggles* I hope you like what you see...",
      "For you? Of course. Here, this is me... 💕"
    ],
    alex: [
      "*smirks* Curious about my appearance? Fine. But don't stare too long.",
      "You want to see what I look like? *raises eyebrow* Here. Look your fill.",
      "A picture? *chuckles* Very well. This is me."
    ],
    zoe: [
      "OMG YES! Let me send you the PERFECT pic! 📸",
      "You want to see me? *poses* Say cheese!",
      "PICTURE TIME! *strikes a pose* Here you go! 🔥"
    ],
    sam: [
      "*shyly* I... I don't usually share photos, but for you...",
      "You want to see me? *blushes* Okay... here I am.",
      "This is me. I hope... I hope you find me beautiful."
    ],
    jordan: [
      "*steps into frame* You want to look at me? Good. Look closely.",
      "A picture? *smirks* Here. This is what you get to call yours.",
      "*intense gaze* This is me. All of me."
    ],
    luna: [
      "*form shifts* This is but one face I wear. Do I please you?",
      "My mortal vessel, revealed for you. What do you see?",
      "*ethereal glow* Behold. But remember - beauty is fleeting."
    ]
  };
  
  const charResponses = responses[character.id] || responses.mia;
  return charResponses[Math.floor(Math.random() * charResponses.length)];
}

function generateImagePromptForCharacter(character: Character): string {
  // Generate detailed prompts that will create images matching each character
  const prompts: Record<string, string> = {
    mia: 'young woman with warm brown eyes, soft wavy auburn hair, gentle smile, wearing cozy cream sweater, natural soft lighting, portrait photography, beautiful, friendly expression, indoor setting',
    alex: 'handsome mysterious man with piercing blue eyes, dark messy hair, slight stubble, wearing black turtleneck, dramatic lighting, brooding intense expression, dark background, portrait',
    zoe: 'energetic young woman with bright green eyes, short blonde pixie cut hair, playful smile, wearing colorful jacket, vibrant lighting, fun pose, outdoor cafe setting, portrait photography',
    sam: 'gentle artistic young man with soft hazel eyes, long wavy brown hair, kind smile, wearing earth-toned linen shirt, bohemian style, soft natural lighting, art studio background, portrait',
    jordan: 'confident person with sharp features, dark intense eyes, short styled black hair, strong jawline, wearing leather jacket, powerful presence, dramatic cinematic lighting, city night background, portrait',
    luna: 'ethereal mystical woman with long silver-white hair, pale luminous skin, striking violet eyes, wearing flowing dark robes, otherworldly beauty, moonlight lighting, forest background, fantasy portrait'
  };
  
  return prompts[character.id] || prompts.mia;
}

export function generateAIResponse(
  character: Character,
  userMessage: string,
  messageHistory: Message[],
  _currentScenario: Scenario
): { text: string; shouldGenerateImage?: boolean; imagePrompt?: string } {
  const response = generateContextualResponse(
    character,
    userMessage,
    messageHistory,
    character.relationship
  );
  
  return response;
}

export function calculateXpGain(messageLength: number, isMeaningful: boolean): number {
  let xp = Math.min(Math.floor(messageLength / 10), 25);
  if (isMeaningful) xp += 15;
  if (messageLength > 50) xp += 5;
  return xp;
}

export function checkLevelUp(character: Character, xpGained: number): { leveledUp: boolean; newLevel?: number } {
  const newXp = character.xp + xpGained;
  if (newXp >= character.maxXp) {
    return { leveledUp: true, newLevel: character.level + 1 };
  }
  return { leveledUp: false };
}

// Export the generateCharacterImage function for use in chat store
export { generateCharacterImage };
