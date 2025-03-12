import { TestBed } from '@angular/core/testing';

import { PredictHqService } from './predict-hq.service';

describe('PredictHqService', () => {
  let service: PredictHqService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PredictHqService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
