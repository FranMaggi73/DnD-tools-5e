
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
		RouteId(): "/" | "/dashboard" | "/events" | "/events/[id]" | "/login";
		RouteParams(): {
			"/events/[id]": { id: string }
		};
		LayoutParams(): {
			"/": { id?: string };
			"/dashboard": Record<string, never>;
			"/events": { id?: string };
			"/events/[id]": { id: string };
			"/login": Record<string, never>
		};
		Pathname(): "/" | "/dashboard" | "/dashboard/" | "/events" | "/events/" | `/events/${string}` & {} | `/events/${string}/` & {} | "/login" | "/login/";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): string & {};
	}
}