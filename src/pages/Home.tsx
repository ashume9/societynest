import { Link } from 'react-router-dom'
import { ShoppingBag, Clock, Shield, Star, ArrowRight, CheckCircle, Zap } from 'lucide-react'

export default function Home() {
  return (
    <div className="page">
      <section style={{
        background: 'linear-gradient(135deg, var(--primary-700) 0%, var(--primary-900) 100%)',
        color: 'white',
        padding: '80px 0 100px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.05,
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }} />
        <div className="container" style={{ position: 'relative', textAlign: 'center' }}>
          <div className="badge badge-blue" style={{
            background: 'rgba(255,255,255,0.15)', color: 'white',
            marginBottom: 24, display: 'inline-flex',
          }}>
            Professional Ironing Service for Societies
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 700, lineHeight: 1.15, marginBottom: 20 }}>
            Fresh, Pressed Clothes<br />
            <span style={{ color: 'var(--accent-400)' }}>Delivered to Your Door</span>
          </h1>
          <p style={{ fontSize: 18, opacity: 0.85, maxWidth: 540, margin: '0 auto 40px', lineHeight: 1.7 }}>
            SocietyXpress offers convenient ironing & delivery services within your residential society.
            Schedule pickups, track orders, and enjoy perfectly pressed clothes.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-accent btn-lg">
              Get Started Free <ArrowRight size={18} />
            </Link>
            <Link to="/pricing" className="btn btn-lg" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', backdropFilter: 'blur(4px)' }}>
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 0', background: 'white' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontSize: 32, fontWeight: 700, color: 'var(--neutral-800)', marginBottom: 12 }}>
              Why Choose SocietyXpress?
            </h2>
            <p style={{ color: 'var(--neutral-500)', fontSize: 16, maxWidth: 480, margin: '0 auto' }}>
              We make ironing simple, reliable, and affordable for modern apartment residents.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
            {[
              { icon: Clock, title: 'Flexible Pickup & Delivery', desc: 'Choose morning or evening slots that fit your schedule. We work around your life.', color: 'var(--primary-600)' },
              { icon: Shield, title: 'Trusted Partners', desc: 'All our ironing and delivery partners are verified with identity checks and society approval.', color: 'var(--success-600)' },
              { icon: Zap, title: 'Express Service', desc: 'Need clothes urgently? Our express service ensures same-day turnaround.', color: 'var(--accent-500)' },
              { icon: Star, title: 'Society Native', desc: 'Operate within your society — faster service, familiar faces, community trust.', color: '#8b5cf6' },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="card" style={{ padding: 28 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: color + '15',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 16,
                }}>
                  <Icon size={24} color={color} />
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 600, color: 'var(--neutral-800)', marginBottom: 8 }}>{title}</h3>
                <p style={{ color: 'var(--neutral-500)', fontSize: 14, lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 0', background: 'var(--neutral-50)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontSize: 32, fontWeight: 700, color: 'var(--neutral-800)', marginBottom: 12 }}>
              How It Works
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32 }}>
            {[
              { step: '01', title: 'Register', desc: 'Sign up with your society, tower, and flat details.' },
              { step: '02', title: 'Place Order', desc: 'Select clothing items, service type, and pickup slot.' },
              { step: '03', title: 'We Pick Up', desc: 'A verified partner collects from your door.' },
              { step: '04', title: 'Get Delivered', desc: 'Pressed clothes returned to your door, on time.' },
            ].map(({ step, title, desc }) => (
              <div key={step} style={{ textAlign: 'center' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: 'var(--primary-600)',
                  color: 'white', fontSize: 14, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px',
                }}>
                  {step}
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 600, color: 'var(--neutral-800)', marginBottom: 8 }}>{title}</h3>
                <p style={{ color: 'var(--neutral-500)', fontSize: 14, lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 0', background: 'white' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: 32, fontWeight: 700, color: 'var(--neutral-800)', marginBottom: 16 }}>
                Service Tiers for Every Need
              </h2>
              <p style={{ color: 'var(--neutral-500)', marginBottom: 32, lineHeight: 1.7 }}>
                From everyday wear to urgent requirements, we have a plan that suits your lifestyle.
              </p>
              {[
                { name: 'Normal', desc: '2–3 day turnaround, ideal for regular ironing', color: 'var(--primary-600)' },
                { name: 'Priority', desc: 'Next-day delivery for when you need it sooner', color: 'var(--accent-500)' },
                { name: 'Express', desc: 'Same-day service for urgent requirements', color: 'var(--error-500)' },
              ].map(({ name, desc, color }) => (
                <div key={name} style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                  <CheckCircle size={20} color={color} style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <span style={{ fontWeight: 600, color: 'var(--neutral-800)' }}>{name}</span>
                    <span style={{ color: 'var(--neutral-500)', fontSize: 14 }}> — {desc}</span>
                  </div>
                </div>
              ))}
              <Link to="/pricing" className="btn btn-primary" style={{ marginTop: 8 }}>
                See Full Pricing <ArrowRight size={16} />
              </Link>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, var(--primary-50) 0%, var(--primary-100) 100%)',
              borderRadius: 24, padding: 40, textAlign: 'center',
            }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>👔</div>
              <h3 style={{ fontSize: 24, fontWeight: 700, color: 'var(--primary-800)', marginBottom: 8 }}>
                Starting at ₹12
              </h3>
              <p style={{ color: 'var(--primary-600)', fontSize: 15 }}>
                per item for normal service
              </p>
              <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { item: 'T-Shirt', price: '₹12' },
                  { item: 'Shirt', price: '₹15' },
                  { item: 'Saree', price: '₹25' },
                  { item: 'Bedsheet', price: '₹30' },
                ].map(({ item, price }) => (
                  <div key={item} style={{
                    display: 'flex', justifyContent: 'space-between',
                    background: 'white', padding: '10px 16px',
                    borderRadius: 8, fontSize: 14,
                  }}>
                    <span style={{ color: 'var(--neutral-600)' }}>{item}</span>
                    <span style={{ fontWeight: 600, color: 'var(--primary-700)' }}>{price}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{
        padding: '80px 0',
        background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--primary-800) 100%)',
        color: 'white', textAlign: 'center',
      }}>
        <div className="container">
          <h2 style={{ fontSize: 36, fontWeight: 700, marginBottom: 16 }}>Ready to Get Started?</h2>
          <p style={{ opacity: 0.85, fontSize: 18, marginBottom: 40, maxWidth: 480, margin: '0 auto 40px' }}>
            Join hundreds of residents already enjoying convenient ironing services in their societies.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-accent btn-lg">
              Create Account <ArrowRight size={18} />
            </Link>
            <Link to="/partner/login" className="btn btn-lg" style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}>
              Join as Partner
            </Link>
          </div>
        </div>
      </section>

      <footer style={{ background: 'var(--neutral-900)', color: 'var(--neutral-400)', padding: '40px 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShoppingBag size={20} color="white" />
            <span style={{ color: 'white', fontWeight: 600 }}>SocietyXpress</span>
          </div>
          <p style={{ fontSize: 14 }}>© 2025 SocietyXpress. Professional ironing service.</p>
          <div style={{ display: 'flex', gap: 24, fontSize: 14 }}>
            <Link to="/pricing" style={{ color: 'var(--neutral-400)' }}>Pricing</Link>
            <Link to="/login" style={{ color: 'var(--neutral-400)' }}>Login</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
