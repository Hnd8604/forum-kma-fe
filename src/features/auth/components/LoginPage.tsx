import { useState, useEffect } from 'react';
import { Button } from '../../../shared/components/ui/button';
import { Input } from '../../../shared/components/ui/input';
import { Label } from '../../../shared/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../shared/components/ui/card';
import { GraduationCap, Mail, Lock, User, Sparkles } from 'lucide-react';
import { AuthService } from '../services/auth.service';
import { useAuthStore } from '../../../store/useStore';
import { ApiError } from '../types/auth.types';
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
  const [tempSession, setTempSession] = useState<string>(''); // Lưu session tạm thời nếu cần
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

      console.log('📱 Login response:', response);

      // Kiểm tra xem response có yêu cầu OTP không (code: AS_010)
      if ((response as any).code === 'AS_010' || !response.accessToken) {
        console.log('🔐 2FA required, switching to OTP step');
        // Nếu cần 2FA, chuyển sang bước nhập OTP; lấy giá trị email mặc định từ username
        setStep('otp');
        setEmailForOtp(username);
        setTempSession((response as any).sessionId || (response as any).tempToken || '');
        setLoading(false);
        return;
      }

      console.log('✅ Login successful without 2FA');

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
        console.log('🔐 2FA required (from error), switching to OTP step');
        setStep('otp');
        setEmailForOtp(username);
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 p-4 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo and Title */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-600 to-red-500 rounded-2xl mb-4 shadow-lg transform hover:scale-105 transition-transform">
            <GraduationCap className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 via-red-500 to-yellow-600 bg-clip-text text-transparent mb-2">
            Forum Sinh Viên
          </h1>
          <div className="flex items-center justify-center space-x-2 text-gray-600">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            <p>Nơi chia sẻ và kết nối</p>
            <Sparkles className="w-4 h-4 text-yellow-500" />
          </div>
        </div>

        {/* Login Card */}
        <Card className="border-0 shadow-2xl backdrop-blur-sm bg-white/95 rounded-2xl overflow-hidden animate-fade-in">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl">
              {step === 'login' ? 'Chào mừng trở lại! 👋' : 'Xác thực 2 yếu tố 🔐'}
            </CardTitle>
            <CardDescription>
              {step === 'login' 
                ? 'Đăng nhập để tiếp tục hành trình học tập'
                : 'Nhập mã OTP đã được gửi đến email của bạn'
              }
            </CardDescription>
          </CardHeader>

          {/* Step 1: Login Form */}
          {step === 'login' && (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-gray-700">Tên đăng nhập</Label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-11 h-12 rounded-xl border-gray-200 focus:border-red-300 focus:ring-red-200 transition-all"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700">Mật khẩu</Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11 h-12 rounded-xl border-gray-200 focus:border-red-300 focus:ring-red-200 transition-all"
                    required
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500" 
                  />
                  <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">Ghi nhớ đăng nhập</span>
                </label>
                <button 
                  type="button"
                  onClick={() => setIsForgotPasswordOpen(true)}
                  className="text-sm text-red-600 hover:text-red-700 hover:underline transition-colors"
                >
                  Quên mật khẩu?
                </button>
              </div>
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-3 pt-2">
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập ngay'}
              </Button>
              {onSwitchToRegister && (
                <div className="text-center text-sm text-gray-600">
                  Chưa có tài khoản?{' '}
                  <button
                    type="button"
                    onClick={onSwitchToRegister}
                    className="text-red-600 hover:text-red-700 hover:underline transition-colors font-medium"
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
              <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="emailForOtp" className="text-gray-700">Email</Label>
                      <Input
                        id="emailForOtp"
                        type="email"
                        placeholder="your@email.com"
                        value={emailForOtp}
                        onChange={(e) => setEmailForOtp(e.target.value)}
                        className="h-12 rounded-xl border-gray-200 focus:border-red-300 focus:ring-red-200"
                        disabled={loading}
                        required
                      />

                      <Label htmlFor="otp" className="text-gray-700">Mã OTP</Label>
                      <Input
                        id="otp"
                        type="text"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        placeholder="000000"
                        disabled={loading}
                        autoFocus
                        className="text-center text-3xl tracking-[0.5em] font-semibold h-14 rounded-xl border-gray-200 focus:border-red-300 focus:ring-red-200"
                        onKeyDown={(e) => e.key === 'Enter' && handleVerifyOtp(e as any)}
                      />

                      <div className="text-sm text-gray-600 text-center space-y-1 mt-2">
                        <p>Kiểm tra email của bạn để lấy mã OTP</p>
                        <p className="text-xs">Mã OTP có hiệu lực trong 5 phút</p>
                      </div>
                    </div>
                {error && (
                  <p className="text-sm text-red-600 text-center">{error}</p>
                )}
              </CardContent>
              <CardFooter className="flex flex-col gap-3 pt-2">
                <Button 
                  type="submit" 
                  disabled={loading || otp.length !== 6}
                  className="w-full h-12 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Đang xác thực...' : 'Xác nhận'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBackToLogin}
                  disabled={loading}
                  className="w-full h-12 rounded-xl"
                >
                  Quay lại
                </Button>
              </CardFooter>
            </form>
          )}
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6 backdrop-blur-sm bg-white/50 rounded-xl p-3">
          Bằng việc đăng nhập, bạn đồng ý với{' '}
          <a href="#" className="text-red-600 hover:text-red-700 hover:underline transition-colors">
            Điều khoản sử dụng
          </a>{' '}
          và{' '}
          <a href="#" className="text-red-600 hover:text-red-700 hover:underline transition-colors">
            Chính sách bảo mật
          </a>
        </p>
      </div>

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
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>

      <ForgotPasswordDialog
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
      />
    </div>
  );
}