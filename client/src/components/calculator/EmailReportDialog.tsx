import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Mail, Loader2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { preparePdfData } from '@/utils/pdfDataTransformer';

interface EmailReportDialogProps {
  calculatorData: any;
  inputs: any;
  results: any;
  customerInfo: any;
  children: React.ReactNode;
}

interface EmailRecipient {
  email: string;
  name: string;
  checked: boolean;
  removable: boolean;
  label?: string;
}

export default function EmailReportDialog({ calculatorData, inputs, results, customerInfo, children }: EmailReportDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [recipients, setRecipients] = useState<EmailRecipient[]>([]);
  const [additionalEmails, setAdditionalEmails] = useState('');
  const { toast } = useToast();

  // Initialize recipients when dialog opens
  useEffect(() => {
    if (isOpen) {
      const initialRecipients: EmailRecipient[] = [];
      
      // Add Sales Rep email if exists
      if (calculatorData?.salesRepEmail) {
        initialRecipients.push({
          email: calculatorData.salesRepEmail,
          name: calculatorData.salesRepName || '',
          checked: true,
          removable: false,
          label: `Sales Rep: ${calculatorData.salesRepName || 'Sales Representative'}`
        });
      }
      
      // Add Merchant email if exists
      if (calculatorData?.contactEmail) {
        initialRecipients.push({
          email: calculatorData.contactEmail,
          name: calculatorData.contactName || calculatorData.businessName || '',
          checked: true,
          removable: false,
          label: `Merchant: ${calculatorData.businessName || 'Merchant'}`
        });
      }
      
      // Always add quotes@dmprocessing.com
      initialRecipients.push({
        email: 'quotes@dmprocessing.com',
        name: 'DMP Quotes Team',
        checked: true,
        removable: false,
        label: 'DMP Quotes Team (CC)'
      });
      
      setRecipients(initialRecipients);
    }
  }, [isOpen, calculatorData]);

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get all checked recipients
    const selectedRecipients = recipients.filter(r => r.checked);
    
    if (selectedRecipients.length === 0) {
      toast({
        title: "Recipients Required",
        description: "Please select at least one recipient.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSending(true);
      
      // Transform the data using the same function as PDF download
      const transformedData = preparePdfData(
        calculatorData,
        inputs,
        results,
        customerInfo
      );
      
      // Prepare recipient lists
      const toEmails = selectedRecipients
        .filter(r => r.email !== 'quotes@dmprocessing.com')
        .map(r => r.email);
      const ccEmails = selectedRecipients
        .filter(r => r.email === 'quotes@dmprocessing.com')
        .map(r => r.email);
      
      const response = await fetch('/api/email-savings-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toEmails,
          ccEmails,
          calculatorData: transformedData
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send email');
      }

      const recipientCount = toEmails.length;
      const recipientText = recipientCount === 1 ? 
        `${toEmails[0]}` : 
        `${recipientCount} recipients`;

      toast({
        title: "Email Sent Successfully!",
        description: `Your savings report has been sent to ${recipientText}`,
        variant: "default",
      });
      
      setIsOpen(false);
      setRecipients([]);
      setAdditionalEmails('');
      
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

  const toggleRecipient = (index: number) => {
    const recipient = recipients[index];
    // Don't allow unchecking quotes@dmprocessing.com
    if (recipient.email === 'quotes@dmprocessing.com') {
      return;
    }
    
    setRecipients(prev => prev.map((r, i) => 
      i === index ? { ...r, checked: !r.checked } : r
    ));
  };

  const processAdditionalEmails = (emailString: string) => {
    if (!emailString || emailString.trim() === '') return;
    
    // Split by comma and trim each email
    const emails = emailString.split(',').map(e => e.trim()).filter(e => e);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validEmails: string[] = [];
    const invalidEmails: string[] = [];
    
    emails.forEach(email => {
      if (emailRegex.test(email)) {
        // Check for duplicates
        if (!recipients.some(r => r.email === email)) {
          validEmails.push(email);
        }
      } else if (email) {
        invalidEmails.push(email);
      }
    });
    
    if (invalidEmails.length > 0) {
      toast({
        title: "Invalid Email(s)",
        description: `Invalid format: ${invalidEmails.join(', ')}`,
        variant: "destructive",
      });
      return;
    }
    
    if (validEmails.length > 0) {
      // Add all valid emails to recipients
      const newRecipients = validEmails.map(email => ({
        email,
        name: '',
        checked: true,
        removable: true,
        label: email
      }));
      
      // Insert new recipients before the last item (quotes@dmprocessing.com)
      setRecipients(prev => [...prev.slice(0, -1), ...newRecipients, prev[prev.length - 1]]);
      setAdditionalEmails('');
    }
  };
  
  // Process emails when input loses focus or Enter is pressed
  const handleEmailInputBlur = () => {
    processAdditionalEmails(additionalEmails);
  };
  
  const handleEmailInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      processAdditionalEmails(additionalEmails);
    }
  };

  const removeRecipient = (index: number) => {
    setRecipients(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg" aria-describedby="email-dialog-description">
        <DialogHeader>
          <DialogTitle>Email Your Savings Report</DialogTitle>
          <p id="email-dialog-description" className="text-sm text-muted-foreground">
            Select recipients for your professional PDF savings report.
          </p>
        </DialogHeader>
        <form onSubmit={handleSendEmail} className="space-y-4">
          <div className="space-y-2">
            <Label>Recipients</Label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {recipients.map((recipient, index) => (
                <div key={`${recipient.email}-${index}`} className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50">
                  <Checkbox
                    id={`recipient-${index}`}
                    checked={recipient.checked}
                    onCheckedChange={() => toggleRecipient(index)}
                    disabled={recipient.email === 'quotes@dmprocessing.com'}
                    className="data-[disabled=true]:cursor-not-allowed"
                  />
                  <Label 
                    htmlFor={`recipient-${index}`} 
                    className="flex-1 cursor-pointer text-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{recipient.label}</span>
                        <div className="text-xs text-gray-500">{recipient.email}</div>
                      </div>
                      {recipient.removable && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            removeRecipient(index);
                          }}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </Label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="additional-email">Add Additional Recipients</Label>
            <Input
              id="additional-email"
              type="text"
              value={additionalEmails}
              onChange={(e) => setAdditionalEmails(e.target.value)}
              onBlur={handleEmailInputBlur}
              onKeyPress={handleEmailInputKeyPress}
              placeholder="Enter email(s) - separate multiple with commas"
              data-testid="input-additional-email"
            />
            <p className="text-xs text-muted-foreground">
              Press Enter or click elsewhere to add. Separate multiple emails with commas.
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              type="submit" 
              disabled={isSending || recipients.filter(r => r.checked).length === 0}
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