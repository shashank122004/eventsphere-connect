import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Calendar, Users, QrCode, Sparkles, ArrowRight, CheckCircle } from 'lucide-react';

const Landing = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleHostClick = () => {
    if (isAuthenticated) {
      navigate('/dashboard/host');
    } else {
      navigate('/auth?mode=login');
    }
  };

  const handleJoinClick = () => {
    if (isAuthenticated) {
      navigate('/dashboard/join');
    } else {
      navigate('/auth?mode=login');
    }
  };

  const features = [
    {
      icon: Calendar,
      title: 'Create Events',
      description: 'Host public or private events with customizable details and guest limits.',
    },
    {
      icon: QrCode,
      title: 'QR Code Sharing',
      description: 'Generate unique QR codes for easy event sharing and quick join.',
    },
    {
      icon: Users,
      title: 'Guest Management',
      description: 'Track RSVPs, manage contacts, and send invitations effortlessly.',
    },
    {
      icon: Sparkles,
      title: 'Smart Organization',
      description: 'Keep track of your event history and upcoming gatherings in one place.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="p-2 gradient-primary rounded-lg">
              <Calendar className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold gradient-text">Eventify</span>
          </Link>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Button onClick={() => navigate('/dashboard')} className="gradient-primary">
                Dashboard
              </Button>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate('/auth?mode=login')}>
                  Login
                </Button>
                <Button onClick={() => navigate('/auth?mode=signup')} className="gradient-primary">
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        </div>

        <div className="container mx-auto text-center relative z-10">
          <div className="animate-slide-up">
            <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              ✨ Event Management Made Simple
            </span>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Create & Join
              <span className="block gradient-text">Amazing Events</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Host memorable gatherings, send invitations, and manage your guest list — all in one beautiful platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={handleHostClick}
                className="gradient-primary text-lg px-8 py-6 hover-lift shadow-glow"
              >
                Host an Event
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleJoinClick}
                className="text-lg px-8 py-6 hover-lift border-2"
              >
                Join an Event
                <QrCode className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            {[
              { value: '10K+', label: 'Events Created' },
              { value: '50K+', label: 'Happy Users' },
              { value: '100K+', label: 'Guests Joined' },
              { value: '99%', label: 'Satisfaction' },
            ].map((stat, i) => (
              <div key={i} className="animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="text-3xl md:text-4xl font-bold gradient-text">{stat.value}</div>
                <div className="text-muted-foreground text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Everything you need
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Powerful features to make your event planning seamless and enjoyable.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="p-6 bg-card rounded-2xl border border-border hover-lift animate-fade-in"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              How it works
            </h2>
            <p className="text-muted-foreground text-lg">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: '01', title: 'Create Account', desc: 'Sign up for free in seconds' },
              { step: '02', title: 'Host or Join', desc: 'Create your event or scan a QR code' },
              { step: '03', title: 'Enjoy!', desc: 'Manage guests and have a great time' },
            ].map((item, i) => (
              <div key={i} className="text-center relative animate-fade-in" style={{ animationDelay: `${i * 0.15}s` }}>
                <div className="text-6xl font-bold text-primary/10 mb-4">{item.step}</div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 left-full w-full">
                    <div className="w-1/2 h-0.5 bg-gradient-to-r from-primary/20 to-transparent" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="gradient-hero rounded-3xl p-12 md:p-20 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-black/20" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                Ready to host your next event?
              </h2>
              <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
                Join thousands of event organizers who trust Eventify for their gatherings.
              </p>
              <Button
                size="lg"
                onClick={() => navigate('/auth?mode=signup')}
                className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6"
              >
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 gradient-primary rounded-lg">
              <Calendar className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">Eventify</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 Eventify. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
