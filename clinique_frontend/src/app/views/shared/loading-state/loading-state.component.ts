import { Component, Input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading-state',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  template: `
    <div class="loading-state">
      <mat-spinner [diameter]="diameter"></mat-spinner>
      <p class="loading-message">{{ message }}</p>
    </div>
  `,
  styles: [`
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
      gap: 16px;
    }
    .loading-message {
      font-size: 14px;
      color: #9e9e9e;
      margin: 0;
    }
  `]
})
export class LoadingStateComponent {
  @Input() message = 'Chargement...';
  @Input() diameter = 40;
}
