import Image from 'next/image'
import favicon from '@/public/favicon.png'

export function NotLogin() {
  return (
    <div className="mx-auto mb-8 max-w-2xl px-4">
      <div className="flex rounded-lg border bg-background p-8">
        <Image src={favicon} alt="Favicon" width={60} height={60} />
        <div className="ml-6">
          <h1 className="mb-2 text-lg font-semibold">Welcome to AI Chatbot!</h1>
          <p className="leading-normal text-muted-foreground">
            Please enter your Access Toekn first. Then start the AI tour.
          </p>
        </div>
      </div>
    </div>
  )
}
