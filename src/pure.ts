import type { Locator, LocatorSelectors } from '@vitest/browser/context';
import {
	type PrettyDOMOptions,
	debug,
	getElementLocatorSelectors
} from '@vitest/browser/utils';
import { act as preactAct } from 'preact/test-utils';
import { createElement, JSX, render as preactRender } from 'preact';

function act(cb: () => void | Promise<void>) {
	const _act = preactAct;
	if (typeof _act !== 'function') {
		cb();
	} else {
		(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
		try {
			_act(cb);
		} finally {
			(globalThis as any).IS_REACT_ACT_ENVIRONMENT = false;
		}
	}
}

export interface RenderResult extends LocatorSelectors {
	container: HTMLElement;
	baseElement: HTMLElement;
	debug: (
		el?: HTMLElement | HTMLElement[] | Locator | Locator[],
		maxLength?: number,
		options?: PrettyDOMOptions
	) => void;
	unmount: () => void;
	rerender: (ui: JSX.Element) => void;
	asFragment: () => DocumentFragment;
}

export interface ComponentRenderOptions {
	container?: HTMLElement;
	baseElement?: HTMLElement;
	wrapper?: ({ children }: { children: JSX.Element }) => JSX.Element;
}

const mountedContainers = new Set<HTMLElement>();

let counter = 0;
export function render(
	ui: JSX.Element,
	{
		container,
		baseElement,
		wrapper: WrapperComponent
	}: ComponentRenderOptions = {}
): RenderResult {
	if (!baseElement) baseElement = document.body;

	if (!container) {
		const elementWrapper = document.createElement('div');
		elementWrapper.id = `vitest-preact-wrapper-${counter++}`;
		container = baseElement.appendChild(elementWrapper);
	}

	act(() => {
		const wrapper = WrapperComponent
			? createElement(WrapperComponent, { children: ui })
			: ui;
		preactRender(wrapper, container);
		mountedContainers.add(container);
	});

	return {
		container,
		baseElement,
		debug: (el, maxLength, options) => debug(el, maxLength, options),
		unmount: () => {
			act(() => {
				preactRender(null, container);
				mountedContainers.delete(container);
			});
		},
		rerender: (newUi: JSX.Element) => {
			act(() => {
				const wrapper = WrapperComponent
					? createElement(WrapperComponent, { children: newUi })
					: newUi;
				preactRender(wrapper, container);
			});
		},
		asFragment: () => {
			return document
				.createRange()
				.createContextualFragment(container.innerHTML);
		},
		...getElementLocatorSelectors(baseElement)
	};
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
