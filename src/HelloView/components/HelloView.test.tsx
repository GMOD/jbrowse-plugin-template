import React from 'react'
import { render, fireEvent, waitFor, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import HelloView from './HelloView'

describe('<HelloView />', () => {
  it('renders and reacts to button push', async () => {
    render(<HelloView />)

    expect(screen.getByRole('heading')).toHaveTextContent(
      'Hello plugin developers!',
    )

    fireEvent.click(screen.getByText('Push the button'))
    const element = await waitFor(() =>
      screen.getByText('Whoa! You pushed the button!'),
    )
    expect(element).toBeTruthy()
  })
})
