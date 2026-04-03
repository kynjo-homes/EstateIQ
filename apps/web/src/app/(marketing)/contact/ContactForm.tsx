'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function ContactForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
        }),
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) {
        setError(data.error ?? 'Could not send. Please try again or email us directly.')
        return
      }
      setDone(true)
      setName('')
      setEmail('')
      setMessage('')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <p className="text-sm text-green-700 pt-2">
        Thank you — your message was sent. We will get back to you soon.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      <div>
        <label htmlFor="contact-name" className="block text-xs font-medium text-gray-700 mb-1">
          Name
        </label>
        <input
          id="contact-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600/30"
          autoComplete="name"
        />
      </div>
      <div>
        <label htmlFor="contact-email" className="block text-xs font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          id="contact-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600/30"
          autoComplete="email"
          required
        />
      </div>
      <div>
        <label htmlFor="contact-message" className="block text-xs font-medium text-gray-700 mb-1">
          Message
        </label>
        <textarea
          id="contact-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600/30 resize-y min-h-[120px]"
          required
        />
      </div>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
      <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700 text-white">
        {loading ? 'Sending…' : 'Send message'}
      </Button>
      <p className="text-xs text-gray-500">
        Submissions are delivered to contact@kynjo.homes. You can also reach us using the details on
        the left.
      </p>
    </form>
  )
}
