import { Component } from '@angular/core';
import { BrowseCourseComponent } from "../browse-course/browse-course.component";
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-browse',
  imports: [BrowseCourseComponent, RouterModule],
  templateUrl: './browse.component.html',
  styleUrl: './browse.component.css'
})
export class BrowseComponent {

}
