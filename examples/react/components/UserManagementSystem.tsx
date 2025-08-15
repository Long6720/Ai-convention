import React, { useState, useEffect } from 'react';
import { User, UserFormData } from '../types/User';
import { UserServiceInterface } from '../services/userService';
import { ValidationService } from '../services/validationService';
import UserForm from './UserForm';
import UserList from './UserList';
import UserStatistics from './UserStatistics';
import ErrorMessage from './ErrorMessage';
import LoadingSpinner from './LoadingSpinner';

interface UserManagementSystemProps {
  userService: UserServiceInterface;
}

const UserManagementSystem: React.FC<UserManagementSystemProps> = ({ userService }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const fetchedUsers = await userService.getUsers();
      setUsers(fetchedUsers);
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (userData: UserFormData) => {
    setError(null);
    
    try {
      // Validate user data
      const validation = ValidationService.validateUser(userData);
      if (!validation.isValid) {
        setError(validation.errors.join(', '));
        return;
      }

      // Sanitize user data
      const sanitizedData = ValidationService.sanitizeUserData(userData);
      
      // Create user
      const newUser = await userService.createUser(sanitizedData);
      setUsers(prevUsers => [...prevUsers, newUser]);
    } catch (err) {
      setError('Failed to create user');
    }
  };

  const handleUpdateUser = async (userData: UserFormData) => {
    if (!selectedUser) return;
    
    setError(null);
    
    try {
      // Validate user data
      const validation = ValidationService.validateUser(userData);
      if (!validation.isValid) {
        setError(validation.errors.join(', '));
        return;
      }

      // Sanitize user data
      const sanitizedData = ValidationService.sanitizeUserData(userData);
      
      // Update user
      const updatedUser = await userService.updateUser(selectedUser.id, sanitizedData);
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === selectedUser.id ? updatedUser : user
        )
      );
      
      // Reset form state
      setIsEditing(false);
      setSelectedUser(null);
    } catch (err) {
      setError('Failed to update user');
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditing(true);
  };

  const handleDeleteUser = async (userId: number) => {
    setError(null);
    
    try {
      await userService.deleteUser(userId);
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
    } catch (err) {
      setError('Failed to delete user');
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSelectedUser(null);
  };

  const handleFormSubmit = (userData: UserFormData) => {
    if (isEditing) {
      handleUpdateUser(userData);
    } else {
      handleCreateUser(userData);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="user-management">
      <h1>User Management System</h1>
      
      <UserForm
        onSubmit={handleFormSubmit}
        initialData={selectedUser || undefined}
        isEditing={isEditing}
        onCancel={handleCancelEdit}
      />

      {error && (
        <ErrorMessage 
          message={error} 
          onDismiss={() => setError(null)}
          type="error"
        />
      )}

      {loading && <LoadingSpinner message="Loading users..." />}

      <UserList
        users={users}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
        emptyMessage="No users found. Add your first user above!"
      />

      <UserStatistics users={users} />
    </div>
  );
};

export default UserManagementSystem;
