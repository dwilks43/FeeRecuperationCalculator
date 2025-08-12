import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Mail, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EmailReportDialogProps {
  calculatorData: any;
  children: React.ReactNode;
}

export default function EmailReportDialog({ calculatorData, children }: EmailReportDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const { toast } = useToast();

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSending(true);
      
      const response = await fetch('/api/email-savings-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim(),
          calculatorData
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send email');
      }

      toast({
        title: "Email Sent Successfully!",
        description: `Your savings report has been sent to ${email}`,
        variant: "default",
      });
      
      setIsOpen(false);
      setEmail('');
      setName('');
      
    } catch (error: any) {
      console.error('Email error:', error);
      toast({
        title: "Email Failed",
        description: error.message || "Failed to send email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" aria-describedby="email-dialog-description">
        <DialogHeader>
          <DialogTitle>Email Your Savings Report</DialogTitle>
          <p id="email-dialog-description" className="text-sm text-muted-foreground">
            Enter your email to receive a professional PDF report with your savings analysis.
          </p>
        </DialogHeader>
        <form onSubmit={handleSendEmail} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@company.com"
              required
              data-testid="input-email-address"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Your Name (Optional)</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Smith"
              data-testid="input-recipient-name"
            />
          </div>
          <div className="flex gap-2">
            <Button 
              type="submit" 
              disabled={isSending}
              className="flex-1 bg-dmp-blue-600 hover:bg-dmp-blue-700"
              data-testid="button-send-email"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Report
                </>
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={isSending}
              data-testid="button-cancel-email"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}