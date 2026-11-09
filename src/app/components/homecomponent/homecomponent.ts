import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Authservice } from '../../services/authservice';

@Component({
  imports: [RouterLink],
  selector: 'app-homecomponent',
  styleUrl: './homecomponent.css',
  templateUrl: './homecomponent.html',
})
export class Homecomponent {
  auth = inject(Authservice);
}