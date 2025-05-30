import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfferPageComponent } from './offer-page.component';

describe('OfferPageComponent', () => {
  let component: OfferPageComponent;
  let fixture: ComponentFixture<OfferPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OfferPageComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(OfferPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
