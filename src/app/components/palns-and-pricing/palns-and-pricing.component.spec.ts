import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PalnsAndPricingComponent } from './palns-and-pricing.component';

describe('PalnsAndPricingComponent', () => {
  let component: PalnsAndPricingComponent;
  let fixture: ComponentFixture<PalnsAndPricingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PalnsAndPricingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PalnsAndPricingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
