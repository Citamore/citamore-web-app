import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagemyBillingComponent } from './managemy-billing.component';

describe('ManagemyBillingComponent', () => {
  let component: ManagemyBillingComponent;
  let fixture: ComponentFixture<ManagemyBillingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManagemyBillingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagemyBillingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
