import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { User } from '../../../../core/models/user.model';

export interface RoleChangeDialogData {
  user: User;
  isAdmin: boolean;
}

@Component({
  selector: 'app-role-change-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>Confirmation de changement de rôle</h2>
    <mat-dialog-content>
      <p>Voulez-vous changer le rôle de <strong>{{ data.user.email }}</strong> ?</p>
      <p>
        <span class="current-role">Rôle actuel : <strong>{{ data.isAdmin ? 'Admin' : 'User' }}</strong></span>
        <br>
        <span class="new-role">Nouveau rôle : <strong>{{ data.isAdmin ? 'User' : 'Admin' }}</strong></span>
      </p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Annuler</button>
      <button mat-raised-button color="primary" [mat-dialog-close]="true">Confirmer</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .current-role, .new-role {
      margin: 8px 0;
      display: block;
    }
  `]
})
export class RoleChangeDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<RoleChangeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RoleChangeDialogData
  ) {}
}
