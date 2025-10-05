import { Routes } from '@angular/router';
	import { authGuard } from './auth.guard';

export const routes: Routes = [
	{
		path: '',
		loadComponent: () => import('./component/login/login.component').then(m => m.LoginComponent)
	},
	{
		path: '',
		loadComponent: () => import('./component/layout/layout.component').then(m => m.LayoutComponent),
		canActivate: [authGuard(['Administrador', 'Cliente'])],
		children: [
			{
				path: 'admin',
				loadComponent: () => import('./component/home/home.component').then(m => m.HomeComponent),
				canActivate: [authGuard(['Administrador'])]
			},
			{
				path: 'home',
				loadComponent: () => import('./component/home/home.component').then(m => m.HomeComponent),
				canActivate: [authGuard(['Cliente'])]
			},
			{
				path: 'usuarios',
				loadComponent: () => import('./component/administracion/usuarios/usuario.component').then(m => m.UsuarioComponent),
				canActivate: [authGuard(['Administrador'])]
			},
			{
				path: 'empresa',
				loadComponent: () => import('./component/catalogos/empresa.component').then(m => m.EmpresaComponent),
				canActivate: [authGuard(['Administrador'])]
			},
			{
				path: 'perfil',
				loadComponent: () => import('./component/administracion/perfil/perfil.component').then(m => m.PerfilComponent),
				canActivate: [authGuard(['Administrador'])]
			}
		]
	}
];