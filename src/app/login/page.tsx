'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Coins, Loader2 } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { signInWithPhoneNumber, ConfirmationResult, RecaptchaVerifier } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

// Extend window interface to include auth helpers
declare global {
  interface Window {
    confirmationResult?: ConfirmationResult;
    recaptchaVerifier?: RecaptchaVerifier;
  }
}

export default function LoginPage() {
  const [step, setStep] = useState<'mobile' | 'otp'>('mobile');
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // This effect handles setting up the reCAPTCHA verifier
    // It's designed to run only once when the 'mobile' step is active
    if (step === 'mobile' && recaptchaContainerRef.current) {
        if (window.recaptchaVerifier && document.getElementById('recaptcha-container')?.hasChildNodes()) {
            // If it's already rendered, don't create a new one
            return;
        }

        // Create the invisible reCAPTCHA verifier
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            'size': 'invisible',
            'callback': () => {
              // reCAPTCHA solved, allow sign-in
            }
        });
        window.recaptchaVerifier.render(); // Explicitly render the verifier
    }

    // Cleanup function to clear the verifier when the component unmounts
    return () => {
        if (window.recaptchaVerifier) {
            try {
                window.recaptchaVerifier.clear();
            } catch (error) {
                console.error("Failed to clear reCAPTCHA verifier on unmount:", error);
            }
        }
    };
  }, [step]);


  const handleMobileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!/^\d{10}$/.test(mobileNumber)) {
        toast({ variant: "destructive", title: "Invalid Mobile Number", description: "Please enter a valid 10-digit number." });
        return;
    }

    setLoading(true);
    try {
      const appVerifier = window.recaptchaVerifier;
      if (!appVerifier) {
          throw new Error("reCAPTCHA verifier not initialized");
      }
      const fullMobileNumber = `+91${mobileNumber}`;
      // The invisible reCAPTCHA will be triggered by this call
      const confirmationResult = await signInWithPhoneNumber(auth, fullMobileNumber, appVerifier);
      window.confirmationResult = confirmationResult;
      setStep('otp');
      toast({
        title: "OTP Sent",
        description: `An OTP has been sent to ${fullMobileNumber}`,
      });
    } catch (error: any) {
      console.error("Error sending OTP:", error);
      let description = "Please check your number and try again.";
      if (error.code === 'auth/too-many-requests') {
        description = "You've made too many requests. Please wait a while before trying again.";
      } else if (error.code === 'auth/invalid-phone-number') {
        description = "The phone number is not valid. Please check it.";
      } else if (error.code === 'auth/billing-not-enabled'){
        description = "Firebase billing is not enabled for this project. Use a test number."
      } else if (error.code === 'auth/network-request-failed') {
        description = "Network error. Please check your internet connection and try again.";
      } else if (error.code === 'auth/internal-error' || error.message.includes('reCAPTCHA has already been rendered')) {
        description = "An internal error occurred. This might be a configuration issue. Please refresh the page and try again."
      }
      toast({
        variant: "destructive",
        title: "Failed to send OTP",
        description: description,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) {
        toast({ variant: "destructive", title: "Invalid OTP", description: "Please enter the full 6-digit OTP." });
        return;
    }
    if (window.confirmationResult) {
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
  
  const handleBack = () => {
    setLoading(false);
    setStep('mobile');
    setOtp('');
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div id="recaptcha-container" ref={recaptchaContainerRef}></div>
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
                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    required
                    pattern="\d{10}"
                    className="rounded-l-none text-base md:text-sm"
                    disabled={loading}
                    />
                </div>
              </div>
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
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  required
                  maxLength={6}
                  className="text-center text-lg tracking-[0.5em] md:text-sm"
                  disabled={loading}
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
                 <Button variant="link" size="sm" onClick={handleBack} disabled={loading}>
                    Back to mobile number
                </Button>
            )}
        </CardFooter>
      </Card>
    </div>
  );
}
