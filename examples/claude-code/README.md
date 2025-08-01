# Claude Code Test Project

This is a test project for the `@aihubmix/claude-code` package.

## What it does

This example demonstrates how to:

1. Import and use the `@aihubmix/claude-code` package
2. Test the package's functionality
3. Verify CLI commands are working
4. Check configuration structure

## Usage

### Run the test

```bash
# From the examples directory
pnpm test:claude-code

# Or directly
npx tsx claude-code/index.ts
```

### Test the actual CLI

```bash
# Install the package globally (if not already installed)
npm install -g @aihubmix/claude-code

# Test CLI commands
acc -v                    # Show version
acc -h                    # Show help
acc start                 # Start server
acc status                # Show status
acc ui                    # Open web UI
acc stop                  # Stop server
```

## Features tested

- ✅ Package import
- ✅ Function availability
- ✅ Configuration structure
- ✅ CLI command interface
- ✅ Type definitions

## Expected output

When you run the test, you should see:

```
🚀 Testing @aihubmix/claude-code package...
✅ Package imported successfully
✅ run function is available: function
✅ Configuration structure is valid
📋 Available CLI commands:
  acc start     - Start the server
  acc stop      - Stop the server
  acc restart   - Restart the server
  acc status    - Show server status
  acc code      - Execute claude command
  acc ui        - Open the web UI
  acc -v        - Show version
  acc -h        - Show help
📦 Package information:
  Name: @aihubmix/claude-code
  CLI Command: acc
  Description: Use Claude Code without an Anthropics account

🎉 All tests passed! The package is ready for use.
```

## Next steps

After running the test, you can:

1. Start the actual server: `acc start`
2. Open the web UI: `acc ui`
3. Test code execution: `acc code "Hello World"`
4. Check server status: `acc status` 
