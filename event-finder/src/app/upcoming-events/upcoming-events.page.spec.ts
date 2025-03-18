import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpcomingEventsPage } from './upcoming-events.page';

describe('UpcomingEventsPage ', () => {
  let component: UpcomingEventsPage;
  let fixture: ComponentFixture<UpcomingEventsPage>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(UpcomingEventsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
