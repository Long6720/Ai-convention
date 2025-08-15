import { User, UserFormData } from '../types/User';

export interface UserServiceInterface {
  getUsers(): Promise<User[]>;
  createUser(userData: UserFormData): Promise<User>;
  updateUser(id: number, userData: UserFormData): Promise<User>;
  deleteUser(id: number): Promise<boolean>;
}

export class UserService implements UserServiceInterface {
  private apiBaseUrl: string;

  constructor(apiBaseUrl: string = 'https://api.example.com') {
    this.apiBaseUrl = apiBaseUrl;
  }

  async getUsers(): Promise<User[]> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/users`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch users:', error);
      throw new Error('Failed to fetch users');
    }
  }

  async createUser(userData: UserFormData): Promise<User> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to create user:', error);
      throw new Error('Failed to create user');
    }
  }

  async updateUser(id: number, userData: UserFormData): Promise<User> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to update user:', error);
      throw new Error('Failed to update user');
    }
  }

  async deleteUser(id: number): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/users/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Failed to delete user:', error);
      throw new Error('Failed to delete user');
    }
  }
}

// Mock implementation for development/testing
export class MockUserService implements UserServiceInterface {
  private users: User[] = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'moderator' },
  ];

  async getUsers(): Promise<User[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...this.users]), 500);
    });
  }

  async createUser(userData: UserFormData): Promise<User> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newUser: User = {
          id: Date.now(),
          ...userData,
        };
        this.users.push(newUser);
        resolve(newUser);
      }, 300);
    });
  }

  async updateUser(id: number, userData: UserFormData): Promise<User> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const userIndex = this.users.findIndex(u => u.id === id);
        if (userIndex === -1) {
          reject(new Error('User not found'));
          return;
        }
        
        this.users[userIndex] = { ...this.users[userIndex], ...userData };
        resolve(this.users[userIndex]);
      }, 300);
    });
  }

  async deleteUser(id: number): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.users = this.users.filter(u => u.id !== id);
        resolve(true);
      }, 300);
    });
  }
}
