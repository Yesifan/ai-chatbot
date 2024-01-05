import Link from 'next/link'
import { RobotCard } from '../features/robot-card'
import { RobotSidebar } from '../features/robot-sidebar'

export const runtime = 'edge'

export const DEFAULT_ROBOT_TEMP = {
  id: 'you_ai_assiatnat',
  name: 'You Ai Assistant',
  // auth: 'Your ai assistant, to help you with anything.',
  // describe: 'Your ai assistant, to help you with anything.',
  // releaseDate: 'Your ai assistant, to help you with anything.',
  pinPrompt: 'Your ai assistant, to help you with anything.',
  tags: ['Assistant']
}

const RobotHeader = () => {
  return (
    <header className="sticky top-0 z-50 flex h-16 items-center bg-gradient-to-br from-background/70 via-background/50 to-background/10 px-6 text-xl font-semibold backdrop-blur-3xl">
      Robot Template
    </header>
  )
}

export default async function RobotPage({
  params
}: {
  params: { id?: [string] }
}) {
  const id = params.id ? params.id[0] : undefined

  return (
    <section className="min-h-screen bg-muted">
      <RobotHeader />
      <div className="relative flex min-h-[calc(100%-4rem)]">
        <div className="flex h-full flex-1 overflow-y-auto p-6">
          <Link href={`/robot/${DEFAULT_ROBOT_TEMP.id}`}>
            <RobotCard
              template={DEFAULT_ROBOT_TEMP}
              tags={DEFAULT_ROBOT_TEMP.tags}
            />
          </Link>
        </div>
        <RobotSidebar id={id} className="shrink-0" />
      </div>
    </section>
  )
}
