import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagemyNotificationsComponent } from './managemy-notifications.component';

describe('ManagemyNotificationsComponent', () => {
  let component: ManagemyNotificationsComponent;
  let fixture: ComponentFixture<ManagemyNotificationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManagemyNotificationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagemyNotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
