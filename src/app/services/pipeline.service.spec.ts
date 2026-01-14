import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PipelineService } from './pipeline.service';
import { BuildResponse, RequestBuild } from '../types/Types';
import { environment } from '../environment/pipeline';
import { HttpErrorResponse } from '@angular/common/http';

describe('PipelineService', () => {
  let service: PipelineService;
  let httpMock: HttpTestingController;

  const mockBuildRequest: RequestBuild = {
    props: { app: 'test-app', type: 'ecr' },
    config: { url: 'http://test.com', clone: 'git clone' },
    detail: {
      branch: 'main',
      region: 'us-east-1',
      account: '123456789012'
    }
  };

  const mockBuildResponse: BuildResponse = {
    id: 'build-123',
    link: 'http://build-link.com',
    message: 'Build started'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PipelineService]
    });
    service = TestBed.inject(PipelineService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call buildApiRepo and return a BuildResponse', () => {
    service.buildApiRepo(mockBuildRequest).subscribe(response => {
      expect(response).toEqual(mockBuildResponse);
    });

    const req = httpMock.expectOne(environment.builds);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockBuildRequest);
    req.flush(mockBuildResponse);
  });

  it('should handle HTTP error when calling buildApiRepo', () => {
    const errorMessage = 'Internal Server Error';

    service.buildApiRepo(mockBuildRequest).subscribe({
      next: () => fail('should have failed with 500 error'),
      error: (error: HttpErrorResponse) => {
        expect(error.status).toBe(500);
        expect(error.error).toBe(errorMessage);
      }
    });

    const req = httpMock.expectOne(environment.builds);
    req.flush(errorMessage, { status: 500, statusText: 'Server Error' });
  });
});
