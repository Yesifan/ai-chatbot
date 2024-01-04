import { createRobot } from '@/app/actions/robot'
import { RobotAvatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Robot } from '@/types/database'

export const runtime = 'edge'

const ROBOT_DEFAULT_TEMPLATE = {
  name: 'You Ai Assistant',
  pinPrompt: 'Your ai assistant, to help you with anything.',
  tags: ['Assistant']
}

interface RobotCardProps extends React.HtmlHTMLAttributes<HTMLDivElement> {
  tags?: string[]
  template: Partial<Pick<Robot, 'name' | 'pinPrompt' | 'input_template'>>
}

function RobotCard({ tags, template, className, ...props }: RobotCardProps) {
  const createRobotHandle = async () => {
    const robot = await createRobot(template)
  }
  return (
    <div
      className={cn(
        'flex w-72 cursor-pointer flex-col gap-2 rounded-lg border bg-background p-4 transition-transform hover:scale-105',
        className
      )}
      {...props}
    >
      <RobotAvatar className="h-14 w-14 rounded bg-secondary p-2 " />
      <h3 className="font-semibold">{template.name}</h3>
      <p className="line-clamp-2 h-10 text-sm text-primary/60">
        {template.pinPrompt}
      </p>
      <div className="h-[22px]">
        {tags?.map(tag => (
          <Badge variant="secondary" key={tag}>
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  )
}

export default async function IndexPage() {
  return (
    <section className="min-h-screen bg-theme-gradient">
      <header className="sticky top-0 z-50 bg-gradient-to-br from-background/70 via-background/50 to-background/10 px-6 py-4 text-xl font-semibold backdrop-blur-xl">
        Robot Template
      </header>
      <div className="flex p-6">
        <RobotCard
          template={ROBOT_DEFAULT_TEMPLATE}
          tags={ROBOT_DEFAULT_TEMPLATE.tags}
        />
      </div>
    </section>
  )
}
