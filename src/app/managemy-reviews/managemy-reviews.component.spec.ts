import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagemyReviewsComponent } from './managemy-reviews.component';

describe('ManagemyReviewsComponent', () => {
  let component: ManagemyReviewsComponent;
  let fixture: ComponentFixture<ManagemyReviewsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManagemyReviewsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagemyReviewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
