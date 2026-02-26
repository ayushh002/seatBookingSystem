import { NavLink, useNavigate, Outlet } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../redux/authSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function Sidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(collapsed));
  }, [collapsed]);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/book', label: 'Book Seat', icon: '📅' },
    { path: '/my-bookings', label: 'My Bookings', icon: '📋' },
    ...(user?.role === 'admin' ? [{ path: '/admin', label: 'Admin Panel', icon: '⚙️' }] : [])
  ];

  const toggleSidebar = () => setCollapsed(!collapsed);

  return (
    <div className="flex min-h-screen bg-linear-to-br from-base-100 to-base-200">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 100 : 256 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="h-screen sticky top-0 bg-base-200/80 backdrop-blur-sm shadow-xl border-r border-base-300/50 flex flex-col"
      >
        {/* Logo area */}
        <div className="flex items-center justify-between p-4 border-b border-base-300/50">
          <AnimatePresence mode="wait">
            {!collapsed ? (
              <motion.div
                key="expanded-logo"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <span className="text-3xl">🪑</span>
                <span className="text-xl font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
                  SeatBook
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="collapsed-logo"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full flex justify-center"
              >
                <span className="text-3xl">🪑</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Toggle button */}
          <button
            onClick={toggleSidebar}
            className="btn btn-ghost btn-sm btn-circle"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Navigation menu */}
        <ul className="flex-1 menu p-2 gap-1 overflow-y-auto">
          {menuItems.map(item => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-4 p-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-primary text-primary-content shadow-md'
                      : 'hover:bg-base-300/70 text-base-content/80 hover:text-base-content'
                  }`
                }
                title={collapsed ? item.label : ''}
              >
                <span className="text-xl">{item.icon}</span>
                <AnimatePresence mode="wait">
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="text-sm font-medium"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </NavLink>
            </li>
          ))}
        </ul>

        {/* User info and logout */}
        <div className="p-2 border-t border-base-300/50">
          {!collapsed && user && (
            <div className="px-3 py-2 mb-2 bg-base-300/30 rounded-lg">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-base-content/60 truncate">{user.email}</p>
              {user.role === 'admin' && (
                <span className="badge badge-primary badge-xs mt-1">Admin</span>
              )}
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 p-3 rounded-lg w-full hover:bg-base-300/70 text-base-content/80 hover:text-base-content transition-all duration-200"
            title={collapsed ? 'Logout' : ''}
          >
            <span className="text-xl">🚪</span>
            <AnimatePresence mode="wait">
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="text-sm font-medium"
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}