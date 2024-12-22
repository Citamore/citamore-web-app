import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageCalenderComponent } from './manage-calender.component';

describe('ManageCalenderComponent', () => {
  let component: ManageCalenderComponent;
  let fixture: ComponentFixture<ManageCalenderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageCalenderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageCalenderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
