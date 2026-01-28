import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import React from 'react';
import { getEventById, getContacts } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getId } from '@/lib/utils';
import { deleteEvent, sendInvites } from '@/lib/api';
import { Calendar, MapPin, Users, Clock, Copy, Share2, ArrowLeft, Mail as MailIcon } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';

const EventDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [event, setEvent] = React.useState<any | undefined>(undefined);
  const [contacts, setContacts] = React.useState<any[]>([]);
  const [selectedContacts, setSelectedContacts] = React.useState<string[]>([]);
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [sendingInvites, setSendingInvites] = React.useState(false);

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

  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!user) return;
      try {
        const data = await getContacts();
        if (mounted) setContacts(data);
      } catch (err) {
        // ignore
      }
    };
    load();
    return () => { mounted = false; };
  }, [user]);

  if (!event) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Event not found</p>
        <Button variant="link" onClick={() => navigate('/dashboard')}>Go back</Button>
      </div>
    );
  }

  const hostId = getId(event?.host) || getId(event?.hostId) || getId(event?.host?._id) || getId(event?.host?.id) || null;
  const isHost = !!user && (!!getId(user) ? getId(user) === hostId : user?.id === hostId);
  const guests = Array.isArray(event?.guests) ? event.guests : [];
  const eventDate = event?.date ? (() => {
    try { return new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }); }
    catch { return 'TBD'; }
  })() : 'TBD';
  const copyCode = () => {
    navigator.clipboard.writeText(event.eventCode);
    toast({ title: 'Copied!', description: 'Event code copied to clipboard' });
  };

  const copyLink = () => {
    navigator.clipboard.writeText(event.eventLink);
    toast({ title: 'Copied!', description: 'Event link copied to clipboard' });
  };

  const handleSendInvites = async () => {
    if (selectedContacts.length === 0) {
      toast({ title: 'Select contacts', description: 'Please select at least one contact', variant: 'destructive' });
      return;
    }

    setSendingInvites(true);
    try {
      const contactsToSend = contacts.filter(c => selectedContacts.includes(c._id || c.id));
      await sendInvites(event, contactsToSend);
      toast({ title: 'Invites sent!', description: `Sent to ${selectedContacts.length} contact${selectedContacts.length !== 1 ? 's' : ''}` });
      setSelectedContacts([]);
      setInviteOpen(false);
    } catch (err: any) {
      toast({ title: 'Failed to send', description: err?.message || 'Could not send invites', variant: 'destructive' });
    } finally {
      setSendingInvites(false);
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
                <CardTitle className="text-2xl">{event.title || 'Untitled Event'}</CardTitle>
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
                  <span>{eventDate}</span>
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

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" /> Guest List ({guests.length}{event.maxGuests ? `/${event.maxGuests}` : ''})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {event.guests.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No guests yet</p>
              ) : (
                <div className="space-y-2">
                  {guests.map((guest: any, i: number) => {
                    const guestName = guest?.name || guest?.user?.name || guest?.user?.email || guest?.email || (typeof guest?.user === 'string' ? guest.user : null) || 'Guest';
                    const key = getId(guest) || getId(guest.user) || i;
                    return (
                      <div key={key} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                          {String(guestName).charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{guestName}</p>
                          <p className="text-sm text-muted-foreground">{guest?.email || guest?.user?.email || ''}</p>
                        </div>
                      </div>
                    );
                  })}
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
                <QRCodeSVG value={event?.eventLink || ''} size={160} />
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Event Code</p>
                <p className="text-3xl font-mono font-bold tracking-widest">{event.eventCode || '—'}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={copyCode}><Copy className="w-4 h-4 mr-2" /> Code</Button>
                <Button variant="outline" onClick={copyLink}><Share2 className="w-4 h-4 mr-2" /> Link</Button>
              </div>
              {isHost && (
                <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full gradient-primary">
                      <MailIcon className="w-4 h-4 mr-2" /> Send Invites
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Send Invites to Contacts</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      {contacts.length === 0 ? (
                        <p className="text-muted-foreground text-center py-6">No contacts added yet</p>
                      ) : (
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                          {contacts.map((contact) => (
                            <div key={contact._id || contact.id} className="flex items-center gap-3 p-2 hover:bg-muted rounded">
                              <Checkbox
                                checked={selectedContacts.includes(contact._id || contact.id)}
                                onCheckedChange={(checked) => {
                                  const id = contact._id || contact.id;
                                  if (checked) {
                                    setSelectedContacts([...selectedContacts, id]);
                                  } else {
                                    setSelectedContacts(selectedContacts.filter(c => c !== id));
                                  }
                                }}
                              />
                              <div className="flex-1">
                                <p className="font-medium text-sm">{contact.name}</p>
                                <p className="text-xs text-muted-foreground">{contact.email}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setInviteOpen(false)} className="flex-1">
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleSendInvites} 
                          disabled={sendingInvites || selectedContacts.length === 0}
                          className="flex-1 gradient-primary"
                        >
                          {sendingInvites ? 'Sending...' : `Send to ${selectedContacts.length}`}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </CardContent>
          </Card>

          {isHost && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4 text-center space-y-3">
                <p className="text-sm text-primary font-medium">You are hosting this event</p>
                <div>
                  <Button variant="destructive" onClick={async () => {
                    if (!confirm('Delete this event? This action cannot be undone.')) return;
                    try {
                      await deleteEvent(getId(event) || event._id || event.id);
                      toast({ title: 'Deleted', description: 'Event deleted', variant: 'default' });
                      navigate('/dashboard');
                    } catch (err: any) {
                      toast({ title: 'Could not delete', description: err?.message || 'Delete failed', variant: 'destructive' });
                    }
                  }}>Delete Event</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
