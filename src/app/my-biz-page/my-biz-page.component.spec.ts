import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyBizPageComponent } from './my-biz-page.component';

describe('MyBizPageComponent', () => {
  let component: MyBizPageComponent;
  let fixture: ComponentFixture<MyBizPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyBizPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyBizPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
