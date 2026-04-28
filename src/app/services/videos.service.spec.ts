import { TestBed } from '@angular/core/testing';

import { VideosService } from './videos.service';

describe('VideosService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: VideosService = TestBed.inject(VideosService);
    expect(service).toBeTruthy();
  });
});
