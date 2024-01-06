import Link from 'next/link'
import { RobotCard } from '../features/robot-card'
import { RobotSidebar } from '../features/robot-sidebar'
import { RobotHeader } from '../features/robot-header'
import { getRobotTemplates, getTemplatePrompt } from '@/app/actions/robot'

export const runtime = 'edge'

export default async function RobotPage({
  params
}: {
  params: { id?: [string] }
}) {
  const id = params.id ? params.id[0] : undefined
  const robots = await getRobotTemplates()
  const selectRobot = robots.find(robot => robot.id === id)
  const promptRes = selectRobot ? await getTemplatePrompt(id!) : undefined
  const prompt = typeof promptRes === 'string' ? promptRes : undefined
  return (
    <section className="flex h-screen flex-col bg-muted">
      <RobotHeader className="sticky top-0 z-50" />
      <div className="relative flex h-1 flex-1">
        <div className="flex h-full flex-1 flex-wrap gap-6 overflow-y-auto p-6">
          {robots.map(template => (
            <Link href={`/robot/${template.id}`} key={template.id}>
              <RobotCard template={template} isActive={template.id === id} />
            </Link>
          ))}
          {robots.map(template => (
            <Link href={`/robot/${template.id}`} key={template.id}>
              <RobotCard template={template} isActive={template.id === id} />
            </Link>
          ))}
          {robots.map(template => (
            <Link href={`/robot/${template.id}`} key={template.id}>
              <RobotCard template={template} isActive={template.id === id} />
            </Link>
          ))}
          {robots.map(template => (
            <Link href={`/robot/${template.id}`} key={template.id}>
              <RobotCard template={template} isActive={template.id === id} />
            </Link>
          ))}
        </div>
        {selectRobot && (
          <RobotSidebar
            template={selectRobot}
            prompt={prompt}
            className="shrink-0"
          />
        )}
      </div>
    </section>
  )
}
