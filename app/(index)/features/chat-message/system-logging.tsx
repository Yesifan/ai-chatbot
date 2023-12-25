// Inspired by Chatbot-UI and modified to fit the needs of this project
// @see https://github.com/mckaywrigley/chatbot-ui/blob/main/components/Chat/ChatMessage.tsx
import Image from 'next/image'
import keyPic from '@/public/images/key.webp'

export function ChatMessageLogging() {
  return (
    <div className="flex items-center">
      <div className="h-36 w-36 rounded-md bg-secondary p-4">
        <Image src={keyPic} alt="key" width={128} height={128} />
      </div>
    </div>
  )
}
