import { getCurrentUser } from '@/lib/utils/cookies'
import { getAllUsersWithTeamAndDrinks } from '@/lib/prisma/fetchers'
import { redirect } from 'next/navigation'
import { DrinkLogForm } from '@/components/drinks'
import { calculateUserScore, sortUsersByScore } from '@/lib/utils/calculations'

export default async function PlayersPage() {
  const currentUser = await getCurrentUser()
  
  if (!currentUser) {
    redirect('/')
  }
  
  if (!currentUser.teamId) {
    redirect('/select-team')
  }
  
  const allUsers = await getAllUsersWithTeamAndDrinks()
  const sortedUsers = sortUsersByScore(allUsers)
  
  const usersForDropdown = allUsers.map(user => ({
    id: user.id,
    name: user.name,
    team: user.team ? { name: user.team.name, color: user.team.color } : null
  }))
  
  return (
    <div className="container mx-auto p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Turnir Šanka Leaderboard</h1>
        <p className="text-gray-600">Track your drinks and compete with other players!</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Drink Logging Form */}
        <div className="lg:col-span-1">
          <DrinkLogForm 
            currentUserId={currentUser.id}
            allUsers={usersForDropdown}
          />
        </div>
        
        {/* Leaderboard */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Leaderboard</h2>
              <div className="space-y-3">
                {sortedUsers.map((user, index) => {
                  const score = calculateUserScore(user.drinkLogs)
                  const isCurrentUser = user.id === currentUser.id
                  
                  return (
                    <div 
                      key={user.id} 
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        isCurrentUser ? 'bg-blue-50 border-blue-200 border' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-lg font-bold text-gray-500 w-8">
                          #{index + 1}
                        </div>
                        <div className="flex items-center gap-2">
                          {user.team && (
                            <div 
                              className="w-4 h-4 rounded" 
                              style={{ backgroundColor: user.team.color }}
                            />
                          )}
                          <span className={`font-medium ${isCurrentUser ? 'text-blue-700' : ''}`}>
                            {user.name}
                            {isCurrentUser && ' (You)'}
                          </span>
                          {user.team && (
                            <span className="text-sm text-gray-500">
                              {user.team.name}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className={`text-xl font-bold ${
                        isCurrentUser ? 'text-blue-700' : 'text-gray-900'
                      }`}>
                        {score} pts
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}