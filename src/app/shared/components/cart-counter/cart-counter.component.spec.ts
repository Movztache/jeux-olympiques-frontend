import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CartCounterComponent } from './cart-counter.component';

describe('CartCounterComponent', () => {
  let component: CartCounterComponent;
  let fixture: ComponentFixture<CartCounterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartCounterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CartCounterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
