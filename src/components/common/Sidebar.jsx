import { NavLink } from 'react-router-dom'
import { useRef, useEffect } from 'react'
import './Sidebar.css'
import Logo from './Logo'

function Sidebar({
  title = 'Admin Panel',
  menuItems = [],
  contentRef,
  showBrand = false,
  brandLink = '/admin',
}) {
  const sidebarRef = useRef(null);
  const dragging = useRef(false);

  useEffect(() => {
    const updateContentMargin = (width) => {
      if (contentRef && contentRef.current) {
        contentRef.current.style.marginLeft = `${width}px`;
      }
    };

    const handleMouseMove = (e) => {
      if (!dragging.current || !sidebarRef.current) return;

      // Get min and max width from CSS custom properties
      const computedStyle = window.getComputedStyle(sidebarRef.current);
      const minWidth = parseInt(computedStyle.getPropertyValue('--sidebar-min-width'), 10);
      const maxWidth = parseInt(computedStyle.getPropertyValue('--sidebar-max-width'), 10);

      const newWidth = Math.min(maxWidth, Math.max(minWidth, e.clientX));
      sidebarRef.current.style.width = `${newWidth}px`;
      updateContentMargin(newWidth);
    };

    const stopDrag = () => {
      dragging.current = false;
    };

    // Initialize content margin on mount
    if (sidebarRef.current) {
      const initialWidth = sidebarRef.current.offsetWidth || 260;
      updateContentMargin(initialWidth);
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", stopDrag);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", stopDrag);
    };
  }, []);

  return (
    <div className="sidebar" ref={sidebarRef}>
      <div 
        className="sidebar-resizer"
        onMouseDown={() => (dragging.current = true)}
      />
      
      <div className="sidebar-header">
        {showBrand && (
          <Logo 
            imageSize={48}
            fontSize={24}
            className="sidebar-brand" 
            logoClassName="sidebar-logo" 
            textClassName="sidebar-brand-title" 
            link={brandLink}
          />
        )}
        <h2>{title}</h2>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item, index) => {
          // If item has onClick handler, render as button instead of NavLink
          if (item.onClick) {
            return (
              <button
                key={index}
                onClick={(e) => {
                  item.onClick(e)
                  // Blur the button after click to remove focus state
                  e.currentTarget.blur()
                }}
                onBlur={(e) => {
                  // Ensure button doesn't look selected after losing focus
                  e.currentTarget.classList.remove('nav-item-focused')
                }}
                onFocus={(e) => {
                  // Add a temporary class for focus state that can be easily removed
                  e.currentTarget.classList.add('nav-item-focused')
                }}
                className={`nav-item nav-item-action ${item.isSignOut ? 'nav-item-sign-out' : ''}`}
                type="button"
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-text">{item.label}</span>
              </button>
            )
          }
          
          return (
            <NavLink 
              key={index}
              to={item.path}
              end={item.path === '/profile' || item.path === '/admin'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text">{item.label}</span>
            </NavLink>
          )
        })}
      </nav>
    </div>
  );
}

export default Sidebar;