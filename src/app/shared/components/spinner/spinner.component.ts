import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  templateUrl: './spinner.component.html',
  styleUrl: './spinner.component.scss'
})
export class SpinnerComponent {
  @Input() diameter: number = 40;
  @Input() color: 'primary' | 'accent' | 'warn' = 'primary';
  @Input() mode: 'determinate' | 'indeterminate' = 'indeterminate';
  @Input() value: number = 0;
  @Input() strokeWidth: number = 4;
  @Input() overlay: boolean = false;
  @Input() message: string = '';
}
