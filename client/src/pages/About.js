import React from 'react';
import Navbar from '../components/navbar';
import styles from '../components/css/About.module.css';

const About = () => {
  return (
    <div className={styles.container}>
      <Navbar />
      
      <div className={styles.content}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>About SilverCare</h1>
            <p className={styles.heroSubtitle}>
              Empowering families to provide exceptional care for their elderly loved ones through innovative technology and compassionate support.
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className={styles.section}>
          <div className={styles.sectionContent}>
            <h2 className={styles.sectionTitle}>Our Mission</h2>
            <p className={styles.sectionText}>
              At SilverCare, we believe that every elder deserves to live with dignity, comfort, and joy. 
              Our mission is to bridge the gap between families and quality elder care by providing a 
              comprehensive platform that connects elders with healthcare professionals, caregivers, 
              and their families.
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section className={styles.section}>
          <div className={styles.sectionContent}>
            <h2 className={styles.sectionTitle}>What We Offer</h2>
            <div className={styles.featuresGrid}>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>🏥</div>
                <h3 className={styles.featureTitle}>Healthcare Appointments</h3>
                <p className={styles.featureText}>
                  Easy booking and management of medical appointments with qualified doctors and specialists.
                </p>
              </div>
              
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>🧠</div>
                <h3 className={styles.featureTitle}>Mental Health Support</h3>
                <p className={styles.featureText}>
                  Access to licensed counselors and mental health professionals for emotional wellbeing.
                </p>
              </div>
              
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>👥</div>
                <h3 className={styles.featureTitle}>Caregiver Services</h3>
                <p className={styles.featureText}>
                  Professional caregivers available for both daily assistance and specialized care needs.
                </p>
              </div>
              
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>💬</div>
                <h3 className={styles.featureTitle}>Family Communication</h3>
                <p className={styles.featureText}>
                  Keep families connected with real-time updates and secure messaging systems.
                </p>
              </div>
              
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>📊</div>
                <h3 className={styles.featureTitle}>Health Monitoring</h3>
                <p className={styles.featureText}>
                  Track health metrics, medications, and care progress with detailed reporting.
                </p>
              </div>
              
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>📱</div>
                <h3 className={styles.featureTitle}>Digital Platform</h3>
                <p className={styles.featureText}>
                  User-friendly interface designed specifically for elders and their families.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className={styles.section}>
          <div className={styles.sectionContent}>
            <h2 className={styles.sectionTitle}>Our Values</h2>
            <div className={styles.valuesGrid}>
              <div className={styles.valueItem}>
                <h3 className={styles.valueTitle}>Compassion</h3>
                <p className={styles.valueText}>
                  We approach every interaction with empathy and understanding, recognizing the unique needs of each elder and family.
                </p>
              </div>
              
              <div className={styles.valueItem}>
                <h3 className={styles.valueTitle}>Quality</h3>
                <p className={styles.valueText}>
                  We maintain the highest standards in healthcare services, caregiver training, and platform security.
                </p>
              </div>
              
              <div className={styles.valueItem}>
                <h3 className={styles.valueTitle}>Innovation</h3>
                <p className={styles.valueText}>
                  We continuously evolve our technology to make elder care more accessible, efficient, and effective.
                </p>
              </div>
              
              <div className={styles.valueItem}>
                <h3 className={styles.valueTitle}>Trust</h3>
                <p className={styles.valueText}>
                  We build lasting relationships through transparency, reliability, and unwavering commitment to our users.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className={styles.statsSection}>
          <div className={styles.sectionContent}>
            <h2 className={styles.sectionTitle}>Making a Difference</h2>
            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <div className={styles.statNumber}>10,000+</div>
                <div className={styles.statLabel}>Elders Served</div>
              </div>
              
              <div className={styles.statItem}>
                <div className={styles.statNumber}>500+</div>
                <div className={styles.statLabel}>Healthcare Professionals</div>
              </div>
              
              <div className={styles.statItem}>
                <div className={styles.statNumber}>1,000+</div>
                <div className={styles.statLabel}>Certified Caregivers</div>
              </div>
              
              <div className={styles.statItem}>
                <div className={styles.statNumber}>95%</div>
                <div className={styles.statLabel}>Family Satisfaction</div>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className={styles.section}>
          <div className={styles.sectionContent}>
            <h2 className={styles.sectionTitle}>Our Team</h2>
            <p className={styles.sectionText}>
              SilverCare is built by a dedicated team of healthcare professionals, technology experts, 
              and passionate individuals who have experienced the challenges of elder care firsthand. 
              Our diverse team brings together decades of experience in healthcare, technology, and 
              family care to create solutions that truly make a difference.
            </p>
            <div className={styles.teamGrid}>
              <div className={styles.teamMember}>
                <div className={styles.memberPhoto}>👨‍⚕️</div>
                <h4 className={styles.memberName}>Dr. Sarah Johnson</h4>
                <p className={styles.memberRole}>Chief Medical Officer</p>
                <p className={styles.memberBio}>20+ years in geriatric medicine</p>
              </div>
              
              <div className={styles.teamMember}>
                <div className={styles.memberPhoto}>👩‍💻</div>
                <h4 className={styles.memberName}>Emily Chen</h4>
                <p className={styles.memberRole}>Head of Technology</p>
                <p className={styles.memberBio}>Expert in healthcare technology solutions</p>
              </div>
              
              <div className={styles.teamMember}>
                <div className={styles.memberPhoto}>👨‍💼</div>
                <h4 className={styles.memberName}>Michael Rodriguez</h4>
                <p className={styles.memberRole}>Director of Care Services</p>
                <p className={styles.memberBio}>15+ years in elder care management</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className={styles.ctaSection}>
          <div className={styles.sectionContent}>
            <h2 className={styles.ctaTitle}>Join the SilverCare Family</h2>
            <p className={styles.ctaText}>
              Ready to provide the best care for your loved ones? Join thousands of families who trust SilverCare.
            </p>
            <div className={styles.ctaButtons}>
              <button 
                className={styles.ctaButton}
                onClick={() => window.location.href = '/roles'}
              >
                Get Started Today
              </button>
              <button 
                className={styles.ctaButtonSecondary}
                onClick={() => window.location.href = '/contact'}
              >
                Contact Us
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <p className={styles.footerText}>
            © 2024 SilverCare. All rights reserved. Providing compassionate care for your loved ones.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default About;