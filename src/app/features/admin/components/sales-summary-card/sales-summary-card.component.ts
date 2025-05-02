import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-sales-summary-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './sales-summary-card.component.html',
  styleUrls: ['./sales-summary-card.component.scss']
})
export class SalesSummaryCardComponent {
  @Input() title: string = '';
  @Input() value: number = 0;
  @Input() valueSuffix: string = '';
  @Input() subtitle: string = '';
  @Input() icon: string = 'assessment';
  @Input() color: 'primary' | 'accent' | 'warn' = 'primary';
  @Input() compareValue?: number;
  @Input() compareLabel?: string;

  formatNumber(value: number): string {
    return value.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }

  getCompareIcon(): string {
    if (!this.compareValue) return '';
    return this.compareValue > 0 ? 'trending_up' : 'trending_down';
  }

  getCompareColor(): string {
    if (!this.compareValue) return '';
    return this.compareValue > 0 ? 'positive' : 'negative';
  }
}
