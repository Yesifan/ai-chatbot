import Link from 'next/link'
import { RobotCard } from '../features/robot-card'
import { RobotSidebar } from '../features/robot-sidebar'
import { RobotHeader } from '../features/robot-header'
import { DEFAULT_ROBOT_TEMP } from '@/lib/constants'

export const runtime = 'edge'

export default async function RobotPage({
  params
}: {
  params: { id?: [string] }
}) {
  const id = params.id ? params.id[0] : undefined

  const robots = [DEFAULT_ROBOT_TEMP]

  return (
    <section className="flex h-screen flex-col bg-muted">
      <RobotHeader className="sticky top-0 z-50" />
      <div className="relative flex flex-1">
        <div className="flex h-full flex-1 flex-wrap gap-4 overflow-y-auto p-6">
          {robots.map(template => (
            <Link href={`/robot/${template.id}`} key={template.id}>
              <RobotCard template={template} />
            </Link>
          ))}
        </div>
        {id && <RobotSidebar id={id} className="shrink-0" />}
      </div>
    </section>
  )
}
