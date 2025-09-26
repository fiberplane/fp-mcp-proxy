#!/usr/bin/env node
import { intro, isCancel, outro } from "@clack/prompts";
import pico from "picocolors";
import { actionDependencies, promptDependencies } from "./actions/dependencies";
import { actionDeploy, promptDeploy } from "./actions/deploy";
import { actionGit, promptGit } from "./actions/git";
import { promptPath } from "./actions/path";
import { promptProxyUrl } from "./actions/proxy";
import { actionTemplate } from "./actions/template";
import { FIBERPLANE_TITLE } from "./const";
import { initContext } from "./context";
import { isError } from "./types";
import { handleCancel, handleError } from "./utils";

async function main() {
  console.log("");
  console.log(pico.cyan(FIBERPLANE_TITLE));
  console.log("");

  intro("🚀 create-fp-mcp-proxy");

  const context = initContext();

  const prompts = [
    promptPath,
    promptProxyUrl,
    promptDependencies,
    promptGit,
    promptDeploy,
  ];

  for (const prompt of prompts) {
    if (!prompt) {
      continue;
    }

    const result = await prompt(context);
    if (isCancel(result)) {
      handleCancel();
    }

    if (isError(result)) {
      handleError(result);
    }
  }

  const actions = [actionTemplate, actionDependencies, actionGit, actionDeploy];

  for (const action of actions) {
    const result = await action(context);

    if (isCancel(result)) {
      handleCancel();
    }

    if (isError(result)) {
      handleError(result);
    }
  }

  outro(`🚀 MCP Proxy project created successfully in ${context.path}!

${pico.cyan("Next steps:")}

# Navigate to your project:
cd ${context.name}

# As you develop, deploy:
${context.packageManager} fp deploy

# Learn more about Fiberplane:
open https://docs.fiberplane.com

${
  context.flags.includes("deploy-fiberplane")
    ? `\n${pico.green("✓")} Fiberplane deployment is configured and ready!${
        context.deploymentUrl
          ? `\n${pico.cyan("🔗")} Your deployment: ${pico.bold(pico.cyan(context.deploymentUrl))}`
          : ""
      }`
    : ""
}
`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Unhandled error:", err);
  process.exit(1);
});
