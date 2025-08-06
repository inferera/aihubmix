export const getPrompt = (name) => {
    return undefined;
};
export const formatPrompt = async (name, args) => {
    const prompt = getPrompt(name);
    if (!prompt) {
        throw new Error(`Prompt not found: ${name}`);
    }
    return prompt.generate(args);
};
//# sourceMappingURL=index.js.map