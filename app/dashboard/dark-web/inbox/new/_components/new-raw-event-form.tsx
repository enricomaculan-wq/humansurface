'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { createRawEventAction, type CreateRawEventState } from '../actions'

const initialState: CreateRawEventState = {
  error: null,
}

const sourceTypes = [
  { value: 'stealer_log', label: 'Stealer log' },
  { value: 'forum_post', label: 'Forum post' },
  { value: 'marketplace', label: 'Marketplace' },
  { value: 'telegram_channel', label: 'Telegram channel' },
  { value: 'paste_site', label: 'Paste site' },
]

const eventTypes = [
  { value: 'credential_exposure', label: 'Credential exposure' },
  { value: 'stealer_detected', label: 'Stealer detected' },
  { value: 'brand_mention', label: 'Brand mention' },
  { value: 'pii_exposure', label: 'PII exposure' },
  { value: 'access_mention', label: 'Access mention' },
]

const templates = [
  {
    label: 'Credential exposure',
    values: {
      source_type: 'stealer_log',
      event_type: 'credential_exposure',
      title: 'Critical credential exposure detected',
      email: 'admin@humansurface.demo',
      domain: 'humansurface.demo',
      brand: '',
      username: '',
      snippet: 'Matched asset: admin@humansurface.demo in credential context',
      url: 'https://portal.humansurface.demo/login',
    },
  },
  {
    label: 'Brand mention',
    values: {
      source_type: 'forum_post',
      event_type: 'brand_mention',
      title: 'Brand mention detected in phishing context',
      email: '',
      domain: 'humansurface.demo',
      brand: 'HumanSurface',
      username: '',
      snippet: 'Human Surface login assets mentioned in phishing discussion',
      url: '',
    },
  },
  {
    label: 'Access mention',
    values: {
      source_type: 'marketplace',
      event_type: 'access_mention',
      title: 'Domain referenced in access-related underground listing',
      email: '',
      domain: 'humansurface.demo',
      brand: '',
      username: 'admin.panel',
      snippet: 'Primary domain appears in access brokerage context',
      url: '',
    },
  },
]

export function NewRawEventForm() {
  const [state, formAction, isPending] = useActionState(
    createRawEventAction,
    initialState
  )

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="mb-3 text-sm font-medium text-white">Quick templates</div>
        <div className="flex flex-wrap gap-2">
          {templates.map((template) => (
            <button
              key={template.label}
              type="button"
              onClick={() => {
                const form = document.getElementById('new-raw-event-form') as HTMLFormElement | null
                if (!form) return

                ;(form.elements.namedItem('source_type') as HTMLSelectElement).value =
                  template.values.source_type
                ;(form.elements.namedItem('event_type') as HTMLSelectElement).value =
                  template.values.event_type
                ;(form.elements.namedItem('title') as HTMLInputElement).value =
                  template.values.title
                ;(form.elements.namedItem('email') as HTMLInputElement).value =
                  template.values.email
                ;(form.elements.namedItem('domain') as HTMLInputElement).value =
                  template.values.domain
                ;(form.elements.namedItem('brand') as HTMLInputElement).value =
                  template.values.brand
                ;(form.elements.namedItem('username') as HTMLInputElement).value =
                  template.values.username
                ;(form.elements.namedItem('snippet') as HTMLTextAreaElement).value =
                  template.values.snippet
                ;(form.elements.namedItem('url') as HTMLInputElement).value =
                  template.values.url
              }}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-white/10"
            >
              {template.label}
            </button>
          ))}
        </div>
      </div>

      <form id="new-raw-event-form" action={formAction} className="grid gap-4">
        {state.error ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
            {state.error}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm text-slate-300">Source type</label>
            <select
              name="source_type"
              defaultValue="stealer_log"
              className="w-full rounded-xl border border-white/10 bg-[#020817] px-3 py-2 text-sm text-white outline-none"
              required
            >
              {sourceTypes.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">Event type</label>
            <select
              name="event_type"
              defaultValue="credential_exposure"
              className="w-full rounded-xl border border-white/10 bg-[#020817] px-3 py-2 text-sm text-white outline-none"
              required
            >
              {eventTypes.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm text-slate-300">Source name</label>
          <input
            name="source_name"
            type="text"
            defaultValue="Demo Feed"
            className="w-full rounded-xl border border-white/10 bg-[#020817] px-3 py-2 text-sm text-white outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-slate-300">External id</label>
          <input
            name="external_id"
            type="text"
            placeholder="Optional unique reference"
            className="w-full rounded-xl border border-white/10 bg-[#020817] px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-slate-300">Title</label>
          <input
            name="title"
            type="text"
            className="w-full rounded-xl border border-white/10 bg-[#020817] px-3 py-2 text-sm text-white outline-none"
            required
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm text-slate-300">Email</label>
            <input
              name="email"
              type="text"
              placeholder="admin@humansurface.demo"
              className="w-full rounded-xl border border-white/10 bg-[#020817] px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">Domain</label>
            <input
              name="domain"
              type="text"
              placeholder="humansurface.demo"
              className="w-full rounded-xl border border-white/10 bg-[#020817] px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm text-slate-300">Brand</label>
            <input
              name="brand"
              type="text"
              placeholder="HumanSurface"
              className="w-full rounded-xl border border-white/10 bg-[#020817] px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">Username</label>
            <input
              name="username"
              type="text"
              placeholder="admin.panel"
              className="w-full rounded-xl border border-white/10 bg-[#020817] px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm text-slate-300">URL</label>
          <input
            name="url"
            type="text"
            placeholder="https://example.com/login"
            className="w-full rounded-xl border border-white/10 bg-[#020817] px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-slate-300">Snippet</label>
          <textarea
            name="snippet"
            rows={5}
            className="w-full rounded-xl border border-white/10 bg-[#020817] px-3 py-2 text-sm text-white outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-full border border-sky-400/30 bg-sky-500/10 px-4 py-2 text-sm text-sky-200 transition hover:bg-sky-500/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? 'Creating...' : 'Create raw event'}
          </button>

          <Link
            href="/dashboard/dark-web/inbox"
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}