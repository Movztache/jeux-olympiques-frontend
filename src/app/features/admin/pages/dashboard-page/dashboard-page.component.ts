import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon'; // Ajout
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // Ajout
import { ReactiveFormsModule, FormGroup, FormBuilder } from '@angular/forms';
import { SalesService } from '../../../../core/services/sales.service';
import { SalesSummary, OfferSalesData } from '../../../../core/models/sales.model';
import { SalesSummaryCardComponent } from '../../components/sales-summary-card/sales-summary-card.component';
import { SalesChartComponent} from '../../components/sales-chart/sales-chart.component';
import { RevenueChartComponent } from '../../components/revenue-chart/revenue-chart.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    MatSelectModule,
    MatIconModule, // Ajout
    MatProgressSpinnerModule, // Ajout
    ReactiveFormsModule,
    SalesSummaryCardComponent,
    SalesChartComponent,
    RevenueChartComponent
  ],
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.scss']
})

export class DashboardComponent implements OnInit {
  salesSummary: SalesSummary | null = null;
  salesData: OfferSalesData[] = [];
  loading = true;
  error = false;
  filterForm: FormGroup;

  constructor(
    private salesService: SalesService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      period: ['month'],
      startDate: [new Date(new Date().setMonth(new Date().getMonth() - 1))],
      endDate: [new Date()]
    });
  }

  ngOnInit(): void {
    this.loadSalesData();
  }

  loadSalesData(): void {
    this.loading = true;
    this.error = false;

    // Chargement du résumé des ventes
    this.salesService.getStatisticsSummary().subscribe({
      next: (data) => {
        this.salesSummary = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des données:', err);
        this.error = true;
        this.loading = false;
      }
    });

    // Chargement des données formatées pour les graphiques
    this.salesService.getFormattedSalesData().subscribe({
      next: (data) => {
        this.salesData = data;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des données formatées:', err);
      }
    });
  }

  onPeriodChange(): void {
    const period = this.filterForm.get('period')?.value;
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'day':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
    }

    this.filterForm.patchValue({
      startDate,
      endDate: new Date()
    });

    this.applyFilters();
  }

  applyFilters(): void {
    const startDate = this.filterForm.get('startDate')?.value;
    const endDate = this.filterForm.get('endDate')?.value;

    if (startDate && endDate) {
      this.loading = true;
      this.salesService.getSalesStatisticsByPeriod(startDate, endDate).subscribe({
        next: (data) => {
          // Transformer les données pour les graphiques
          this.salesData = Object.keys(data).map(offerId => {
            const id = parseInt(offerId, 10);
            const stats = data[id];
            return {
              offerId: id,
              sales: stats.salesCount,
              revenue: stats.totalRevenue
            };
          });
          this.loading = false;
        },
        error: (err) => {
          console.error('Erreur lors du chargement des statistiques par période:', err);
          this.error = true;
          this.loading = false;
        }
      });
    }
  }
}
