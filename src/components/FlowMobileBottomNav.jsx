import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  Sparkles,
  Calendar,
  Menu
} from 'lucide-react';

export const FlowMobileBottomNav = ({
  activeModule,
  setActiveModule,
  onOpenMobileMenu
}) => {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 768;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isMobile) {
    return null;
  }
  const navTabs = [
    {
      id: 'dashboards',
      label: 'Dashboard',
      icon: LayoutDashboard
    },
    {
      id: 'spaces',
      label: 'Tasks',
      icon: FolderKanban
    },
    {
      id: 'brain',
      label: 'KeepWork AI',
      icon: Sparkles,
      isCenter: true
    },
    {
      id: 'planner',
      label: 'Planner',
      icon: Calendar
    }
  ];

  return (
    <nav
      className="flow-mobile-bottom-nav"
      style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000 }}
      aria-label="Mobile Bottom Navigation"
    >
      {navTabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeModule === tab.id;

        if (tab.isCenter) {
          return (
            <button
              key={tab.id}
              type="button"
              className={`mobile-nav-item mobile-nav-center ${isActive ? 'active' : ''}`}
              onClick={() => setActiveModule(tab.id)}
              title="Buka KeepWork AI"
            >
              <div className="mobile-nav-center-icon">
                <Icon size={20} />
              </div>
              <span className="mobile-nav-label">KeepWork AI</span>
            </button>
          );
        }

        return (
          <button
            key={tab.id}
            type="button"
            className={`mobile-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setActiveModule(tab.id)}
            title={tab.label}
          >
            <Icon size={18} />
            <span className="mobile-nav-label">{tab.label}</span>
            {isActive && <div className="mobile-nav-indicator" />}
          </button>
        );
      })}

      {/* Menu / Drawer Toggle */}
      <button
        type="button"
        className="mobile-nav-item"
        onClick={onOpenMobileMenu}
        title="Buka Menu Lengkap"
      >
        <Menu size={18} />
        <span className="mobile-nav-label">Menu</span>
      </button>
    </nav>
  );
};
