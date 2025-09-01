'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Coins, Loader2 } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

// Extend window interface to include recaptchaVerifier
declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

export default function LoginPage() {
  const [step, setStep] = useState<'mobile' | 'otp'>('mobile');
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'normal',
        'callback': () => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        }
      });
      window.recaptchaVerifier.render();
    }
  }

  const handleMobileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mobileNumber.length >= 10) {
      setLoading(true);
      setupRecaptcha();
      try {
        const fullMobileNumber = `+91${mobileNumber}`;
        const appVerifier = window.recaptchaVerifier;
        if (!appVerifier) {
            throw new Error("reCAPTCHA not initialized");
        }
        const confirmationResult = await signInWithPhoneNumber(auth, fullMobileNumber, appVerifier);
        window.confirmationResult = confirmationResult;
        setStep('otp');
        toast({
          title: "OTP Sent",
          description: `An OTP has been sent to ${fullMobileNumber}`,
        });
      } catch (error) {
        console.error("Error sending OTP:", error);
        toast({
          variant: "destructive",
          title: "Failed to send OTP",
          description: "Please solve the reCAPTCHA and try again.",
        });
        // Reset reCAPTCHA
        if (window.recaptchaVerifier) {
            window.recaptchaVerifier.render();
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length >= 6 && window.confirmationResult) {
      setLoading(true);
      try {
        await window.confirmationResult.confirm(otp);
        toast({
            title: "Login Successful!",
        });
        router.push('/dashboard');
      } catch (error) {
        console.error("Error verifying OTP:", error);
        toast({
          variant: "destructive",
          title: "Invalid OTP",
          description: "The OTP you entered is incorrect. Please try again.",
        });
      } finally {
        setLoading(false);
      }
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
              : `We've sent a code to +91${mobileNumber}.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'mobile' ? (
            <form onSubmit={handleMobileSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number</Label>
                <div className="flex items-center">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-sm">+91</span>
                    <Input
                    id="mobile"
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    required
                    pattern="\d{10}"
                    className="rounded-l-none text-base"
                    />
                </div>
              </div>
              <div id="recaptcha-container" className="flex justify-center"></div>
              <Button type="submit" className="w-full font-bold" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : 'Send OTP'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">One-Time Password</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  maxLength={6}
                  className="text-center text-lg tracking-[0.5em]"
                />
              </div>
              <Button type="submit" className="w-full font-bold" disabled={loading}>
                 {loading ? <Loader2 className="animate-spin" /> : 'Verify & Login'}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
            {step === 'otp' && (
                 <Button variant="link" size="sm" onClick={() => setStep('mobile')} disabled={loading}>
                    Back to mobile number
                </Button>
            )}
        </CardFooter>
      </Card>
    </div>
  );
}
