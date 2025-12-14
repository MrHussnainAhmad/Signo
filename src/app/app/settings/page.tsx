'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { PageHeader } from '@/components/layout/AppLayout';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { Badge, RoleBadge, PlanBadge } from '@/components/ui/Badge'; // ✅ FIX: import Badge
import { FileUpload } from '@/components/ui/FileUpload';
import { ConfirmModal, Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { Skeleton } from '@/components/ui/Spinner';
import {
  UserRound,
  Shield,
  Building2,
  Users,
  Mail,
  Trash2,
  PencilLine,
  KeyRound,
  Upload,
  Settings as SettingsIcon,
  LockKeyhole,
} from 'lucide-react';

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchData() {
    try {
      // backend unchanged
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
    } catch {
      showError('Error', 'Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setIsSavingProfile(true);

    try {
      // backend unchanged
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
    } catch {
      showError('Error', 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handleSaveWorkspace(e: React.FormEvent) {
    e.preventDefault();
    setIsSavingWorkspace(true);

    try {
      // backend unchanged
      const response = await fetch('/api/settings/workspace', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: workspaceName }),
      });

      const data = await response.json();

      if (response.ok) {
        setWorkspace((prev) => (prev ? { ...prev, name: workspaceName } : null));
        success('Workspace Updated', 'Workspace settings have been saved');
      } else {
        showError('Error', data.error || 'Failed to update workspace');
      }
    } catch {
      showError('Error', 'Failed to update workspace');
    } finally {
      setIsSavingWorkspace(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setIsSavingPassword(true);

    try {
      // backend unchanged
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
    } catch {
      showError('Error', 'Failed to change password');
    } finally {
      setIsSavingPassword(false);
    }
  }

  async function handleInviteMember(e: React.FormEvent) {
    e.preventDefault();
    setIsInviting(true);

    try {
      // backend unchanged
      const response = await fetch('/api/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        const sentTo = inviteEmail;
        setInviteEmail('');
        setShowInviteModal(false);
        success('Invite Sent', `Invitation sent to ${sentTo}`);
      } else {
        showError('Error', data.error || 'Failed to send invite');
      }
    } catch {
      showError('Error', 'Failed to send invite');
    } finally {
      setIsInviting(false);
    }
  }

  async function handleRemoveMember() {
    if (!memberToRemove) return;

    try {
      // backend unchanged
      const response = await fetch(`/api/settings/members?memberId=${memberToRemove.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMembers((prev) => prev.filter((m) => m.id !== memberToRemove.id));
        success('Member Removed', `${memberToRemove.user.name} has been removed`);
      }
    } catch {
      showError('Error', 'Failed to remove member');
    } finally {
      setMemberToRemove(null);
    }
  }

  async function handleAvatarUpload(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    // backend unchanged
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

  const showWorkspaceSection = !!workspace?.isOwner;
  const showTeamSection = workspace?.plan === 'STUDIO';

  const sectionLinks = useMemo(() => {
    const links: Array<{ id: string; label: string; icon: React.ReactNode }> = [
      { id: 'profile', label: 'Profile', icon: <UserRound className="h-4 w-4" aria-hidden="true" /> },
      { id: 'security', label: 'Security', icon: <Shield className="h-4 w-4" aria-hidden="true" /> },
    ];

    if (showWorkspaceSection) {
      links.push({
        id: 'workspace',
        label: 'Workspace',
        icon: <Building2 className="h-4 w-4" aria-hidden="true" />,
      });
    }
    if (showTeamSection) {
      links.push({ id: 'team', label: 'Team', icon: <Users className="h-4 w-4" aria-hidden="true" /> });
    }

    return links;
  }, [showTeamSection, showWorkspaceSection]);

  if (isLoading) {
    return (
      <div>
        <div className="mb-8">
          <Skeleton width={200} height={32} className="mb-2" />
          <Skeleton width={360} height={20} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4">
            <Skeleton height={220} className="rounded-2xl" />
          </div>
          <div className="lg:col-span-8 space-y-6">
            <Skeleton height={260} className="rounded-2xl" />
            <Skeleton height={240} className="rounded-2xl" />
            <Skeleton height={260} className="rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl">
      <PageHeader title="Settings" description="Manage your account and workspace settings" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column */}
        <div className="lg:col-span-4 space-y-6">
          <Card>
            <div className="flex items-start gap-4">
              <Avatar src={user?.avatarUrl} name={user?.name || ''} size="xl" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-500">Signed in as</p>
                <p className="mt-1 text-lg font-semibold text-gray-900 truncate">
                  {user?.name || '—'}
                </p>
                <p className="mt-1 text-sm text-gray-600 truncate">
                  {user?.email || '—'}
                </p>

                {workspace && (
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <PlanBadge plan={workspace.plan} />
                    <Badge variant="gray">{workspace.name}</Badge>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <SettingsIcon className="h-4 w-4 text-gray-500" aria-hidden="true" />
                Quick navigation
              </p>

              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2">
                {sectionLinks.map((l) => (
                  <a
                    key={l.id}
                    href={`#${l.id}`}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-medium text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50 transition"
                  >
                    {l.icon}
                    {l.label}
                  </a>
                ))}
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-gray-500" aria-hidden="true" />
                Profile photo
              </CardTitle>
              <CardDescription>Upload a new avatar image</CardDescription>
            </CardHeader>

            <FileUpload
              onUpload={handleAvatarUpload}
              accept="image/*"
              maxSize={5 * 1024 * 1024}
              label="Upload image"
              hint="JPG, PNG, or GIF. Max 5MB."
            />
          </Card>
        </div>

        {/* Right column */}
        <div className="lg:col-span-8 space-y-6">
          <section id="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserRound className="h-5 w-5 text-gray-500" aria-hidden="true" />
                  Profile
                </CardTitle>
                <CardDescription>Your personal account settings</CardDescription>
              </CardHeader>

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

                <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-end">
                  <Button type="submit" isLoading={isSavingProfile}>
                    <span className="inline-flex items-center gap-2">
                      <PencilLine className="h-4 w-4" aria-hidden="true" />
                      Save profile
                    </span>
                  </Button>
                </div>
              </form>
            </Card>
          </section>

          <section id="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-gray-500" aria-hidden="true" />
                  Security
                </CardTitle>
                <CardDescription>Change your account password</CardDescription>
              </CardHeader>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <Input
                  label="Current password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
                <Input
                  label="New password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  hint="At least 8 characters with uppercase, lowercase, and number"
                  required
                />

                <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-end">
                  <Button type="submit" isLoading={isSavingPassword}>
                    <span className="inline-flex items-center gap-2">
                      <KeyRound className="h-4 w-4" aria-hidden="true" />
                      Update password
                    </span>
                  </Button>
                </div>
              </form>
            </Card>
          </section>

          {workspace?.isOwner && (
            <section id="workspace">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-gray-500" aria-hidden="true" />
                    Workspace
                  </CardTitle>
                  <CardDescription>Manage your workspace settings</CardDescription>
                </CardHeader>

                <form onSubmit={handleSaveWorkspace} className="space-y-4">
                  <Input
                    label="Workspace name"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    required
                  />

                  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Current plan</p>
                      <p className="mt-1 text-sm text-gray-600">
                        Your plan affects team member limits and collaboration features.
                      </p>
                    </div>
                    <PlanBadge plan={workspace.plan} size="lg" />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-end">
                    <Button type="submit" isLoading={isSavingWorkspace}>
                      <span className="inline-flex items-center gap-2">
                        <PencilLine className="h-4 w-4" aria-hidden="true" />
                        Save workspace
                      </span>
                    </Button>
                  </div>
                </form>
              </Card>
            </section>
          )}

          {workspace?.plan === 'STUDIO' && (
            <section id="team">
              <Card>
                <CardHeader
                  action={
                    workspace.isOwner && (
                      <Button onClick={() => setShowInviteModal(true)} size="sm">
                        <span className="inline-flex items-center gap-2">
                          <Mail className="h-4 w-4" aria-hidden="true" />
                          Invite
                        </span>
                      </Button>
                    )
                  }
                >
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-gray-500" aria-hidden="true" />
                    Team members
                  </CardTitle>
                  <CardDescription>Manage your team</CardDescription>
                </CardHeader>

                <div className="space-y-3">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-4"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar src={member.user.avatarUrl} name={member.user.name} size="md" />
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-gray-900 truncate">
                              {member.user.name}
                            </span>
                            {member.isCurrentUser && (
                              <span className="text-xs text-gray-500">(you)</span>
                            )}
                            <RoleBadge role={member.role} />
                          </div>
                          <p className="text-sm text-gray-600 truncate">{member.user.email}</p>
                        </div>
                      </div>

                      {member.canRemove ? (
                        <Button variant="ghost" size="sm" onClick={() => setMemberToRemove(member)}>
                          <span className="inline-flex items-center gap-2 text-red-700">
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                            Remove
                          </span>
                        </Button>
                      ) : (
                        <div className="text-sm text-gray-400 sm:text-right">
                          {member.isCurrentUser ? (
                            <span className="inline-flex items-center gap-2">
                              <LockKeyhole className="h-4 w-4" aria-hidden="true" />
                              Protected
                            </span>
                          ) : (
                            '—'
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            </section>
          )}
        </div>
      </div>

      {/* Invite Modal */}
      <Modal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        title="Invite team member"
        description="Send an invitation to join your workspace"
      >
        <form onSubmit={handleInviteMember}>
          <Input
            label="Email address"
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="colleague@example.com"
            required
            className="mb-6"
          />
          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={() => setShowInviteModal(false)} fullWidth>
              Cancel
            </Button>
            <Button type="submit" isLoading={isInviting} fullWidth>
              Send invite
            </Button>
          </div>
        </form>
      </Modal>

      {/* Remove Member Modal */}
      <ConfirmModal
        isOpen={!!memberToRemove}
        onClose={() => setMemberToRemove(null)}
        onConfirm={handleRemoveMember}
        title="Remove member"
        message={`Are you sure you want to remove ${memberToRemove?.user.name} from your workspace?`}
        confirmText="Remove"
        variant="danger"
      />
    </div>
  );
}