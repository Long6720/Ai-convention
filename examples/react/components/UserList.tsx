import React from 'react';
import { User } from '../types/User';
import UserCard from './UserCard';

interface UserListProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (id: number) => void;
  emptyMessage?: string;
}

const UserList: React.FC<UserListProps> = ({ 
  users, 
  onEdit, 
  onDelete, 
  emptyMessage = 'No users found' 
}) => {
  if (users.length === 0) {
    return (
      <div className="user-list-empty">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="user-list">
      <h2>Users ({users.length})</h2>
      <div className="user-grid">
        {users.map(user => (
          <UserCard
            key={user.id}
            user={user}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
};

export default UserList;
