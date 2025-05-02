import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesSummaryCardComponent } from './sales-summary-card.component';

describe('SalesSummaryCardComponent', () => {
  let component: SalesSummaryCardComponent;
  let fixture: ComponentFixture<SalesSummaryCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesSummaryCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesSummaryCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
