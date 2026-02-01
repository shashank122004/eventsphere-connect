import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QrCode, Keyboard, ArrowRight } from "lucide-react";
import { joinEventByCode } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const JoinEvent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  const [code, setCode] = useState<string>(searchParams.get("code") || "");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleJoin = async () => {
    if (!user) {
      toast({ title: 'Not signed in', description: 'Please login to join events', variant: 'destructive' });
      return;
    }

    if (code.trim().length < 6) {
      toast({ title: 'Invalid code', description: 'Enter a 6-digit event code', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const res = await joinEventByCode(code.toUpperCase().trim());

      toast({
        title: 'Joined successfully 🎉',
        description: `You're now attending ${res.title || 'the event'}`,
      });

      const eventId = res._id || res.id;
      navigate(`/dashboard/event/attending/${eventId}`);
    } catch (err: any) {
      // fetch-based errors throw an Error with message, while other libs may use response.data
      const serverMessage = err?.message || (err?.response && err.response.data && (err.response.data.message || JSON.stringify(err.response.data)));
      toast({
        title: 'Could not join',
        description: serverMessage || 'You may have already joined or the event is full',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto animate-fade-in">
      <h1 className="text-3xl font-bold mb-2">Join an Event</h1>
      <p className="text-muted-foreground mb-8">
        Enter a code or scan a QR code
      </p>

      <Card>
        <Tabs defaultValue="code">
          <TabsList className="w-full">
            <TabsTrigger value="code" className="flex-1">
              <Keyboard className="w-4 h-4 mr-2" />
              Enter Code
            </TabsTrigger>
            <TabsTrigger value="qr" className="flex-1">
              <QrCode className="w-4 h-4 mr-2" />
              Scan QR
            </TabsTrigger>
          </TabsList>

          <TabsContent value="code">
            <CardContent className="p-6 space-y-4">
              <Input
                placeholder="Enter 6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="text-center text-2xl tracking-widest font-mono"
              />

              <Button
                onClick={handleJoin}
                className="w-full gradient-primary"
                disabled={isLoading || code.length < 6}
              >
                {isLoading ? "Joining..." : "Join Event"}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </CardContent>
          </TabsContent>

          <TabsContent value="qr">
            <CardContent className="p-6 text-center">
              <div className="py-12 bg-muted rounded-lg">
                <QrCode className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  QR Scanner coming soon
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Use the code tab for now
                </p>
              </div>
            </CardContent>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default JoinEvent;
