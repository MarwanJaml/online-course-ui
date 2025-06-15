import { Component } from '@angular/core';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { PalnsAndPricingComponent } from '../palns-and-pricing/palns-and-pricing.component';
import { CategoryComponent } from "../course/category/category.component";
import { BrowseCourseComponent } from "../course/browse-course/browse-course.component";

@Component({
  selector: 'app-home',
  imports: [CarouselModule, PalnsAndPricingComponent, CategoryComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

}
