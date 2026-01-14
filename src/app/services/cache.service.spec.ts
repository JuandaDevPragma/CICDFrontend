import { TestBed } from '@angular/core/testing';
import { CacheService } from './cache.service';
import { PLATFORM_ID } from '@angular/core';
import { of } from 'rxjs';

describe('CacheService', () => {
  let service: CacheService;

  describe('Browser Platform', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          CacheService,
          { provide: PLATFORM_ID, useValue: 'browser' }
        ]
      });
      service = TestBed.inject(CacheService);
    });

    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should call db.get when calling get', (done) => {
      const mockValue = { data: 'test' };
      const dbSpy = jasmine.createSpyObj('IDBDatabase', ['get']);
      dbSpy.get.and.returnValue(Promise.resolve(mockValue));

      // Sobrescribir db$ para inyectar el mock
      (service as any).db$ = of(dbSpy);

      service.get('test-key').subscribe(val => {
        expect(dbSpy.get).toHaveBeenCalledWith('cache', 'test-key');
        expect(val).toEqual(mockValue);
        done();
      });
    });

    it('should call db.put when calling set', (done) => {
      const mockValue = { data: 'test' };
      const dbSpy = jasmine.createSpyObj('IDBDatabase', ['put']);
      dbSpy.put.and.returnValue(Promise.resolve());

      (service as any).db$ = of(dbSpy);

      service.set('test-key', mockValue).subscribe(() => {
        expect(dbSpy.put).toHaveBeenCalledWith('cache', mockValue, 'test-key');
        done();
      });
    });

    it('should call db.delete when calling remove', (done) => {
      const dbSpy = jasmine.createSpyObj('IDBDatabase', ['delete']);
      dbSpy.delete.and.returnValue(Promise.resolve());

      (service as any).db$ = of(dbSpy);

      service.remove('test-key').subscribe(() => {
        expect(dbSpy.delete).toHaveBeenCalledWith('cache', 'test-key');
        done();
      });
    });

    it('should call db.clear when calling clear', (done) => {
      const dbSpy = jasmine.createSpyObj('IDBDatabase', ['clear']);
      dbSpy.clear.and.returnValue(Promise.resolve());

      (service as any).db$ = of(dbSpy);

      service.clear().subscribe(() => {
        expect(dbSpy.clear).toHaveBeenCalledWith('cache');
        done();
      });
    });
  });

  describe('Server Platform', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          CacheService,
          { provide: PLATFORM_ID, useValue: 'server' }
        ]
      });
      service = TestBed.inject(CacheService);
    });

    it('should return null on get when on server', (done) => {
      service.get('any').subscribe(val => {
        expect(val).toBeNull();
        done();
      });
    });

    it('should do nothing on set when on server', (done) => {
      service.set('any', {}).subscribe(val => {
        expect(val).toBeUndefined();
        done();
      });
    });
  });
});
