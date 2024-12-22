import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagemyReportsComponent } from './managemy-reports.component';

describe('ManagemyReportsComponent', () => {
  let component: ManagemyReportsComponent;
  let fixture: ComponentFixture<ManagemyReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManagemyReportsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagemyReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
