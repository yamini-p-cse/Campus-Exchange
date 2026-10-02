import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { EmptyState } from '../components/ui/EmptyState'
import { getMessagesForUser, sendListingMessage } from '../features/messages/messageService'
import { getProfiles } from '../features/profile/profileService'
import { getListing } from '../features/listings/listingService'
import { useAuth } from '../features/auth/useAuth'
import type { Listing } from '../types/listing'
import type { ListingMessage, MessageWithListing } from '../types/message'
import type { StudentProfile } from '../types/profile'
import { supabase } from '../lib/supabase'

interface Conversation {
  key: string
  listingId: string
  listingTitle: string
  participantId: string
  latestMessage: ListingMessage
}

export function MessagesPage() {
  const { user } = useAuth()
  const userId = user?.id
  const [searchParams] = useSearchParams()
  const requestedListingId = searchParams.get('listingId')
  const requestedParticipantId = searchParams.get('participantId')
  const [messages, setMessages] = useState<MessageWithListing[]>([])
  const [profiles, setProfiles] = useState<StudentProfile[]>([])
  const [openingListing, setOpeningListing] = useState<Listing | null>(null)
  const [messageText, setMessageText] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const activeUserId: string = userId ?? ''
    if (!activeUserId) return
    let isMounted = true

    async function loadInbox() {
      setIsLoading(true)
      setError('')
      try {
        const [messageResult, listingResult] = await Promise.all([
          getMessagesForUser(activeUserId),
          requestedListingId ? getListing(requestedListingId) : Promise.resolve({ data: null, error: null }),
        ])
        if (messageResult.error) throw messageResult.error
        if (listingResult.error) throw listingResult.error
        const loadedMessages = (messageResult.data ?? []) as unknown as MessageWithListing[]
        const participantIds = [...new Set(loadedMessages.flatMap((message) => [message.sender_id, message.recipient_id]).filter((id) => id !== activeUserId))]
        const profileResult = participantIds.length ? await getProfiles(participantIds) : { data: [], error: null }
        if (profileResult.error) throw profileResult.error
        if (!isMounted) return
        setMessages(loadedMessages)
        setProfiles(profileResult.data ?? [])
        setOpeningListing((listingResult.data as Listing | null) ?? null)
      } catch (caughtError) {
        if (isMounted) setError(caughtError instanceof Error ? caughtError.message : 'Your inbox could not be loaded.')
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    void loadInbox()
    return () => { isMounted = false }
  }, [requestedListingId, userId])

  useEffect(() => {
    const client = supabase
    if (!client || !userId) return

    const channel = client
      .channel(`listing-messages-${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'listing_messages',
        filter: `recipient_id=eq.${userId}`,
      }, (payload) => {
        const incomingMessage = payload.new as ListingMessage
        void getListing(incomingMessage.listing_id).then(({ data }) => {
          const listing = data as Listing | null
          setMessages((current) => current.some((message) => message.id === incomingMessage.id)
            ? current
            : [...current, {
              ...incomingMessage,
              listing: listing ? { title: listing.title, seller_id: listing.seller_id } : null,
            }])
        }).catch(() => undefined)
      })
      .subscribe()

    return () => {
      void client.removeChannel(channel)
    }
  }, [userId])

  const conversationsByKey = new Map<string, Conversation>()
  for (const message of messages) {
    const participantId = message.sender_id === user?.id ? message.recipient_id : message.sender_id
    const key = `${message.listing_id}:${participantId}`
    conversationsByKey.set(key, {
      key,
      listingId: message.listing_id,
      listingTitle: message.listing?.title ?? 'Listing',
      participantId,
      latestMessage: message,
    })
  }
  const conversations = [...conversationsByKey.values()].sort((first, second) =>
    second.latestMessage.created_at.localeCompare(first.latestMessage.created_at),
  )
  const activeConversation = requestedParticipantId
    ? conversations.find((conversation) => conversation.listingId === requestedListingId && conversation.participantId === requestedParticipantId)
    : requestedListingId
      ? conversations.find((conversation) => conversation.listingId === requestedListingId)
      : conversations[0]
  const activeListingId = requestedListingId ?? activeConversation?.listingId
  const activeListing = openingListing?.id === activeListingId ? openingListing : null
  const activeParticipantId = requestedParticipantId ?? activeConversation?.participantId ?? (
    activeListing && activeListing.seller_id !== user?.id ? activeListing.seller_id : null
  )
  const activeMessages = messages.filter((message) =>
    message.listing_id === activeListingId && activeParticipantId &&
    ((message.sender_id === user?.id && message.recipient_id === activeParticipantId) ||
      (message.sender_id === activeParticipantId && message.recipient_id === user?.id)),
  )
  const otherPerson = profiles.find((profile) => profile.user_id === activeParticipantId)
  const activeTitle = activeListing?.title ?? activeConversation?.listingTitle ?? 'Conversation'

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!user || !activeListingId || !activeParticipantId || !messageText.trim()) return
    setIsSending(true)
    setError('')
    try {
      const { data, error: sendError } = await sendListingMessage({
        listing_id: activeListingId,
        sender_id: user.id,
        recipient_id: activeParticipantId,
        body: messageText.trim(),
      })
      if (sendError) throw sendError
      setMessages((current) => [...current, {
        ...(data as ListingMessage),
        listing: activeListing ? { title: activeListing.title, seller_id: activeListing.seller_id } : activeMessages[0]?.listing ?? null,
      }])
      setMessageText('')
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Your message could not be sent.')
    } finally {
      setIsSending(false)
    }
  }

  if (isLoading) return <section className="message-page"><p role="status">Loading your inbox…</p></section>

  return (
    <section className="messages-page">
      <div className="account-page__heading">
        <div><p className="eyebrow">Campus Exchange</p><h1>Messages</h1></div>
      </div>
      {error && <p className="auth-message auth-message--error" role="alert">{error}</p>}
      <div className="messages-layout">
        <aside className="conversation-list" aria-label="Conversations">
          <h2>Conversations</h2>
          {conversations.length ? conversations.map((conversation) => (
            <Link
              className={`conversation-link${conversation.key === `${activeListingId}:${activeParticipantId}` ? ' is-active' : ''}`}
              key={conversation.key}
              to={`/messages?listingId=${conversation.listingId}&participantId=${conversation.participantId}`}
            >
              <strong>{conversation.listingTitle}</strong>
              <span>{profiles.find((profile) => profile.user_id === conversation.participantId)?.display_name ?? 'Student'}</span>
              <small>{conversation.latestMessage.body}</small>
            </Link>
          )) : <p className="conversation-list__empty">No conversations yet.</p>}
        </aside>
        <section className="conversation-panel" aria-label="Selected conversation">
          {activeListingId && activeParticipantId ? (
            <>
              <header className="conversation-panel__header">
                <div><h2>{activeTitle}</h2><p>{otherPerson?.display_name ?? 'Student'}</p></div>
                <Link className="text-link" to={`/listings/${activeListingId}`}>View item</Link>
              </header>
              <div className="message-thread" aria-live="polite">
                {activeMessages.length ? activeMessages.map((message) => (
                  <article className={`message-bubble${message.sender_id === user?.id ? ' is-mine' : ''}`} key={message.id}>
                    <p>{message.body}</p>
                    <time dateTime={message.created_at}>{new Date(message.created_at).toLocaleString()}</time>
                  </article>
                )) : <p className="message-thread__empty">Start the conversation about this item.</p>}
              </div>
              <form className="message-compose" onSubmit={(event) => void handleSubmit(event)}>
                <label className="visually-hidden" htmlFor="message-text">Write a message</label>
                <textarea id="message-text" maxLength={4000} onChange={(event) => setMessageText(event.target.value)} placeholder="Write a message…" required rows={3} value={messageText} />
                <button className="primary-button" disabled={isSending || !messageText.trim()} type="submit">{isSending ? 'Sending…' : 'Send message'}</button>
              </form>
            </>
          ) : activeListing && activeListing.seller_id === user?.id ? (
            <EmptyState message="Choose a conversation with a buyer from your inbox." />
          ) : (
            <EmptyState message="Choose a conversation, or open a listing to message its seller." />
          )}
        </section>
      </div>
    </section>
  )
}