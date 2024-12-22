import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageMypageComponent } from './manage-mypage.component';

describe('ManageMypageComponent', () => {
  let component: ManageMypageComponent;
  let fixture: ComponentFixture<ManageMypageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageMypageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageMypageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
