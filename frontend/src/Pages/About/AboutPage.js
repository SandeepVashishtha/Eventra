import React from 'react';
import { useState } from 'react';

const AboutPage = () => {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      icon: "🎯",
      title: "Smart Event Creation",
      stat: "90% faster setup",
      description: "Launch events in minutes with intelligent templates, automatic capacity management, and integrated ticketing. Full support for workshops, conferences, meetups, and specialized events.",
      cta: "Start Creating"
    },
    {
      icon: "⚡",
      title: "Instant QR Check-ins",
      stat: "3 sec check-in",
      description: "Lightning-fast attendee check-ins with QR codes that work offline. Real-time attendance tracking and automated no-show management keep your events running smoothly.",
      cta: "See Demo"
    },
    {
      icon: "📈",
      title: "Live Analytics",
      stat: "15+ metrics",
      description: "Real-time dashboards showing registration trends, attendance patterns, and engagement insights. Make data-driven decisions that lead to consistently better events.",
      cta: "View Dashboard"
    },
    {
      icon: "🤝",
      title: "Team Collaboration",
      stat: "Unlimited members",
      description: "Invite co-organizers, assign specific roles, and coordinate effortlessly. Built-in communication tools and task management ensure seamless teamwork.",
      cta: "Add Team"
    },
    {
      icon: "🔒",
      title: "Enterprise Security",
      stat: "Bank-level security",
      description: "SOC 2 compliant with end-to-end encryption. Advanced privacy controls and full GDPR compliance for handling sensitive attendee data with complete confidence.",
      cta: "Learn More"
    },
    {
      icon: "🌍",
      title: "Global Reach",
      stat: "195 countries",
      description: "Multi-timezone coordination, 30+ languages, and international payment processing. Host events anywhere in the world and welcome attendees from everywhere.",
      cta: "Go Global"
    }
  ];

  const targetUsers = [
    {
      icon: "🏘️",
      title: "Communities & Nonprofits",
      description: "Local groups, hobby clubs, and nonprofit organizations looking to engage their members and expand their reach through well-organized events."
    },
    {
      icon: "🎓",
      title: "Educational Institutions",
      description: "Colleges, universities, and schools managing everything from orientation sessions and academic conferences to cultural festivals."
    },
    {
      icon: "💼",
      title: "Professional Organizations",
      description: "Industry associations, startup communities, and professional networks hosting conferences, networking events, and skill-building workshops."
    },
    {
      icon: "🏢",
      title: "Corporate Teams",
      description: "Companies organizing internal events, team building activities, product launches, and client appreciation gatherings."
    }
  ];

  const whyChoose = [
    {
      icon: "📖",
      title: "Open Source Transparency",
      description: "Our code is open for inspection, contribution, and customization. No hidden algorithms or locked-in proprietary systems."
    },
    {
      icon: "👥",
      title: "Community-Driven Development",
      description: "Built by event organizers, for event organizers. Every feature is designed based on real-world needs and feedback from active users."
    },
    {
      icon: "📊",
      title: "Scalable & Flexible",
      description: "Whether you're planning a 20-person workshop or a 5,000-attendee conference, Eventra adapts to your needs without breaking your budget."
    },
    {
      icon: "🌐",
      title: "Global Yet Local",
      description: "International capabilities with deep understanding of local event management challenges and cultural considerations."
    }
  ];

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-background">
          <div className="hero-gradient"></div>
        </div>
        
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
            
              <span style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
                About Us
              </span>
            </h1>
            
            <p className="hero-subtitle">
              Create, manage, and track events with ease. Eventra is a comprehensive open-source platform 
              designed for communities, colleges, and organizations worldwide to transform how they plan, 
              execute, and experience events.
            </p>
            
            <div className="hero-actions">
              <a href="#features" className="btn-primary hero-btn">
                Explore Features
              </a>
              <a href="#mission" className="btn-secondary hero-btn">
                Our Mission
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section id="mission" className="mission-vision" style={{padding: '5rem 0', background: '#f8fafc'}}>
        <div className="container">
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '3rem', maxWidth: '1200px', margin: '0 auto'}}>
            <div className="mission-card" style={{
              background: 'white',
              borderRadius: '20px',
              padding: '3rem',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(0, 0, 0, 0.05)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              }}></div>
              <div style={{fontSize: '3rem', marginBottom: '1.5rem'}}>🎯</div>
              <h2 style={{fontSize: '2rem', fontWeight: '700', color: '#1a1a1a', marginBottom: '1.5rem'}}>Our Mission</h2>
              <p style={{color: '#6b7280', lineHeight: '1.6', fontSize: '1.1rem'}}>
                To democratize event management by providing powerful, accessible tools that enable any community 
                to create meaningful connections and memorable experiences. We believe that great events shouldn't 
                require expensive software or technical expertise – just passion and the right platform.
              </p>
            </div>

            <div className="vision-card" style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: '20px',
              padding: '3rem',
              boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{fontSize: '3rem', marginBottom: '1.5rem'}}>🌟</div>
              <h2 style={{fontSize: '2rem', fontWeight: '700', marginBottom: '1.5rem'}}>Our Vision</h2>
              <p style={{color: 'rgba(255, 255, 255, 0.95)', lineHeight: '1.6', fontSize: '1.1rem'}}>
                A world where every community, regardless of size or budget, has access to professional-grade 
                event management tools. We envision thriving local ecosystems where organizations can focus 
                on what matters most: bringing people together and creating lasting impact.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features" style={{padding: '5rem 0'}}>
        <div className="container">
          <div className="features-header">
            <h2 className="features-title">Everything You Need to Host Amazing Events</h2>
            <p className="features-subtitle">
              From intimate workshops to large conferences, Eventra provides the tools that modern event organizers trust
            </p>
          </div>
          
          <div className="features-grid">
            {features.map((feature, index) => (
              <div 
                key={index}
                className={`feature-card `}
                onMouseEnter={() => setActiveFeature(index)}
                style={{
                  transform: activeFeature === index ? 'translateY(-8px)' : 'translateY(0)',
                  transition: 'all 0.3s ease'
                }}
              >
                <div className="feature-icon">{feature.icon}</div>
                <div className="feature-header">
                  <h3 className="feature-title">{feature.title}</h3>
                  <span className="feature-stat">{feature.stat}</span>
                </div>
                <p className="feature-description">{feature.description}</p>
               
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Target Users Section */}
      <section className="target-users" style={{padding: '5rem 0', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', position: 'relative', overflow: 'hidden'}}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)',
          pointerEvents: 'none'
        }}></div>
        
        <div className="container" style={{position: 'relative', zIndex: 2}}>
          <div className="section-header">
            <h2 className="section-title">Who We Serve</h2>
            <p className="section-subtitle">
              Trusted by diverse organizations worldwide to create exceptional event experiences
            </p>
          </div>
          
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem'}}>
            {targetUsers.map((user, index) => (
              <div 
                key={index}
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  borderRadius: '16px',
                  padding: '2rem',
                  backdropFilter: 'blur(15px)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
                }}
              >
                <div style={{fontSize: '2.5rem', marginBottom: '1rem'}}>{user.icon}</div>
                <h3 style={{color: 'white', fontSize: '1.3rem', fontWeight: '700', marginBottom: '1rem'}}>{user.title}</h3>
                <p style={{color: 'rgba(255, 255, 255, 0.9)', lineHeight: '1.6'}}>{user.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Eventra Section */}
      <section className="why-choose" style={{padding: '5rem 0', background: '#f8fafc'}}>
        <div className="container">
          <div style={{textAlign: 'center', marginBottom: '4rem'}}>
            <h2 style={{fontSize: '3rem', fontWeight: '700', color: '#1a1a1a', marginBottom: '1rem'}}>Why Choose Eventra</h2>
            <p style={{fontSize: '1.2rem', color: '#6b7280', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6'}}>
              Built with transparency, scalability, and community at our core
            </p>
          </div>
          
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', maxWidth: '1200px', margin: '0 auto'}}>
            {whyChoose.map((item, index) => (
              <div 
                key={index}
                style={{
                  background: 'white',
                  borderRadius: '20px',
                  padding: '2.5rem',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
                  border: '1px solid rgba(0, 0, 0, 0.05)',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 20px 50px rgba(0, 0, 0, 0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.08)';
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                }}></div>
                <div style={{fontSize: '2.5rem', marginBottom: '1.5rem'}}>{item.icon}</div>
                <h3 style={{fontSize: '1.5rem', fontWeight: '700', color: '#1a1a1a', marginBottom: '1rem'}}>{item.title}</h3>
                <p style={{color: '#6b7280', lineHeight: '1.6'}}>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Impact Section */}
      <section className="community-impact" style={{padding: '5rem 0', background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', position: 'relative', overflow: 'hidden'}}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 50%, rgba(102, 126, 234, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(118, 75, 162, 0.1) 0%, transparent 50%)'
        }}></div>
        
        <div className="container" style={{position: 'relative', zIndex: 2}}>
          <div style={{textAlign: 'center', marginBottom: '4rem'}}>
            <h2 style={{fontSize: '3rem', fontWeight: '700', color: 'white', marginBottom: '1rem'}}>Join Our Growing Community</h2>
            <p style={{fontSize: '1.2rem', color: 'rgba(255, 255, 255, 0.8)', lineHeight: '1.6', maxWidth: '600px', margin: '0 auto'}}>
              Thousands of organizers worldwide trust Eventra to bring their communities together
            </p>
          </div>
          
          <div style={{
            background: 'rgba(255, 255, 255, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            borderRadius: '20px',
            padding: '3rem',
            textAlign: 'center',
            backdropFilter: 'blur(15px)',
            maxWidth: '800px',
            margin: '0 auto'
          }}>

            
            <p style={{color: 'rgba(255, 255, 255, 0.95)', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '2rem'}}>
              Start creating extraordinary events today and become part of a community that's reshaping how the world connects.
            </p>
            
            <div style={{display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap'}}>
              <a 
                href="#" 
                style={{
                  background: 'white',
                  color: '#667eea',
                  padding: '1rem 2rem',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 10px 20px rgba(255, 255, 255, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Get Started Free
              </a>
              <a 
                href="#" 
                style={{
                  background: 'transparent',
                  color: 'white',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  padding: '1rem 2rem',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'white';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                View Documentation
              </a>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .about-page {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .hero {
          min-height: 80vh;
          display: flex;
          align-items: center;
          position: relative;
          overflow: hidden;
          padding-top: 120px;
        }

        .hero-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: -1;
        }

        .hero-gradient {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
        }

        .hero-background::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -20%;
          width: 800px;
          height: 800px;
          background: radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%);
          border-radius: 50%;
          animation: float 6s ease-in-out infinite;
        }

        .hero-background::after {
          content: '';
          position: absolute;
          bottom: -50%;
          left: -20%;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(118, 75, 162, 0.1) 0%, transparent 70%);
          border-radius: 50%;
          animation: float 8s ease-in-out infinite reverse;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }

        .hero-content {
          text-align: center;
          max-width: 800px;
          margin: 0 auto;
          position: relative;
          z-index: 2;
        }

        .hero-title {
          font-size: 4rem;
          font-weight: 800;
          line-height: 1.2;
          margin-bottom: 2rem;
          color: #1a1a1a;
        }

        .hero-subtitle {
          font-size: 1.3rem;
          color: #6b7280;
          margin-bottom: 3rem;
          line-height: 1.6;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .hero-actions {
          display: flex;
          gap: 1.5rem;
          justify-content: center;
          margin-bottom: 4rem;
        }

        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 1rem 2rem;
          border-radius: 12px;
          text-decoration: none;
          font-weight: 600;
          font-size: 1.1rem;
          transition: all 0.3s ease;
          display: inline-block;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }

        .btn-secondary {
          background: transparent;
          color: #667eea;
          border: 2px solid #667eea;
          padding: 1rem 2rem;
          border-radius: 12px;
          text-decoration: none;
          font-weight: 600;
          font-size: 1.1rem;
          transition: all 0.3s ease;
          display: inline-block;
        }

        .btn-secondary:hover {
          background: #667eea;
          color: white;
          transform: translateY(-2px);
        }

        .features {
          background: #f8fafc;
          position: relative;
          padding: 5rem 0;
        }

        .features-header {
          text-align: center;
          margin-bottom: 4rem;
        }

        .features-title {
          font-size: 3rem;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 1rem;
          line-height: 1.2;
        }

        .features-subtitle {
          font-size: 1.2rem;
          color: #6b7280;
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .feature-card {
          background: white;
          border-radius: 20px;
          padding: 2.5rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(0, 0, 0, 0.05);
        }

        .feature-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.12);
        }

        .feature-card.highlight {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
        }

        .feature-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .feature-card.highlight::before {
          background: rgba(255, 255, 255, 0.3);
        }

        .feature-icon {
          font-size: 3rem;
          margin-bottom: 1.5rem;
          display: block;
        }

        .feature-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
          gap: 1rem;
        }

        .feature-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1a1a1a;
          line-height: 1.3;
          flex: 1;
        }

        .feature-stat {
          font-size: 0.875rem;
          font-weight: 600;
          color: #667eea;
          background: rgba(102, 126, 234, 0.1);
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          white-space: nowrap;
        }

        .feature-card.highlight .feature-title {
          color: white;
        }

        .feature-card.highlight .feature-stat {
          color: white;
          background: rgba(255, 255, 255, 0.2);
        }

        .feature-description {
          color: #6b7280;
          line-height: 1.6;
          margin-bottom: 2rem;
        }

        .feature-card.highlight .feature-description {
          color: rgba(255, 255, 255, 0.9);
        }

        .feature-cta {
          color: #667eea;
          font-weight: 600;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
        }

        .feature-card.highlight .feature-cta {
          color: white;
        }

        .feature-cta:hover {
          gap: 1rem;
        }

        .section-title {
          font-size: 3rem;
          font-weight: 700;
          color: white;
          margin-bottom: 1rem;
          line-height: 1.2;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .section-subtitle {
          font-size: 1.2rem;
          color: rgba(255, 255, 255, 0.95);
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        }

        .section-header {
          text-align: center;
          margin-bottom: 4rem;
          position: relative;
          z-index: 2;
        }

        @media (max-width: 1024px) {
          .hero {
            padding-top: 100px;
          }
          
          .container {
            padding: 0 1.5rem;
          }
          
          .hero-actions {
            gap: 1rem;
          }
        }

        @media (max-width: 768px) {
          .hero {
            padding-top: 80px;
            min-height: 70vh;
          }
          
          .container {
            padding: 0 1rem;
          }
          
          .hero-title {
            font-size: 3rem;
          }
          
          .hero-subtitle {
            font-size: 1.1rem;
            margin-bottom: 2rem;
          }
          
          .hero-actions {
            flex-direction: column;
            align-items: center;
            gap: 1rem;
            margin-bottom: 2rem;
          }
          
          .btn-primary,
          .btn-secondary {
            width: 100%;
            max-width: 280px;
            text-align: center;
          }
          
          .features-title,
          .section-title {
            font-size: 2.5rem;
          }
          
          .features-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
          
          .feature-card {
            padding: 2rem;
          }
          
          .feature-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }
          
          .feature-stat {
            align-self: flex-start;
          }
          
          .mission-vision {
            padding: 3rem 0 !important;
          }
          
          .mission-vision > .container > div {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
          
          .mission-card,
          .vision-card {
            padding: 2rem !important;
          }
        }

        @media (max-width: 480px) {
          .hero {
            padding-top: 70px;
            min-height: 60vh;
          }
          
          .container {
            padding: 0 1rem;
          }
          
          .hero-title {
            font-size: 2.5rem;
            margin-bottom: 1.5rem;
          }
          
          .hero-subtitle {
            font-size: 1rem;
            margin-bottom: 2rem;
          }
          
          .btn-primary,
          .btn-secondary {
            padding: 0.875rem 1.5rem;
            font-size: 1rem;
          }
          
          .section-title,
          .features-title {
            font-size: 2rem;
          }
          
          .feature-card {
            padding: 1.5rem;
          }
          
          .feature-icon {
            font-size: 2.5rem;
            margin-bottom: 1rem;
          }
          
          .feature-title {
            font-size: 1.3rem;
          }
          
          .mission-card,
          .vision-card {
            padding: 1.5rem !important;
          }
          
          .mission-card h2,
          .vision-card h2 {
            font-size: 1.5rem !important;
          }
          
          .mission-card .container div,
          .vision-card .container div {
            font-size: 2.5rem !important;
            margin-bottom: 1rem !important;
          }
          
          .target-users,
          .why-choose,
          .community-impact {
            padding: 3rem 0 !important;
          }
          
          .target-users > .container > div,
          .why-choose > .container > div:last-child {
            grid-template-columns: 1fr !important;
            gap: 1.5rem !important;
          }
          
          .community-impact .container > div:last-child {
            padding: 2rem !important;
          }
          
          .community-impact .container > div:last-child > div:first-child {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 1.5rem !important;
          }
          
          .community-impact .container > div:last-child > div:first-child > div > div:first-child {
            font-size: 2rem !important;
          }
          
          .community-impact .container > div:last-child > div:last-child {
            flex-direction: column !important;
            gap: 1rem !important;
          }
          
          .community-impact .container > div:last-child > div:last-child > a {
            width: 100% !important;
            text-align: center !important;
          }
        }

        @media (max-width: 320px) {
          .hero {
            padding-top: 60px;
          }
          
          .hero-title {
            font-size: 2rem;
          }
          
          .section-title,
          .features-title {
            font-size: 1.75rem;
          }
          
          .feature-card {
            padding: 1rem;
          }
          
          .mission-card,
          .vision-card {
            padding: 1rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AboutPage;