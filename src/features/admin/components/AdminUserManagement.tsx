import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminService, PaginatedResponse } from '../services/admin.service';
import { User } from '@/interfaces/auth.types';
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
import { Badge } from '@/components/ui/badge';
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
  Search,
  Ban,
  UserCheck,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  Eye,
} from 'lucide-react';

export default function AdminUserManagement() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionType, setActionType] = useState<'ban' | 'unban' | 'delete' | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const pageSize = 10;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      let response: PaginatedResponse<User>;
      if (searchQuery.trim()) {
        response = await AdminService.searchUsers(searchQuery, page, pageSize);
      } else {
        response = await AdminService.getAllUsers(page, pageSize);
      }
      setUsers(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Không thể tải danh sách người dùng',
      });
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchUsers();
  };

  const handleAction = async () => {
    if (!selectedUser || !actionType) return;
    
    setActionLoading(true);
    try {
      switch (actionType) {
        case 'ban':
          await AdminService.banUser(selectedUser.userId);
          toast({
            title: 'Thành công',
            description: `Đã cấm người dùng ${selectedUser.username}`,
          });
          break;
        case 'unban':
          await AdminService.unbanUser(selectedUser.userId);
          toast({
            title: 'Thành công',
            description: `Đã bỏ cấm người dùng ${selectedUser.username}`,
          });
          break;
        case 'delete':
          await AdminService.deleteUser(selectedUser.userId);
          toast({
            title: 'Thành công',
            description: `Đã xóa người dùng ${selectedUser.username}`,
          });
          break;
      }
      fetchUsers();
    } catch (error) {
      console.error('Action failed:', error);
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Thao tác thất bại',
      });
    } finally {
      setActionLoading(false);
      setSelectedUser(null);
      setActionType(null);
    }
  };

  const getStatusBadge = (user: User) => {
    if (user.banned || user.userStatus === 'INACTIVE') {
      return (
        <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 shadow-md">
          Bị cấm
        </Badge>
      );
    }
    if (user.userStatus === 'PENDING') {
      return (
        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 shadow-md">
          Chờ xác thực
        </Badge>
      );
    }
    return (
      <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-md">
        Hoạt động
      </Badge>
    );
  };

  const getRoleBadge = (user: User) => {
    const roleName = user.roleName || user.roles?.[0] || 'USER';
    switch (roleName.toUpperCase()) {
      case 'ADMIN':
        return (
          <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-0 shadow-md font-semibold">
            {roleName}
          </Badge>
        );
      case 'MODERATOR':
        return (
          <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 shadow-md font-semibold">
            {roleName}
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gradient-to-r from-gray-400 to-gray-500 text-white border-0 shadow-md">
            {roleName}
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 shadow-xl text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Quản Lý Người Dùng</h1>
            <p className="text-blue-100 text-lg">
              Tổng cộng <span className="font-semibold">{totalElements}</span> người dùng
            </p>
          </div>
          <Button 
            variant="secondary" 
            onClick={fetchUsers} 
            disabled={loading}
            className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Tìm kiếm theo tên, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 text-base border-2 focus:border-blue-500 rounded-xl shadow-sm"
          />
        </div>
        <Button type="submit" className="h-12 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-lg">
          Tìm kiếm
        </Button>
      </form>

      {/* Table */}
      <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-lg bg-white dark:bg-gray-900">
        <Table>
          <TableHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-bold text-gray-700 dark:text-gray-200">Người dùng</TableHead>
              <TableHead className="font-bold text-gray-700 dark:text-gray-200">Email</TableHead>
              <TableHead className="font-bold text-gray-700 dark:text-gray-200">Vai trò</TableHead>
              <TableHead className="font-bold text-gray-700 dark:text-gray-200">Trạng thái</TableHead>
              <TableHead className="font-bold text-gray-700 dark:text-gray-200">Ngày tạo</TableHead>
              <TableHead className="text-right font-bold text-gray-700 dark:text-gray-200">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  Không tìm thấy người dùng nào
                </TableCell>
              </TableRow>
            ) : (
              users.map((user, index) => (
                <TableRow 
                  key={user.userId} 
                  className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-800 dark:hover:to-gray-700 transition-all animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-md">
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-white" />
                        ) : (
                          <span className="text-base font-bold text-white">
                            {user.firstName?.[0]}{user.lastName?.[0]}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{user.firstName} {user.lastName}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-300">{user.email}</TableCell>
                  <TableCell>{getRoleBadge(user)}</TableCell>
                  <TableCell>{getStatusBadge(user)}</TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-400">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/profile/${user.userId}`)}
                        title="Xem hồ sơ"
                        className="hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900 rounded-lg transition-all"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {user.banned || user.userStatus === 'INACTIVE' ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedUser(user);
                            setActionType('unban');
                          }}
                          title="Bỏ cấm"
                          className="hover:bg-green-100 hover:text-green-600 dark:hover:bg-green-900 rounded-lg transition-all"
                        >
                          <UserCheck className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedUser(user);
                            setActionType('ban');
                          }}
                          title="Cấm người dùng"
                          className="hover:bg-orange-100 hover:text-orange-600 dark:hover:bg-orange-900 rounded-lg transition-all"
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedUser(user);
                          setActionType('delete');
                        }}
                        title="Xóa người dùng"
                        className="hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900 rounded-lg transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white dark:bg-gray-900 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-sm">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Trang <span className="font-bold text-blue-600">{page + 1}</span> / <span className="font-bold">{totalPages}</span>
            <span className="ml-3 text-gray-500">({totalElements} kết quả)</span>
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="hover:bg-blue-50 hover:border-blue-500 hover:text-blue-600 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="hover:bg-blue-50 hover:border-blue-500 hover:text-blue-600 disabled:opacity-50"
            >
              Sau
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={!!selectedUser && !!actionType} onOpenChange={() => {
        setSelectedUser(null);
        setActionType(null);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === 'ban' && 'Cấm người dùng'}
              {actionType === 'unban' && 'Bỏ cấm người dùng'}
              {actionType === 'delete' && 'Xóa người dùng'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === 'ban' && (
                <>Bạn có chắc chắn muốn cấm người dùng <strong>{selectedUser?.username}</strong>? Người dùng sẽ không thể đăng nhập.</>
              )}
              {actionType === 'unban' && (
                <>Bạn có chắc chắn muốn bỏ cấm người dùng <strong>{selectedUser?.username}</strong>? Người dùng sẽ có thể đăng nhập lại.</>
              )}
              {actionType === 'delete' && (
                <>Bạn có chắc chắn muốn xóa người dùng <strong>{selectedUser?.username}</strong>? Hành động này không thể hoàn tác.</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAction}
              disabled={actionLoading}
              className={actionType === 'delete' ? 'bg-red-500 hover:bg-red-600' : ''}
            >
              {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Xác nhận
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
