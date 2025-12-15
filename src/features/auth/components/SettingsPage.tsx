import React, { useState } from 'react';
import { Button } from '../../../shared/components/ui/button';
import { Input } from '../../../shared/components/ui/input';
import { useAuthStore } from '../../../store/useStore';

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const [name, setName] = useState(user?.name ?? '');
  const [email] = useState('student@university.edu');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    if (password && password !== confirmPassword) {
      alert('Mật khẩu xác nhận không khớp');
      return;
    }

    setSaving(true);
    setTimeout(() => {
      setUser({
        name: name || 'Bạn',
        avatar: user?.avatar ?? (name ? name.charAt(0).toUpperCase() : 'B'),
        group: user?.group ?? '',
      });
      setSaving(false);
      alert('Lưu cài đặt thành công');
    }, 500);
  };

  return (
    <div className="p-8 w-full max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Cài đặt tài khoản</h2>

      <div className="space-y-4 bg-white p-6 rounded-xl shadow-sm border">
        <div>
          <label className="text-sm text-gray-600 block mb-1">Email</label>
          <Input value={email} disabled />
        </div>

        <div>
          <label className="text-sm text-gray-600 block mb-1">Tên hiển thị</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div>
          <label className="text-sm text-gray-600 block mb-1">Mật khẩu mới</label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        <div>
          <label className="text-sm text-gray-600 block mb-1">Xác nhận mật khẩu</label>
          <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        </div>

        <div className="flex items-center justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </div>
      </div>
    </div>
  );
}
