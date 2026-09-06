import { useState } from 'preact/hooks';
import { expect, test } from 'vitest';
import type { RenderOptions } from 'vitest-browser-preact';
import { render } from 'vitest-browser-preact';
import { page, userEvent } from 'vitest/browser';

const HelloWorld = () => {
	return <div>Hello World</div>;
};

const Counter = props => {
	const [count, setCount] = useState(props.initialCount);
	return (
		<div>
			<div>Count is {count}</div>
			<button onClick={() => setCount(count + 1)}>Increment</button>
		</div>
	);
};

const Input = () => {
	const [value, setValue] = useState('');
	const onChange = e => setValue(e.target.value + '!');
	return <input value={value} onInput={onChange} />;
};

test('renders simple component', async () => {
	const screen = render(<HelloWorld />);
	await expect.element(page.getByText('Hello World')).toBeVisible();
	expect(screen.container.innerHTML).toMatchSnapshot();
});

test('injects stable locator test ids', () => {
	const screen = render(<HelloWorld />);
	expect(screen.baseElement.getAttribute('data-testid')).toMatch(
		/^__vitest_\d+__$/
	);
	expect(screen.container.getAttribute('data-testid')).toMatch(
		/^__vitest_\d+__$/
	);
});

test('exports RenderOptions type', () => {
	const options: RenderOptions = {};
	expect(options).toEqual({});
});

test('renders counter', async () => {
	const screen = render(<Counter initialCount={1} />);

	await expect.element(screen.getByText('Count is 1')).toBeVisible();
	await screen.getByRole('button', { name: 'Increment' }).click();
	await expect.element(screen.getByText('Count is 2')).toBeVisible();
});

test('renders counter with user event', async () => {
	const screen = render(<Input />);
	await userEvent.fill(screen.getByRole('textbox'), 'Hello');
	await expect.element(screen.getByRole('textbox')).toHaveValue('Hello!');
});

test('renders counter with wrapper', async () => {
	const Wrapper = ({ children }) => (
		<div id="wrapper">Wrapper of {children}</div>
	);
	const screen = render(<Counter initialCount={1} />, { wrapper: Wrapper });
	await expect.element(screen.getByText('Count is 1')).toBeVisible();
	await expect.element(screen.getByText(/Wrapper of/)).toBeVisible();
});
