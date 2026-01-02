import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { getUserHostedEvents, getUserJoinedEvents } from '@/lib/storage';
import { useNavigate } from 'react-router-dom';

const EventHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const hosted = user ? getUserHostedEvents(user.id).filter(e => e.status === 'completed') : [];
  const joined = user ? getUserJoinedEvents(user.id).filter(e => e.status === 'completed') : [];
  const all = [...hosted.map(e => ({...e, type: 'hosted'})), ...joined.map(e => ({...e, type: 'joined'}))].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold mb-8">Event History</h1>
      {all.length === 0 ? (
        <Card><CardContent className="py-20 text-center text-muted-foreground">No past events</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {all.map(event => (
            <div key={event.id} className="p-4 bg-muted/50 rounded-lg hover:bg-muted cursor-pointer transition-colors" onClick={() => navigate(`/dashboard/event/${event.id}`)}>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{event.title}</p>
                  <p className="text-sm text-muted-foreground">{new Date(event.date).toLocaleDateString()}</p>
                </div>
                <span className={`text-sm px-2 py-1 rounded ${event.type === 'hosted' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'}`}>{event.type === 'hosted' ? 'Hosted' : 'Attended'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventHistory;
