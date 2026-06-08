export default function MailboxPanel({ messages }) {
  if (!messages?.length) {
    return <p className="muted-text">No messages in mailbox.</p>
  }

  return (
    <ul className="mailbox-list">
      {messages.map((message, idx) => (
        <li key={idx} className={`mailbox-item${message.unread ? ' unread' : ''}`}>
          <div className="mailbox-item-header">
            <span className="mailbox-subject">{message.subject}</span>
            {message.unread ? <span className="mailbox-unread-dot" aria-label="Unread" /> : null}
          </div>
          <p className="mailbox-preview">{message.preview}</p>
          <div className="mailbox-meta">
            <span>{message.from}</span>
            <span>{message.date}</span>
          </div>
        </li>
      ))}
    </ul>
  )
}
