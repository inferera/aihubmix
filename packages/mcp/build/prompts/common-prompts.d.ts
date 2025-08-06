export declare const commonPrompts: {
    code_review: {
        description: string;
        arguments: {
            name: string;
            description: string;
            required: boolean;
        }[];
        generate(args: {
            code: string;
            language?: string;
        }): Promise<string>;
    };
    documentation: {
        description: string;
        arguments: {
            name: string;
            description: string;
            required: boolean;
        }[];
        generate(args: {
            code: string;
            format?: string;
        }): Promise<string>;
    };
    refactor: {
        description: string;
        arguments: {
            name: string;
            description: string;
            required: boolean;
        }[];
        generate(args: {
            code: string;
            goals?: string;
        }): Promise<string>;
    };
};
