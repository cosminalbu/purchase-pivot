import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const PendingApproval: React.FC = () => {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
            <Clock className="h-6 w-6 text-orange-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Account Pending Approval</CardTitle>
          <CardDescription>
            Your account has been created successfully but requires admin approval before you can access the system.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4">
            <div className="flex items-start space-x-3">
              <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">What's next?</p>
                <p className="text-sm text-muted-foreground">
                  A system administrator will review your account and assign appropriate permissions. 
                  You'll receive an email notification once your account is approved.
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              In the meantime, you can:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Check your email for the account verification link</li>
              <li>• Contact your system administrator if you have questions</li>
              <li>• Sign out and try again with a different account</li>
            </ul>
          </div>

          <Button 
            onClick={handleSignOut} 
            variant="outline" 
            className="w-full"
          >
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PendingApproval;