"use client";

/**
 * User Management Page (Admin only)
 * List, create, edit, and deactivate users
 */

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { AdminOnly } from "@/components/auth";
import { useCurrentUser } from "@/hooks/use-current-user";
import { createUserSchema, updateUserSchema, type CreateUserInput, type UpdateUserInput } from "@/lib/validations/auth";
import {
  Users,
  Plus,
  Pencil,
  UserX,
  UserCheck,
  KeyRound,
  X,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  temporaryPassword?: string;
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrateur",
  MANAGER: "Gestionnaire",
  ESTIMATOR: "Estimateur",
};

const ROLE_OPTIONS = [
  { value: "ADMIN", label: "Administrateur" },
  { value: "MANAGER", label: "Gestionnaire" },
  { value: "ESTIMATOR", label: "Estimateur" },
];

export default function UsersPage() {
  const router = useRouter();
  const { user: currentUser, isLoading: isLoadingUser } = useCurrentUser();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<"create" | "edit" | "password" | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/v1/users");
      if (!response.ok) {
        if (response.status === 403) {
          router.push("/");
          return;
        }
        throw new Error("Erreur lors de la récupération des utilisateurs");
      }
      const data = await response.json();
      setUsers(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (!isLoadingUser && currentUser) {
      fetchUsers();
    }
  }, [isLoadingUser, currentUser, fetchUsers]);

  const handleToggleActive = async (user: User) => {
    try {
      const action = user.isActive ? "deactivate" : "activate";
      const response = await fetch(`/api/v1/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de l'opération");
      }

      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    }
  };

  const handleResetPassword = async (user: User) => {
    try {
      const response = await fetch(`/api/v1/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset-password" }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de la réinitialisation");
      }

      const data = await response.json();
      setTempPassword(data.temporaryPassword);
      setSelectedUser(user);
      setShowModal("password");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    }
  };

  if (isLoadingUser || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <AdminOnly
      fallback={
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Vous n&apos;avez pas les permissions pour accéder à cette page.
          </AlertDescription>
        </Alert>
      }
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Users className="h-6 w-6" />
              Gestion des utilisateurs
            </h1>
            <p className="text-muted-foreground">
              Gérez les comptes utilisateurs de votre atelier
            </p>
          </div>
          <Button onClick={() => setShowModal("create")}>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un utilisateur
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Utilisateurs ({users.length})</CardTitle>
            <CardDescription>
              Liste de tous les utilisateurs de votre atelier
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-medium">Nom</th>
                    <th className="text-left py-3 px-2 font-medium">Courriel</th>
                    <th className="text-left py-3 px-2 font-medium">Rôle</th>
                    <th className="text-left py-3 px-2 font-medium">Statut</th>
                    <th className="text-left py-3 px-2 font-medium">Dernière connexion</th>
                    <th className="text-right py-3 px-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-2">
                        <div className="font-medium">
                          {user.firstName} {user.lastName}
                        </div>
                      </td>
                      <td className="py-3 px-2 text-muted-foreground">{user.email}</td>
                      <td className="py-3 px-2">
                        <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-primary/10 text-primary">
                          {ROLE_LABELS[user.role] || user.role}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        {user.isActive ? (
                          <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-green-100 text-green-700">
                            Actif
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-red-100 text-red-700">
                            Inactif
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-muted-foreground">
                        {user.lastLoginAt
                          ? new Date(user.lastLoginAt).toLocaleDateString("fr-CA", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Jamais"}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              setShowModal("edit");
                            }}
                            title="Modifier"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleResetPassword(user)}
                            title="Réinitialiser le mot de passe"
                          >
                            <KeyRound className="h-4 w-4" />
                          </Button>
                          {user.id !== currentUser?.id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleActive(user)}
                              title={user.isActive ? "Désactiver" : "Activer"}
                            >
                              {user.isActive ? (
                                <UserX className="h-4 w-4 text-red-500" />
                              ) : (
                                <UserCheck className="h-4 w-4 text-green-500" />
                              )}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Create User Modal */}
        {showModal === "create" && (
          <CreateUserModal
            onClose={() => setShowModal(null)}
            onSuccess={(newUser) => {
              if (newUser.temporaryPassword) {
                setTempPassword(newUser.temporaryPassword);
                setSelectedUser(newUser);
                setShowModal("password");
              } else {
                setShowModal(null);
              }
              fetchUsers();
            }}
          />
        )}

        {/* Edit User Modal */}
        {showModal === "edit" && selectedUser && (
          <EditUserModal
            user={selectedUser}
            onClose={() => {
              setShowModal(null);
              setSelectedUser(null);
            }}
            onSuccess={() => {
              setShowModal(null);
              setSelectedUser(null);
              fetchUsers();
            }}
          />
        )}

        {/* Password Display Modal */}
        {showModal === "password" && selectedUser && tempPassword && (
          <PasswordModal
            user={selectedUser}
            password={tempPassword}
            onClose={() => {
              setShowModal(null);
              setSelectedUser(null);
              setTempPassword(null);
            }}
          />
        )}
      </div>
    </AdminOnly>
  );
}

function CreateUserModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: (user: User) => void;
}) {
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      role: "ESTIMATOR",
    },
  });

  const onSubmit = async (data: CreateUserInput) => {
    setError(null);
    try {
      const response = await fetch("/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la création");
      }

      const newUser = await response.json();
      onSuccess(newUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Nouvel utilisateur</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-4 space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-4 grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom</Label>
                <Input
                  id="firstName"
                  {...register("firstName")}
                  className={errors.firstName ? "border-destructive" : ""}
                />
                {errors.firstName && (
                  <p className="text-sm text-destructive">{errors.firstName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <Input
                  id="lastName"
                  {...register("lastName")}
                  className={errors.lastName ? "border-destructive" : ""}
                />
                {errors.lastName && (
                  <p className="text-sm text-destructive">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Courriel</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Rôle</Label>
              <select
                id="role"
                {...register("role")}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {ROLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe (optionnel)</Label>
              <Input
                id="password"
                type="password"
                {...register("password")}
                placeholder="Laisser vide pour générer automatiquement"
                className={errors.password ? "border-destructive" : ""}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Si laissé vide, un mot de passe temporaire sera généré
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2 p-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Création...
                </>
              ) : (
                "Créer"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditUserModal({
  user,
  onClose,
  onSuccess,
}: {
  user: User;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdateUserInput>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role as "ADMIN" | "MANAGER" | "ESTIMATOR",
    },
  });

  const onSubmit = async (data: UpdateUserInput) => {
    setError(null);
    try {
      const response = await fetch(`/api/v1/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la modification");
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Modifier l&apos;utilisateur</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-4 space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label>Courriel</Label>
              <Input value={user.email} disabled className="bg-muted" />
            </div>

            <div className="grid gap-4 grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom</Label>
                <Input
                  id="firstName"
                  {...register("firstName")}
                  className={errors.firstName ? "border-destructive" : ""}
                />
                {errors.firstName && (
                  <p className="text-sm text-destructive">{errors.firstName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <Input
                  id="lastName"
                  {...register("lastName")}
                  className={errors.lastName ? "border-destructive" : ""}
                />
                {errors.lastName && (
                  <p className="text-sm text-destructive">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Rôle</Label>
              <select
                id="role"
                {...register("role")}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {ROLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 p-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Enregistrement...
                </>
              ) : (
                "Enregistrer"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PasswordModal({
  user,
  password,
  onClose,
}: {
  user: User;
  password: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Mot de passe temporaire</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-4 space-y-4">
          <Alert variant="warning">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Notez ce mot de passe maintenant. Il ne sera plus affiché.
            </AlertDescription>
          </Alert>

          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Utilisateur: <strong>{user.email}</strong>
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-muted px-3 py-2 rounded-md font-mono text-lg">
                {password}
              </code>
              <Button variant="outline" onClick={copyToClipboard}>
                {copied ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  "Copier"
                )}
              </Button>
            </div>
          </div>
        </div>
        <div className="flex justify-end p-4 border-t">
          <Button onClick={onClose}>Fermer</Button>
        </div>
      </div>
    </div>
  );
}
