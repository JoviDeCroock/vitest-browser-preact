import { expect, test } from 'vitest'
import { page, userEvent } from '@vitest/browser/context'
import { render } from 'vitest-browser-preact'
import { useState } from 'preact/hooks'

const HelloWorld = () => {
  return <div>Hello World</div>
}

const Counter = (props) => {
  const [count, setCount] = useState(props.initialCount)
  return (
    <div>
        <div>Count is {count}</div>
        <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  )
}

const Input = () => {
    const [value, setValue] = useState('')
    const onChange = (e) => setValue(e.target.value + '!')
    return <input value={value} onInput={onChange} />
}

test('renders simple component', async () => {
  const screen = render(<HelloWorld />)
  await expect.element(page.getByText('Hello World')).toBeVisible()
  expect(screen.container).toMatchSnapshot()
})

test('renders counter', async () => {
  const screen = render(<Counter initialCount={1} />)

  await expect.element(screen.getByText('Count is 1')).toBeVisible()
  await screen.getByRole('button', { name: 'Increment' }).click()
  await expect.element(screen.getByText('Count is 2')).toBeVisible()
})

test('renders counter with user event', async () => {
  const screen = render(<Input />)
  await userEvent.fill(screen.getByRole('textbox'), 'Hello')
  await expect.element(screen.getByRole('textbox')).toHaveValue('Hello!')
})
