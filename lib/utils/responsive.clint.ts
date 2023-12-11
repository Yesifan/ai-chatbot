import { UAParser } from 'ua-parser-js'

export function getPlatform() {
  const ua = new UAParser()
  return ua.getOS().name as 'Mac OS' | 'Windows' | undefined
}

export function isMobileDevice() {
  const ua = new UAParser()
  const device = ua.getDevice()
  return device.type === 'mobile'
}
