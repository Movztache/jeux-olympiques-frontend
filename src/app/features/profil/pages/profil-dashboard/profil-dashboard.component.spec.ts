import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfilDashboardComponent } from './profil-dashboard.component';

describe('ProfilDashboardComponent', () => {
  let component: ProfilDashboardComponent;
  let fixture: ComponentFixture<ProfilDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfilDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfilDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
