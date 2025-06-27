/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

// Cloudflare will inject secrets on runtime, but we need to put this here to please typescript
export interface Env {
	R2_ACCOUNT_ID: string;
	R2_ACCESS_KEY_ID: string;
	R2_SECRET_ACCESS_KEY: string;
	R2_BUCKET_NAME: string;
	R2: R2Bucket; // bound bucket
}

export default {
	async fetch(request, env, ctx): Promise<Response> {
		// Currently unused as we bound the R2 bucket with wrangler.jsonc
		// const accountId = env.R2_ACCOUNT_ID;
		// const accessKey = env.R2_ACCESS_KEY_ID;
		// const secretKey = env.R2_SECRET_ACCESS_KEY;

		const url = new URL(request.url);
		
		// e.g. https://cdn.hikemap.app/uploads/mypic.jpg
		const key = url.pathname.replace(/^\/+/, ''); // strip leading slashes
		
		if (!key) {
		  return new Response('Missing file path.', { status: 400 });
		}
		
		try {
		  const object = await env.R2.get(key);
		
		  if (!object || !object.body) {
			return new Response('File not found in R2.', { status: 404 });
		  }
		
		  const contentType = object.httpMetadata?.contentType || 'application/octet-stream';
		
		  return new Response(object.body, {
			headers: {
			  'Content-Type': contentType,
			  'Cache-Control': 'public, max-age=31536000',
			},
		  });
		} catch (err) {
		  return new Response(`Server error: ${(err as Error).message}`, { status: 500 });
		}
	},
} satisfies ExportedHandler<Env>;


