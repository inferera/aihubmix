declare module "zod" {
  export const z: any;
}

declare module "ai" {
  export function generateText(options: any): Promise<any>;
  export function streamText(options: any): any;
  export function experimental_generateImage(options: any): Promise<any>;
  export function embed(options: any): Promise<any>;
  export function experimental_generateSpeech(options: any): Promise<any>;
  export function experimental_transcribe(options: any): Promise<any>;
  export function streamObject(options: any): any;
  export function embedMany(options: any): Promise<any>;
  export function generateObject(options: any): Promise<any>;
} 
