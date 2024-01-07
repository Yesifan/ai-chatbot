import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import Avatar, { RobotAvatar } from '@/components/ui/avatar'
import { type RobotTemplate } from '@/types/api'

interface RobotCardProps extends React.HtmlHTMLAttributes<HTMLDivElement> {
  isActive?: boolean
  template: RobotTemplate
}

export function RobotCard({
  template,
  isActive,
  className,
  ...props
}: RobotCardProps) {
  const { name, icon, cover, description, tags } = template
  return (
    <div
      className={cn('relative h-full max-w-72 cursor-pointer', className)}
      {...props}
    >
      {isActive && (
        <span className="absolute inline-flex h-full w-full animate-ping-sm rounded-lg bg-primary opacity-75" />
      )}
      <div
        className="relative flex h-full flex-col gap-2 rounded-lg bg-background bg-cover bg-center p-4 transition-transform hover:scale-105"
        style={{
          backgroundImage: cover ? `url(${cover})` : undefined
        }}
      >
        {icon ? (
          <Avatar
            className="h-14 w-14 rounded bg-secondary/20 p-2 text-4xl backdrop-blur"
            fallback={icon.startsWith('http') ? '🤖' : icon}
            src={icon.startsWith('http') ? icon : undefined}
          />
        ) : (
          <RobotAvatar className="h-14 w-14 rounded bg-secondary/20 p-2 backdrop-blur " />
        )}
        <h3 className="font-semibold drop-shadow-text dark:drop-shadow-text-dark">
          {name}
        </h3>
        <p className="line-clamp-2 h-10 text-sm text-primary/90 drop-shadow-text dark:drop-shadow-text-dark">
          {description}
        </p>
        <div className="flex flex-wrap gap-2">
          {tags?.map(tag => (
            <Badge
              key={tag}
              variant="secondary"
              className="bg-secondary/30 backdrop-blur"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )
}
