import { useState, useEffect } from 'react';
import { AdminService, Role } from '../services/admin.service';
import { useToast } from '@/components/ui/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Trash2,
  Loader2,
  RefreshCw,
  Edit,
  Plus,
  Shield,
} from 'lucide-react';

// Available permissions
const AVAILABLE_PERMISSIONS = [
  { id: 'role:manage', label: 'Quản lý vai trò', description: 'Tạo, sửa, xóa vai trò' },
  { id: 'user:ban', label: 'Cấm người dùng', description: 'Cấm người dùng khỏi hệ thống' },
  { id: 'user:unban', label: 'Bỏ cấm người dùng', description: 'Bỏ cấm người dùng' },
  { id: 'post:delete', label: 'Xóa bài viết', description: 'Xóa bất kỳ bài viết nào' },
  { id: 'comment:delete', label: 'Xóa bình luận', description: 'Xóa bất kỳ bình luận nào' },
  { id: 'group:delete', label: 'Xóa nhóm', description: 'Xóa bất kỳ nhóm nào' },
  { id: 'report:view', label: 'Xem báo cáo', description: 'Xem các báo cáo vi phạm' },
  { id: 'report:handle', label: 'Xử lý báo cáo', description: 'Xử lý các báo cáo vi phạm' },
];

export default function AdminRoleManagement() {
  const { toast } = useToast();
  
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({ name: '', permissions: [] as string[] });
  const [saving, setSaving] = useState(false);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await AdminService.getAllRoles();
      setRoles(response || []);
    } catch (error) {
      console.error('Failed to fetch roles:', error);
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Không thể tải danh sách vai trò',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Vui lòng nhập tên vai trò',
      });
      return;
    }

    setSaving(true);
    try {
      await AdminService.createRole({
        name: formData.name.toUpperCase(),
        permissions: formData.permissions,
      });
      toast({
        title: 'Thành công',
        description: 'Đã tạo vai trò mới',
      });
      setShowCreateDialog(false);
      setFormData({ name: '', permissions: [] });
      fetchRoles();
    } catch (error) {
      console.error('Create failed:', error);
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Tạo vai trò thất bại',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedRole || !formData.name.trim()) return;

    setSaving(true);
    try {
      await AdminService.updateRole(selectedRole.id, {
        name: formData.name.toUpperCase(),
        permissions: formData.permissions,
      });
      toast({
        title: 'Thành công',
        description: 'Đã cập nhật vai trò',
      });
      setShowEditDialog(false);
      setSelectedRole(null);
      setFormData({ name: '', permissions: [] });
      fetchRoles();
    } catch (error) {
      console.error('Update failed:', error);
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Cập nhật vai trò thất bại',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedRole) return;

    setSaving(true);
    try {
      await AdminService.deleteRole(selectedRole.id);
      toast({
        title: 'Thành công',
        description: `Đã xóa vai trò ${selectedRole.name}`,
      });
      setShowDeleteDialog(false);
      setSelectedRole(null);
      fetchRoles();
    } catch (error) {
      console.error('Delete failed:', error);
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Xóa vai trò thất bại',
      });
    } finally {
      setSaving(false);
    }
  };

  const openEditDialog = (role: Role) => {
    setSelectedRole(role);
    setFormData({
      name: role.name,
      permissions: role.permissions || [],
    });
    setShowEditDialog(true);
  };

  const togglePermission = (permissionId: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter((p) => p !== permissionId)
        : [...prev.permissions, permissionId],
    }));
  };

  const getRoleBadgeColor = (roleName: string) => {
    switch (roleName.toUpperCase()) {
      case 'ADMIN':
        return 'bg-red-500';
      case 'MODERATOR':
        return 'bg-blue-500';
      case 'USER':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản Lý Vai Trò</h1>
          <p className="text-muted-foreground">
            Quản lý vai trò và quyền hạn trong hệ thống
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchRoles} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
          <Button onClick={() => {
            setFormData({ name: '', permissions: [] });
            setShowCreateDialog(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Tạo vai trò
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên vai trò</TableHead>
              <TableHead>Quyền hạn</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : roles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-10 text-muted-foreground">
                  Chưa có vai trò nào
                </TableCell>
              </TableRow>
            ) : (
              roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <Badge className={getRoleBadgeColor(role.name)}>
                        {role.name}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions?.length > 0 ? (
                        role.permissions.map((perm) => (
                          <Badge key={perm} variant="outline" className="text-xs">
                            {perm}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">Không có quyền đặc biệt</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(role)}
                        title="Chỉnh sửa"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedRole(role);
                          setShowDeleteDialog(true);
                        }}
                        title="Xóa vai trò"
                        disabled={role.name.toUpperCase() === 'ADMIN' || role.name.toUpperCase() === 'USER'}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={showCreateDialog || showEditDialog} onOpenChange={(open) => {
        if (!open) {
          setShowCreateDialog(false);
          setShowEditDialog(false);
          setSelectedRole(null);
          setFormData({ name: '', permissions: [] });
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {showCreateDialog ? 'Tạo vai trò mới' : 'Chỉnh sửa vai trò'}
            </DialogTitle>
            <DialogDescription>
              {showCreateDialog
                ? 'Tạo một vai trò mới với các quyền hạn tùy chỉnh'
                : `Chỉnh sửa vai trò ${selectedRole?.name}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="roleName">Tên vai trò</Label>
              <Input
                id="roleName"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="VD: MODERATOR"
                disabled={showEditDialog && (selectedRole?.name === 'ADMIN' || selectedRole?.name === 'USER')}
              />
            </div>

            <div className="space-y-2">
              <Label>Quyền hạn</Label>
              <div className="border rounded-lg p-3 space-y-3 max-h-[300px] overflow-y-auto">
                {AVAILABLE_PERMISSIONS.map((perm) => (
                  <div key={perm.id} className="flex items-start space-x-3">
                    <Checkbox
                      id={perm.id}
                      checked={formData.permissions.includes(perm.id)}
                      onCheckedChange={() => togglePermission(perm.id)}
                    />
                    <div className="grid gap-1">
                      <Label htmlFor={perm.id} className="font-medium cursor-pointer">
                        {perm.label}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {perm.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                setShowEditDialog(false);
              }}
              disabled={saving}
            >
              Hủy
            </Button>
            <Button
              onClick={showCreateDialog ? handleCreate : handleEdit}
              disabled={saving}
            >
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {showCreateDialog ? 'Tạo' : 'Lưu'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa vai trò</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa vai trò <strong>{selectedRole?.name}</strong>?
              Người dùng có vai trò này sẽ được chuyển về vai trò mặc định.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={saving}
              className="bg-red-500 hover:bg-red-600"
            >
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
