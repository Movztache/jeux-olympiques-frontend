import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import {MatCheckbox} from '@angular/material/checkbox';

@Component({
  selector: 'app-reservation-form',
  templateUrl: './reservation-form.component.html',
  styleUrls: ['./reservation-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCheckbox
  ]
})
export class ReservationFormComponent implements OnInit {
  @Input() offerId: string | null = null;
  @Input() offerType: 'solo' | 'duo' | 'family' = 'solo';
  @Output() formSubmit = new EventEmitter<any>();

  reservationForm!: FormGroup;

  // Maximum number of tickets based on offer type
  get maxTickets(): number {
    switch(this.offerType) {
      case 'solo': return 1;
      case 'duo': return 2;
      case 'family': return 4;
      default: return 1;
    }
  }

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    // Initial ticket count based on offer type
    const initialTickets = this.offerType === 'solo' ? 1 : this.offerType === 'duo' ? 2 : 4;

    this.reservationForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required],
      ticketCount: [initialTickets, [
        Validators.required,
        Validators.min(1),
        Validators.max(this.maxTickets)
      ]],
      specialRequests: [''],
      acceptTerms: [false, Validators.requiredTrue]
    });
  }

  onSubmit(): void {
    if (this.reservationForm.valid) {
      this.formSubmit.emit({
        ...this.reservationForm.value,
        offerId: this.offerId
      });
    } else {
      this.reservationForm.markAllAsTouched();
    }
  }
}
