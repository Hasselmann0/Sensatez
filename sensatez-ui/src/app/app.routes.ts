import { Routes } from '@angular/router';
import { authGuard } from './presentation/guards/auth.guard';
import { MainShellComponent } from './presentation/layout/main-shell.component';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./presentation/pages/login/login.page').then(m => m.LoginPageComponent)
  },
  {
    path: '',
    component: MainShellComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'painel',
        loadComponent: () =>
          import('./presentation/pages/financial-hub/financial-hub.page').then(
            m => m.FinancialHubPageComponent
          )
      },
      {
        path: 'calendario',
        redirectTo: 'painel',
        pathMatch: 'full'
      },
      {
        path: 'imoveis',
        loadComponent: () =>
          import('./presentation/pages/properties/properties.page').then(
            m => m.PropertiesPageComponent
          )
      },
      {
        path: 'contratos',
        loadComponent: () =>
          import('./presentation/pages/contracts/contracts.page').then(
            m => m.ContractsPageComponent
          )
      },
      {
        path: 'proprietarios',
        loadComponent: () =>
          import('./presentation/pages/owners/owners.page').then(m => m.OwnersPageComponent)
      },
      {
        path: 'inquilinos',
        loadComponent: () =>
          import('./presentation/pages/tenants/tenants.page').then(m => m.TenantsPageComponent)
      },
      {
        path: '',
        redirectTo: 'painel',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'painel'
  }
];

