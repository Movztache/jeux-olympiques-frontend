// src/app/features/dashboard/components/sales-chart/sales-chart.component.ts
import { Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import Chart from 'chart.js/auto';
import { OfferSalesData } from '../../../../core/models/sales.model';

@Component({
  selector: 'app-sales-chart',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule
  ],
  templateUrl: './sales-chart.component.html',
  styleUrls: ['./sales-chart.component.scss']
})
export class SalesChartComponent implements AfterViewInit, OnChanges {
  @Input() salesData: OfferSalesData[] = [];
  @ViewChild('salesCanvas') salesCanvas!: ElementRef<HTMLCanvasElement>;
  chart: any;
  chartType: 'bar' | 'line' = 'bar';
  chartTitle = 'Ventes par offre';

  // Options pour les périodes de comparaison
  timePeriods = [
    { value: 'month', label: 'Mensuel' },
    { value: 'quarter', label: 'Trimestriel' },
    { value: 'year', label: 'Annuel' }
  ];
  selectedPeriod = 'month';

  ngAfterViewInit() {
    this.createChart();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['salesData'] && !changes['salesData'].firstChange && this.chart) {
      this.updateChart();
    }
  }

  createChart() {
    if (!this.salesCanvas) return;

    const ctx = this.salesCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    // Traitement des données pour le graphique
    const labels = this.salesData.map(item => item.offerName || `Offre ${item.offerId}`);
    const data = this.salesData.map(item => item.sales);

    this.chart = new Chart(ctx, {
      type: this.chartType,
      data: {
        labels: labels,
        datasets: [{
          label: 'Nombre de ventes',
          data: data,
          backgroundColor: 'rgba(63, 81, 181, 0.7)',
          borderColor: 'rgba(63, 81, 181, 1)',
          borderWidth: 1,
          tension: 0.4  // Pour les courbes plus douces en mode ligne
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: this.chartTitle
          },
          tooltip: {
            mode: 'index',
            intersect: false,
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  updateChart() {
    if (!this.chart) return;

    // Mise à jour des données du graphique
    const labels = this.salesData.map(item => item.offerName || `Offre ${item.offerId}`);
    const data = this.salesData.map(item => item.sales);

    this.chart.data.labels = labels;
    this.chart.data.datasets[0].data = data;
    this.chart.options.plugins.title.text = this.chartTitle;
    this.chart.update();
  }

  switchChartType(type: 'bar' | 'line') {
    if (this.chartType === type) return;
    this.chartType = type;

    if (this.chart) {
      this.chart.destroy();
      this.createChart();
    }
  }

  changePeriod(period: string) {
    this.selectedPeriod = period;

    // Simuler un changement de données selon la période
    // Dans une application réelle, vous appeliez probablement un service ici

    this.updateChart();
  }

  downloadChart(format: 'png' | 'jpg' | 'pdf') {
    if (!this.chart) return;

    let link = document.createElement('a');
    link.download = `ventes-par-offre.${format}`;

    if (format === 'pdf') {
      // Logique pour générer un PDF
      console.log('Téléchargement en PDF - fonctionnalité à implémenter');
    } else {
      // Image format
      link.href = this.chart.toBase64Image(format);
      link.click();
    }
  }

  getPeriodLabel(): string {
    switch (this.selectedPeriod) {
      case 'month': return 'Mensuel';
      case 'quarter': return 'Trimestriel';
      case 'year': return 'Annuel';
      default: return 'Mensuel';
    }
  }

}
