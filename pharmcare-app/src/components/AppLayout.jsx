import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

export default function AppLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const location = useLocation()

  // Close mobile drawer when route changes
  useEffect(() => {
    setIsMobileOpen(false)
  }, [location.pathname])

  return (
    <div className={`app-shell ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div 
          className="sidebar-backdrop"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <Sidebar 
        isCollapsed={isCollapsed} 
        toggleCollapse={() => setIsCollapsed(!isCollapsed)} 
        isMobileOpen={isMobileOpen}
        closeMobile={() => setIsMobileOpen(false)}
      />

      <div className="app-content">
        <TopBar 
          toggleMobileSidebar={() => setIsMobileOpen(prev => !prev)} 
        />
        <main className="page-main fade-up">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

