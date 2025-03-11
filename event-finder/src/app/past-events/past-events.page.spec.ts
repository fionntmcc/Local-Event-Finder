import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PastEventsPage } from './past-events.page';

describe('PastEventsPage', () => {
  let component: PastEventsPage;
  let fixture: ComponentFixture<PastEventsPage>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(PastEventsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
