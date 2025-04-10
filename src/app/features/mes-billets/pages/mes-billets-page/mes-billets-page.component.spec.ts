import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MesBilletsPageComponent } from './mes-billets-page.component';

describe('MesBilletsPageComponent', () => {
  let component: MesBilletsPageComponent;
  let fixture: ComponentFixture<MesBilletsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MesBilletsPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MesBilletsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
