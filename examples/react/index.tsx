import React from 'react';
import ReactDOM from 'react-dom/client';
import UserManagementSystem from './components/UserManagementSystem';
import { MockUserService } from './services/userService';
import './styles/globals.css';

const App: React.FC = () => {
  // Dependency injection - we can easily swap implementations
  const userService = new MockUserService();
  
  // For production, you would use the real API service:
  // const userService = new UserService('https://your-api.com');

  return (
    <div className="app">
      <UserManagementSystem userService={userService} />
    </div>
  );
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
