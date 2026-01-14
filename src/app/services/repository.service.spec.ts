import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import RepositoryService from './repository.service';
import { CacheService } from './cache.service';
import { of } from 'rxjs';
import { environment } from '../environment/pipeline';
import { Repositories } from '../types/Types';

describe('RepositoryService', () => {
  let service: RepositoryService;
  let httpMock: HttpTestingController;
  let cacheServiceSpy: jasmine.SpyObj<CacheService>;

  const mockRepositories: Repositories = {
    params: { accounts: ['123'], regions: ['us-east-1'] },
    repos: [{ props: { app: 'test-app', type: 'ecr' }, config: { url: '', clone: '' }, branches: [] }]
  };

  beforeEach(() => {
    cacheServiceSpy = jasmine.createSpyObj('CacheService', ['get', 'set']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        RepositoryService,
        { provide: CacheService, useValue: cacheServiceSpy }
      ]
    });
    service = TestBed.inject(RepositoryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return cached data if valid and not forced', (done) => {
    const cachedEntry = {
      value: mockRepositories,
      timestamp: Date.now(),
      ttl: 1000 * 60 * 60 * 24
    };
    cacheServiceSpy.get.and.returnValue(of(cachedEntry));

    service.onRefresh().subscribe(data => {
      expect(data).toEqual(mockRepositories);
      done();
    });

    service.loadData(false);
  });

  it('should fetch from API if cache is invalid or forced', (done) => {
    cacheServiceSpy.get.and.returnValue(of(null));
    cacheServiceSpy.set.and.returnValue(of(undefined));

    service.onRefresh().subscribe(data => {
      expect(data).toEqual(mockRepositories);
      done();
    });

    service.loadData(true);

    const req = httpMock.expectOne(environment.repos);
    expect(req.request.method).toBe('GET');
    req.flush(mockRepositories);

    expect(cacheServiceSpy.set).toHaveBeenCalled();
  });

  it('should find repo by id from cache', (done) => {
    const cachedEntry = {
      value: mockRepositories,
      timestamp: Date.now(),
      ttl: 1000 * 60 * 60 * 24
    };
    cacheServiceSpy.get.and.returnValue(of(cachedEntry));

    service.findRepoById('test-app').subscribe(result => {
      expect(result?.app).toEqual(mockRepositories.repos[0]);
      expect(result?.params).toEqual(mockRepositories.params);
      done();
    });
  });

  it('should return undefined if repo id not found in cache', (done) => {
    cacheServiceSpy.get.and.returnValue(of(null));

    service.findRepoById('unknown').subscribe(result => {
      expect(result).toBeUndefined();
      done();
    });
  });

  it('should return undefined if cache has no value', (done) => {
    cacheServiceSpy.get.and.returnValue(of({ value: null } as any));

    service.findRepoById('test-app').subscribe(result => {
      expect(result).toBeUndefined();
      done();
    });
  });
});
