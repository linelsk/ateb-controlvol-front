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
			}
		]
	},
	// Puedes agregar más rutas aquí
];