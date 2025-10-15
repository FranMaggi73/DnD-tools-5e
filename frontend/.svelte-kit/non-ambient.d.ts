
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	export interface AppTypes {
		RouteId(): "/" | "/campaigns" | "/campaigns/[id]" | "/campaigns/[id]/characters" | "/campaigns/[id]/combat" | "/dashboard" | "/login";
		RouteParams(): {
			"/campaigns/[id]": { id: string };
			"/campaigns/[id]/characters": { id: string };
			"/campaigns/[id]/combat": { id: string }
		};
		LayoutParams(): {
			"/": { id?: string };
			"/campaigns": { id?: string };
			"/campaigns/[id]": { id: string };
			"/campaigns/[id]/characters": { id: string };
			"/campaigns/[id]/combat": { id: string };
			"/dashboard": Record<string, never>;
			"/login": Record<string, never>
		};
		Pathname(): "/" | "/campaigns" | "/campaigns/" | `/campaigns/${string}` & {} | `/campaigns/${string}/` & {} | `/campaigns/${string}/characters` & {} | `/campaigns/${string}/characters/` & {} | `/campaigns/${string}/combat` & {} | `/campaigns/${string}/combat/` & {} | "/dashboard" | "/dashboard/" | "/login" | "/login/";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): string & {};
	}
}