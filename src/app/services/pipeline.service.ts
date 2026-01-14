import {Injectable} from '@angular/core';
import {map, Observable} from 'rxjs';
import {BuildResponse, RequestBuild} from '../types/Types';
import {environment} from '../environment/pipeline';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PipelineService {

  constructor(private client: HttpClient) { }

  public buildApiRepo(build: RequestBuild): Observable<BuildResponse> {
    return this.client.post<BuildResponse>(environment.builds, build)
      .pipe(map(r => r as BuildResponse));
  }
}
