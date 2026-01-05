import { ReactNode } from 'react';

interface MainAppLayoutProps {
  header: ReactNode; // Header component (fixed at top)
  leftSidebar?: ReactNode; // Left sidebar (scrollable)
  rightSidebar?: ReactNode; // Right sidebar (scrollable)
  children: ReactNode; // Main content (scrollable)
  leftSidebarWidth?: string; // Default: 280px
  rightSidebarWidth?: string; // Default: 320px
}

/**
 * MainAppLayout - Full-page layout with fixed header and 3-column scrollable content
 * 
 * Structure:
 * ┌─────────────────────────────────┐
 * │         FIXED HEADER            │ (height: auto)
 * ├────────────┬─────────────┬──────┤
 * │   Left     │   Main      │Right │
 * │ Sidebar    │  Content    │Side  │
 * │ (scroll)   │  (scroll)   │(scrl)│
 * │            │             │      │
 * ├────────────┴─────────────┴──────┤
 * └─────────────────────────────────┘
 * 
 * - Total height = 100vh
 * - Header height is auto
 * - Content area = 100vh - header height
 * - Each section has independent scroll
 */
export default function MainAppLayout({
  header,
  leftSidebar,
  rightSidebar,
  children,
  leftSidebarWidth = '280px',
  rightSidebarWidth = '320px',
}: MainAppLayoutProps) {
  return (
    <div className="flex flex-col h-screen w-screen bg-white overflow-hidden">
      {/* Fixed Header */}
      <div className="flex-shrink-0 border-b border-slate-200/80">
        {header}
      </div>

      {/* Main Content Area - Flexible Height with 3 Columns */}
      <div className="flex flex-1 overflow-hidden bg-gradient-to-b from-slate-50 to-slate-100">
        {/* Left Sidebar */}
        {leftSidebar && (
          <div
            className="flex flex-col border-r border-slate-200/50 bg-white/50 backdrop-blur-sm overflow-hidden"
            style={{ width: leftSidebarWidth }}
          >
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
              <div className="p-4">
                {leftSidebar}
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            {children}
          </div>
        </div>

        {/* Right Sidebar */}
        {rightSidebar && (
          <div
            className="flex flex-col border-l border-slate-200/50 bg-white/50 backdrop-blur-sm overflow-hidden"
            style={{ width: rightSidebarWidth }}
          >
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
              <div className="p-4">
                {rightSidebar}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
