import Link from 'next/link'
import { RobotCard } from '../features/robot-card'
import { RobotSidebar } from '../features/robot-sidebar'
import { RobotTemplate } from '@/types/api'
import { RobotHeader } from '../features/robot-header'

export const runtime = 'edge'

export const DEFAULT_ROBOT_TEMP: RobotTemplate = {
  id: 'you_ai_assiatnat',
  name: 'You Ai Assistant',
  // auth: 'Your ai assistant, to help you with anything.',
  description: 'Your ai assistant, to help you with anything.',
  // releaseDate: 'Your ai assistant, to help you with anything.',
  pinPrompt:
    'Take a deep breath and help the questioner solve the problem step by step.',
  tags: ['Assistant']
}

export default async function RobotPage({
  params
}: {
  params: { id?: [string] }
}) {
  const id = params.id ? params.id[0] : undefined

  return (
    <section className="flex h-screen flex-col bg-muted">
      <RobotHeader className="sticky top-0 z-50" />
      <div className="relative flex flex-1">
        <div className="flex h-full flex-1 flex-wrap gap-4 overflow-y-auto p-6">
          <Link href={`/robot/${DEFAULT_ROBOT_TEMP.id}`}>
            <RobotCard template={DEFAULT_ROBOT_TEMP} />
          </Link>
        </div>
        {id && <RobotSidebar id={id} className="shrink-0" />}
      </div>
    </section>
  )
}
