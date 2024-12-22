import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone:false,
  styleUrls: ['./app.component.scss']  // Use 'styleUrls' (plural) here
})
export class AppComponent {
  title = 'book-my-service-web';
}
