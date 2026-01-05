import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, User } from 'lucide-react';
import { AuthService } from '../services/auth.service';
import { useAuthStore } from '@/store/useStore';
import { ApiError } from '@/interfaces/auth.types';
import ForgotPasswordDialog from './ForgotPasswordDialog';

interface LoginPageProps {
  onLogin: () => void;
  onSwitchToRegister?: () => void;
}

export default function LoginPage({ onLogin, onSwitchToRegister }: LoginPageProps) {
  const { login: setAuthLogin } = useAuthStore();

  const [step, setStep] = useState<'login' | 'otp'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [_tempSession, setTempSession] = useState<string>('');
  const [emailForOtp, setEmailForOtp] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  // Load remembered username on mount
  useEffect(() => {
    try {
      const rememberedUsername = localStorage.getItem('rememberedUsername');
      if (rememberedUsername) {
        setUsername(rememberedUsername);
        setRememberMe(true);
      }
    } catch (error) {
      console.error('Failed to load remembered username:', error);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await AuthService.login({
        username,
        password,
      });

      // Kiểm tra xem response có yêu cầu OTP không (code: AS_010)
      if ((response as any).code === 'AS_010' || !response.accessToken) {
        // Nếu cần 2FA, chuyển sang bước nhập OTP
        setStep('otp');
        setEmailForOtp(''); // Luôn để trống khi vào OTP
        setTempSession((response as any).sessionId || (response as any).tempToken || '');
        setLoading(false);
        return;
      }

      // Convert AuthData to User for the store
      const user = {
        userId: response.userId,
        username: response.username,
        email: response.email,
        firstName: response.firstName,
        lastName: response.lastName,
      };

      // Update auth store with user data
      setAuthLogin(user);

      // Save credentials if remember me is checked
      if (rememberMe) {
        try {
          localStorage.setItem('rememberedUsername', username);
        } catch (error) {
          console.error('Failed to save username:', error);
        }
      } else {
        // Clear remembered username if not checking remember me
        try {
          localStorage.removeItem('rememberedUsername');
        } catch (error) {
          console.error('Failed to clear username:', error);
        }
      }

      // Call the onLogin callback
      onLogin();
    } catch (error: any) {
      const apiError = error as ApiError;

      // Kiểm tra nếu lỗi là yêu cầu 2FA (code: AS_010)
      if (apiError.code === 'AS_010') {
        setStep('otp');
        setEmailForOtp(''); // Luôn để trống khi vào OTP
        setTempSession(apiError.sessionId || '');
        setLoading(false);
        return;
      }

      setError(apiError.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await AuthService.verifyLoginOtp({
        email: emailForOtp,
        otp,
      });

      // Convert AuthData to User for the store
      const user = {
        userId: response.userId,
        username: response.username,
        email: response.email,
        firstName: response.firstName,
        lastName: response.lastName,
      };

      // Update auth store with user data
      setAuthLogin(user);

      // Save credentials if remember me is checked
      if (rememberMe) {
        try {
          localStorage.setItem('rememberedUsername', username);
        } catch (error) {
          console.error('Failed to save username:', error);
        }
      }

      // Call the onLogin callback
      onLogin();
    } catch (error: any) {
      const apiError = error as ApiError;
      setError(apiError.message || 'Mã OTP không chính xác hoặc đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setStep('login');
    setOtp('');
    setError(null);
    setEmailForOtp('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/30 transform hover:scale-105 transition-transform">
              <svg viewBox="0 0 24 24" className="w-10 h-10 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Forum KMA</h1>
          <p className="text-sm text-slate-500 mt-2">Cộng đồng sinh viên Học viện Kỹ thuật Mật mã</p>
        </div>

        {/* Login Card */}
        <Card className="border-0 shadow-2xl backdrop-blur-sm bg-white/90 rounded-3xl overflow-hidden">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-bold text-slate-900">
              {step === 'login' ? 'Đăng nhập' : 'Xác thực 2 yếu tố'}
            </CardTitle>
            <CardDescription className="text-slate-500">
              {step === 'login'
                ? 'Chào mừng bạn quay trở lại!'
                : 'Nhập mã OTP đã được gửi đến email của bạn'
              }
            </CardDescription>
          </CardHeader>

          {/* Step 1: Login Form */}
          {step === 'login' && (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium text-slate-700">Tên đăng nhập</Label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <Input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-12 h-12 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm transition-all"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-slate-700">Mật khẩu</Label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-12 h-12 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm transition-all"
                      required
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-600">Ghi nhớ đăng nhập</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsForgotPasswordOpen(true)}
                    className="text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium"
                  >
                    Quên mật khẩu?
                  </button>
                </div>
                {error && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-center gap-2">
                    <span>⚠️</span>
                    {error}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-col gap-4 pt-2 pb-6 px-6">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30"
                >
                  {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </Button>
                {onSwitchToRegister && (
                  <div className="text-center text-sm text-slate-500">
                    Chưa có tài khoản?{' '}
                    <button
                      type="button"
                      onClick={onSwitchToRegister}
                      className="text-blue-600 hover:text-blue-700 hover:underline font-semibold"
                    >
                      Đăng ký ngay
                    </button>
                  </div>
                )}
              </CardFooter>
            </form>
          )}

          {/* Step 2: OTP Verification */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp}>
              <CardContent className="space-y-5">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="emailForOtp" className="text-sm font-medium text-slate-700">Email</Label>
                    <Input
                      id="emailForOtp"
                      type="email"
                      placeholder="your@email.com"
                      value={emailForOtp}
                      onChange={(e) => setEmailForOtp(e.target.value)}
                      className="h-12 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm transition-all"
                      disabled={loading}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="otp" className="text-sm font-medium text-slate-700">Mã OTP</Label>
                    <Input
                      id="otp"
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      disabled={loading}
                      autoFocus
                      className="text-center text-2xl tracking-[0.5em] font-bold h-16 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      onKeyDown={(e) => e.key === 'Enter' && handleVerifyOtp(e as any)}
                    />
                  </div>

                  <div className="text-sm text-slate-500 text-center space-y-1 mt-4 p-4 bg-slate-50 rounded-xl">
                    <p>📧 Kiểm tra email của bạn để lấy mã OTP</p>
                    <p className="text-xs">Mã OTP có hiệu lực trong 5 phút</p>
                  </div>
                </div>
                {error && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-center gap-2">
                    <span>⚠️</span>
                    {error}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-col gap-3 pt-2 pb-6 px-6">
                <Button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-blue-500/25"
                >
                  {loading ? 'Đang xác thực...' : 'Xác nhận'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBackToLogin}
                  disabled={loading}
                  className="w-full h-12 rounded-xl border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50"
                >
                  Quay lại
                </Button>
              </CardFooter>
            </form>
          )}
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-8">
          Bằng việc đăng nhập, bạn đồng ý với{' '}
          <a href="#" className="text-blue-600 hover:underline">
            Điều khoản sử dụng
          </a>{' '}
          và{' '}
          <a href="#" className="text-blue-600 hover:underline">
            Chính sách bảo mật
          </a>
        </p>
      </div>

      <ForgotPasswordDialog
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
      />

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}