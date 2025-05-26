# Vitest Browser Preact

A modern testing setup demonstrating browser-based testing for Preact components using Vitest. This project showcases how to effectively test Preact components with real browser interactions, making it perfect for testing complex UI behaviors.

## Getting Started

```bash
pnpm add vitest-browser-preact
```

### Example

```tsx
import { render } from 'vitest-browser-preact'
import { expect, test } from 'vitest'

test('renders counter', async () => {
  const screen = render(<Counter initialCount={1} />);
  await expect.element(screen.getByText('Count is 1')).toBeVisible();
  await screen.getByRole('button', { name: 'Increment' }).click();
  await expect.element(screen.getByText('Count is 2')).toBeVisible();
});
```

You can also fully rely on the `page` object, this library injects `.render` on the `page`
object.

```tsx
import { expect, test } from 'vitest'

test('renders counter', async () => {
  const screen = page.render(<Counter initialCount={1} />);
  await expect.element(screen.getByText('Count is 1')).toBeVisible();
  await screen.getByRole('button', { name: 'Increment' }).click();
  await expect.element(screen.getByText('Count is 2')).toBeVisible();
});
```

## Render Options

The `render` function accepts an options object as its second parameter with the following properties:

```ts
interface ComponentRenderOptions {
  // Optional HTMLElement where the component will be rendered
  container?: HTMLElement;
  // Optional HTMLElement that serves as the base element (defaults to document.body)
  baseElement?: HTMLElement;
  // Optional wrapper component that can wrap the rendered component
  wrapper?: ({ children }: { children: JSX.Element }) => JSX.Element;
}
```

Example with options:

```tsx
import { render } from 'vitest-browser-preact'

test('renders with custom container', () => {
  const screen = render(<MyComponent />, { 
    wrapper: ({ children }) => (
      <Context.Provider value={{ foo: 'bar' }}>
        {children}
      </Context.Provider>
    )
  });
});
```

## Contributing

Feel free to open issues and pull requests. All contributions are welcome!

## License

MIT 
