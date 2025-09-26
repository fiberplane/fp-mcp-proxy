import { Hono } from "hono";
import { proxy } from "hono/proxy";

const app = new Hono<{ Bindings: { PROXY_URL: string } }>();

app.all("*", (c) => {
	const PROXY_URL = c.env.PROXY_URL;
	const targetBaseUrl = toUrl(PROXY_URL);
	if (!PROXY_URL || !targetBaseUrl) {
		return c.json({ error: "Server configuration error" }, 500);
	}

	// Get the full path from the request URL
	const requestPath = new URL(c.req.url).pathname;

	// Properly construct the target URL, handling potential double slashes
	const targetUrl = new URL(requestPath, targetBaseUrl).toString();

	return proxy(targetUrl, {
		...c.req, // optional, specify only when forwarding all the request data (including credentials) is necessary.
		headers: {
			...c.req.header(),
			// Examples:
			//
			// 'X-Forwarded-For': '127.0.0.1',
			// 'X-Forwarded-Host': c.req.header('host'),
			// Authorization: undefined, // do not propagate request headers contained in c.req.header('Authorization')
		},
	});
});

function toUrl(url: string) {
	try {
		return new URL(url);
	} catch (_error) {
		console.error(`Invalid URL: ${url}`);
		return false;
	}
}

export default app;
