export const enum Platform {
  Windows = 'Windows',
  Mac = 'Mac',
  Mobile = 'Mobile'
}

export function getPlatform() {
  if (typeof window !== 'undefined') {
    // use client
    const userAgent = navigator?.userAgent

    if (/Win/i.test(userAgent)) {
      return Platform.Windows
    }

    if (/Mac/i.test(userAgent)) {
      return Platform.Mac
    }

    if (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        userAgent
      )
    ) {
      return Platform.Mobile
    }

    return Platform.Windows
  } else {
    return Platform.Windows
  }
}
