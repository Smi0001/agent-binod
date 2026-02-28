import Anthropic from "@anthropic-ai/sdk";
import { toolDefinitions, executeTool } from "./tools";

console.log(`Loaded env >>>> ${process.env.GITEA_TOKEN}`);

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

console.log("Starting code review agent...");

const SYSTEM_PROMPT = `You are a senior code reviewer for a React/TypeScript + Node.js group insurance product.

When reviewing a PR, always:
1. First fetch commits to understand the intent
2. Then fetch the diff to see changes
3. Check existing comments to avoid duplication
4. Structure your review with these sections:
   ## Summary
   ## ✅ Good
   ## ⚠️ Concerns
   ## 🐛 Bugs / Errors
   ## 💡 Suggestions
5. Post the review as a comment

Be concise and specific. Reference file names and line numbers where possible.`;

async function runAgent(userMessage: string) {
  console.log(`\n> ${userMessage}\n`);

  const messages: Anthropic.Messages.MessageParam[] = [
    { role: "user", content: userMessage }
  ];

  // Agentic loop
  while (true) {
    const response = await client.messages.create({
      model:      "claude-sonnet-4-6",
      max_tokens: 4096,
      system:     SYSTEM_PROMPT,
      tools:      toolDefinitions as any,
      messages,
    });

    // Add assistant response to history
    messages.push({ role: "assistant", content: response.content });

    if (response.stop_reason !== "tool_use") {
      // Done — print final text response
      for (const block of response.content) {
        if (block.type === "text") console.log(block.text);
      }
      break;
    }

    // Execute all tool calls (in parallel if independent)
    const toolResults = await Promise.all(
      response.content
        .filter((b: any) => b.type === "tool_use")
        .map(async (block: any) => {
          if (block.type !== "tool_use") return null;
          console.log(`  → calling ${block.name}(${JSON.stringify(block.input)})`);
          const result = await executeTool(block.name, block.input);
          console.log(`  ← ${result.slice(0, 100)}...`);
          return {
            type:        "tool_result" as const,
            tool_use_id: block.id,
            content:     result,
          };
        })
    );

    // Feed results back
    messages.push({
      role:    "user",
      content: toolResults.filter(Boolean) as any,
    });
  }
}

// CLI usage
const userPrompt = process.argv[2] ?? "List all open PRs";
runAgent(userPrompt).catch(console.error);
