// src/app/features/admin/pages/user-list/user-list.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';

import { SearchBarComponent } from '../../../../shared/components/search-bar/search-bar.component';

import { UserService } from '../../../../core/services/user.service';
import {Role, User} from '../../../../core/models/user.model';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import { RoleChangeDialogComponent } from '../../components/role-change-dialog/role-change-dialog.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatSlideToggleModule,
    MatDialogModule,
    MatChipsModule,
    SearchBarComponent
  ],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
  // Constantes pour les IDs de rôle
  private readonly ROLE_ADMIN_ID = 1;
  private readonly ROLE_USER_ID = 2;
  // Colonnes à afficher dans le tableau
  displayedColumns: string[] = ['email', 'role', 'actions'];

  // Données des utilisateurs
  users: User[] = [];
  filteredUsers: User[] = [];

  // Pagination
  pageSize = 10;
  pageSizeOptions: number[] = [10, 25, 50];
  pageIndex = 0;

  // Recherche
  searchTerm = '';

  // État de chargement
  loading = true;

  constructor(
    private userService: UserService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  /**
   * Charge la liste des utilisateurs
   */
  loadUsers(): void {
    this.loading = true;
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        console.log('Utilisateurs récupérés:', users);
        // Vérifier que chaque utilisateur a un userId valide
        this.users = users.map(user => {
          if (user.userId === undefined || user.userId === null) {
            console.warn(`Utilisateur sans ID valide:`, user);
          }
          return user;
        });
        this.applyFilter();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des utilisateurs', error);
        this.snackBar.open('Erreur lors du chargement des utilisateurs', 'Fermer', {
          duration: 3000,
          verticalPosition: 'top'
        });
        this.loading = false;
      }
    });
  }

  /**
   * Applique le filtre de recherche
   */
  applyFilter(): void {
    const filterValue = this.searchTerm.toLowerCase().trim();

    if (!filterValue) {
      this.filteredUsers = [...this.users];
    } else {
      this.filteredUsers = this.users.filter(user =>
        user.email.toLowerCase().includes(filterValue) ||
        user.firstName.toLowerCase().includes(filterValue) ||
        user.lastName.toLowerCase().includes(filterValue)
      );
    }

    this.pageIndex = 0;
  }

  /**
   * Gère le changement de page
   * @param event Événement de pagination
   */
  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
  }

  /**
   * Gère le tri des colonnes
   * @param sort Événement de tri
   */
  onSortChange(sort: Sort): void {
    const data = [...this.filteredUsers];

    if (!sort.active || sort.direction === '') {
      this.filteredUsers = data;
      return;
    }

    this.filteredUsers = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'email': return this.compare(a.email, b.email, isAsc);
        case 'role': return this.compare(this.getRoleName(a.roles[0]) || '', this.getRoleName(b.roles[0]) || '', isAsc);
        default: return 0;
      }
    });
  }

  /**
   * Affiche le rôle d'un utilisateur
   * @param user L'utilisateur dont on veut afficher le rôle
   * @returns Le rôle à afficher
   */
  getRoleDisplay(user: User): string {
    if (!user) {
      return 'User';
    }

    // Utiliser directement la propriété roleName si elle existe
    if (user.roleName) {
      return user.roleName;
    }

    // Utiliser la propriété roleId si elle existe (1 = Admin, 2 = User)
    if (user.roleId === 1) {
      return 'Admin';
    } else if (user.roleId === 2) {
      return 'User';
    }

    // Fallback sur la méthode isAdmin
    return this.isAdmin(user) ? 'Admin' : 'User';
  }

  /**
   * Extrait le nom du rôle, qu'il soit une chaîne de caractères ou un objet
   * @param role Le rôle à traiter
   * @returns Le nom du rôle
   */
  private getRoleName(role: Role | string | undefined): string {
    if (!role) {
      return '';
    }

    if (typeof role === 'string') {
      return role;
    }

    return role.roleName || '';
  }

  /**
   * Fonction de comparaison pour le tri
   */
  private compare(a: string | number, b: string | number, isAsc: boolean): number {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  /**
   * Ouvre une boîte de dialogue pour confirmer le changement de rôle
   * @param user Utilisateur à modifier
   */
  openRoleChangeDialog(user: User): void {
    const isAdmin = this.isAdmin(user);

    const dialogRef = this.dialog.open(RoleChangeDialogComponent, {
      width: '400px',
      data: { user, isAdmin }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.toggleUserRole(user);
      }
    });
  }

  /**
   * Bascule le rôle de l'utilisateur entre Admin et User
   * @param user Utilisateur à modifier
   */
  private toggleUserRole(user: User): void {
    // Vérifier que l'utilisateur a un ID valide
    if (!user.userId) {
      this.snackBar.open('Erreur: ID utilisateur non défini', 'Fermer', {
        duration: 3000,
        verticalPosition: 'top'
      });
      return;
    }

    const isAdmin = this.isAdmin(user);
    // Si l'utilisateur est déjà admin, on lui donne le rôle USER, sinon ADMIN
    const roleId = isAdmin ? this.ROLE_USER_ID : this.ROLE_ADMIN_ID;

    console.log(`Changement de rôle pour l'utilisateur ${user.email} (ID: ${user.userId}) - Nouveau rôle: ${roleId === this.ROLE_ADMIN_ID ? 'Admin' : 'User'}`);

    this.userService.updateUserRole(user.userId, roleId).subscribe({
      next: (updatedUser) => {
        // Mettre à jour l'utilisateur dans la liste
        const index = this.users.findIndex(u => u.userId === user.userId);
        if (index !== -1) {
          console.log('Utilisateur mis à jour:', updatedUser);

          // Mettre à jour toutes les propriétés pertinentes
          this.users[index].roles = updatedUser.roles || [];
          this.users[index].roleId = updatedUser.roleId;
          this.users[index].roleName = updatedUser.roleName;

          // Si les propriétés roleId et roleName ne sont pas mises à jour par le backend,
          // les mettre à jour manuellement
          if (roleId === this.ROLE_ADMIN_ID && (!this.users[index].roleId || this.users[index].roleId !== this.ROLE_ADMIN_ID)) {
            this.users[index].roleId = this.ROLE_ADMIN_ID;
            this.users[index].roleName = 'Admin';
          } else if (roleId === this.ROLE_USER_ID && (!this.users[index].roleId || this.users[index].roleId !== this.ROLE_USER_ID)) {
            this.users[index].roleId = this.ROLE_USER_ID;
            this.users[index].roleName = 'User';
          }

          // Forcer la mise à jour de la vue
          this.users = [...this.users];
          this.applyFilter();
        } else {
          console.warn('Utilisateur non trouvé dans la liste après mise à jour');
        }

        this.snackBar.open(`Rôle de l'utilisateur mis à jour avec succès`, 'Fermer', {
          duration: 3000,
          verticalPosition: 'top'
        });
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour du rôle', error);
        this.snackBar.open('Erreur lors de la mise à jour du rôle', 'Fermer', {
          duration: 3000,
          verticalPosition: 'top'
        });

        // Rétablir l'état précédent
        // Si l'utilisateur était admin, on lui remet le rôle ADMIN, sinon USER
        if (isAdmin) {
          // Était admin, doit rester admin
          const hasAdminRole = this.isAdmin(user);
          if (!hasAdminRole) {
            // Ajouter un rôle admin au format approprié
            // Vérifier si les rôles existants sont des chaînes de caractères ou des objets
            if (user.roles.length > 0 && typeof user.roles[0] === 'string') {
              user.roles.push('Admin');
            } else {
              user.roles.push({ roleName: 'Admin' });
            }
          }
        } else {
          // Était user, doit rester user
          // Filtrer les rôles admin
          user.roles = user.roles.filter(role => {
            // Si le rôle est une chaîne de caractères
            if (typeof role === 'string') {
              return role.toLowerCase() !== 'admin';
            }

            // Si le rôle est un objet avec une propriété roleName
            if (typeof role === 'object' && role !== null && role.roleName) {
              return role.roleName.toLowerCase() !== 'admin';
            }

            return true;
          });
        }
      }
    });
  }

  /**
   * Supprime un utilisateur après confirmation
   * @param user Utilisateur à supprimer
   */
  deleteUser(user: User): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmer la suppression',
        message: `Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.email} ?`,
        confirmText: 'Supprimer',
        cancelText: 'Annuler'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userService.deleteUser(user.userId!).subscribe({
          next: () => {
            // Supprimer l'utilisateur de la liste
            this.users = this.users.filter(u => u.userId !== user.userId);
            this.applyFilter();

            this.snackBar.open('Utilisateur supprimé avec succès', 'Fermer', {
              duration: 3000,
              verticalPosition: 'top'
            });
          },
          error: (error) => {
            console.error('Erreur lors de la suppression de l\'utilisateur', error);
            this.snackBar.open('Erreur lors de la suppression de l\'utilisateur', 'Fermer', {
              duration: 3000,
              verticalPosition: 'top'
            });
          }
        });
      }
    });
  }

  /**
   * Rafraîchit la liste des utilisateurs
   */
  refreshUsers(): void {
    this.searchTerm = '';
    this.loadUsers();
  }

  /**
   * Vérifie si l'utilisateur est un administrateur
   * @param user Utilisateur à vérifier
   * @returns true si l'utilisateur est un administrateur
   */
  isAdmin(user: User): boolean {
    if (!user) {
      return false;
    }

    // Vérifier d'abord la propriété roleId (1 = Admin, 2 = User)
    if (user.roleId === 1) {
      return true;
    }

    // Vérifier ensuite la propriété roleName
    if (user.roleName && user.roleName.toLowerCase() === 'admin') {
      return true;
    }

    // Si l'email contient 'admin', c'est probablement un administrateur (fallback)
    if (user.email && user.email.toLowerCase().includes('admin')) {
      return true;
    }

    // Si l'utilisateur n'a pas de rôles valides
    if (!user.roles || !Array.isArray(user.roles) || user.roles.length === 0) {
      return false;
    }

    // Vérifier si l'un des rôles est 'Admin' (insensible à la casse)
    return user.roles.some(role => {
      // Si le rôle est une chaîne de caractères
      if (typeof role === 'string') {
        return role.toLowerCase() === 'admin';
      }

      // Si le rôle est un objet avec une propriété roleName
      if (typeof role === 'object' && role !== null && role.roleName) {
        return role.roleName.toLowerCase() === 'admin';
      }

      return false;
    });
  }

  /**
   * Obtient les utilisateurs paginés
   * @returns Liste paginée des utilisateurs
   */
  getPaginatedUsers(): User[] {
    const startIndex = this.pageIndex * this.pageSize;
    return this.filteredUsers.slice(startIndex, startIndex + this.pageSize);
  }
}
