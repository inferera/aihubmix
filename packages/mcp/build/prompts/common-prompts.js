// src/prompts/common-prompts.ts
export const commonPrompts = {
    code_review: {
        description: 'Generate a code review prompt',
        arguments: [
            {
                name: 'code',
                description: 'Code to review',
                required: true
            },
            {
                name: 'language',
                description: 'Programming language',
                required: false
            }
        ],
        async generate(args) {
            return `Please review the following ${args.language || 'code'} and provide feedback on:
1. Code quality and best practices
2. Potential bugs or issues
3. Performance improvements
4. Security considerations
5. Readability and maintainability

Code to review:
\`\`\`${args.language || ''}
${args.code}
\`\`\`

Please provide specific, actionable feedback with examples where appropriate.`;
        }
    },
    documentation: {
        description: 'Generate documentation for code',
        arguments: [
            {
                name: 'code',
                description: 'Code to document',
                required: true
            },
            {
                name: 'format',
                description: 'Documentation format (jsdoc, markdown, etc.)',
                required: false
            }
        ],
        async generate(args) {
            return `Please generate ${args.format || 'comprehensive'} documentation for the following code:

\`\`\`
${args.code}
\`\`\`

Include:
- Purpose and functionality
- Parameters and return values
- Usage examples
- Any important notes or considerations
${args.format === 'jsdoc' ? '- JSDoc format comments' : ''}`;
        }
    },
    refactor: {
        description: 'Generate refactoring suggestions',
        arguments: [
            {
                name: 'code',
                description: 'Code to refactor',
                required: true
            },
            {
                name: 'goals',
                description: 'Refactoring goals',
                required: false
            }
        ],
        async generate(args) {
            return `Please suggest refactoring improvements for the following code${args.goals ? ` with focus on: ${args.goals}` : ''}:

\`\`\`
${args.code}
\`\`\`

Consider:
- Code structure and organization
- Performance optimizations
- Readability improvements
- Design patterns
- Error handling
- Testing considerations

Provide the refactored code with explanations for the changes.`;
        }
    }
};
//# sourceMappingURL=common-prompts.js.map