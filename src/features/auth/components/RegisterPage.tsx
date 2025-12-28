import { useState } from 'react';
import { Button } from '../../../shared/components/ui/button';
import { Input } from '../../../shared/components/ui/input';
import { Label } from '../../../shared/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../shared/components/ui/card';
import { GraduationCap, Mail, Lock, User, Sparkles } from 'lucide-react';
import { AuthService } from '../services/auth.service';
import { useAuthStore } from '../../../store/useStore';
import { ApiError } from '../types/auth.types';
import EmailVerificationDialog from './EmailVerificationDialog';

interface RegisterPageProps {
  onRegister: () => void;
  onSwitchToLogin?: () => void;
}

export default function RegisterPage({ onRegister, onSwitchToLogin }: RegisterPageProps) {
  const { login: setAuthLogin } = useAuthStore();
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEmailVerification, setShowEmailVerification] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp!');
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }

    setLoading(true);
    
    try {
      const response = await AuthService.register({
        username,
        email,
        firstName,
        lastName,
        password,
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
      
      // Show email verification dialog
      setShowEmailVerification(true);
    } catch (error: any) {
      const apiError = error as ApiError;
      setError(apiError.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
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

        {/* Register Card */}
        <Card className="border-0 shadow-2xl backdrop-blur-sm bg-white/95 rounded-2xl overflow-hidden animate-fade-in">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl">Tạo tài khoản mới 🎓</CardTitle>
            <CardDescription>Tham gia cộng đồng sinh viên ngay hôm nay</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-gray-700">Họ</Label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Nguyễn Văn"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="pl-11 h-12 rounded-xl border-gray-200 focus:border-red-300 focus:ring-red-200 transition-all"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-gray-700">Tên</Label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="An"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="pl-11 h-12 rounded-xl border-gray-200 focus:border-red-300 focus:ring-red-200 transition-all"
                      required
                    />
                  </div>
                </div>
              </div>
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
                <Label htmlFor="email" className="text-gray-700">Email</Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-700">Xác nhận mật khẩu</Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-11 h-12 rounded-xl border-gray-200 focus:border-red-300 focus:ring-red-200 transition-all"
                    required
                  />
                </div>
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
                {loading ? 'Đang đăng ký...' : 'Đăng ký ngay'}
              </Button>
              {onSwitchToLogin && (
                <div className="text-center text-sm text-gray-600">
                  Đã có tài khoản?{' '}
                  <button
                    type="button"
                    onClick={onSwitchToLogin}
                    className="text-red-600 hover:text-red-700 hover:underline transition-colors font-medium"
                  >
                    Đăng nhập ngay
                  </button>
                </div>
              )}
            </CardFooter>
          </form>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6 backdrop-blur-sm bg-white/50 rounded-xl p-3">
          Bằng việc đăng ký, bạn đồng ý với{' '}
          <a href="#" className="text-red-600 hover:text-red-700 hover:underline transition-colors">
            Điều khoản sử dụng
          </a>{' '}
          và{' '}
          <a href="#" className="text-red-600 hover:text-red-700 hover:underline transition-colors">
            Chính sách bảo mật
          </a>
        </p>
      </div>

      {/* Email Verification Dialog */}
      <EmailVerificationDialog
        isOpen={showEmailVerification}
        onClose={() => {
          setShowEmailVerification(false);
          // Call the onRegister callback when verification dialog closes
          onRegister();
        }}
        onVerificationComplete={() => {
          setShowEmailVerification(false);
          onRegister();
        }}
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
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
