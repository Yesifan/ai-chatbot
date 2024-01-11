'use client'
import { atom } from 'jotai'
import { Chat } from '@/types/database'

export const chatSidebarStateAtom = atom(false)

export const chatListAtom = atom<Chat[] | undefined>(undefined)
