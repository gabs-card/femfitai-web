import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { UsuariosService } from '../../../services/usuariosservices';
import { Authservice } from '../../../services/authservice';

@Component({
  imports: [MatInputModule, MatFormFieldModule, MatSelectModule, MatCheckboxModule,
    MatButtonModule, ReactiveFormsModule],
  selector: 'app-ceditusuarioscomponent',
  styleUrl: './ceditusuarioscomponent.css',
  templateUrl: './ceditusuarioscomponent.html',
})
export class Ceditusuarioscomponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  private us = inject(UsuariosService);
  private auth = inject(Authservice);

  id = 0;
  mensaje = '';
  roles = ['PROGRAMADOR', 'TESTER'];

  form = this.fb.nonNullable.group({
    nombres: ['', Validators.required],
    apellidos: ['', Validators.required],
    correo: ['', [Validators.required, Validators.email]],
    rol: ['TESTER', Validators.required],
    estado: [true],
    passwordHash: ['', [Validators.required, Validators.minLength(8)]],
  });

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.us.buscarPorId(this.id).subscribe({
      next: (u) => {
        this.form.patchValue({
          nombres: u.nombres,
          apellidos: u.apellidos,
          correo: u.correo,
          rol: u.rol,
          estado: u.estado ?? true,
        });
        // En tu propia cuenta no puedes cambiar rol ni estado (evita quedarte sin acceso)
        if (u.idUsuario === this.auth.idUsuario()) {
          this.form.controls.rol.disable();
          this.form.controls.estado.disable();
        }
        this.cdr.detectChanges();
      },
      error: (e: HttpErrorResponse) => {
        this.mensaje = e.status === 404 ? 'El usuario no existe.' : 'No se pudo cargar el usuario.';
        this.cdr.detectChanges();
      },
    });
  }

  guardar(): void {
    if (this.form.invalid) {
      this.mensaje = 'Completa correctamente los campos. La contraseña es obligatoria (mínimo 8 caracteres).';
      return;
    }
    const v = this.form.getRawValue();
    this.us.actualizar(this.id, {
      nombres: v.nombres.trim(),
      apellidos: v.apellidos.trim(),
      correo: v.correo.trim(),
      rol: v.rol,
      estado: v.estado,
      passwordHash: v.passwordHash,
    }).subscribe({
      next: () => this.router.navigate(['/usuarios/listar']),
      error: (e: HttpErrorResponse) => {
        this.mensaje =
          e.status === 409 ? 'El correo ya está registrado por otro usuario.'
          : e.status === 403 ? 'No tienes permiso para editar usuarios.'
          : e.status === 0 ? 'No se pudo conectar con el servidor.'
          : e.error?.message || 'No se pudieron guardar los cambios.';
        this.cdr.detectChanges();
      },
    });
  }

  cancelar(): void {
    this.router.navigate(['/usuarios/listar']);
  }
}