#!/usr/bin/env node
import "dotenv/config";
import Anthropic from "@anthropic-ai/sdk";
import { toolDefinitions, executeTool, Platform } from "./tools";

// Parse CLI args: strip --platform=... flag, rest is the user prompt.
// Auto-detects platform (Gitea/GitHub) based on env config if --platform is not specified.
const args = process.argv.slice(2);

function detectPlatform(): Platform {
  const platformArg = args.find(a => a.startsWith("--platform="));
  if (platformArg) return platformArg.split("=")[1] === "github" ? "github" : "gitea";
  const hasGitea  = !!process.env.GITEA_TOKEN;
  const hasGithub = !!process.env.GITHUB_TOKEN;
  if (hasGithub && !hasGitea) return "github";
  return "gitea"; // default when both or neither are set
}

const current_platform: Platform = detectPlatform();
const userPrompt = args.filter(a => !a.startsWith("--platform=")).join(" ") || "List all open PRs";

function validateEnv(platform: Platform): void {
  const required: Record<Platform, string[]> = {
    gitea:  ["ANTHROPIC_API_KEY", "GITEA_TOKEN", "GITEA_BASE", "GITEA_REPO"],
    github: ["ANTHROPIC_API_KEY", "GITHUB_TOKEN", "GITHUB_REPO"],
  };
  const missing = required[platform].filter(key => !process.env[key]);
  if (missing.length) {
    console.error(`Missing required env variables for platform "${platform}": ${missing.join(", ")}`);
    process.exit(1);
  }
}

console.log(`Agent Binod is on Platform: ${current_platform}`);

validateEnv(current_platform);

const current_env_token = (current_platform === "github" ? process.env.GITHUB_TOKEN : process.env.GITEA_TOKEN);
const masked_token = current_env_token ? `${current_env_token.slice(0, 6)}*****${current_env_token.slice(-4)}` : "not set";

console.log(`Loading platform ticket for Agent Binod... ${masked_token}`);

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

console.log("Activating Agent Binod to review your code...");

const SYSTEM_PROMPT = `You are a senior code reviewer for the given project.

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
          try {
            const result = await executeTool(block.name, block.input, current_platform);
            console.log(`  ← ${result.slice(0, 100)}...`);
            return {
              type:        "tool_result" as const,
              tool_use_id: block.id,
              content:     result,
            };
          } catch (err: any) {
            const message = err?.message ?? String(err);
            console.error(`  ← ERROR [${block.name}]: ${message}`);
            return {
              type:        "tool_result" as const,
              tool_use_id: block.id,
              content:     `Error: ${message}`,
              is_error:    true,
            };
          }
        })
    );

    // Feed results back
    messages.push({
      role:    "user",
      content: toolResults.filter(Boolean) as any,
    });
  }
}

runAgent(userPrompt).catch(console.error);
