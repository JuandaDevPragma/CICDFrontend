import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import RepositoryService from './services/repository.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('AppComponent', () => {
  let repoServiceSpy: jasmine.SpyObj<RepositoryService>;

  beforeEach(async () => {
    repoServiceSpy = jasmine.createSpyObj('RepositoryService', ['loadData']);

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        { provide: RepositoryService, useValue: repoServiceSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'pipeline' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('pipeline');
  });

  it('should call loadData on refreshData', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    app.refreshData();
    expect(repoServiceSpy.loadData).toHaveBeenCalledWith(true);
  });
});
