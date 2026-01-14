import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {concatMap, exhaustMap, map, Observable, of, shareReplay, Subject, switchMap, tap} from 'rxjs';
import {CacheEntry, GetBuildRepo, Repositories, SingleRepoState} from '../types/Types';
import {environment} from '../environment/pipeline';
import {CacheService} from './cache.service';

@Injectable({
  providedIn: 'root'
})
class RepositoryService {

  private trigger$ = new Subject<boolean>();
  private repoTrigger$ = new Subject<void>();

  private refresh$ = this.trigger$.pipe(
    exhaustMap(val => this.findAllRepositories(val)),
    shareReplay(1)
  );

  private refreshRepo$ = this.repoTrigger$.pipe();

  private readonly KEY = 'repos';
  private readonly TTL = 1000 * 60 * 60 * 24;

  constructor(private client: HttpClient, private cacheService: CacheService) {
    this.refresh$.subscribe();
    this.refreshRepo$.subscribe();
  }

  getRepoStateByApp(app: string): Observable<SingleRepoState> {
    return this.client.get<SingleRepoState>(`${environment.repos}/${app}`)
      .pipe(map(r => r as SingleRepoState));
  }

  findRepoById(app: string): Observable<GetBuildRepo | undefined>{
    return this.cacheService.get<CacheEntry<Repositories>>(this.KEY)
      .pipe(map(r => {
        if(!r?.value) return undefined;
        return {
          app: r.value.repos.find(repo => repo.props.app === app),
          params: r.value.params
        } as GetBuildRepo;
      }));
  }

  private findAllRepositories(forceRefresh = false): Observable<Repositories> {
    return this.cacheService
      .get<CacheEntry<Repositories>>(this.KEY)
      .pipe(
        switchMap(entry => {
          const isValid =
            !!entry && Date.now() - entry.timestamp < entry.ttl;

          // ✅ CACHE HIT → solo cache
          if (isValid && !forceRefresh) {
            return of(entry.value);
          }

          // ❌ CACHE MISS → API + guardar
          return this.getApiRepos().pipe(
            concatMap(data =>
               this.cacheService
                .set(this.KEY, {
                  value: data,
                  timestamp: Date.now(),
                  ttl: this.TTL,
                })
                .pipe(
                  tap(() => this.repoTrigger$.next()),
                  map(() => data))
            )
          );
        })
      );
  }

  loadData(force = true): void {
    this.trigger$.next(force);
  }

  /** Solo si alguien necesita escuchar */
  onRefresh(): Observable<Repositories> {
    return this.refresh$;
  }

  onRefreshRepo(): Observable<void> {
    return this.refreshRepo$;
  }


  private getApiRepos(): Observable<Repositories> {
    return this.client.get<Repositories>(environment.repos)
      .pipe(map(r => r as Repositories));
  }

}

export default RepositoryService
