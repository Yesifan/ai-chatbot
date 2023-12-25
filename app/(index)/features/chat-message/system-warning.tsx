// Inspired by Chatbot-UI and modified to fit the needs of this project
// @see https://github.com/mckaywrigley/chatbot-ui/blob/main/components/Chat/ChatMessage.tsx

export function ChatMessageWarning({ content }: { content: string }) {
  return (
    <div className="flex rounded-md border border-warning/80 bg-warning/20 px-4 py-2 text-warning">
      <div className="mr-1">⚠️</div>
      <div>{content}</div>
    </div>
  )
}
