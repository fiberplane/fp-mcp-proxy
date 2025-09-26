import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spinner } from "@clack/prompts";
import { downloadTemplate } from "giget";
import pico from "picocolors";
import type { Context } from "../context";

const PROXY_TEMPLATE_URL = "github:fiberplane/fp-mcp-proxy/templates/proxy";

export async function actionTemplate(context: Context) {
  if (!context.path) {
    throw new Error("Path not set");
  }

  const s = spinner();
  s.start("Creating MCP Proxy project from template...");

  try {
    // Ensure the directory exists
    if (!existsSync(context.path)) {
      mkdirSync(context.path, { recursive: true });
    }

    // Download the proxy template
    await downloadTemplate(PROXY_TEMPLATE_URL, {
      dir: context.path,
      force: true,
    });

    // Update package.json name field with the project directory name
    const packageJsonPath = join(context.path, "package.json");
    if (existsSync(packageJsonPath)) {
      try {
        const packageJsonContent = readFileSync(packageJsonPath, "utf-8");
        const packageJson = JSON.parse(packageJsonContent);

        // Set the name to the user-provided project name
        packageJson.name = context.name;

        // Write back the updated package.json
        writeFileSync(
          packageJsonPath,
          `${JSON.stringify(packageJson, null, 2)}\n`,
        );
      } catch (_error) {
        // If package.json parsing fails, continue without updating
        console.warn(
          `${pico.yellow("⚠")} Could not update package.json name field`,
        );
      }
    }

    // Replace $$PROXY_URL$$ placeholder in src/index.ts with user's proxy URL
    if (context.proxyUrl) {
      const srcIndexPath = join(context.path, "src", "index.ts");
      if (existsSync(srcIndexPath)) {
        try {
          const srcContent = readFileSync(srcIndexPath, "utf-8");
          const updatedContent = srcContent.replace(
            /\$\$PROXY_URL\$\$/g,
            context.proxyUrl,
          );
          writeFileSync(srcIndexPath, updatedContent);
        } catch (_error) {
          console.warn(
            `${pico.yellow("⚠")} Could not update src/index.ts with proxy URL`,
          );
        }
      }
    }

    // Create .env.example file with the proxy URL
    if (context.proxyUrl) {
      const envExamplePath = join(context.path, ".env.example");
      const envContent = `PROXY_URL=${context.proxyUrl}\n`;
      writeFileSync(envExamplePath, envContent);
    }

    s.stop(`${pico.green("✓")} Proxy template downloaded successfully`);
  } catch (error) {
    s.stop(`${pico.red("✗")} Failed to download template`);
    throw error;
  }
}
