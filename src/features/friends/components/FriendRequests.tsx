import React, { useEffect, useState } from 'react';
import { Check, X, Clock, Send } from 'lucide-react';
import { Button } from '../../../shared/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../../shared/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/components/ui/tabs';
import { Badge } from '../../../shared/components/ui/badge';
import { FriendshipResponse } from '../types/friendship.types';
import { FriendshipService } from '../services/friendship.service';
import { toast } from 'sonner';

interface FriendRequestsProps {
  onRequestHandled?: () => void;
}

export default function FriendRequests({ onRequestHandled }: FriendRequestsProps) {
  const [receivedRequests, setReceivedRequests] = useState<FriendshipResponse[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendshipResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const [received, sent] = await Promise.all([
        FriendshipService.getReceivedRequests(),
        FriendshipService.getSentRequests(),
      ]);
      setReceivedRequests(received || []);
      setSentRequests(sent || []);
    } catch (error: any) {
      toast.error(error.message || 'Không thể tải lời mời kết bạn');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (request: FriendshipResponse) => {
    try {
      setProcessingIds((prev) => new Set(prev).add(request.id));
      await FriendshipService.acceptFriendRequest(request.id);
      toast.success(`Đã chấp nhận lời mời kết bạn từ ${request.username}`);
      setReceivedRequests((prev) => prev.filter((r) => r.id !== request.id));
      onRequestHandled?.();
    } catch (error: any) {
      toast.error(error.message || 'Không thể chấp nhận lời mời');
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(request.id);
        return next;
      });
    }
  };

  const handleReject = async (request: FriendshipResponse) => {
    try {
      setProcessingIds((prev) => new Set(prev).add(request.id));
      await FriendshipService.rejectFriendRequest(request.id);
      toast.success('Đã từ chối lời mời kết bạn');
      setReceivedRequests((prev) => prev.filter((r) => r.id !== request.id));
      onRequestHandled?.();
    } catch (error: any) {
      toast.error(error.message || 'Không thể từ chối lời mời');
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(request.id);
        return next;
      });
    }
  };

  const handleCancelRequest = async (request: FriendshipResponse) => {
    try {
      setProcessingIds((prev) => new Set(prev).add(request.id));
      await FriendshipService.rejectFriendRequest(request.id);
      toast.success('Đã hủy lời mời kết bạn');
      setSentRequests((prev) => prev.filter((r) => r.id !== request.id));
    } catch (error: any) {
      toast.error(error.message || 'Không thể hủy lời mời');
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(request.id);
        return next;
      });
    }
  };

  const getInitials = (request: FriendshipResponse) => {
    if (request.firstName && request.lastName) {
      return `${request.firstName[0]}${request.lastName[0]}`.toUpperCase();
    }
    return request.username.substring(0, 2).toUpperCase();
  };

  const getDisplayName = (request: FriendshipResponse) => {
    if (request.firstName && request.lastName) {
      return `${request.firstName} ${request.lastName}`;
    }
    return request.username;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const RequestCard = ({
    request,
    type,
  }: {
    request: FriendshipResponse;
    type: 'received' | 'sent';
  }) => {
    const isProcessing = processingIds.has(request.id);

    return (
      <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={request.avatarUrl} alt={request.username} />
            <AvatarFallback className="bg-gradient-to-br from-red-400 to-yellow-400 text-white">
              {getInitials(request)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{getDisplayName(request)}</p>
            <p className="text-sm text-muted-foreground">@{request.username}</p>
            <p className="text-xs text-muted-foreground mt-1">
              <Clock className="h-3 w-3 inline mr-1" />
              {formatDate(request.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {type === 'received' ? (
            <>
              <Button
                size="sm"
                onClick={() => handleAccept(request)}
                disabled={isProcessing}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="h-4 w-4 mr-1" />
                Chấp nhận
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleReject(request)}
                disabled={isProcessing}
              >
                <X className="h-4 w-4 mr-1" />
                Từ chối
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleCancelRequest(request)}
              disabled={isProcessing}
            >
              <X className="h-4 w-4 mr-1" />
              Hủy lời mời
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <Tabs defaultValue="received" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="received" className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Đã nhận
          {receivedRequests.length > 0 && (
            <Badge variant="destructive" className="ml-1">
              {receivedRequests.length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="sent" className="flex items-center gap-2">
          <Send className="h-4 w-4" />
          Đã gửi
          {sentRequests.length > 0 && (
            <Badge variant="secondary" className="ml-1">
              {sentRequests.length}
            </Badge>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="received" className="mt-4 space-y-3">
        {receivedRequests.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Không có lời mời kết bạn nào
          </div>
        ) : (
          receivedRequests.map((request) => (
            <RequestCard key={request.id} request={request} type="received" />
          ))
        )}
      </TabsContent>

      <TabsContent value="sent" className="mt-4 space-y-3">
        {sentRequests.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Bạn chưa gửi lời mời kết bạn nào
          </div>
        ) : (
          sentRequests.map((request) => (
            <RequestCard key={request.id} request={request} type="sent" />
          ))
        )}
      </TabsContent>
    </Tabs>
  );
}
