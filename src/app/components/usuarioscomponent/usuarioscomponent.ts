import { ChangeDetectorRef, Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButton } from '@angular/material/button';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsuariosService } from '../../services/usuariosservices';
import { Loginservice } from '../../services/loginservice';
import { MatSelectModule } from '@angular/material/select';

@Component({
  imports: [MatInputModule, MatFormFieldModule, MatButton, ReactiveFormsModule, MatSelectModule],
  selector: 'app-usuarioscomponent',
  styleUrl: './usuarioscomponent.css',
  templateUrl: './usuarioscomponent.html',
})
export class Usuarioscomponent {
  @Input() administracion = false;
  @Output() volverLogin = new EventEmitter<void>();
  @Output() cuentaCreada = new EventEmitter<void>();

  mensaje: string = '';
  guardando = false;
  private auth = inject(Loginservice);
  get esAdministracion(): boolean {
    return this.administracion && this.auth.hasAnyRole(['ADMIN']);
  }

  private cs = inject(UsuariosService);
  private cdr = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);

    form = this.fb.nonNullable.group({
    nombres: ['', Validators.required],
    apellidos: ['', Validators.required],
    correo: ['', [Validators.required, Validators.email]],
    passwordHash: ['', [Validators.required, Validators.minLength(8)]],
    rol: ['USUARIA'],
    estado: [true],
  });

  registrarUsuario() {
    if (this.guardando) return;

    if (this.form.invalid) {
      this.mensaje = 'Completa correctamente todos los campos';
      return;
    }

    const v = this.form.getRawValue();
    const datos = {
      nombres: v.nombres.trim(),
      apellidos: v.apellidos.trim(),
      correo: v.correo.trim(),
      passwordHash: v.passwordHash,
      ...(this.esAdministracion ? { rol: v.rol, estado: v.estado } : {}),
    };

    this.guardando = true;
    this.cs.registrar(datos).subscribe({
      next: () => {
        this.guardando = false;
        this.cuentaCreada.emit();
      },
      error: (err) => {
        this.guardando = false;
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
