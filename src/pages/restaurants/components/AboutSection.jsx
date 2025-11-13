import { Link } from 'react-router-dom'
import './AboutSection.css'

function AboutSection() {
  return (
    <section className="about-section">
      <div className="about-content-wrapper">
        <h2>About VT Student Eats</h2>
        <div className="about-content">
          <p>VT Student Eats connects Virginia Tech Innovation Campus students with affordable dining options.</p>
          <p>Discover restaurants offering student discounts and special promotions near campus.</p>
          <p>
            <Link to="/group-orders" className="group-orders-link-btn">
            Join group orders
            </Link>
            {' '}to save on delivery fees and enjoy meals with friends.
          </p>
        </div>
      </div>
    </section>
  )
}

export default AboutSection

