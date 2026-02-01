import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import React from 'react';
import { getMyEvents } from '@/lib/api';

const MyEvents = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [hosted, setHosted] = React.useState<any[]>([]);
  const [joined, setJoined] = React.useState<any[]>([]);

  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!user) return;
      try {
        const data = await getMyEvents();
        if (!mounted) return;
        setHosted(data.hosted || []);
        setJoined(data.joined || []);
      } catch (err) {
        // ignore
      }
    };
    load();
    return () => { mounted = false; };
  }, [user]);

  const HostedEventCard = ({ event }: { event: any }) => (
    <div className="p-4 bg-muted/50 rounded-lg hover:bg-muted cursor-pointer transition-colors" onClick={() => navigate(`/dashboard/event/${event._id || event.id}`)}>
      <div className="flex justify-between items-start">
        <div>
          <p className="font-medium">{event.title}</p>
          <p className="text-sm text-muted-foreground">{new Date(event.date).toLocaleDateString()} at {event.time}</p>
        </div>
        <span className="text-sm text-muted-foreground">{event.guests.length} guests</span>
      </div>
    </div>
  );

  const JoinedEventCard = ({ event }: { event: any }) => (
    <div className="p-4 bg-muted/50 rounded-lg hover:bg-muted cursor-pointer transition-colors" onClick={() => navigate(`/dashboard/event/attending/${event._id || event.id}`)}>
      <div className="flex justify-between items-start">
        <div>
          <p className="font-medium">{event.title}</p>
          <p className="text-sm text-muted-foreground">{new Date(event.date).toLocaleDateString()} at {event.time}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold mb-8">My Events</h1>
      <Tabs defaultValue="hosted">
        <TabsList><TabsTrigger value="hosted"><Calendar className="w-4 h-4 mr-2" />Hosted ({hosted.length})</TabsTrigger><TabsTrigger value="joined"><Users className="w-4 h-4 mr-2" />Joined ({joined.length})</TabsTrigger></TabsList>
        <TabsContent value="hosted" className="mt-6">
          {hosted.length === 0 ? <Card><CardContent className="py-12 text-center text-muted-foreground">No hosted events</CardContent></Card> : <div className="space-y-3">{hosted.map(e => <HostedEventCard key={e._id || e.id} event={e} />)}</div>}
        </TabsContent>
        <TabsContent value="joined" className="mt-6">
          {joined.length === 0 ? <Card><CardContent className="py-12 text-center text-muted-foreground">No joined events</CardContent></Card> : <div className="space-y-3">{joined.map(e => <JoinedEventCard key={e._id || e.id} event={e} />)}</div>}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MyEvents;

