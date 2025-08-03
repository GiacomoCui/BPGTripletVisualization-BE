import {Component, OnInit} from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';
import {Menubar} from 'primeng/menubar';
import {Fluid} from 'primeng/fluid';
import {Button} from 'primeng/button';


@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
  imports: [
    Menubar,
    Fluid,
    Button
  ],
  providers: [MessageService]
})
export class App implements OnInit {

  menuItems: MenuItem[] = [];
  items: MenuItem[] | null = null;

  constructor(private messageService: MessageService) {}

  ngOnInit() {
    this.menuItems = [
      { label: 'Portfolio' },
      { label: 'Contact' },
      { label: 'Blog' }
    ];
    this.items = [
      {
        icon: 'pi pi-pencil',
        command: () => {
          this.messageService.add({ severity: 'info', summary: 'Add', detail: 'Data Added' });
        }
      },
      {
        icon: 'pi pi-refresh',
        command: () => {
          this.messageService.add({ severity: 'success', summary: 'Update', detail: 'Data Updated' });
        }
      }
    ];
  }
}
