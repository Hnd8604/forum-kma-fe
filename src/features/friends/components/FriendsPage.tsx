import React, { useState } from 'react';
import { Users, UserPlus, ShieldX, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../../shared/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/components/ui/card';
import FriendsList from './FriendsList';
import FriendRequests from './FriendRequests';
import BlockedUsers from './BlockedUsers';

interface FriendsPageProps {
  onStartChat?: (userId: string, username: string) => void;
}

export default function FriendsPage({ onStartChat }: FriendsPageProps) {
  const [activeTab, setActiveTab] = useState('friends');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRequestHandled = () => {
    // Refresh friends list when a request is accepted
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link to="/forum">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Bạn bè</h1>
        </div>
      </div>

      {/* Tabs */}
      <Card>
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="friends" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Bạn bè</span>
              </TabsTrigger>
              <TabsTrigger value="requests" className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                <span className="hidden sm:inline">Lời mời</span>
              </TabsTrigger>
              <TabsTrigger value="blocked" className="flex items-center gap-2">
                <ShieldX className="h-4 w-4" />
                <span className="hidden sm:inline">Đã chặn</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="friends">
              <FriendsList key={refreshKey} onStartChat={onStartChat} />
            </TabsContent>

            <TabsContent value="requests">
              <FriendRequests onRequestHandled={handleRequestHandled} />
            </TabsContent>

            <TabsContent value="blocked">
              <BlockedUsers />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
