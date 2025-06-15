import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { CategoryComponent } from './components/course/category/category.component';
import { CourseByCategoryComponent } from './components/course/course-by-category/course-by-category.component';
import { BrowseComponent } from './components/course/browse/browse.component';
import { CourseDetailsComponent } from './components/course/course-details/course-details.component';

export const routes: Routes = [

  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent ,  data: { animation: 'HomePage' }},
  { path: 'course/category', component: CategoryComponent },
  { path: 'course/course-details', component: CourseDetailsComponent },
  { path: 'course/browse', component: BrowseComponent },
  { path: 'course/category/:categoryId', component: CourseByCategoryComponent },
];
