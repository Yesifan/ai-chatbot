import { Markdown } from './markdown'

export function PinPrompt({ content }: { content: string }) {
  return (
    <div className="mx-auto mb-8 max-w-2xl px-4">
      <div className="flex rounded-lg border bg-background p-8">
        <Markdown content={content} />
      </div>
    </div>
  )
}
