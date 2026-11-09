
import { ChangeDetectorRef, Component, EventEmitter, Output, inject } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButton } from '@angular/material/button';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsuariosService } from '../../services/usuariosservices';

@Component({
  imports: [
    MatInputModule,
    MatFormFieldModule,
    MatButton,
    ReactiveFormsModule,
  ],
  selector: 'app-usuarioscomponent',
  styleUrl: './usuarioscomponent.css',
  templateUrl: './usuarioscomponent.html',
})
export class Usuarioscomponent {

  @Output() volverLogin = new EventEmitter<void>();
  @Output() cuentaCreada = new EventEmitter<void>();

  mensaje: string = '';
  form: any;

  private cs = inject(UsuariosService);
  private cdr = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);

  ngOnInit() {
    this.form = this.fb.group({
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      passwordHash: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  registrarUsuario() {

    if (this.form.invalid) {
      this.mensaje = 'Completa correctamente todos los campos';
      return;
    }

    const datos = {
      nombres: this.form.value.nombres.trim(),
      apellidos: this.form.value.apellidos.trim(),
      correo: this.form.value.correo.trim(),
      passwordHash: this.form.value.passwordHash
    };

    this.cs.registrar(datos).subscribe({
      next: () => 
        this.cuentaCreada.emit(),
      error: (err) => {
        console.log('Ocurrió un error al registrar el usuario', err);

        if (err.status === 409) {
          this.mensaje = 'El correo ya se encuentra registrado';
        } else if (err.status === 0) {
          this.mensaje = 'No se pudo conectar con el servidor';
        } else {
          this.mensaje = err.error?.message || 'No se pudo registrar la cuenta';
        }

        this.cdr.detectChanges();
      },
    });
  }

  regresar(): void {
    this.volverLogin.emit();
  }
}
