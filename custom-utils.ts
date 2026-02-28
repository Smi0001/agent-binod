import { readFileSync } from "fs";

export const loadEnv = (path = ".env") => {
  try {
    readFileSync(path, "utf-8")
      .split("\n")
      .forEach(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) return; // skip comments/empty
        const [key, ...rest] = trimmed.split("=");
        process.env[key.trim()] = rest.join("=").trim().replace(/^['"]|['"]$/g, ""); // strip quotes
      });
      console.log(`Loaded env >>>> ${process.env.GITEA_TOKEN}`);  
  } catch (e) {
    console.warn(".env file not found / could not be loaded, relying on existing environment variables");
  }
}
