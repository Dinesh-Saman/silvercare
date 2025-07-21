import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './LandingPage.module.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const features = [
    {
      icon: '👨‍👩‍👧‍👦',
      title: 'Family Member Portal',
      description: 'Register and manage elderly relatives, book appointments, and receive real-time emergency alerts.'
    },
    {
      icon: '👴',
      title: 'Elderly Support',
      description: 'Maintain medical history, receive reminders, and join virtual consultations with ease.'
    },
    {
      icon: '🧑‍⚕️',
      title: 'Doctor Dashboard',
      description: 'Manage professional profiles, approve appointments, and provide medical advice.'
    },
    {
      icon: '🧑‍💼',
      title: 'Caregiver Tools',
      description: 'View schedules, log medication administration, and support during consultations.'
    },
    {
      icon: '🧠',
      title: 'Mental Health Integration',
      description: 'Access counselors for therapy sessions and mental health support.'
    },
    {
      icon: '🛡️',
      title: 'Admin Features',
      description: 'Monitor platform activity, manage users, and handle emergency alerts.'
    }
  ];

  const testimonials = [
    {
      name: 'Priya Perera',
      role: 'Family Member',
      content: 'SilverCare has made caring for my elderly parents so much easier. The emergency alerts give me peace of mind.',
      avatar: '👩'
    },
    {
      name: 'Dr. Kumara Silva',
      role: 'Medical Professional',
      content: 'The platform streamlines patient management and makes virtual consultations seamless.',
      avatar: '👨‍⚕️'
    },
    {
      name: 'Nimal Fernando',
      role: 'Caregiver',
      content: 'I can efficiently manage multiple patients and keep families updated on their loved ones.',
      avatar: '👨‍💼'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const handleGetStarted = () => {
    navigate('/register-options');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={styles.landingPage}>
      {/* Navigation Header */}
      <nav className={styles.navbar}>
        <div className={styles.navContainer}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>🩺</span>
            <span className={styles.logoText}>SilverCare</span>
          </div>
          <div className={styles.navLinks}>
            <button onClick={() => scrollToSection('features')} className={styles.navLink}>
              Features
            </button>
            <button onClick={() => scrollToSection('about')} className={styles.navLink}>
              About
            </button>
            <button onClick={() => scrollToSection('testimonials')} className={styles.navLink}>
              Testimonials
            </button>
            <button onClick={handleLogin} className={styles.loginBtn}>
              Login
            </button>
            <button onClick={handleGetStarted} className={styles.getStartedBtn}>
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContainer}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              Comprehensive Elder Care
              <span className={styles.highlight}> Management Platform</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Connect senior citizens with family members, doctors, caregivers, and mental health professionals. 
              Ensuring safety, comfort, and dignity for the elderly across Sri Lanka.
            </p>
            <div className={styles.heroButtons}>
              <button onClick={handleGetStarted} className={styles.primaryBtn}>
                Get Started Today
              </button>
              <button onClick={() => scrollToSection('features')} className={styles.secondaryBtn}>
                Learn More
              </button>
            </div>
            <div className={styles.heroStats}>
              <div className={styles.stat}>
                <span className={styles.statNumber}>1000+</span>
                <span className={styles.statLabel}>Families Served</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNumber}>500+</span>
                <span className={styles.statLabel}>Healthcare Professionals</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNumber}>24/7</span>
                <span className={styles.statLabel}>Emergency Support</span>
              </div>
            </div>
          </div>
          <div className={styles.heroImage}>
            <div className={styles.heroImagePlaceholder}>
              <span className={styles.heroEmoji}>🌿👵👴</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={styles.features}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>🌟 Key Features</h2>
            <p className={styles.sectionSubtitle}>
              Comprehensive tools designed to support every aspect of elder care
            </p>
          </div>
          <div className={styles.featuresGrid}>
            {features.map((feature, index) => (
              <div key={index} className={styles.featureCard}>
                <div className={styles.featureIcon}>{feature.icon}</div>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDescription}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className={styles.about}>
        <div className={styles.container}>
          <div className={styles.aboutContent}>
            <div className={styles.aboutText}>
              <h2 className={styles.sectionTitle}>About SilverCare</h2>
              <p className={styles.aboutDescription}>
                SilverCare is a comprehensive web-based elder care management platform designed specifically 
                for the Sri Lankan community. We bridge the gap between senior citizens and their support 
                network, providing a centralized system for health monitoring, appointment scheduling, 
                virtual consultations, and emergency support.
              </p>
              <div className={styles.aboutFeatures}>
                <div className={styles.aboutFeature}>
                  <span className={styles.aboutFeatureIcon}>📈</span>
                  <span>Real-time Health Monitoring</span>
                </div>
                <div className={styles.aboutFeature}>
                  <span className={styles.aboutFeatureIcon}>🔒</span>
                  <span>Secure Data Management</span>
                </div>
                <div className={styles.aboutFeature}>
                  <span className={styles.aboutFeatureIcon}>🚨</span>
                  <span>Emergency Alert System</span>
                </div>
                <div className={styles.aboutFeature}>
                  <span className={styles.aboutFeatureIcon}>💬</span>
                  <span>Secure Communication</span>
                </div>
              </div>
            </div>
            <div className={styles.aboutImage}>
              <div className={styles.techStack}>
                <h3>🛠️ Tech Stack</h3>
                <div className={styles.techItems}>
                  <span className={styles.techItem}>React.js</span>
                  <span className={styles.techItem}>Node.js</span>
                  <span className={styles.techItem}>PostgreSQL</span>
                  <span className={styles.techItem}>JWT Auth</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className={styles.testimonials}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>What Our Users Say</h2>
            <p className={styles.sectionSubtitle}>
              Trusted by families, healthcare professionals, and caregivers across Sri Lanka
            </p>
          </div>
          <div className={styles.testimonialSlider}>
            <div className={styles.testimonialCard}>
              <div className={styles.testimonialContent}>
                <p className={styles.testimonialText}>
                  "{testimonials[currentSlide].content}"
                </p>
                <div className={styles.testimonialAuthor}>
                  <span className={styles.authorAvatar}>
                    {testimonials[currentSlide].avatar}
                  </span>
                  <div className={styles.authorInfo}>
                    <span className={styles.authorName}>
                      {testimonials[currentSlide].name}
                    </span>
                    <span className={styles.authorRole}>
                      {testimonials[currentSlide].role}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.testimonialDots}>
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`${styles.dot} ${index === currentSlide ? styles.activeDot : ''}`}
                  onClick={() => setCurrentSlide(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className={styles.container}>
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>Ready to Get Started?</h2>
            <p className={styles.ctaSubtitle}>
              Join thousands of families who trust SilverCare for their elder care needs
            </p>
            <div className={styles.ctaButtons}>
              <button onClick={handleGetStarted} className={styles.ctaPrimaryBtn}>
                Register Now
              </button>
              <button onClick={handleLogin} className={styles.ctaSecondaryBtn}>
                Sign In
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerContent}>
            <div className={styles.footerSection}>
              <div className={styles.footerLogo}>
                <span className={styles.logoIcon}>🩺</span>
                <span className={styles.logoText}>SilverCare</span>
              </div>
              <p className={styles.footerDescription}>
                Comprehensive elder care management platform ensuring safety, 
                comfort, and dignity for the elderly across Sri Lanka.
              </p>
            </div>
            <div className={styles.footerSection}>
              <h4 className={styles.footerTitle}>Quick Links</h4>
              <ul className={styles.footerLinks}>
                <li><button onClick={() => scrollToSection('features')}>Features</button></li>
                <li><button onClick={() => scrollToSection('about')}>About</button></li>
                <li><button onClick={handleLogin}>Login</button></li>
                <li><button onClick={handleGetStarted}>Register</button></li>
              </ul>
            </div>
            <div className={styles.footerSection}>
              <h4 className={styles.footerTitle}>User Types</h4>
              <ul className={styles.footerLinks}>
                <li>Family Members</li>
                <li>Healthcare Professionals</li>
                <li>Caregivers</li>
                <li>Mental Health Professionals</li>
              </ul>
            </div>
            <div className={styles.footerSection}>
              <h4 className={styles.footerTitle}>Contact</h4>
              <div className={styles.contactInfo}>
                <p>📧 support@silvercare.lk</p>
                <p>📞 +94 11 234 5678</p>
                <p>📍 Colombo, Sri Lanka</p>
              </div>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <p>&copy; 2024 SilverCare. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;