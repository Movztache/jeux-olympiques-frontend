import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BilletteriePageComponent } from './billetterie-page.component';

describe('BilletteriePageComponent', () => {
  let component: BilletteriePageComponent;
  let fixture: ComponentFixture<BilletteriePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BilletteriePageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BilletteriePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
