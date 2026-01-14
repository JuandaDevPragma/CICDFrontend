import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RepositoryComponent } from './repository.component';
import { ActivatedRoute, Router } from '@angular/router';
import { PipelineService } from '../services/pipeline.service';
import RepositoryService from '../services/repository.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { GetBuildRepo } from '../types/Types';
import { HttpErrorResponse } from '@angular/common/http';

describe('RepositoryComponent', () => {
  let component: RepositoryComponent;
  let fixture: ComponentFixture<RepositoryComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let pipelineServiceSpy: jasmine.SpyObj<PipelineService>;
  let repoServiceSpy: jasmine.SpyObj<RepositoryService>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

  const mockRepoData: GetBuildRepo = {
    app: {
      props: { app: 'test-app', type: 'ecr', link: 'http://old-link.com' },
      config: { url: 'http://test.com', clone: 'git clone' },
      branches: ['main', 'develop']
    },
    params: {
      accounts: ['123456789012'],
      regions: ['us-east-1', 'us-west-2']
    }
  };

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    pipelineServiceSpy = jasmine.createSpyObj('PipelineService', ['buildApiRepo']);
    repoServiceSpy = jasmine.createSpyObj('RepositoryService', ['onRefreshRepo', 'findRepoById']);
    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    repoServiceSpy.onRefreshRepo.and.returnValue(of(undefined));
    repoServiceSpy.findRepoById.and.returnValue(of(mockRepoData));

    await TestBed.configureTestingModule({
      imports: [
        RepositoryComponent,
        MatSnackBarModule,
        NoopAnimationsModule,
        ReactiveFormsModule
      ],
      providers: [
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { queryParams: { repository: 'test-app' } }
          }
        },
        { provide: PipelineService, useValue: pipelineServiceSpy },
        { provide: RepositoryService, useValue: repoServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RepositoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load repo data on init', () => {
    expect(repoServiceSpy.findRepoById).toHaveBeenCalledWith('test-app');
    expect(component.repoData).toEqual(mockRepoData.app);
    expect(component.params).toEqual(mockRepoData.params);
  });

  it('should go back if repo not found', () => {
    repoServiceSpy.findRepoById.and.returnValue(of(undefined));
    routerSpy.navigate.and.returnValue(Promise.resolve(true));
    component.loadRepo();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should validate form and show error snackbar if invalid', () => {
    component.BranchFormControl.setValue('');
    component.pushBuild();
    expect(snackBarSpy.open).toHaveBeenCalledWith(jasmine.stringMatching(/aun no has seleccionado/), '😰', jasmine.any(Object));
  });

  it('should call pipeline service and show success snackbar on valid form', () => {
    component.BranchFormControl.setValue('main');
    component.RegionFormControl.setValue('us-east-1');
    component.AccountFormControl.setValue('123456789012');

    const mockResponse = { id: '123', link: 'http://new-link.com', message: 'Success' };
    pipelineServiceSpy.buildApiRepo.and.returnValue(of(mockResponse));

    component.pushBuild();

    expect(pipelineServiceSpy.buildApiRepo).toHaveBeenCalled();
    expect(snackBarSpy.open).toHaveBeenCalledWith(jasmine.stringMatching(/Excelente/), '🚀', jasmine.any(Object));
    expect(component.enableLink).toBeTrue();
    expect(component.link).toBe('http://new-link.com');
  });

  it('should handle error from pipeline service with custom message', () => {
    component.BranchFormControl.setValue('main');
    component.RegionFormControl.setValue('us-east-1');
    component.AccountFormControl.setValue('123456789012');

    const errorResponse = new HttpErrorResponse({
      error: { message: 'Build error' },
      status: 500
    });
    pipelineServiceSpy.buildApiRepo.and.returnValue(throwError(() => errorResponse));

    component.pushBuild();

    expect(snackBarSpy.open).toHaveBeenCalledWith('Build error', '😰', jasmine.any(Object));
  });

  it('should handle error from pipeline service with default message', () => {
    component.BranchFormControl.setValue('main');
    component.RegionFormControl.setValue('us-east-1');
    component.AccountFormControl.setValue('123456789012');

    pipelineServiceSpy.buildApiRepo.and.returnValue(throwError(() => new Error('Generic error')));

    component.pushBuild();

    expect(snackBarSpy.open).toHaveBeenCalledWith('Lo sentimos, no pudimos procesar tu solicitud, intentalo mas tarde', '😰', jasmine.any(Object));
  });

  it('should open link in new window', () => {
    spyOn(window, 'open');
    component.link = 'http://test.com';
    component.openLink();
    expect(window.open).toHaveBeenCalledWith('http://test.com', '_blank');
  });
});
