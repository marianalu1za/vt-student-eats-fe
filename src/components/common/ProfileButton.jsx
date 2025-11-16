import './ProfileButton.css'
import { useNavigate } from 'react-router-dom'

function ProfileButton({
  onClick,
  label = 'Profile',
  icon = '👤',
  to = '/user',
}) {
  const navigate = useNavigate()
  const handleClick = (e) => {
    // if (typeof onClick === 'function') {
    //   onClick(e)
    // }
    if (!e.defaultPrevented) {
      navigate(to)
    }
  }

  return (
    <button
      type="button"
      className="profile-button"
      onClick={handleClick}
      aria-label={label}
    >
      <span className="profile-button-icon" aria-hidden="true">
        {icon}
      </span>
    </button>
  )
}

export default ProfileButton


