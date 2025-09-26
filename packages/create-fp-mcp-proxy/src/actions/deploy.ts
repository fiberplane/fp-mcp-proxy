import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { confirm, select, spinner } from "@clack/prompts";
import pico from "picocolors";
import type { Context } from "../context";

// Read deployment info from .fiberplane file and construct URL
function getUrlFromFiberplaneFile(
  projectPath: string,
  isPreview: boolean = false,
): string | null {
  try {
    const fiberplaneFilePath = join(projectPath, ".fiberplane");
    const fileContent = readFileSync(fiberplaneFilePath, "utf-8");
    const data = JSON.parse(fileContent);

    if (data.appName) {
      if (isPreview) {
        return `https://${data.appName}-preview.fp.dev`;
      }
      return `https://${data.appName}.fp.dev`;
    }
  } catch (_error) {
    // File doesn't exist or is invalid, ignore
  }
  return null;
}

export async function promptDeploy(context: Context) {
  const deployFiberplane = await confirm({
    message: "Should we deploy this thing now?",
    initialValue: true,
  });

  if (deployFiberplane) {
    context.flags.push("deploy-fiberplane");

    // Ask for deployment environment only if they want to deploy
    const deploymentEnvironment = await select({
      message: "Which environment should we deploy to?",
      options: [
        { value: "prod", label: "Production" },
        { value: "preview", label: "Preview" },
      ],
      initialValue: "prod",
    });

    if (typeof deploymentEnvironment === "string") {
      context.deploymentEnvironment = deploymentEnvironment as
        | "prod"
        | "preview";
    }
  }

  return deployFiberplane;
}

export async function actionDeploy(context: Context) {
  if (!context.flags.includes("deploy-fiberplane") || !context.path) {
    return;
  }

  const isPreview = context.deploymentEnvironment === "preview";
  const s = spinner();
  s.start(
    `Deploying to Fiberplane ${isPreview ? "(Preview)" : "(Production)"}...`,
  );

  let deploymentUrl: string | null = null;

  try {
    // Prepare environment variables for preview deployment
    const envVars = isPreview
      ? {
          FIBERPLANE_API_URL: "https://preview.fiberplane.io",
          FIBERPLANE_AUTH_URL: "https://auth-preview.fiberplane.io",
        }
      : {};

    // HACK - force login flow here until deploy does it automatically
    const loginCommand = `${context.packageManager} fiberplane-cli auth login`;

    execSync(loginCommand, {
      cwd: context.path,
      stdio: "inherit", // Show output to user
      env: { ...process.env, ...envVars },
    });

    // Execute the deploy script in the target project
    const deployCommand = `${context.packageManager} run deploy`;

    execSync(deployCommand, {
      cwd: context.path,
      stdio: "inherit", // Show output to user
      env: { ...process.env, ...envVars },
    });

    // Read deployment URL from .fiberplane file
    deploymentUrl = getUrlFromFiberplaneFile(context.path, isPreview);

    s.stop(`${pico.green("✓")} Deployment completed successfully`);

    if (deploymentUrl) {
      console.log(`
${pico.cyan("🚀 Your MCP project is now live!")}

Your MCP server has been deployed to Fiberplane${isPreview ? " (Preview)" : ""}.
Visit your deployment: ${pico.bold(pico.cyan(deploymentUrl))}
`);
    } else {
      console.log(`
${pico.cyan("🚀 Your MCP project is now live!")}

Your MCP server has been deployed to Fiberplane${isPreview ? " (Preview)" : ""}.
Visit your Fiberplane dashboard to manage your deployment.
`);
    }

    // Set the deployment URL on context for later use
    if (deploymentUrl) {
      context.deploymentUrl = deploymentUrl;
    }
  } catch (error) {
    s.stop(`${pico.red("✗")} Deployment failed`);
    console.error(`
${pico.red("Deployment error:")} ${error instanceof Error ? error.message : "Unknown error"}

${pico.dim("Make sure:")}
• The template includes a "deploy" script in package.json
• You have proper Fiberplane credentials configured
• All dependencies are installed
`);
    throw error;
  }
}
