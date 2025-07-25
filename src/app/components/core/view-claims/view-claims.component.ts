import { Component, OnInit } from '@angular/core';
import { LoginService } from '../../../services/login.service';
import { Claim } from '../../../models/claim';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-view-claims',
  standalone: true, // Update to standalone if using Angular 14+
  imports: [CommonModule],
  templateUrl: './view-claims.component.html',
  styleUrls: ['./view-claims.component.css']
})
export class ViewClaimsComponent implements OnInit {
  claims: Claim[] = [];
  displayedColumns: string[] = ['claim', 'value', 'description'];

  constructor(private loginService: LoginService) { }

  ngOnInit(): void {
    this.loginService.claims$.subscribe((c) => {
      this.claims = c;
      console.log('Claims received:', c); // For debugging
    });
  }
}