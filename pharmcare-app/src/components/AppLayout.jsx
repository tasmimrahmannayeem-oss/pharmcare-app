import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

export default function AppLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className={`app-shell ${isCollapsed ? 'collapsed' : ''}`}>
      <Sidebar isCollapsed={isCollapsed} toggleCollapse={() => setIsCollapsed(!isCollapsed)} />
      <div className="app-content">
        <TopBar />
        <main className="page-main fade-up">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
