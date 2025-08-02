import { Component } from '@angular/core';
import { NavbarComponent } from './components/nav-bar/nav-bar.component';
import { RouterOutlet } from '@angular/router';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NavbarComponent, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'pinpotha';
   constructor(router: Router) {
    router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        console.log('NavigationEnd:', event.urlAfterRedirects);
      }
    });
  }
}
