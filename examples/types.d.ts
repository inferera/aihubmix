declare module 'image-type' {
  interface ImageTypeResult {
    ext: string;
    mime: string;
  }
  
  function imageType(buffer: Uint8Array | Buffer): Promise<ImageTypeResult | null>;
  export = imageType;
}

declare module 'terminal-image' {
  interface TerminalImageOptions {
    width?: number;
    height?: number;
  }
  
  const terminalImage: {
    buffer(buffer: Buffer, options?: TerminalImageOptions): Promise<string>;
    file(filePath: string, options?: TerminalImageOptions): Promise<string>;
  };
  
  export = terminalImage;
}

declare module 'sharp' {
  interface Sharp {
    png(): Sharp;
    toBuffer(): Promise<Buffer>;
  }
  
  function sharp(input?: Buffer | Uint8Array): Sharp;
  export = sharp;
} 
