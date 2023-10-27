import { getChats, removeChat, shareChat } from '@/app/actions'
import { ChatItemActions } from '@/components/history-chat-actions'
import { ChatItem } from '@/components/history-chat-item'

export async function HistoryChatList() {
  const chats = await getChats()

  return (
    <div className="flex-1 overflow-auto">
      {chats?.length ? (
        <div className="space-y-2 px-2">
          {chats.map(
            chat =>
              chat && (
                <ChatItem key={chat?.id} chat={chat}>
                  <ChatItemActions
                    chat={chat}
                    removeChat={removeChat}
                    shareChat={shareChat}
                  />
                </ChatItem>
              )
          )}
        </div>
      ) : (
        <div className="p-8 text-center">
          <p className="text-sm text-muted-foreground">No chat history</p>
        </div>
      )}
    </div>
  )
}
