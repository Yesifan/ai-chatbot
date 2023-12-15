import { ReloadButton } from './reload-button'
import { IconWifiSlash } from '@/components/ui/icons'

export default function FallbackPage() {
  return (
    <main className="flex h-screen flex-col items-center justify-center bg-background">
      <IconWifiSlash className="mb-12 h-24 w-24" />
      <h1 className="text-lg font-semibold">Oops! You are offline.</h1>
      <p>
        Please check your internet connection and
        <ReloadButton />
      </p>
    </main>
  )
}
