import React, { useState, useEffect, useRef } from 'react';
import DoctorSidebar from './doctor_sidebar';
import styles from './css/DoctorLayout.module.css';

const DoctorLayout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const observerRef = useRef(null);

  useEffect(() => {
    const observeCallback = (mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const target = mutation.target;
          const isCollapsed = target.classList.toString().includes('collapsed');
          console.log('Sidebar state changed:', isCollapsed);
          setSidebarCollapsed(isCollapsed);
        }
      });
    };

    const findAndObserveSidebar = () => {
      const sidebar = document.querySelector('[class*="sidebar"]');
      if (sidebar) {
        console.log('Sidebar found:', sidebar);
        
        if (observerRef.current) {
          observerRef.current.disconnect();
        }

        observerRef.current = new MutationObserver(observeCallback);
        observerRef.current.observe(sidebar, {
          attributes: true,
          attributeFilter: ['class']
        });

        const isCollapsed = sidebar.classList.toString().includes('collapsed');
        console.log('Initial sidebar state:', isCollapsed);
        setSidebarCollapsed(isCollapsed);
      } else {
        console.log('Sidebar not found, retrying...');
        setTimeout(findAndObserveSidebar, 100);
      }
    };

    setTimeout(findAndObserveSidebar, 200);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const handleSidebarItemClick = (item) => {
    console.log('Sidebar item clicked:', item);
  };

  return (
    <div className={styles.layoutContainer}>
      <DoctorSidebar onItemClick={handleSidebarItemClick} />
      <div className={`${styles.mainContent} ${sidebarCollapsed ? styles.collapsed : styles.expanded}`}>
        <div className={styles.contentWrapper}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default DoctorLayout;
