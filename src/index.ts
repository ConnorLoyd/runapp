import { getAppHtml } from "./ui/app";
import { getManifest } from "./pwa/manifest";
import { getServiceWorker } from "./pwa/serviceWorker";
import { handleApi } from "./api";

export default {
	async fetch(request, env) {
		const url = new URL(request.url);

		// API routes
		if (url.pathname.startsWith("/api/")) {
			return handleApi(request, env);
		}

		switch (url.pathname) {
			case "/manifest.json":
				return new Response(getManifest(), {
					headers: { "content-type": "application/manifest+json" },
				});

			case "/sw.js":
				return new Response(getServiceWorker(), {
					headers: { "content-type": "application/javascript" },
				});

			default:
				return new Response(getAppHtml(), {
					headers: { "content-type": "text/html;charset=UTF-8" },
				});
		}
	},
} satisfies ExportedHandler<Env>;
