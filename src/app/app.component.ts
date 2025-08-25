import { Component } from '@angular/core';
import { NavbarComponent } from './components/nav-bar/nav-bar.component';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NavbarComponent, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'pinpotha';
  constructor(private router: Router) {
    this.router.navigate(['/merits']);
  }
}
