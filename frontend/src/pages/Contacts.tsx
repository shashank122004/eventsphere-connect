import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Mail, Phone } from 'lucide-react';
import { getContacts as apiGetContacts, addContact as apiAddContact, deleteContact as apiDeleteContact } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const Contacts = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [contacts, setContacts] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });

  const handleAdd = async () => {
    if (!user || !form.name || !form.email) return;
    try {
      const newContact = await apiAddContact(form);
      setContacts(prev => [...prev, newContact]);
      setForm({ name: '', email: '', phone: '' });
      setOpen(false);
      toast({ title: 'Contact added' });
    } catch (err: any) {
      toast({ title: 'Failed', description: err.message || 'Could not add contact', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiDeleteContact(id);
      setContacts(prev => prev.filter(c => (c._id || c.id) !== id));
      toast({ title: 'Contact deleted' });
    } catch (err: any) {
      toast({ title: 'Failed', description: err.message || 'Could not delete contact', variant: 'destructive' });
    }
  };

  // load contacts
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!user) return;
      try {
        const data = await apiGetContacts();
        if (mounted) setContacts(data);
      } catch (err) {
        // ignore for now
      }
    };
    load();
    return () => { mounted = false; };
  }, [user]);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Contacts</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="gradient-primary"><Plus className="w-4 h-4 mr-2" />Add Contact</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Contact</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
              <div><Label>Email *</Label><Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
              <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
              <Button onClick={handleAdd} className="w-full">Add Contact</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {contacts.length === 0 ? (
        <Card><CardContent className="py-20 text-center text-muted-foreground">No contacts yet</CardContent></Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contacts.map(contact => (
            <Card key={contact._id || contact.id} className="hover-lift">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">{contact.name.charAt(0)}</div>
                    <div>
                      <p className="font-medium">{contact.name}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1"><Mail className="w-3 h-3" />{contact.email}</p>
                      {contact.phone && <p className="text-sm text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" />{contact.phone}</p>}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(contact._id || contact.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Contacts;
