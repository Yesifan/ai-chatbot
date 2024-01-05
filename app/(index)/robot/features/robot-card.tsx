import { Robot } from '@/types/database'
import { Badge } from '@/components/ui/badge'
import { RobotAvatar } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface RobotCardProps extends React.HtmlHTMLAttributes<HTMLDivElement> {
  tags?: string[]
  template: Partial<Pick<Robot, 'name' | 'pinPrompt' | 'input_template'>>
}

export function RobotCard({
  tags,
  template,
  className,
  ...props
}: RobotCardProps) {
  return (
    <div
      className={cn(
        'flex w-72 cursor-pointer flex-col gap-2 rounded-lg border bg-background/80 p-4 backdrop-blur transition-transform hover:scale-105',
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
