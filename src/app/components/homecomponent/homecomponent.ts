import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Loginservice } from '../../services/loginservice';

@Component({
  imports: [RouterLink],
  selector: 'app-homecomponent',
  styleUrl: './homecomponent.css',
  templateUrl: './homecomponent.html',
})
export class Homecomponent {
  constructor(private readonly loginService: Loginservice) { }

  get esProgramador(): boolean {
    return this.loginService.hasAnyRole(['PROGRAMADOR']);
  }
}