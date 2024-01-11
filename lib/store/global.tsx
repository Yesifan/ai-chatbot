'use client'
import { atom } from 'jotai'
import { Chat } from '@/types/database'

const chatSidebarStateAtom = atom(false)
export const chatSidebarToogleAtom = atom(
  get => get(chatSidebarStateAtom),
  (get, set) => {
    set(chatSidebarStateAtom, value => !value)
  }
)

export const chatListAtom = atom<Chat[] | undefined>(undefined)
