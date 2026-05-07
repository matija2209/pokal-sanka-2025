import Link from 'next/link'
import { getActiveEvent } from '@/lib/events'
import { updateActiveEventName } from './actions'

import { ResetDatabaseForm } from '@/components/superadmin/reset-db-form'

type SuperAdminPageProps = {
  searchParams?: Promise<{
    event?: string
    reset?: string
  }>
}

export default async function SuperAdminPage({ searchParams }: SuperAdminPageProps) {
  const activeEvent = await getActiveEvent()
  const params = searchParams ? await searchParams : undefined
  const eventStatus = params?.event
  const resetStatus = params?.reset

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold text-red-600 mb-8">Super Admin Panel</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link 
          href="/superadmin/trivia" 
          className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-red-400 hover:shadow-md transition-all group shadow-sm"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">Trivia Manager</h2>
          <p className="text-gray-700 font-medium">Manage quiz categories, questions, results, and player powers.</p>
        </Link>
        
        <Link 
          href="/superadmin/bachelor" 
          className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-red-400 hover:shadow-md transition-all group shadow-sm"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">Bachelor Admin</h2>
          <p className="text-gray-700 font-medium">Approve sightings and manage hype events for the bachelor party.</p>
        </Link>
      </div>

      <div className="bg-white border-2 border-gray-200 rounded-xl p-6 mb-8 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Active Event</h2>
        <p className="text-gray-800 text-base mb-6 bg-gray-50 inline-block px-4 py-2 rounded-lg border border-gray-100 font-medium">
          Current event: <span className="font-black text-gray-900">{activeEvent?.name ?? 'No active event'}</span>
        </p>

        {eventStatus === 'updated' && (
          <p className="text-green-900 font-bold bg-green-100 border-2 border-green-400 rounded-xl px-4 py-3 mb-6">
            Event name updated successfully.
          </p>
        )}
        {eventStatus === 'missing-name' && (
          <p className="text-amber-900 font-bold bg-amber-100 border-2 border-amber-400 rounded-xl px-4 py-3 mb-6">
            Event name is required.
          </p>
        )}
        {eventStatus === 'no-active-event' && (
          <p className="text-amber-900 font-bold bg-amber-100 border-2 border-amber-400 rounded-xl px-4 py-3 mb-6">
            No active event found.
          </p>
        )}
        {eventStatus === 'error' && (
          <p className="text-red-900 font-bold bg-red-100 border-2 border-red-400 rounded-xl px-4 py-3 mb-6">
            Failed to update event name.
          </p>
        )}

        <form action={updateActiveEventName} className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="w-full sm:max-w-md">
            <label htmlFor="eventName" className="block text-base font-bold text-gray-900 mb-2">
              Event name
            </label>
            <input
              id="eventName"
              name="eventName"
              defaultValue={activeEvent?.name ?? ''}
              className="w-full rounded-xl border-2 border-gray-300 px-4 py-4 text-base text-gray-900 font-medium focus:border-blue-500 outline-none"
              placeholder="Enter event name"
              required
              maxLength={120}
            />
          </div>
          <button
            type="submit"
            className="bg-gray-900 hover:bg-black active:bg-blue-900 text-white font-bold py-4 px-6 rounded-xl transition-colors min-h-[56px] shadow-sm"
          >
            Save Event Name
          </button>
        </form>
      </div>

      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-red-800 mb-4 flex items-center gap-2">
          <span>⚠️</span> Danger Zone
        </h2>
        <p className="text-red-900 font-bold text-base mb-6">
          This permanently deletes teams, users, feed posts, drink logs, commentary, trivia, and bachelor data for
          the <span className="underline">{activeEvent?.name ?? 'current'}</span> event only. Other events and event
          settings are not removed.
        </p>

        {resetStatus === 'success' && (
          <p className="text-green-900 font-bold bg-green-100 border-2 border-green-400 rounded-xl px-4 py-3 mb-6">
            Event data reset completed.
          </p>
        )}
        {resetStatus === 'schema-required' && (
          <p className="text-amber-900 font-bold bg-amber-100 border-2 border-amber-400 rounded-xl px-4 py-3 mb-6">
            Event-scoped reset needs the multi-event database schema (eventId columns). Use a full migration or
            contact support.
          </p>
        )}
        {resetStatus === 'no-event' && (
          <p className="text-amber-900 font-bold bg-amber-100 border-2 border-amber-400 rounded-xl px-4 py-3 mb-6">
            No event found to reset. Create or select an active event first.
          </p>
        )}

        <ResetDatabaseForm eventName={activeEvent?.name ?? 'Unknown event'} />
      </div>
    </div>
  )
}