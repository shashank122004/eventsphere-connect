import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import React from 'react';
import { getEventHistory } from '@/lib/api';
import { useNavigate } from 'react-router-dom';

const EventHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [all, setAll] = React.useState<any[]>([]);

  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!user) return;
      try {
        const data = await getEventHistory();
        if (!mounted) return;
        const hosted = (data.hosted || []).map((e:any) => ({ ...e, type: 'hosted' }));
        const joined = (data.joined || []).map((e:any) => ({ ...e, type: 'joined' }));
        const merged = [...hosted, ...joined].sort((a:any,b:any) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setAll(merged);
      } catch (err) {
        // ignore
      }
    };
    load();
    return () => { mounted = false; };
  }, [user]);

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold mb-8">Event History</h1>
      {all.length === 0 ? (
        <Card><CardContent className="py-20 text-center text-muted-foreground">No past events</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {all.map(event => (
            <div key={event._id || event.id} className="p-4 bg-muted/50 rounded-lg hover:bg-muted cursor-pointer transition-colors" onClick={() => navigate(`/dashboard/event/${event._id || event.id}`)}>
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
