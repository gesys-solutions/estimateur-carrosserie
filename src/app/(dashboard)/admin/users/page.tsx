"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  Plus,
  UserPlus,
  MoreHorizontal,
  Pencil,
  UserX,
  UserCheck,
  Search,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCurrentUser } from "@/hooks/use-current-user";
import {
  createUserSchema,
  type CreateUserFormData,
} from "@/lib/validations/auth";
import type { Role } from "@/types";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrateur",
  MANAGER: "Gestionnaire",
  ESTIMATOR: "Estimateur",
};

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: "ESTIMATOR", label: "Estimateur" },
  { value: "MANAGER", label: "Gestionnaire" },
  { value: "ADMIN", label: "Administrateur" },
];

export default function AdminUsersPage() {
  const { user: currentUser, isAdmin, isLoading: userLoading } = useCurrentUser();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterActive, setFilterActive] = useState<string>("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/v1/users");
      if (!response.ok) throw new Error("Erreur lors du chargement");
      const result = await response.json();
      setUsers(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin, fetchUsers]);

  const createForm = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      role: "ESTIMATOR",
    },
  });

  async function onCreateSubmit(data: CreateUserFormData) {
    try {
      setError(null);
      const response = await fetch("/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Erreur lors de la création");
      }

      setSuccess("Utilisateur créé avec succès");
      setShowCreateDialog(false);
      createForm.reset();
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    }
  }

  async function toggleUserActive(user: User) {
    try {
      setError(null);
      const response = await fetch(`/api/v1/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !user.isActive }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Erreur lors de la modification");
      }

      setSuccess(
        user.isActive
          ? "Utilisateur désactivé"
          : "Utilisateur réactivé"
      );
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    }
    setActionMenuOpen(null);
  }

  async function updateUserRole(userId: string, newRole: Role) {
    try {
      setError(null);
      const response = await fetch(`/api/v1/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Erreur lors de la modification");
      }

      setSuccess("Rôle modifié avec succès");
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    }
  }

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      searchQuery === "" ||
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesActive =
      filterActive === "all" ||
      (filterActive === "active" && user.isActive) ||
      (filterActive === "inactive" && !user.isActive);

    return matchesSearch && matchesRole && matchesActive;
  });

  if (userLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold">Accès refusé</h2>
        <p className="text-muted-foreground">
          Cette page est réservée aux administrateurs.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestion des utilisateurs</h1>
          <p className="text-muted-foreground">
            Gérez les utilisateurs de votre atelier
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un utilisateur
        </Button>
      </div>

      {/* Messages */}
      {error && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-auto hover:underline"
          >
            Fermer
          </button>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-md bg-green-50 p-3 text-sm text-green-800">
          <CheckCircle className="h-4 w-4" />
          {success}
          <button
            onClick={() => setSuccess(null)}
            className="ml-auto hover:underline"
          >
            Fermer
          </button>
        </div>
      )}

      {/* Create User Dialog */}
      {showCreateDialog && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Nouvel utilisateur
            </CardTitle>
            <CardDescription>
              Créez un nouveau compte utilisateur
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={createForm.handleSubmit(onCreateSubmit)}
              className="space-y-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Prénom</label>
                  <Input
                    {...createForm.register("firstName")}
                    placeholder="Jean"
                  />
                  {createForm.formState.errors.firstName && (
                    <p className="text-sm text-destructive">
                      {createForm.formState.errors.firstName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nom</label>
                  <Input
                    {...createForm.register("lastName")}
                    placeholder="Tremblay"
                  />
                  {createForm.formState.errors.lastName && (
                    <p className="text-sm text-destructive">
                      {createForm.formState.errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Courriel</label>
                <Input
                  type="email"
                  {...createForm.register("email")}
                  placeholder="jean@exemple.com"
                />
                {createForm.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {createForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Mot de passe</label>
                <Input
                  type="password"
                  {...createForm.register("password")}
                  placeholder="Minimum 8 caractères"
                />
                {createForm.formState.errors.password && (
                  <p className="text-sm text-destructive">
                    {createForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Rôle</label>
                <select
                  {...createForm.register("role")}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {ROLE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {createForm.formState.errors.role && (
                  <p className="text-sm text-destructive">
                    {createForm.formState.errors.role.message}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={createForm.formState.isSubmitting}
                >
                  {createForm.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Création...
                    </>
                  ) : (
                    "Créer l'utilisateur"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateDialog(false);
                    createForm.reset();
                  }}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="all">Tous les rôles</option>
              {ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value)}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actifs</option>
              <option value="inactive">Inactifs</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              Aucun utilisateur trouvé
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      Utilisateur
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      Rôle
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      Statut
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      Dernière connexion
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-muted/50">
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {user.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {editingUser?.id === user.id ? (
                          <select
                            value={editingUser.role}
                            onChange={(e) =>
                              updateUserRole(user.id, e.target.value as Role)
                            }
                            onBlur={() => setEditingUser(null)}
                            autoFocus
                            className="rounded-md border border-input bg-background px-2 py-1 text-sm"
                          >
                            {ROLE_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                            {ROLE_LABELS[user.role] || user.role}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            user.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {user.isActive ? "Actif" : "Inactif"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {user.lastLoginAt
                          ? new Date(user.lastLoginAt).toLocaleDateString(
                              "fr-CA",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )
                          : "Jamais"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="relative inline-block">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              setActionMenuOpen(
                                actionMenuOpen === user.id ? null : user.id
                              )
                            }
                            disabled={user.id === currentUser?.id}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                          {actionMenuOpen === user.id && (
                            <div className="absolute right-0 z-10 mt-1 w-48 rounded-md border bg-background shadow-lg">
                              <button
                                className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-muted"
                                onClick={() => {
                                  setEditingUser(user);
                                  setActionMenuOpen(null);
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                                Modifier le rôle
                              </button>
                              <button
                                className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-muted"
                                onClick={() => toggleUserActive(user)}
                              >
                                {user.isActive ? (
                                  <>
                                    <UserX className="h-4 w-4" />
                                    Désactiver
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="h-4 w-4" />
                                    Réactiver
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
