gimport React, { useState, useEffect } from 'react';

// VIOLATION: Single Responsibility Principle - This component does too many things
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

// VIOLATION: Open/Closed Principle - Hard to extend without modification
const UserManagementSystem: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', role: '' });

  // VIOLATION: Dependency Inversion Principle - Direct dependency on external API
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://api.example.com/users');
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  // VIOLATION: Single Responsibility Principle - Business logic mixed with UI logic
  const validateUser = (user: Partial<User>): boolean => {
    if (!user.name || user.name.length < 2) return false;
    if (!user.email || !user.email.includes('@')) return false;
    if (!user.role || !['admin', 'user', 'moderator'].includes(user.role)) return false;
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateUser(formData)) {
      setError('Invalid user data');
      return;
    }
    
    if (isEditing && selectedUser) {
      // VIOLATION: Single Responsibility Principle - Update logic mixed with UI
      const updatedUsers = users.map(user => 
        user.id === selectedUser.id ? { ...user, ...formData } : user
      );
      setUsers(updatedUsers);
    } else {
      // VIOLATION: Single Responsibility Principle - Create logic mixed with UI
      const newUser: User = {
        id: Date.now(),
        name: formData.name,
        email: formData.email,
        role: formData.role
      };
      setUsers([...users, newUser]);
    }
    
    setFormData({ name: '', email: '', role: '' });
    setIsEditing(false);
    setSelectedUser(null);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setFormData({ name: user.name, email: user.email, role: user.role });
    setIsEditing(true);
  };

  const handleDelete = (userId: number) => {
    // VIOLATION: Single Responsibility Principle - Delete logic mixed with UI
    setUsers(users.filter(user => user.id !== userId));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // VIOLATION: Interface Segregation Principle - Component has too many responsibilities
  return (
    <div className="user-management">
      <h1>User Management System</h1>
      
      {/* VIOLATION: Single Responsibility Principle - Form component mixed with main component */}
      <form onSubmit={handleSubmit} className="user-form">
        <h2>{isEditing ? 'Edit User' : 'Add New User'}</h2>
        <input
          type="text"
          placeholder="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        <select
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
        >
          <option value="">Select Role</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
          <option value="moderator">Moderator</option>
        </select>
        <button type="submit">
          {isEditing ? 'Update User' : 'Add User'}
        </button>
        {isEditing && (
          <button type="button" onClick={() => {
            setIsEditing(false);
            setSelectedUser(null);
            setFormData({ name: '', email: '', role: '' });
          }}>
            Cancel
          </button>
        )}
      </form>

      {/* VIOLATION: Single Responsibility Principle - Error display mixed with main component */}
      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      {/* VIOLATION: Single Responsibility Principle - Loading state mixed with main component */}
      {loading && <div className="loading">Loading users...</div>}

      {/* VIOLATION: Single Responsibility Principle - User list mixed with main component */}
      <div className="user-list">
        <h2>Users</h2>
        {users.map(user => (
          <div key={user.id} className="user-item">
            <div className="user-info">
              <h3>{user.name}</h3>
              <p>{user.email}</p>
              <span className={`role role-${user.role}`}>{user.role}</span>
            </div>
            <div className="user-actions">
              <button onClick={() => handleEdit(user)}>Edit</button>
              <button onClick={() => handleDelete(user.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* VIOLATION: Single Responsibility Principle - Statistics mixed with main component */}
      <div className="user-stats">
        <h2>Statistics</h2>
        <p>Total Users: {users.length}</p>
        <p>Admins: {users.filter(u => u.role === 'admin').length}</p>
        <p>Users: {users.filter(u => u.role === 'user').length}</p>
        <p>Moderators: {users.filter(u => u.role === 'moderator').length}</p>
      </div>
    </div>
  );
};

// VIOLATION: Single Responsibility Principle - Multiple components in one file
const UserCard: React.FC<{ user: User; onEdit: (user: User) => void; onDelete: (id: number) => void }> = ({ user, onEdit, onDelete }) => {
  return (
    <div className="user-card">
      <h3>{user.name}</h3>
      <p>{user.email}</p>
      <span className={`role role-${user.role}`}>{user.role}</span>
      <div className="actions">
        <button onClick={() => onEdit(user)}>Edit</button>
        <button onClick={() => onDelete(user.id)}>Delete</button>
      </div>
    </div>
  );
};

// VIOLATION: Single Responsibility Principle - Another component in the same file
const UserForm: React.FC<{
  onSubmit: (data: { name: string; email: string; role: string }) => void;
  initialData?: { name: string; email: string; role: string };
  isEditing?: boolean;
}> = ({ onSubmit, initialData, isEditing = false }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    email: initialData?.email || '',
    role: initialData?.role || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    if (!isEditing) {
      setFormData({ name: '', email: '', role: '' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="user-form">
      <h2>{isEditing ? 'Edit User' : 'Add New User'}</h2>
      <input
        type="text"
        placeholder="Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />
      <select
        value={formData.role}
        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
      >
        <option value="">Select Role</option>
        <option value="admin">Admin</option>
        <option value="user">User</option>
        <option value="moderator">Moderator</option>
      </select>
      <button type="submit">
        {isEditing ? 'Update User' : 'Add User'}
      </button>
    </form>
  );
};

// VIOLATION: Single Responsibility Principle - Yet another component in the same file
const UserStatistics: React.FC<{ users: User[] }> = ({ users }) => {
  const getRoleCount = (role: string) => users.filter(u => u.role === role).length;

  return (
    <div className="user-stats">
      <h2>Statistics</h2>
      <p>Total Users: {users.length}</p>
      <p>Admins: {getRoleCount('admin')}</p>
      <p>Users: {getRoleCount('user')}</p>
      <p>Moderators: {getRoleCount('moderator')}</p>
    </div>
  );
};

export default UserManagementSystem;
export { UserCard, UserForm, UserStatistics };
