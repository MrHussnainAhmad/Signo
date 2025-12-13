'use client';

import React, { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/AppLayout';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { RoleBadge, PlanBadge } from '@/components/ui/Badge';
import { FileUpload } from '@/components/ui/FileUpload';
import { ConfirmModal, Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { Skeleton } from '@/components/ui/Spinner';

interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}

interface Member {
  id: string;
  role: 'OWNER' | 'MEMBER';
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  };
  isCurrentUser: boolean;
  canRemove: boolean;
}

interface Workspace {
  id: string;
  name: string;
  plan: 'UNPAID' | 'SOLO' | 'STUDIO';
  logoUrl: string | null;
  isOwner: boolean;
}

export default function SettingsPage() {
  const { success, error: showError } = useToast();

  const [user, setUser] = useState<User | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [profileName, setProfileName] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Loading states
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingWorkspace, setIsSavingWorkspace] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isInviting, setIsInviting] = useState(false);

  // Modal states
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [profileRes, workspaceRes, membersRes] = await Promise.all([
        fetch('/api/settings/profile'),
        fetch('/api/settings/workspace'),
        fetch('/api/settings/members'),
      ]);

      const profileData = await profileRes.json();
      const workspaceData = await workspaceRes.json();
      const membersData = await membersRes.json();

      if (profileData.success) {
        setUser(profileData.data.user);
        setProfileName(profileData.data.user.name);
      }

      if (workspaceData.success) {
        setWorkspace(workspaceData.data.workspace);
        setWorkspaceName(workspaceData.data.workspace.name);
      }

      if (membersData.success) {
        setMembers(membersData.data.members);
      }
    } catch (error) {
      showError('Error', 'Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setIsSavingProfile(true);

    try {
      const response = await fetch('/api/settings/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: profileName }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.data.user);
        success('Profile Updated', 'Your profile has been saved');
      } else {
        showError('Error', data.error || 'Failed to update profile');
      }
    } catch (error) {
      showError('Error', 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handleSaveWorkspace(e: React.FormEvent) {
    e.preventDefault();
    setIsSavingWorkspace(true);

    try {
      const response = await fetch('/api/settings/workspace', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: workspaceName }),
      });

      const data = await response.json();

      if (response.ok) {
        setWorkspace((prev) => prev ? { ...prev, name: workspaceName } : null);
        success('Workspace Updated', 'Workspace settings have been saved');
      } else {
        showError('Error', data.error || 'Failed to update workspace');
      }
    } catch (error) {
      showError('Error', 'Failed to update workspace');
    } finally {
      setIsSavingWorkspace(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setIsSavingPassword(true);

    try {
      const response = await fetch('/api/settings/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setCurrentPassword('');
        setNewPassword('');
        success('Password Changed', 'Your password has been updated');
      } else {
        showError('Error', data.error || 'Failed to change password');
      }
    } catch (error) {
      showError('Error', 'Failed to change password');
    } finally {
      setIsSavingPassword(false);
    }
  }

  async function handleInviteMember(e: React.FormEvent) {
    e.preventDefault();
    setIsInviting(true);

    try {
      const response = await fetch('/api/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        setInviteEmail('');
        setShowInviteModal(false);
        success('Invite Sent', `Invitation sent to ${inviteEmail}`);
      } else {
        showError('Error', data.error || 'Failed to send invite');
      }
    } catch (error) {
      showError('Error', 'Failed to send invite');
    } finally {
      setIsInviting(false);
    }
  }

  async function handleRemoveMember() {
    if (!memberToRemove) return;

    try {
      const response = await fetch(`/api/settings/members?memberId=${memberToRemove.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMembers((prev) => prev.filter((m) => m.id !== memberToRemove.id));
        success('Member Removed', `${memberToRemove.user.name} has been removed`);
      }
    } catch (error) {
      showError('Error', 'Failed to remove member');
    } finally {
      setMemberToRemove(null);
    }
  }

  async function handleAvatarUpload(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload/avatar', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (response.ok) {
      setUser(data.data.user);
      success('Avatar Updated', 'Your avatar has been updated');
    } else {
      throw new Error(data.error || 'Upload failed');
    }
  }

  if (isLoading) {
    return (
      <div>
        <div className="mb-8">
          <Skeleton width={200} height={32} className="mb-2" />
          <Skeleton width={300} height={20} />
        </div>
        <div className="space-y-6">
          <Skeleton height={200} className="rounded-xl" />
          <Skeleton height={200} className="rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Settings"
        description="Manage your account and workspace settings"
      />

      {/* Profile Settings */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your personal account settings</CardDescription>
        </CardHeader>

        <div className="flex items-start gap-6 mb-6">
          <Avatar src={user?.avatarUrl} name={user?.name || ''} size="xl" />
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Profile Picture</h4>
            <FileUpload
              onUpload={handleAvatarUpload}
              accept="image/*"
              maxSize={5 * 1024 * 1024}
              label="Upload new image"
              hint="JPG, PNG or GIF. Max 5MB."
            />
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <Input
            label="Name"
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
            required
          />
          <Input
            label="Email"
            value={user?.email || ''}
            disabled
            hint="Contact support to change your email"
          />
          <Button type="submit" isLoading={isSavingProfile}>
            Save Changes
          </Button>
        </form>
      </Card>

      {/* Password */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>Change your account password</CardDescription>
        </CardHeader>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
          <Input
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            hint="At least 8 characters with uppercase, lowercase, and number"
            required
          />
          <Button type="submit" isLoading={isSavingPassword}>
            Change Password
          </Button>
        </form>
      </Card>

      {/* Workspace Settings */}
      {workspace?.isOwner && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Workspace</CardTitle>
            <CardDescription>Manage your workspace settings</CardDescription>
          </CardHeader>

          <form onSubmit={handleSaveWorkspace} className="space-y-4">
            <Input
              label="Workspace Name"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              required
            />
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Plan:</span>
              <PlanBadge plan={workspace.plan} />
            </div>
            <Button type="submit" isLoading={isSavingWorkspace}>
              Save Changes
            </Button>
          </form>
        </Card>
      )}

      {/* Team Members */}
      {workspace?.plan === 'STUDIO' && (
        <Card>
          <CardHeader
            action={
              workspace.isOwner && (
                <Button onClick={() => setShowInviteModal(true)} size="sm">
                  Invite Member
                </Button>
              )
            }
          >
            <CardTitle>Team Members</CardTitle>
            <CardDescription>Manage your team</CardDescription>
          </CardHeader>

          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Avatar src={member.user.avatarUrl} name={member.user.name} size="md" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{member.user.name}</span>
                      {member.isCurrentUser && (
                        <span className="text-xs text-gray-500">(you)</span>
                      )}
                      <RoleBadge role={member.role} />
                    </div>
                    <p className="text-sm text-gray-500">{member.user.email}</p>
                  </div>
                </div>
                {member.canRemove && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setMemberToRemove(member)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Invite Modal */}
      <Modal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        title="Invite Team Member"
        description="Send an invitation to join your workspace"
      >
        <form onSubmit={handleInviteMember}>
          <Input
            label="Email Address"
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="colleague@example.com"
            required
            className="mb-6"
          />
          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowInviteModal(false)}
              fullWidth
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isInviting} fullWidth>
              Send Invite
            </Button>
          </div>
        </form>
      </Modal>

      {/* Remove Member Modal */}
      <ConfirmModal
        isOpen={!!memberToRemove}
        onClose={() => setMemberToRemove(null)}
        onConfirm={handleRemoveMember}
        title="Remove Member"
        message={`Are you sure you want to remove ${memberToRemove?.user.name} from your workspace?`}
        confirmText="Remove"
        variant="danger"
      />
    </div>
  );
}