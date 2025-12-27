import { useState } from 'react';
import { Button } from '../../../shared/components/ui/button';
import { Input } from '../../../shared/components/ui/input';
import { Label } from '../../../shared/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../shared/components/ui/dialog';
import { passwordService } from '../services/password.service';
import { Alert, AlertDescription } from '../../../shared/components/ui/alert';

interface ChangePasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  accessToken: string;
}

export default function ChangePasswordDialog({
  isOpen,
  onClose,
  accessToken,
}: ChangePasswordDialogProps) {
  const [step, setStep] = useState<'password' | 'otp'>('password');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRequestChange = async () => {
    setError('');
    setSuccess('');

    // Validate
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu mới không khớp');
      return;
    }

    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    setLoading(true);

    try {
      const response = await passwordService.requestChangePassword(
        { oldPassword, newPassword },
        accessToken
      );

      if (response.code === 200) {
        setSuccess('OTP đã được gửi đến email của bạn');
        setStep('otp');
      } else {
        setError(response.message || 'Có lỗi xảy ra');
      }
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi đổi mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError('');
    setSuccess('');

    if (!otp || otp.length !== 6) {
      setError('Vui lòng nhập mã OTP 6 số');
      return;
    }

    setLoading(true);

    try {
      const response = await passwordService.verifyChangePassword(
        { otp },
        accessToken
      );

      if (response.code === 200) {
        setSuccess('Đổi mật khẩu thành công!');
        setTimeout(() => {
          handleClose();
        }, 1500);
      } else {
        setError(response.message || 'Mã OTP không chính xác');
      }
    } catch (err: any) {
      setError(err.message || 'Mã OTP không chính xác');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('password');
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setOtp('');
    setError('');
    setSuccess('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Đổi mật khẩu</DialogTitle>
          <DialogDescription>
            {step === 'password'
              ? 'Nhập mật khẩu cũ và mật khẩu mới của bạn'
              : 'Nhập mã OTP đã được gửi đến email của bạn'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-500 text-green-700">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {step === 'password' ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="oldPassword">Mật khẩu cũ</Label>
                <Input
                  id="oldPassword"
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Nhập mật khẩu cũ"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Mật khẩu mới</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nhập mật khẩu mới"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới"
                />
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="otp">Mã OTP</Label>
              <Input
                id="otp"
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="Nhập mã OTP 6 số"
                className="text-center text-2xl tracking-widest"
              />
              <p className="text-xs text-gray-500 text-center">
                Kiểm tra email để lấy mã OTP
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Hủy
          </Button>
          {step === 'password' ? (
            <Button onClick={handleRequestChange} disabled={loading}>
              {loading ? 'Đang xử lý...' : 'Tiếp tục'}
            </Button>
          ) : (
            <Button onClick={handleVerifyOtp} disabled={loading}>
              {loading ? 'Đang xác thực...' : 'Xác nhận'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
