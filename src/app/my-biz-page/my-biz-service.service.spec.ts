import { TestBed } from '@angular/core/testing';

import { MyBizServiceService } from './my-biz-service.service';

describe('MyBizServiceService', () => {
  let service: MyBizServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MyBizServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
