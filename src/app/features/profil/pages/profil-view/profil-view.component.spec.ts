// src/app/features/profil/pages/profil-view/profil-view.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { ProfilViewComponent } from './profil-view.component';
import { ProfilService } from '../../services/profil.service';
import { of } from 'rxjs';

describe('ProfilViewComponent', () => {
  let component: ProfilViewComponent;
  let fixture: ComponentFixture<ProfilViewComponent>;
  let profilServiceSpy: jasmine.SpyObj<ProfilService>;
  let httpTestingController: HttpTestingController;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('ProfilService', ['getUserProfile', 'updateUserProfile']);

    await TestBed.configureTestingModule({
      imports: [
        ProfilViewComponent,
        NoopAnimationsModule
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ProfilService, useValue: spy }
      ]
    }).compileComponents();

    profilServiceSpy = TestBed.inject(ProfilService) as jasmine.SpyObj<ProfilService>;
    httpTestingController = TestBed.inject(HttpTestingController);
    profilServiceSpy.getUserProfile.and.returnValue(of({}));
  });

  afterEach(() => {
    // Après chaque test, vérifiez qu'il n'y a pas de requêtes HTTP en attente
    httpTestingController.verify();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfilViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Vous pouvez ajouter plus de tests ici...
  // Par exemple, tester le chargement du profil, la mise à jour, etc.
});
