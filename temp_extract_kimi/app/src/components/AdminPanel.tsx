import { useState } from 'react';
import { Shield, Lock, Unlock, Crown, Image, UserPlus, LogOut, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { usePremiumStore } from '@/store/premiumStore';
import { useChatStore } from '@/store/chatStore';
import { cn } from '@/lib/utils';

export function AdminPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'login' | 'dashboard'>('login');
  
  const { 
    isAdminMode, 
    activateAdminMode, 
    deactivateAdminMode,
    addCustomCharacterSlots,
    addNsfwImageCredits,
    upgradeToPremium,
    downgradeToFree,
    user,
  } = usePremiumStore();
  
  const { characters } = useChatStore();

  const handleLogin = () => {
    const success = activateAdminMode(password);
    if (success) {
      setError('');
      setActiveTab('dashboard');
      setPassword('');
    } else {
      setError('Invalid admin password');
    }
  };

  const handleLogout = () => {
    deactivateAdminMode();
    setActiveTab('login');
    setIsOpen(false);
  };

  const handleUpgradePremium = () => {
    upgradeToPremium(30);
  };

  const handleDowngrade = () => {
    downgradeToFree();
  };

  const handleAddCharSlots = () => {
    addCustomCharacterSlots(10);
  };

  const handleAddNsfwCredits = () => {
    addNsfwImageCredits(50);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="relative"
      >
        <Shield className={cn(
          "w-5 h-5",
          isAdminMode ? "text-yellow-400" : "text-gray-400"
        )} />
        {isAdminMode && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
        )}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-yellow-400" />
              Admin Panel
            </DialogTitle>
          </DialogHeader>

          {activeTab === 'login' && !isAdminMode ? (
            <div className="space-y-4">
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-yellow-400" />
                </div>
                <p className="text-gray-400 text-sm">
                  Enter admin password to access premium controls
                </p>
              </div>

              <div className="space-y-2">
                <Label>Admin Password</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  placeholder="Enter password..."
                />
                {error && (
                  <p className="text-red-400 text-sm">{error}</p>
                )}
              </div>

              <Button 
                onClick={handleLogin}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500"
              >
                <Unlock className="w-4 h-4 mr-2" />
                Access Admin
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Status Badge */}
              <div className="flex items-center justify-center">
                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50 px-4 py-1">
                  <Crown className="w-3 h-3 mr-1" />
                  ADMIN MODE ACTIVE
                </Badge>
              </div>

              {/* Current Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-800/50 p-3 rounded-lg text-center">
                  <p className="text-xs text-gray-400">User Tier</p>
                  <p className="text-lg font-semibold text-white capitalize">{user.tier}</p>
                </div>
                <div className="bg-gray-800/50 p-3 rounded-lg text-center">
                  <p className="text-xs text-gray-400">Custom Characters</p>
                  <p className="text-lg font-semibold text-white">{user.customCharactersRemaining}</p>
                </div>
                <div className="bg-gray-800/50 p-3 rounded-lg text-center">
                  <p className="text-xs text-gray-400">NSFW Credits</p>
                  <p className="text-lg font-semibold text-white">{user.nsfwImagesRemaining}</p>
                </div>
                <div className="bg-gray-800/50 p-3 rounded-lg text-center">
                  <p className="text-xs text-gray-400">Total Characters</p>
                  <p className="text-lg font-semibold text-white">{characters.length}</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-2">
                <Label className="text-xs text-gray-400 uppercase">Quick Actions</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    onClick={handleUpgradePremium}
                    className="text-sm"
                  >
                    <Crown className="w-4 h-4 mr-1 text-yellow-400" />
                    +Premium
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleDowngrade}
                    className="text-sm"
                  >
                    <Zap className="w-4 h-4 mr-1" />
                    Free Mode
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleAddCharSlots}
                    className="text-sm"
                  >
                    <UserPlus className="w-4 h-4 mr-1" />
                    +10 Chars
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleAddNsfwCredits}
                    className="text-sm"
                  >
                    <Image className="w-4 h-4 mr-1" />
                    +50 NSFW
                  </Button>
                </div>
              </div>

              {/* Logout */}
              <Button 
                onClick={handleLogout}
                variant="destructive"
                className="w-full"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Exit Admin Mode
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
