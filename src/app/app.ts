import {Component, inject, OnInit} from '@angular/core';
import {MenuItem, MessageService} from 'primeng/api';
import {Menubar} from 'primeng/menubar';
import {Router, RouterOutlet} from '@angular/router';


@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
  imports: [
    Menubar,
    RouterOutlet
  ],
  providers: [MessageService]
})
export class App implements OnInit {

  menuItems: MenuItem[] = [];
  items: MenuItem[] | null = null;
  private router = inject(Router);

  constructor() {
  }

  ngOnInit() {
    this.menuItems = [
      {
        label: 'Homepage',
        command: () => {
          this.router.navigate(['']);
        }
      },
      {
        label: 'Triplets From ASes',
        command: () => {
          this.router.navigate(['/tripletsFromASes']);
        }
      },
      {label: 'Blog'}
    ];
  }

  onMenuItemClick(event: any) {
    console.log('Menu item clicked:', event);
  }
}
