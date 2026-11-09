import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { UsuariosService } from '../../../services/usuariosservices';
import { UsuarioDTO, UsuarioEditDTO } from '../../../models/UsuarioDTO';
import { mensajeDeError } from '../../../utils/errores';

type Campo = 'nombres' | 'apellidos' | 'correo' | 'passwordHash';

@Component({
  selector: 'app-ceditusuarioscomponent',
  imports: [MatInputModule, MatCheckboxModule, MatButtonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './ceditusuarioscomponent.html',
  styleUrl: './ceditusuarioscomponent.css',
})
export class Ceditusuarioscomponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  private us = inject(UsuariosService);

  id = 0;
  usuario: UsuarioDTO | null = null;
  errorCarga = '';
  mensaje = '';
  guardando = false;
  editando: Record<Campo, boolean> = { nombres: false, apellidos: false, correo: false, passwordHash: false };

  // todos los campos empiezan deshabilitados; una casilla habilita cada uno
  form = this.fb.nonNullable.group({
    nombres: [{ value: '', disabled: true }, Validators.required],
    apellidos: [{ value: '', disabled: true }, Validators.required],
    correo: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
    passwordHash: [{ value: '', disabled: true }, [Validators.required, Validators.minLength(8)]],
  });

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.us.buscarPorId(this.id).subscribe({
      next: (u) => {
        this.usuario = u;
        this.form.patchValue({ nombres: u.nombres, apellidos: u.apellidos, correo: u.correo });
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        this.errorCarga =
          err.status === 404 ? 'El usuario no existe.' : mensajeDeError(err, 'No se pudo cargar el usuario.');
        this.cdr.detectChanges();
      },
    });
  }

  get hayCambios(): boolean {
    return Object.values(this.editando).some(Boolean);
  }

  alternar(campo: Campo, activo: boolean): void {
    this.editando[campo] = activo;
    const control = this.form.controls[campo];
    if (activo) {
      control.enable();
    } else {
      control.disable();
      if (campo === 'passwordHash') control.reset('');
      else control.setValue(this.usuario![campo]); // vuelve al valor original
    }
  }

  guardar(): void {
    if (!this.usuario) return;
    if (!this.hayCambios) {
      this.mensaje = 'Activa al menos una casilla para editar.';
      return;
    }
    if (this.form.invalid) {
      this.mensaje = 'Revisa los campos marcados.';
      return;
    }
    const v = this.form.getRawValue();
    const datos: UsuarioEditDTO = {
      nombres: v.nombres.trim(),
      apellidos: v.apellidos.trim(),
      correo: v.correo.trim(),
    };
    if (this.editando.passwordHash) datos.passwordHash = v.passwordHash;

    this.guardando = true;
    this.us.actualizar(this.id, datos).subscribe({
      next: () =>
        this.router.navigate(['/usuarios/listar'], { state: { mensaje: 'Usuario actualizado correctamente.' } }),
      error: (err: HttpErrorResponse) => {
        this.mensaje = mensajeDeError(err, 'No se pudieron guardar los cambios.', 'El correo ya está registrado por otro usuario.');
        this.guardando = false;
        this.cdr.detectChanges();
      },
    });
  }
}