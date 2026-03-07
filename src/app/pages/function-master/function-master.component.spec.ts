import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FunctionMasterComponent } from './function-master.component';

describe('FunctionMasterComponent', () => {
  let component: FunctionMasterComponent;
  let fixture: ComponentFixture<FunctionMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FunctionMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FunctionMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
