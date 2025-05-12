import React from 'react';
import { UserPresence as UserPresenceType } from '../../types';

interface UserPresenceProps {
  users: UserPresenceType[];
}

const UserPresence: React.FC<UserPresenceProps> = ({ users }) => {
  if (users.length === 0) {
    return null;
  }

  // Sort users: first by whether they have a selection (active), then by name
  const sortedUsers = [...users].sort((a, b) => {
    const aHasSelection = !!a.selection;
    const bHasSelection = !!b.selection;
    
    if (aHasSelection && !bHasSelection) return -1;
    if (!aHasSelection && bHasSelection) return 1;
    return a.name.localeCompare(b.name);
  });

  const displayedUsers = sortedUsers.slice(0, 5);
  const remainingCount = sortedUsers.length - displayedUsers.length;

  return (
    <div className="flex items-center space-x-1">
      <div className="flex -space-x-2">
        {displayedUsers.map((user) => (
          <div
            key={user.userId}
            className="relative flex items-center justify-center w-8 h-8 rounded-full ring-2 ring-white"
            style={{ backgroundColor: user.color }}
            title={user.name}
          >
            <span className="text-xs font-medium text-white">
              {user.name.charAt(0).toUpperCase()}
            </span>
            {user.selection && (
              <span className="absolute top-0 right-0 block w-2 h-2 bg-green-400 rounded-full ring-1 ring-white" />
            )}
          </div>
        ))}
        
        {remainingCount > 0 && (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 ring-2 ring-white">
            <span className="text-xs font-medium text-gray-600">+{remainingCount}</span>
          </div>
        )}
      </div>
      
      <span className="text-sm text-gray-500">
        {users.length} {users.length === 1 ? 'user' : 'users'} online
      </span>
    </div>
  );
};

export default UserPresence;