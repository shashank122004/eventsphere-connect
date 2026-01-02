import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, MapPin, Users, ArrowRight } from 'lucide-react';
import { getPublicEvents, joinEvent } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

const ExploreEvents = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const events = getPublicEvents();

  const handleJoin = (eventId: string, eventTitle: string) => {
    if (!user) return;
    const success = joinEvent(eventId, {
      userId: user.id,
      name: user.name,
      email: user.email,
      joinedAt: new Date().toISOString(),
    });

    if (success) {
      toast({ title: 'Joined!', description: `You're attending ${eventTitle}` });
      navigate(`/dashboard/event/${eventId}`);
    } else {
      toast({ title: 'Could not join', description: 'Already joined or event is full', variant: 'destructive' });
    }
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold mb-2">Explore Events</h1>
      <p className="text-muted-foreground mb-8">Discover public events to join</p>

      {events.length === 0 ? (
        <Card><CardContent className="py-20 text-center text-muted-foreground">No public events available</CardContent></Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => (
            <Card key={event.id} className="hover-lift">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold text-lg">{event.title}</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2"><Calendar className="w-4 h-4" />{new Date(event.date).toLocaleDateString()} at {event.time}</div>
                  <div className="flex items-center gap-2"><MapPin className="w-4 h-4" />{event.location}</div>
                  <div className="flex items-center gap-2"><Users className="w-4 h-4" />{event.guests.length} attending • by {event.hostName}</div>
                </div>
                <Button className="w-full" onClick={() => handleJoin(event.id, event.title)} disabled={event.hostId === user?.id}>
                  {event.hostId === user?.id ? 'Your Event' : 'Join'} <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExploreEvents;
