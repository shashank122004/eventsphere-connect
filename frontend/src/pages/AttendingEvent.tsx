import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEventById, leaveEvent } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, MapPin, Clock, ArrowLeft } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useToast } from '@/hooks/use-toast';

const AttendingEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [event, setEvent] = React.useState<any | undefined>(undefined);

  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!id) return;
      try {
        const data = await getEventById(id);
        if (mounted) setEvent(data);
      } catch (err) {
        if (mounted) setEvent(undefined);
      }
    };
    load();
    return () => { mounted = false; };
  }, [id]);

  if (!event) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Event not found</p>
        <Button variant="link" onClick={() => navigate('/dashboard')}>Go back</Button>
      </div>
    );
  }

  const leave = async () => {
    if (!confirm('Leave this event?')) return;
    try {
      await leaveEvent(id as string);
      toast({ title: 'Left event', description: 'You have left the event' });
      navigate('/dashboard');
    } catch (err: any) {
      toast({ title: 'Could not leave', description: err?.message || 'Leave failed', variant: 'destructive' });
    }
  };

  return (
    <div className="animate-fade-in">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back
      </Button>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">{event.title || 'Untitled Event'}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-2">Hosted by {event.host?.name || event.hostName || 'Unknown'}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${event.isPublic ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                  {event.isPublic ? 'Public' : 'Private'}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{event.description || 'No description'}</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span>{event.date ? new Date(event.date).toLocaleDateString() : 'TBD'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-primary" />
                  <span>{event.time || 'TBD'}</span>
                </div>
                <div className="flex items-center gap-3 sm:col-span-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span>{event.location || 'TBD'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Share Event</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center p-4 bg-white rounded-lg">
                <QRCodeSVG value={event?.eventLink || ''} size={160} />
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Event Code</p>
                <p className="text-3xl font-mono font-bold tracking-widest">{event.eventCode || '—'}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={() => { navigator.clipboard.writeText(event.eventCode || ''); toast({ title: 'Copied', description: 'Code copied' }); }}>Code</Button>
                <Button variant="outline" onClick={() => { navigator.clipboard.writeText(event.eventLink || ''); toast({ title: 'Copied', description: 'Link copied' }); }}>Link</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-muted/10 bg-muted/5">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">You are attending this event</p>
              <div className="mt-3">
                <Button variant="destructive" onClick={leave}>Leave Event</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AttendingEvent;
