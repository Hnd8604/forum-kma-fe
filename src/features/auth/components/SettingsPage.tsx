import React, { useState, useEffect } from 'react';
import { Button } from '../../../shared/components/ui/button';
import { Input } from '../../../shared/components/ui/input';
// switch replaced by single button UI
import { useAuthStore } from '../../../store/useStore';
import { AuthService } from '../services/auth.service';
import { TwoFAService } from '../services/twofa.service';
import { Alert, AlertDescription } from '../../../shared/components/ui/alert';
import EmailVerificationDialog from './EmailVerificationDialog';
import ChangePasswordDialog from './ChangePasswordDialog';
import DisableTwoFADialog from './DisableTwoFADialog';
import SessionManagement from './SessionManagement';

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const [username, setUsername] = useState(user?.username ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEmailVerificationOpen, setIsEmailVerificationOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isDisableTwoFAOpen, setIsDisableTwoFAOpen] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [toggling2FA, setToggling2FA] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  // Fetch user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const profile = await AuthService.fetchUserProfile();
        setUser(profile);
        
        // Update form fields
        setUsername(profile.username);
        setEmail(profile.email);
        setFirstName(profile.firstName || '');
        setLastName(profile.lastName || '');
        setIs2FAEnabled(profile.is2FAEnabled || false);
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [setUser]);

  // TODO: Get accessToken from auth store
  const accessToken = localStorage.getItem('accessToken') || '';

  const handleSave = async () => {
    setSaving(true);
    setSaveError('');
    setSaveSuccess('');

    if (!user?.userId) {
      setSaveError('Không tìm thấy thông tin user');
      setSaving(false);
      return;
    }

    try {
      const updatedUser = await AuthService.updateProfile(user.userId, {
        username,
        email,
        firstName,
        lastName,
        is2FAEnabled,
      });

      // Update local store
      setUser(updatedUser);
      setSaveSuccess('Cập nhật thông tin thành công!');
    } catch (error: any) {
      setSaveError(error.message || 'Có lỗi xảy ra khi cập nhật thông tin');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle2FA = async (checked: boolean) => {
    if (checked) {
      // Enable 2FA - gọi API trực tiếp
      setToggling2FA(true);
      setSaveError('');
      setSaveSuccess('');
      
      try {
        const response = await TwoFAService.enable();
        setIs2FAEnabled(true);
        setSaveSuccess(response.message || 'Đã bật xác thực 2 yếu tố');
        
        // Update user in store
        if (user) {
          setUser({ ...user, is2FAEnabled: true });
        }
      } catch (error: any) {
        console.error('Error enabling 2FA:', error);
        setSaveError(error.message || 'Có lỗi xảy ra khi bật xác thực 2 yếu tố');
        setIs2FAEnabled(false);
      } finally {
        setToggling2FA(false);
      }
    } else {
      // Disable 2FA - mở dialog để xác thực OTP
      setIsDisableTwoFAOpen(true);
      // Revert switch ngay lập tức, sẽ cập nhật sau khi xác thực thành công
      setIs2FAEnabled(true);
    }
  };

  const handleDisable2FASuccess = () => {
    setIs2FAEnabled(false);
    setSaveSuccess('Đã tắt xác thực 2 yếu tố thành công');
    
    // Update user in store
    if (user) {
      setUser({ ...user, is2FAEnabled: false });
    }
  };

  const handleEnable2FA = async () => {
    setToggling2FA(true);
    setSaveError('');
    setSaveSuccess('');

    try {
      const response = await TwoFAService.enable();
      setIs2FAEnabled(true);
      setSaveSuccess(response.message || 'Đã bật xác thực 2 yếu tố');
      if (user) setUser({ ...user, is2FAEnabled: true });
    } catch (error: any) {
      console.error('Error enabling 2FA:', error);
      setSaveError(error.message || 'Có lỗi xảy ra khi bật xác thực 2 yếu tố');
    } finally {
      setToggling2FA(false);
    }
  };

  return (
    <div className="p-8 w-full max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6">Cài đặt tài khoản</h2>

      {/* Thông tin cá nhân */}
      <div className="space-y-4 bg-white p-6 rounded-xl shadow-sm border mb-6">
        <h3 className="text-lg font-semibold mb-4">Thông tin cá nhân</h3>
        
        {saveError && (
          <Alert variant="destructive">
            <AlertDescription>{saveError}</AlertDescription>
          </Alert>
        )}

        {saveSuccess && (
          <Alert className="border-green-500 text-green-700 bg-green-50">
            <AlertDescription>{saveSuccess}</AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600 block mb-1">Họ</label>
            <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Nhập họ" />
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-1">Tên</label>
            <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Nhập tên" />
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-600 block mb-1">Email</label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@kma.vn" />
        </div>

        <div>
          <label className="text-sm text-gray-600 block mb-1">Tên đăng nhập</label>
          <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Nhập tên đăng nhập" />
        </div>

        <div className="flex items-center justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </div>
      </div>

      {/* Bảo mật */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Bảo mật</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <h4 className="font-medium">Đổi mật khẩu</h4>
              <p className="text-sm text-gray-500">
                Cập nhật mật khẩu của bạn để bảo vệ tài khoản
              </p>
            </div>
            <Button 
              onClick={() => setIsChangePasswordOpen(true)}
              variant="outline"
            >
              Đổi mật khẩu
            </Button>
          </div>

          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <h4 className="font-medium">Xác thực Email</h4>
              <p className="text-sm text-gray-500">
                {user?.userStatus === 'ACTIVE' 
                  ? 'Email của bạn đã được xác thực' 
                  : 'Xác thực email để bảo vệ tài khoản của bạn'
                }
              </p>
            </div>
            {user?.userStatus === 'ACTIVE' ? (
              <div className="flex items-center gap-2 text-green-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">Đã xác thực</span>
              </div>
            ) : (
              <Button 
                onClick={() => setIsEmailVerificationOpen(true)}
                variant="outline"
              >
                Xác thực Email
              </Button>
            )}
          </div>

          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <h4 className="font-medium">Xác thực 2 yếu tố</h4>
              <p className="text-sm text-gray-500">
                Bảo vệ tài khoản với xác thực 2 bước
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={is2FAEnabled ? () => setIsDisableTwoFAOpen(true) : handleEnable2FA}
                variant="outline"
                size="sm"
                disabled={toggling2FA || loading}
                className="ml-auto"
              >
                {toggling2FA ? 'Đang xử lý...' : (is2FAEnabled ? 'Tắt 2FA' : 'Bật 2FA')}
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <h4 className="font-medium">Phiên đăng nhập</h4>
              <p className="text-sm text-gray-500">
                Quản lý các thiết bị đã đăng nhập
              </p>
            </div>
          </div>

          {/* Session Management Component */}
          <div className="mt-4">
            <SessionManagement />
          </div>
        </div>
      </div>

      <EmailVerificationDialog
        isOpen={isEmailVerificationOpen}
        onClose={() => setIsEmailVerificationOpen(false)}
        onVerificationComplete={() => {
          setSaveSuccess('Email đã được xác thực thành công!');
        }}
      />
      
      <ChangePasswordDialog
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        is2FAEnabled={is2FAEnabled}
      />

      <DisableTwoFADialog
        isOpen={isDisableTwoFAOpen}
        onClose={() => setIsDisableTwoFAOpen(false)}
        onSuccess={handleDisable2FASuccess}
      />
    </div>
  );
}
