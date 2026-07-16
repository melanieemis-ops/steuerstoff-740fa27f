import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/erfolge')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/erfolge"!</div>
}
