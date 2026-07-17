import { RouterProvider } from 'react-router/dom'
import type { AppRouter } from './router'

export default function App({ router }: { router: AppRouter }) {
  return <RouterProvider router={router} />
}
