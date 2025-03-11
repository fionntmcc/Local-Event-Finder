import { TestBed } from '@angular/core/testing';

import { TicketmasterService } from './ticketmaster.service';

describe('TicketmasterService', () => {
  let service: TicketmasterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TicketmasterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
