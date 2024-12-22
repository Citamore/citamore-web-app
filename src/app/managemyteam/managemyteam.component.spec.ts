import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagemyteamComponent } from './managemyteam.component';

describe('ManagemyteamComponent', () => {
  let component: ManagemyteamComponent;
  let fixture: ComponentFixture<ManagemyteamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManagemyteamComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagemyteamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
