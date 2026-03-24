import { beforeEach } from 'vitest';
import { page } from 'vitest/browser';
import { cleanup, render } from './pure';

export { render, cleanup } from './pure';
export type {
	ComponentRenderOptions,
	RenderOptions,
	RenderResult
} from './pure';

page.extend({
	render,
	[Symbol.for('vitest:component-cleanup')]: cleanup
});

beforeEach(() => {
	cleanup();
});

declare module 'vitest/browser' {
	interface BrowserPage {
		render: typeof render;
	}
}
