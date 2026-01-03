import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar, MapPin, Globe, Users, ArrowRight } from 'lucide-react';
import { createEvent as apiCreateEvent } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const HostEvent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    locationType: 'physical' as 'physical' | 'online',
    isPublic: true,
    maxGuests: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validate date: must be today or in the future
    if (!form.date) {
      toast({ title: 'Invalid date', description: 'Please select a date', variant: 'destructive' });
      return;
    }
    const selected = new Date(form.date);
    const today = new Date();
    today.setHours(0,0,0,0);
    selected.setHours(0,0,0,0);
    if (selected < today) {
      toast({ title: 'Invalid date', description: 'Date must be today or later', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const event = await apiCreateEvent({
        ...form,
        maxGuests: form.maxGuests ? parseInt(form.maxGuests) : undefined,
      });
      toast({ title: 'Event created!', description: `Code: ${event.eventCode}` });
      const id = event._id || event.id;
      navigate(`/dashboard/event/${id}`);
    } catch (err: any) {
      toast({ title: 'Failed', description: err.message || 'Could not create event', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <h1 className="text-3xl font-bold mb-2">Host an Event</h1>
      <p className="text-muted-foreground mb-8">Create a new event and invite guests</p>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Event Name *</Label>
              <Input id="title" placeholder="My Awesome Event" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Tell guests about your event..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input id="date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time *</Label>
                <Input id="time" type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} required />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Location Type</Label>
              <RadioGroup value={form.locationType} onValueChange={(v) => setForm({ ...form, locationType: v as 'physical' | 'online' })} className="flex gap-4">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="physical" id="physical" />
                  <Label htmlFor="physical" className="flex items-center gap-1 cursor-pointer"><MapPin className="w-4 h-4" /> Physical</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="online" id="online" />
                  <Label htmlFor="online" className="flex items-center gap-1 cursor-pointer"><Globe className="w-4 h-4" /> Online</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">{form.locationType === 'online' ? 'Meeting Link' : 'Address'} *</Label>
              <Input id="location" placeholder={form.locationType === 'online' ? 'https://meet.google.com/...' : '123 Main St, City'} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
            </div>

            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Public Event</p>
                <p className="text-sm text-muted-foreground">Anyone can discover and join</p>
              </div>
              <Switch checked={form.isPublic} onCheckedChange={(v) => setForm({ ...form, isPublic: v })} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxGuests">Max Guests (optional)</Label>
              <Input id="maxGuests" type="number" min="1" placeholder="Unlimited" value={form.maxGuests} onChange={(e) => setForm({ ...form, maxGuests: e.target.value })} />
            </div>

            <Button type="submit" className="w-full gradient-primary" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Event'} <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default HostEvent;
