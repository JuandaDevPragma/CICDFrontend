import {Inject, Injectable, PLATFORM_ID} from '@angular/core';
import {DBSchema, IDBPDatabase, openDB} from 'idb';
import {defer, from, map, Observable, of, switchMap} from 'rxjs';
import {isPlatformBrowser} from '@angular/common';

interface AppCacheDB extends DBSchema {
  cache: {
    key: string;
    value: any;
  };
}

@Injectable({
  providedIn: 'root'
})
export class CacheService {

  private db$: Observable<IDBPDatabase<AppCacheDB> | null>;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.db$ = isPlatformBrowser(platformId)
      ? defer(() =>
        from(
          openDB<AppCacheDB>('app-cache-db', 1, {
            upgrade(db) {
              if (!db.objectStoreNames.contains('cache')) {
                db.createObjectStore('cache');
              }
            },
          })
        )
      )
      : of(null);
  }

  get<T>(key: string): Observable<T | null> {
    return this.db$.pipe(
      switchMap(db =>
        db ? from(db.get('cache', key)).pipe(map(v => v ?? null)) : of(null)
      )
    );
  }

  set<T>(key: string, value: T): Observable<void> {
    return this.db$.pipe(
      switchMap(db =>
        db ? from(db.put('cache', value, key)).pipe(map(() => void 0)) : of(void 0)
      )
    );
  }

  remove(key: string): Observable<void> {
    return this.db$.pipe(
      switchMap(db =>
        db ? from(db.delete('cache', key)).pipe(map(() => void 0)) : of(void 0)
      )
    );
  }

  clear(): Observable<void> {
    return this.db$.pipe(
      switchMap(db =>
        db ? from(db.clear('cache')).pipe(map(() => void 0)) : of(void 0)
      )
    );
  }
}
