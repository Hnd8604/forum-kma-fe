import React, { useState } from 'react';
import { Button } from '../../../shared/components/ui/button';
import { Input } from '../../../shared/components/ui/input';
import { Switch } from '../../../shared/components/ui/switch';
import { useAuthStore } from '../../../store/useStore';
import ChangePasswordDialog from './ChangePasswordDialog';

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const [username, setUsername] = useState(user?.username ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [saving, setSaving] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [toggling2FA, setToggling2FA] = useState(false);

  // TODO: Get accessToken from auth store
  const accessToken = localStorage.getItem('accessToken') || '';

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      if (user) {
        setUser({
          ...user,
          username: username || user.username,
          email: email || user.email,
        });
      }
      setSaving(false);
      alert('Lưu cài đặt thành công');
    }, 500);
  };

  const handleToggle2FA = async (checked: boolean) => {
    setToggling2FA(true);
    
    try {
      // TODO: Call API to enable/disable 2FA
      // const response = await authService.toggle2FA(accessToken, checked);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIs2FAEnabled(checked);
      alert(checked ? 'Đã bật xác thực 2 yếu tố' : 'Đã tắt xác thực 2 yếu tố');
    } catch (error) {
      console.error('Error toggling 2FA:', error);
      alert('Có lỗi xảy ra khi thay đổi cài đặt 2FA');
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
        
        <div>
          <label className="text-sm text-gray-600 block mb-1">Email</label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div>
          <label className="text-sm text-gray-600 block mb-1">Tên đăng nhập</label>
          <Input value={username} onChange={(e) => setUsername(e.target.value)} />
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
                Thay đổi mật khẩu của bạn với xác thực OTP qua email
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
              <h4 className="font-medium">Xác thực 2 yếu tố</h4>
              <p className="text-sm text-gray-500">
                Bảo vệ tài khoản với xác thực 2 bước
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                {is2FAEnabled ? 'Đã bật' : 'Đã tắt'}
              </span>
              <Switch 
                checked={is2FAEnabled}
                onCheckedChange={handleToggle2FA}
                disabled={toggling2FA}
              />
            </div>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <h4 className="font-medium">Phiên đăng nhập</h4>
              <p className="text-sm text-gray-500">
                Quản lý các thiết bị đã đăng nhập
              </p>
            </div>
            <Button variant="outline" disabled>Đang phát triển</Button>
          </div>
        </div>
      </div>

      <ChangePasswordDialog
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        accessToken={accessToken}
      />
    </div>
  );
}
