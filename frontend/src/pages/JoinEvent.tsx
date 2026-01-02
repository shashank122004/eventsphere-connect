import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QrCode, Keyboard, ArrowRight } from 'lucide-react';
import { getEventByCode, joinEvent } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

const JoinEvent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [code, setCode] = useState(searchParams.get('code') || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleJoin = () => {
    if (!user || !code.trim()) return;

    setIsLoading(true);
    const event = getEventByCode(code.toUpperCase());

    if (!event) {
      toast({ title: 'Event not found', description: 'Please check the code and try again', variant: 'destructive' });
      setIsLoading(false);
      return;
    }

    if (event.hostId === user.id) {
      toast({ title: 'This is your event', description: 'You cannot join your own event', variant: 'destructive' });
      setIsLoading(false);
      return;
    }

    const success = joinEvent(event.id, {
      userId: user.id,
      name: user.name,
      email: user.email,
      joinedAt: new Date().toISOString(),
    });

    setIsLoading(false);

    if (success) {
      toast({ title: 'Joined successfully!', description: `You're now attending ${event.title}` });
      navigate(`/dashboard/event/${event.id}`);
    } else {
      toast({ title: 'Could not join', description: 'You may have already joined or the event is full', variant: 'destructive' });
    }
  };

  return (
    <div className="max-w-md mx-auto animate-fade-in">
      <h1 className="text-3xl font-bold mb-2">Join an Event</h1>
      <p className="text-muted-foreground mb-8">Enter a code or scan a QR code</p>

      <Card>
        <Tabs defaultValue="code">
          <TabsList className="w-full">
            <TabsTrigger value="code" className="flex-1"><Keyboard className="w-4 h-4 mr-2" /> Enter Code</TabsTrigger>
            <TabsTrigger value="qr" className="flex-1"><QrCode className="w-4 h-4 mr-2" /> Scan QR</TabsTrigger>
          </TabsList>

          <TabsContent value="code">
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Input placeholder="Enter 6-digit code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} maxLength={6} className="text-center text-2xl tracking-widest font-mono" />
              </div>
              <Button onClick={handleJoin} className="w-full gradient-primary" disabled={isLoading || code.length < 6}>
                {isLoading ? 'Joining...' : 'Join Event'} <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </CardContent>
          </TabsContent>

          <TabsContent value="qr">
            <CardContent className="p-6 text-center">
              <div className="py-12 bg-muted rounded-lg">
                <QrCode className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">QR Scanner coming soon</p>
                <p className="text-sm text-muted-foreground mt-1">Use the code tab for now</p>
              </div>
            </CardContent>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default JoinEvent;
