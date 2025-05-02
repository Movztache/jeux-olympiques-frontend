// src/app/features/dashboard/components/revenue-chart/revenue-chart.component.ts
import { Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import Chart from 'chart.js/auto';
import { ChartType as ChartJsType, TooltipItem } from 'chart.js';
import { OfferSalesData } from '../../../../core/models/sales.model';
import {MatTooltip} from '@angular/material/tooltip';

type DisplayValueType = 'total' | 'percentage';
type DownloadFormat = 'png' | 'jpg' | 'pdf';
type ChartType = 'pie' | 'doughnut' | 'bar';

@Component({
  selector: 'app-revenue-chart',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltip
  ],
  templateUrl: './revenue-chart.component.html',
  styleUrls: ['./revenue-chart.component.scss']
})
export class RevenueChartComponent implements AfterViewInit, OnChanges {
  @Input() salesData: OfferSalesData[] = [];
  @ViewChild('revenueCanvas') revenueCanvas!: ElementRef<HTMLCanvasElement>;
  chart: Chart | null = null;
  chartType: ChartType = 'pie';
  chartTitle = 'Répartition des revenus par offre';

  displayValues = [
    { value: 'total' as DisplayValueType, label: 'Montant total' },
    { value: 'percentage' as DisplayValueType, label: 'Pourcentage' }
  ];
  selectedDisplayValue: DisplayValueType = 'total';

  backgroundColors = [
    'rgba(255, 99, 132, 0.7)',
    'rgba(54, 162, 235, 0.7)',
    'rgba(255, 206, 86, 0.7)',
    'rgba(75, 192, 192, 0.7)',
    'rgba(153, 102, 255, 0.7)',
    'rgba(255, 159, 64, 0.7)',
    'rgba(233, 30, 99, 0.7)',
    'rgba(156, 39, 176, 0.7)'
  ];

  borderColors = [
    'rgba(255, 99, 132, 1)',
    'rgba(54, 162, 235, 1)',
    'rgba(255, 206, 86, 1)',
    'rgba(75, 192, 192, 1)',
    'rgba(153, 102, 255, 1)',
    'rgba(255, 159, 64, 1)',
    'rgba(233, 30, 99, 1)',
    'rgba(156, 39, 176, 1)'
  ];

  ngAfterViewInit(): void {
    this.createChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['salesData'] && !changes['salesData'].firstChange && this.chart) {
      this.updateChart();
    }
  }

  createChart(): void {
    if (!this.revenueCanvas) return;

    const ctx = this.revenueCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    // Traitement des données pour le graphique
    const labels = this.salesData.map(item => item.offerName || `Offre ${item.offerId}`);
    const data = this.salesData.map(item => Number(item.revenue));

    const component = this; // Stockage de la référence pour utiliser dans le callback

    this.chart = new Chart(ctx, {
      type: this.chartType as ChartJsType,
      data: {
        labels: labels,
        datasets: [{
          label: 'Revenus',
          data: data,
          backgroundColor: this.backgroundColors,
          borderColor: this.borderColors,
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              boxWidth: 15,
              padding: 15
            }
          },
          title: {
            display: true,
            text: this.chartTitle,
            font: {
              size: 16
            }
          },
          tooltip: {
            callbacks: {
              label: function(tooltipItem: TooltipItem<ChartJsType>) {
                const value = tooltipItem.raw as number;
                const total = (tooltipItem.dataset.data as number[]).reduce((a, b) => a + b, 0);

                if (component.selectedDisplayValue === 'percentage') {
                  const percentage = ((value / total) * 100).toFixed(1);
                  return `${tooltipItem.label}: ${percentage}%`;
                } else {
                  return `${tooltipItem.label}: ${value.toFixed(2)} €`;
                }
              }
            }
          }
        }
      }
    });
  }

  updateChart(): void {
    if (!this.chart) return;

    // Traitement des données pour le graphique
    const labels = this.salesData.map(item => item.offerName || `Offre ${item.offerId}`);
    const data = this.salesData.map(item => Number(item.revenue));

    this.chart.data.labels = labels;
    this.chart.data.datasets[0].data = data;

    // Mise à jour des options du tooltip en fonction du mode d'affichage
    const component = this;
    if (this.chart && this.chart.options && this.chart.options.plugins && this.chart.options.plugins.tooltip) {
      this.chart.options.plugins.tooltip.callbacks = this.chart.options.plugins.tooltip.callbacks || {};
      this.chart.options.plugins.tooltip.callbacks.label = function(tooltipItem: TooltipItem<ChartJsType>) {
        const value = tooltipItem.raw as number;
        const total = (tooltipItem.dataset.data as number[]).reduce((a, b) => a + b, 0);

        if (component.selectedDisplayValue === 'percentage') {
          const percentage = ((value / total) * 100).toFixed(1);
          return `${tooltipItem.label}: ${percentage}%`;
        } else {
          return `${tooltipItem.label}: ${value.toLocaleString('fr-FR')} €`;
        }
      };

      this.chart.update();
    }
  }

  switchChartType(type: ChartType): void {
    if (this.chartType === type || !this.chart) return;
    this.chartType = type;
    this.chart.destroy();
    this.createChart();
  }

  downloadChart(format: DownloadFormat): void {
    if (!this.chart || !this.revenueCanvas) return;

    const canvas = this.revenueCanvas.nativeElement;
    let imageLink = document.createElement('a');

    switch (format) {
      case 'png':
        imageLink.download = `revenue-chart-${new Date().toISOString()}.png`;
        imageLink.href = canvas.toDataURL('image/png');
        break;
      case 'jpg':
        imageLink.download = `revenue-chart-${new Date().toISOString()}.jpg`;
        imageLink.href = canvas.toDataURL('image/jpeg');
        break;
      case 'pdf':
        // Pour générer un PDF, vous auriez besoin d'une bibliothèque supplémentaire comme jsPDF
        console.log('PDF download not implemented yet');
        return;
    }

    imageLink.click();
  }


  changeDisplayValue(value: DisplayValueType): void {
    if (this.selectedDisplayValue === value) return;

    this.selectedDisplayValue = value;

    // Mise à jour du graphique si nécessaire
    if (this.chart) {
      // Mise à jour des options du tooltip en fonction du mode d'affichage
      if (this.chart.options && this.chart.options.plugins && this.chart.options.plugins.tooltip) {
        this.chart.options.plugins.tooltip.callbacks = this.chart.options.plugins.tooltip.callbacks || {};

        const component = this;
        this.chart.options.plugins.tooltip.callbacks.label = function(tooltipItem: TooltipItem<ChartJsType>) {
          const value = tooltipItem.raw as number;
          const total = (tooltipItem.dataset.data as number[]).reduce((a, b) => a + b, 0);

          if (component.selectedDisplayValue === 'percentage') {
            const percentage = ((value / total) * 100).toFixed(1);
            return `${tooltipItem.label}: ${percentage}%`;
          } else {
            return `${tooltipItem.label}: ${value.toLocaleString('fr-FR')} €`;
          }
        };

        this.chart.update();
      }
    }
  }

  getDisplayLabel(): string {
    return this.selectedDisplayValue === 'total' ? 'Montant total' : 'Pourcentage';
  }

}
