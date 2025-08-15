import React from 'react';
import { User } from '../types/User';

interface UserStatisticsProps {
  users: User[];
}

const UserStatistics: React.FC<UserStatisticsProps> = ({ users }) => {
  const getRoleCount = (role: string) => users.filter(u => u.role === role).length;

  const totalUsers = users.length;
  const adminCount = getRoleCount('admin');
  const userCount = getRoleCount('user');
  const moderatorCount = getRoleCount('moderator');

  return (
    <div className="user-stats">
      <h2>User Statistics</h2>
      
      <div className="stats-grid">
        <div className="stat-item">
          <span className="stat-number">{totalUsers}</span>
          <span className="stat-label">Total Users</span>
        </div>
        
        <div className="stat-item">
          <span className="stat-number">{adminCount}</span>
          <span className="stat-label">Admins</span>
        </div>
        
        <div className="stat-item">
          <span className="stat-number">{userCount}</span>
          <span className="stat-label">Users</span>
        </div>
        
        <div className="stat-item">
          <span className="stat-number">{moderatorCount}</span>
          <span className="stat-label">Moderators</span>
        </div>
      </div>

      <div className="stats-breakdown">
        <h3>Role Distribution</h3>
        <div className="role-distribution">
          <div className="role-bar">
            <span>Admin</span>
            <div className="bar-container">
              <div 
                className="bar admin-bar" 
                style={{ width: `${totalUsers > 0 ? (adminCount / totalUsers) * 100 : 0}%` }}
              ></div>
            </div>
            <span>{adminCount}</span>
          </div>
          
          <div className="role-bar">
            <span>User</span>
            <div className="bar-container">
              <div 
                className="bar user-bar" 
                style={{ width: `${totalUsers > 0 ? (userCount / totalUsers) * 100 : 0}%` }}
              ></div>
            </div>
            <span>{userCount}</span>
          </div>
          
          <div className="role-bar">
            <span>Moderator</span>
            <div className="bar-container">
              <div 
                className="bar moderator-bar" 
                style={{ width: `${totalUsers > 0 ? (moderatorCount / totalUsers) * 100 : 0}%` }}
              ></div>
            </div>
            <span>{moderatorCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserStatistics;
