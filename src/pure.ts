import { type JSX, createElement, render as preactRender } from 'preact';
import { act as preactAct } from 'preact/test-utils';
import type {
	Locator,
	LocatorSelectors,
	PrettyDOMOptions
} from 'vitest/browser';
import { page, server, utils } from 'vitest/browser';

const { debug, getElementLocatorSelectors } = utils;

let testIdCounter = 0;

function getTestIdAttribute(): string {
	return server.config.browser.locators.testIdAttribute ?? 'data-testid';
}

function ensureTestIdAttribute(element: HTMLElement) {
	const attributeId = getTestIdAttribute();
	if (!element.hasAttribute(attributeId)) {
		element.setAttribute(attributeId, `__vitest_${testIdCounter++}__`);
	}
}

function mark(locator: Locator, name: string, fn: Function) {
	if (!locator.mark) {
		return;
	}

	const error = new Error(name);
	if ('captureStackTrace' in Error) {
		(Error as any).captureStackTrace(error, fn);
	}

	return locator.mark(name, error);
}

async function act(cb: () => void | Promise<void>) {
	const _act = preactAct;
	if (typeof _act !== 'function') {
		cb();
	} else {
		(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
		try {
			await _act(cb);
		} finally {
			(globalThis as any).IS_REACT_ACT_ENVIRONMENT = false;
		}
	}
}

export interface RenderResult extends LocatorSelectors {
	container: HTMLElement;
	baseElement: HTMLElement;
	locator: Locator;
	debug: (
		el?: HTMLElement | HTMLElement[] | Locator | Locator[],
		maxLength?: number,
		options?: PrettyDOMOptions
	) => void;
	unmount: () => Promise<void>;
	rerender: (ui: JSX.Element) => Promise<void>;
	asFragment: () => DocumentFragment;
}

export interface ComponentRenderOptions {
	container?: HTMLElement;
	baseElement?: HTMLElement;
	wrapper?: ({ children }: { children: JSX.Element }) => JSX.Element;
}

export interface RenderOptions extends ComponentRenderOptions {}

const mountedContainers = new Set<HTMLElement>();

let wrapperCounter = 0;
export async function render(
	ui: JSX.Element,
	{
		container,
		baseElement,
		wrapper: WrapperComponent
	}: ComponentRenderOptions = {}
): Promise<RenderResult> {
	if (!baseElement) {
		// default to document.body instead of documentElement to avoid output of potentially-large
		// head elements (such as JSS style blocks) in debug output
		baseElement = document.body;
	}

	if (!container) {
		const elementWrapper = document.createElement('div');
		elementWrapper.id = `vitest-preact-wrapper-${wrapperCounter++}`;
		container = baseElement.appendChild(elementWrapper);
	}

	ensureTestIdAttribute(baseElement);
	ensureTestIdAttribute(container);

	await act(() => {
		const wrapper = WrapperComponent
			? createElement(WrapperComponent, { children: ui })
			: ui;
		preactRender(wrapper, container);
		mountedContainers.add(container);
	});

	const locator = page.elementLocator(container);
	await mark(locator, 'preact.render', render);

	const renderResult: RenderResult = {
		container,
		baseElement,
		locator,
		debug: (el, maxLength, options) => debug(el, maxLength, options),
		unmount: async () => {
			await act(() => {
				preactRender(null, container);
				mountedContainers.delete(container);
			});
			await mark(locator, 'preact.unmount', renderResult.unmount);
		},
		rerender: async (newUi: JSX.Element) => {
			await act(() => {
				const wrapper = WrapperComponent
					? createElement(WrapperComponent, { children: newUi })
					: newUi;
				preactRender(wrapper, container);
			});
			await mark(locator, 'preact.rerender', renderResult.rerender);
		},
		asFragment: () => {
			return document
				.createRange()
				.createContextualFragment(container.innerHTML);
		},
		...getElementLocatorSelectors(baseElement)
	};

	return renderResult;
}

export function cleanup(): void {
	mountedContainers.forEach(container => {
		act(() => {
			preactRender(null, container);
		});
		if (container.parentNode === document.body) {
			document.body.removeChild(container);
		}
	});
	mountedContainers.clear();
}
