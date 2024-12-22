import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AddEditServicesComponent } from './add-edit-services.component';

describe('AddEditServicesComponent', () => {
  let component: AddEditServicesComponent;
  let fixture: ComponentFixture<AddEditServicesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddEditServicesComponent ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddEditServicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
