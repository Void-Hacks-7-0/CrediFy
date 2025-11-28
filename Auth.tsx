import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { ShieldCheck, Phone, User, KeyRound, ArrowRight, Sparkles } from 'lucide-react';

const Auth: React.FC = () => {
  const { login, register, sendOtp, verifyOtp } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  
  // Form States
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  
  // UI States
  const [step, setStep] = useState<'MOBILE' | 'OTP'>('MOBILE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mobile.length !== 10) {
        setError('Please enter a valid 10-digit mobile number');
        return;
    }
    if (!isLogin && name.length < 3) {
        setError('Please enter your full name');
        return;
    }

    setLoading(true);
    try {
        const code = await sendOtp(mobile);
        setGeneratedOtp(code);
        setStep('OTP');
        // Simulating SMS arrival
        setTimeout(() => alert(`Your SecureFin OTP is: ${code}`), 100);
    } catch (err) {
        setError('Failed to send OTP. Try again.');
    } finally {
        setLoading(false);
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!generatedOtp) return;

    if (verifyOtp(otp, generatedOtp)) {
        setLoading(true);
        // Simulate processing
        setTimeout(() => {
            if (isLogin) {
                login(mobile);
            } else {
                register(name, mobile);
            }
            setLoading(false);
        }, 800);
    } else {
        setError('Invalid OTP. Please try again.');
    }
  };

  const switchMode = () => {
      setIsLogin(!isLogin);
      setStep('MOBILE');
      setOtp('');
      setError('');
      setGeneratedOtp(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 w-full max-w-md p-6">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-brand-600 p-8 text-white text-center">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                            <ShieldCheck size={32} className="text-white" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold">Welcome to SecureFin</h1>
                    <p className="text-brand-100 text-sm mt-2">Blockchain-Powered Finance for Everyone</p>
                </div>

                {/* Body */}
                <div className="p-8">
                    <div className="flex gap-4 mb-8 bg-slate-100 p-1 rounded-xl">
                        <button 
                            onClick={() => !loading && switchMode()}
                            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${isLogin ? 'bg-white shadow text-brand-600' : 'text-slate-500'}`}
                        >
                            Login
                        </button>
                        <button 
                            onClick={() => !loading && switchMode()}
                            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${!isLogin ? 'bg-white shadow text-brand-600' : 'text-slate-500'}`}
                        >
                            Register
                        </button>
                    </div>

                    {step === 'MOBILE' ? (
                        <form onSubmit={handleSendOtp} className="space-y-4">
                            {!isLogin && (
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 text-slate-400" size={18} />
                                        <input 
                                            type="text" 
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Rahul Kumar"
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">Mobile Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3 text-slate-400" size={18} />
                                    <input 
                                        type="tel" 
                                        value={mobile}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                            setMobile(val);
                                        }}
                                        placeholder="98765 43210"
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full bg-brand-900 hover:bg-brand-800 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? 'Sending OTP...' : 'Get OTP'}
                                {!loading && <ArrowRight size={18} />}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerify} className="space-y-4 animate-in fade-in slide-in-from-right-8">
                            <div className="text-center mb-4">
                                <p className="text-slate-600">Enter OTP sent to <span className="font-bold">+91 {mobile}</span></p>
                                <button type="button" onClick={() => setStep('MOBILE')} className="text-xs text-brand-600 hover:underline mt-1">Change Number</button>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">One Time Password</label>
                                <div className="relative">
                                    <KeyRound className="absolute left-3 top-3 text-slate-400" size={18} />
                                    <input 
                                        type="text" 
                                        value={otp}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                                            setOtp(val);
                                        }}
                                        placeholder="0000"
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all text-center tracking-widest font-bold text-lg"
                                        maxLength={4}
                                    />
                                </div>
                            </div>

                            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? 'Verifying...' : (isLogin ? 'Login' : 'Complete Registration')}
                                {!loading && <Sparkles size={18} />}
                            </button>
                        </form>
                    )}
                </div>
            </div>
            
            <p className="text-center text-slate-500 text-xs mt-6">
                &copy; 2024 SecureFin Hackathon Project. <br/>
                Mock OTP simulates secure authentication.
            </p>
        </div>
    </div>
  );
};

export default Auth;