import { text } from "@clack/prompts";
import type { Context } from "../context";

export async function promptProxyUrl(context: Context) {
  const proxyUrl = await text({
    message: "What URL do you want to proxy to?",
    placeholder: "https://api.example.com",
    validate(value) {
      if (!value) return "Please enter a URL";
      try {
        new URL(value);
        return;
      } catch {
        return "Please enter a valid URL";
      }
    },
  });

  if (typeof proxyUrl === "string") {
    context.proxyUrl = proxyUrl;
  }

  return proxyUrl;
}
