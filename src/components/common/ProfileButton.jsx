import './ProfileButton.css'

function ProfileButton({
  onClick = () => {},
  label = 'Profile',
  icon = '👤',
}) {
  return (
    <button
      type="button"
      className="profile-button"
      onClick={onClick}
      aria-label={label}
    >
      <span className="profile-button-icon" aria-hidden="true">
        {icon}
      </span>
    </button>
  )
}

export default ProfileButton


