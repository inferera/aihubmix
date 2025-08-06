import { Prompt } from '../types/index.js';


export const getPrompt = (name: string): Prompt | undefined => {
  return undefined;
};

export const formatPrompt = async (name: string, args: Record<string, any>): Promise<string> => {
  const prompt = getPrompt(name);
  if (!prompt) {
    throw new Error(`Prompt not found: ${name}`);
  }

  return prompt.generate(args);
}; 
