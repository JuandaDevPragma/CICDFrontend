import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import RepositoryService from '../services/repository.service';
import { of, throwError } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Repositories } from '../types/Types';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let repoServiceSpy: jasmine.SpyObj<RepositoryService>;

  const mockRepositories: Repositories = {
    params: { accounts: ['123'], regions: ['us-east-1'] },
    repos: [
      {
        props: { app: 'app-one', type: 'ecr' },
        config: { url: '', clone: '' },
        branches: ['main']
      },
      {
        props: { app: 'app-two', type: 'ecr' },
        config: { url: '', clone: '' },
        branches: ['main']
      }
    ]
  };

  beforeEach(async () => {
    repoServiceSpy = jasmine.createSpyObj('RepositoryService', ['onRefresh', 'loadData']);
    repoServiceSpy.onRefresh.and.returnValue(of(mockRepositories));

    await TestBed.configureTestingModule({
      imports: [DashboardComponent, FormsModule],
      providers: [
        { provide: RepositoryService, useValue: repoServiceSpy }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load data on init', () => {
    expect(repoServiceSpy.onRefresh).toHaveBeenCalled();
    expect(repoServiceSpy.loadData).toHaveBeenCalledWith(false);
    expect(component.data.length).toBe(2);
    expect(component.temp.length).toBe(2);
  });

  it('should filter data based on value', () => {
    component.value = 'one';
    component.filterData();
    expect(component.temp.length).toBe(1);
    expect(component.temp[0].props.app).toBe('app-one');
  });

  it('should show all data if filter value is empty', () => {
    component.value = '';
    component.filterData();
    expect(component.temp.length).toBe(2);
  });

  it('should track by app name and index', () => {
    const result = component.trackByRepoId(0, mockRepositories.repos[0]);
    expect(result).toBe('app-one-0');
  });

  it('should handle error on refresh', () => {
    repoServiceSpy.onRefresh.and.returnValue(throwError(() => new Error('API Error')));
    component.ngOnInit();
    expect(component.data).toEqual([]);
    expect(component.temp).toEqual([]);
  });
});
