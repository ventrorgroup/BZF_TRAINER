import { TestBed } from '@angular/core/testing';

import { Bzf } from './bzf';

describe('Bzf', () => {
  let service: Bzf;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Bzf);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
