import {Component, inject, OnInit} from '@angular/core';
import {MenuItem, MessageService} from 'primeng/api';
import {Router, RouterOutlet} from '@angular/router';
import {Menubar} from 'primeng/menubar';


@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
  standalone: true,
  imports: [
    Menubar,
    RouterOutlet
  ],
  providers: [MessageService]
})
export class App implements OnInit {

  menuItems: MenuItem[] = [];
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
    ];
  }

  onMenuItemClick(event: any) {
    console.log('Menu item clicked:', event);
  }
}
