import { NavLink } from 'react-router-dom'
import { useRef, useEffect } from 'react'
import './Sidebar.css'
import Logo from './Logo'

function Sidebar({ title = 'Admin Panel', menuItems = [], contentRef }) {
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
        <Logo 
          imageSize={48}
          fontSize={24}
          className="sidebar-brand" 
          logoClassName="sidebar-logo" 
          textClassName="sidebar-brand-title" 
          link="/admin"
        />
        <h2>{title}</h2>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item, index) => (
          <NavLink 
            key={index}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-text">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export default Sidebar;