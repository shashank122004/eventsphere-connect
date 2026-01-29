import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, QrCode, Compass, Calendar, Users, ArrowRight, Sparkles } from 'lucide-react';
import { getMyEvents } from '@/lib/api';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [hostedEvents, setHostedEvents] = React.useState<any[]>([]);
  const [joinedEvents, setJoinedEvents] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Filter upcoming events
  const upcomingHosted = hostedEvents.filter(e => e.status === 'upcoming');
  const upcomingJoined = joinedEvents.filter(e => e.status === 'upcoming');

  // Fetch events from API
  React.useEffect(() => {
    let mounted = true;

    const loadEvents = async () => {
      if (!user) return;
      try {
        const data = await getMyEvents();
        if (!mounted) return;

        console.log('API data:', data); // debug API

        setHostedEvents(data.hostedEvents || []);
        setJoinedEvents(data.joinedEvents || []);
      } catch (err) {
        console.error('Error fetching events:', err);
        setHostedEvents([]);
        setJoinedEvents([]);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();

    return () => { mounted = false; };
  }, [user]);

  // Quick Actions
  const quickActions = [
    { icon: PlusCircle, title: 'Host Event', description: 'Create a new event', to: '/dashboard/host', gradient: 'gradient-primary' },
    { icon: QrCode, title: 'Join Event', description: 'Enter code or scan QR', to: '/dashboard/join', gradient: 'gradient-accent' },
    { icon: Compass, title: 'Explore', description: 'Find public events', to: '/dashboard/explore', gradient: 'gradient-primary' },
  ];

  // Stats
  const stats = [
    { icon: Calendar, value: hostedEvents.length, label: 'Events Hosted' },
    { icon: Users, value: joinedEvents.length, label: 'Events Joined' },
    { icon: Sparkles, value: upcomingHosted.length + upcomingJoined.length, label: 'Upcoming' },
  ];

  if (!user) {
    return <div className="text-center py-20">Loading user...</div>;
  }

  if (loading) {
    return <div className="text-center py-20">Loading events...</div>;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
            Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span>!
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            What would you like to do today?
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="hover-lift">
            <CardContent className="p-4 sm:p-6 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <stat.icon className="w-5 sm:w-6 md:w-7 h-5 sm:h-6 md:h-7 text-primary" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl md:text-2xl font-bold">{stat.value}</p>
                <p className="text-sm sm:text-base text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {quickActions.map((action, i) => (
            <Card
              key={i}
              className="hover-lift cursor-pointer group"
              onClick={() => navigate(action.to)}
            >
              <CardContent className="p-4 sm:p-6">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl ${action.gradient} flex items-center justify-center mb-4`}>
                  <action.icon className="w-6 sm:w-7 md:w-8 h-6 sm:h-7 md:h-8 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-base sm:text-lg md:text-lg mb-1">{action.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">{action.description}</p>
                <ArrowRight className="w-5 h-5 mt-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hosting */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Upcoming Events You're Hosting
            </CardTitle>
            <CardDescription>
              {upcomingHosted.length} event{upcomingHosted.length !== 1 ? 's' : ''} coming up
            </CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingHosted.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No upcoming events</p>
                <Button
                  variant="link"
                  onClick={() => navigate('/dashboard/host')}
                  className="mt-2"
                >
                  Host your first event
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingHosted.slice(0, 3).map((event) => (
                  <div
                    key={event._id || event.id}
                    className="p-4 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                    onClick={() => navigate(`/dashboard/event/${event._id || event.id}`)}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                      <div>
                        <p className="font-medium truncate sm:truncate-none">{event.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(event.date).toLocaleDateString()} at {event.time}
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {event.guests.length} guest{event.guests.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                ))}
                {upcomingHosted.length > 3 && (
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => navigate('/dashboard/my-events')}
                  >
                    View all ({upcomingHosted.length})
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Joined */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-accent" />
              Events You're Attending
            </CardTitle>
            <CardDescription>
              {upcomingJoined.length} event{upcomingJoined.length !== 1 ? 's' : ''} coming up
            </CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingJoined.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No events joined yet</p>
                <Button
                  variant="link"
                  onClick={() => navigate('/dashboard/explore')}
                  className="mt-2"
                >
                  Explore public events
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingJoined.slice(0, 3).map((event) => (
                  <div
                    key={event._id || event.id}
                    className="p-4 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                    onClick={() => navigate(`/dashboard/event/attending/${event._id || event.id}`)}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                      <div>
                        <p className="font-medium truncate sm:truncate-none">{event.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(event.date).toLocaleDateString()} at {event.time}
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        by {event.hostName}
                      </div>
                    </div>
                  </div>
                ))}
                {upcomingJoined.length > 3 && (
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => navigate('/dashboard/my-events')}
                  >
                    View all ({upcomingJoined.length})
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
