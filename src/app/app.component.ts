import { Component, OnInit } from '@angular/core';
import { Router, NavigationStart, NavigationEnd, Event as RouterEvent } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="container">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
  `]
})
export class AppComponent implements OnInit {
  title = 'jeux-olympiques-frontend';

  constructor(private router: Router) {}

  ngOnInit() {
    // Surveillance des événements de navigation
    this.router.events.pipe(
      filter((event): event is RouterEvent => event instanceof NavigationStart || event instanceof NavigationEnd)
    ).subscribe(event => {
      console.log('Navigation Event:', event.constructor.name, 'URL:', (event as any).url);
    });
  }
}
