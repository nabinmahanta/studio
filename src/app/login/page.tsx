'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Coins } from 'lucide-react';

export default function LoginPage() {
  const [step, setStep] = useState<'mobile' | 'otp'>('mobile');
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const router = useRouter();

  const handleMobileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would send an OTP here
    if (mobileNumber.length >= 10) {
      setStep('otp');
    }
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would verify the OTP here
    if (otp.length >= 4) {
      router.push('/dashboard');
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-8 flex items-center gap-3 text-foreground">
        <Coins className="h-10 w-10 text-primary" />
        <h1 className="font-headline text-4xl font-bold">Lekha Sahayak</h1>
      </div>
      <Card className="w-full max-w-sm border-2 border-primary/20 shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">
            {step === 'mobile' ? 'Welcome!' : 'Enter OTP'}
          </CardTitle>
          <CardDescription>
            {step === 'mobile'
              ? 'Enter your mobile number to sign in.'
              : `We've sent a code to ${mobileNumber}.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'mobile' ? (
            <form onSubmit={handleMobileSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number</Label>
                <Input
                  id="mobile"
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  required
                  pattern="\d{10}"
                  className="text-base"
                />
              </div>
              <Button type="submit" className="w-full font-bold">
                Send OTP
              </Button>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">One-Time Password</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="4-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  maxLength={4}
                  className="text-center text-lg tracking-[1em]"
                />
              </div>
              <Button type="submit" className="w-full font-bold">
                Verify & Login
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
            {step === 'otp' && (
                 <Button variant="link" size="sm" onClick={() => setStep('mobile')}>
                    Back to mobile number
                </Button>
            )}
        </CardFooter>
      </Card>
    </div>
  );
}
