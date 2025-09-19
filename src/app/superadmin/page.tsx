import { resetDatabase } from './actions'

export default function SuperAdminPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold text-red-600 mb-8">Super Admin Panel</h1>
      
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-red-800 mb-4">Danger Zone</h2>
        <p className="text-red-700 mb-6">
          This action will permanently delete ALL data from the database. This cannot be undone.
        </p>
        
        <form action={resetDatabase}>
          <button
            type="submit"
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            🗑️ RESET DATABASE
          </button>
        </form>
      </div>
    </div>
  )
}