import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, MapPin, Users, Clock, Copy, Share2, ArrowLeft } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { getEventById } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

const EventDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const event = id ? getEventById(id) : undefined;

  if (!event) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Event not found</p>
        <Button variant="link" onClick={() => navigate('/dashboard')}>Go back</Button>
      </div>
    );
  }

  const isHost = user?.id === event.hostId;
  const copyCode = () => {
    navigator.clipboard.writeText(event.eventCode);
    toast({ title: 'Copied!', description: 'Event code copied to clipboard' });
  };

  const copyLink = () => {
    navigator.clipboard.writeText(event.eventLink);
    toast({ title: 'Copied!', description: 'Event link copied to clipboard' });
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
                <CardTitle className="text-2xl">{event.title}</CardTitle>
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
                  <span>{new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-primary" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center gap-3 sm:col-span-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span>{event.location}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" /> Guest List ({event.guests.length}{event.maxGuests ? `/${event.maxGuests}` : ''})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {event.guests.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No guests yet</p>
              ) : (
                <div className="space-y-2">
                  {event.guests.map((guest, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                        {guest.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{guest.name}</p>
                        <p className="text-sm text-muted-foreground">{guest.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                <QRCodeSVG value={event.eventLink} size={160} />
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Event Code</p>
                <p className="text-3xl font-mono font-bold tracking-widest">{event.eventCode}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={copyCode}><Copy className="w-4 h-4 mr-2" /> Code</Button>
                <Button variant="outline" onClick={copyLink}><Share2 className="w-4 h-4 mr-2" /> Link</Button>
              </div>
            </CardContent>
          </Card>

          {isHost && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-primary font-medium">You are hosting this event</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
