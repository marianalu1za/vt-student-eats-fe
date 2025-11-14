import { Link } from 'react-router-dom'
import './Logo.css'

function Logo({
  imageSize = 60,
  fontSize = 16,
  text = 'VT Student Eats',
  showText = true,
  className = '',
  logoClassName = '',
  textClassName = '',
  imageSrc = '/images/logo.png',
  imageAlt = 'VT Student Eats Logo',
  link,
}) {
  const wrapperClass = ['app-logo', className].filter(Boolean).join(' ')
  const imageWrapperClass = ['app-logo-image', logoClassName].filter(Boolean).join(' ')
  const textWrapperClass = ['app-logo-text', textClassName].filter(Boolean).join(' ')

  const content = (
    <div className={wrapperClass}>
      <div
        className={imageWrapperClass}
        style={{ width: `${imageSize}px`, height: `${imageSize}px` }}
      >
        <img src={imageSrc} alt={imageAlt} />
      </div>
      {showText && (
        <span
          className={textWrapperClass}
          style={{ fontSize: `${fontSize}px` }}
        >
          {text}
        </span>
      )}
    </div>
  )

  if (link) {
    return (
      <Link to={link} className="logo-link">
        {content}
      </Link>
    )
  }

  return content
}

export default Logo


