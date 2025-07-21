import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './css/doctor_sidebar.module.css'; // Use doctor sidebar styles for now

const HealthProfessionalSidebar = ({ onItemClick, onToggleCollapse }) => {
  const [expandedMenus, setExpandedMenus] = useState({});
  const [activeMenuItem, setActiveMenuItem] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();

  const toggleSubmenu = (menuKey) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
  };

  const handleToggleSidebar = () => {
    const newCollapsedState = !sidebarCollapsed;
    setSidebarCollapsed(newCollapsedState);
    if (onToggleCollapse) {
      onToggleCollapse(newCollapsedState);
    }
    if (newCollapsedState) {
      setExpandedMenus({});
    }
  };

  const handleMenuItemClick = (item) => {
    setActiveMenuItem(item.key);
    switch (item.key) {
      case 'dashboard':
        navigate('/healthprofessional/dashboard');
        break;
      case 'appointments':
        navigate('/healthprofessional/appointments');
        break;
      case 'patients':
        navigate('/healthprofessional/patients');
        break;
      case 'treatment-plans':
        navigate('/healthprofessional/treatment-plans');
        break;
      case 'reports':
        navigate('/healthprofessional/reports');
        break;
      case 'messages':
        navigate('/healthprofessional/messages');
        break;
      case 'profile-settings':
        navigate('/healthprofessional/profile');
        break;
      case 'resources':
        navigate('/healthprofessional/resources');
        break;
      default:
        console.log('Navigation not implemented for:', item.key);
    }
    if (onItemClick) {
      onItemClick(item);
    }
  };

  const sidebarItems = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: '🏠',
      path: '/healthprofessional/dashboard'
    },
    {
      key: 'appointments',
      label: 'Appointments',
      icon: '📅',
      path: '/healthprofessional/appointments'
    },
    {
      key: 'patients',
      label: 'Patients',
      icon: '👥',
      path: '/healthprofessional/patients'
    },
    {
      key: 'treatment-plans',
      label: 'Treatment Plans',
      icon: '📝',
      path: '/healthprofessional/treatment-plans'
    },
    {
      key: 'reports',
      label: 'Reports',
      icon: '📊',
      path: '/healthprofessional/reports'
    },
    {
      key: 'messages',
      label: 'Messages',
      icon: '💬',
      path: '/healthprofessional/messages'
    },
    {
      key: 'profile-settings',
      label: 'Profile Settings',
      icon: '⚙️',
      path: '/healthprofessional/profile'
    },
    {
      key: 'resources',
      label: 'Resources',
      icon: '📚',
      path: '/healthprofessional/resources'
    }
  ];

  const handleItemClick = (item) => {
    if (item.hasSubmenu) {
      toggleSubmenu(item.key);
    } else {
      handleMenuItemClick(item);
    }
  };

  return (
    <div className={`${styles.sidebar} ${sidebarCollapsed ? styles.collapsed : ''}`}>
      {/* Sidebar Header */}
      <div className={styles.sidebarHeader}>
        <div className={styles.logo}>
          {!sidebarCollapsed && <span className={styles.logoText}>SilverCare</span>}
        </div>
        <button 
          className={styles.toggleButton}
          onClick={handleToggleSidebar}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? '▶' : '◀'}
        </button>
      </div>

      {/* User Info */}
      {!sidebarCollapsed && (
        <div className={styles.userInfo}>
          <div className={styles.userAvatar}>🧑‍⚕️</div>
          <div className={styles.userDetails}>
            <span className={styles.userName}>Health Professional</span>
            <span className={styles.userRole}>Mental Health</span>
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className={styles.navigation}>
        <ul className={styles.menuList}>
          {sidebarItems.map((item) => (
            <li key={item.key} className={styles.menuItem}>
              <div
                className={`${styles.menuLink} ${activeMenuItem === item.key ? styles.active : ''}`}
                onClick={() => handleItemClick(item)}
                title={sidebarCollapsed ? item.label : ''}
              >
                <span className={styles.menuIcon}>{item.icon}</span>
                {!sidebarCollapsed && (
                  <span className={styles.menuLabel}>{item.label}</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default HealthProfessionalSidebar; 