import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Loginservice } from '../../services/loginservice';
import { Usuarioscomponent } from '../usuarioscomponent/usuarioscomponent';

@Component({
  selector: 'app-logincomponent',
  imports: [ReactiveFormsModule, Usuarioscomponent],
  templateUrl: './logincomponent.html',
  styleUrl: './logincomponent.css',
})
export class Logincomponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(Loginservice);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly form = this.fb.nonNullable.group({
    correo: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  mensaje = signal('');
  submitting = signal(false);
  mostrarRegistro = signal(false);

  ngOnInit(): void {
    this.mostrarRegistro.set(this.route.snapshot.data['registroInicial'] === true);
  }

  submit(): void {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.mensaje.set('');
    this.submitting.set(true);

    const { correo, password } = this.form.getRawValue();

    this.auth.login({ correo: correo.trim(), password }).subscribe({
      next: () => {
        this.submitting.set(false);

        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        const destination =
          returnUrl?.startsWith('/') && !returnUrl.startsWith('//') && returnUrl !== '/'
            ? returnUrl
            : '/inicio';

        void this.router.navigateByUrl(destination);
      },
      error: (error: HttpErrorResponse) => {
        this.submitting.set(false);
        this.form.controls.password.reset('');

        if (error.status === 401) {
          this.mensaje.set('Correo o contraseña incorrectos, o cuenta inactiva.');
        } else if (error.status === 0) {
          this.mensaje.set(
            'No se pudo conectar con FemFitAI. Verifica la conexión con el servidor.',
          );
        } else {
          this.mensaje.set('No se pudo iniciar sesión.');
        }
      },
    });
  }

  volverLanding(): void {
    void this.router.navigateByUrl('/');
  }

  abrirRegistro(): void {
    this.mostrarRegistro.set(true);
    this.mensaje.set('');
  }

  volverLogin(): void {
    this.mostrarRegistro.set(false);
    this.mensaje.set('');
  }

  cuentaCreada(): void {
    this.mostrarRegistro.set(false);
    this.mensaje.set('Cuenta creada correctamente.');
  }
}
