import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardRepositoryComponent } from './card-repository.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RepoDetailResponse } from '../../types/Types';

describe('CardRepositoryComponent', () => {
  let component: CardRepositoryComponent;
  let fixture: ComponentFixture<CardRepositoryComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

  const mockRepo: RepoDetailResponse = {
    props: { app: 'test-app', type: 'ecr' },
    config: { url: 'http://test.com', clone: 'git clone' },
    branches: ['main']
  };

  const mockParams = {
    accounts: ['123456789012'],
    regions: ['us-east-1']
  };

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    routerSpy.navigate.and.returnValue(Promise.resolve(true));
    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      declarations: [CardRepositoryComponent],
      imports: [MatSnackBarModule, NoopAnimationsModule],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: MatSnackBar, useValue: snackBarSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardRepositoryComponent);
    component = fixture.componentInstance;
    component.repositoryDetail = mockRepo;
    component.params = mockParams;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to /Repository when branches exist', () => {
    component.navigate();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/Repository'], {
      queryParams: { repository: 'test-app' }
    });
  });

  it('should open snackbar when no branches exist', () => {
    component.repositoryDetail = { ...mockRepo, branches: [] };
    component.navigate();
    expect(snackBarSpy.open).toHaveBeenCalledWith(
      '¡Ups! este repositorio no cuenta con ramas aun',
      '😰',
      jasmine.any(Object)
    );
  });
});
