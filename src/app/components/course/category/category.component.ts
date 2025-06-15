import { Component, Input } from '@angular/core';
import { CourseCategory } from '../../../models/category';
import { MOCK_COURSE_CATEGORIES } from '../../../mock-data/mock-course-categories';

import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CategoryService } from '../../../services/category.service';

import { CommonModule } from '@angular/common'; // <-- import CommonModule

@Component({
  selector: 'app-category',
  standalone: true, // <-- add this
  imports: [CommonModule, FormsModule, RouterModule], // <-- add CommonModule here
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css'] // <-- fix typo here
})
export class CategoryComponent {
  @Input() categories : CourseCategory[] =[];
  @Input() viewType : 'tabs' | 'list' = 'tabs'; // Default view type is 'tabs'

  constructor(private categoryService: CategoryService) {
    this.getCategories(); // Fetch categories when the component is initialized
  }

  getCategories() {
    this.categoryService.getCategories().subscribe(data => 
      this.categories = data
    );
  }
}
