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

## Contributing

Feel free to open issues and pull requests. All contributions are welcome!

## License

MIT 
