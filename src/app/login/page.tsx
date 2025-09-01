'use client';

import { useState, useEffect, useRef } from 'react';
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
  const [isRecaptchaVerified, setIsRecaptchaVerified] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);

  const setupRecaptcha = () => {
    if (!recaptchaContainerRef.current) return;

    // Use a flag to ensure this only runs once per render
    if (window.recaptchaVerifier) {
      return;
    }

    const verifier = new RecaptchaVerifier(auth, recaptchaContainerRef.current, {
        'size': 'normal',
        'callback': () => {
            setIsRecaptchaVerified(true);
        },
        'expired-callback': () => {
            setIsRecaptchaVerified(false);
            toast({
                variant: "destructive",
                title: "reCAPTCHA Expired",
                description: "Please solve the reCAPTCHA again.",
            });
        }
    });

    window.recaptchaVerifier = verifier;
    
    verifier.render().catch(error => {
        console.error("reCAPTCHA render error:", error);
        setLoading(false);
        toast({
            variant: "destructive",
            title: "reCAPTCHA Error",
            description: "Could not render reCAPTCHA. Please refresh and try again.",
        });
    });
  }

  // Effect to set up and tear down reCAPTCHA
  useEffect(() => {
    if (step === 'mobile') {
      setupRecaptcha();
    }
    
    // Cleanup function to run when component unmounts or step changes
    return () => {
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (error) {
          console.error("Failed to clear reCAPTCHA on cleanup:", error)
        }
        window.recaptchaVerifier = undefined;
      }
      if (recaptchaContainerRef.current) {
        recaptchaContainerRef.current.innerHTML = "";
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
    if (!isRecaptchaVerified) {
        toast({ variant: "destructive", title: "reCAPTCHA Required", description: "Please complete the reCAPTCHA verification." });
        return;
    }

    setLoading(true);
    try {
      const appVerifier = window.recaptchaVerifier;
      if (!appVerifier) {
          throw new Error("reCAPTCHA not initialized");
      }
      const fullMobileNumber = `+91${mobileNumber}`;
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
      } else if (error.code === 'auth/internal-error') {
        description = "An internal error occurred. This might be a configuration issue. Please try again later."
      }
      toast({
        variant: "destructive",
        title: "Failed to send OTP",
        description: description,
      });
      // Reset reCAPTCHA for the user to try again
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.render();
      }
      setIsRecaptchaVerified(false);
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
    setIsRecaptchaVerified(false);
  }

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
                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    required
                    pattern="\d{10}"
                    className="rounded-l-none text-base md:text-sm"
                    disabled={loading}
                    />
                </div>
              </div>
              <div ref={recaptchaContainerRef} className="flex justify-center [&>div]:mx-auto"></div>
              <Button type="submit" className="w-full font-bold" disabled={loading || !isRecaptchaVerified}>
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
