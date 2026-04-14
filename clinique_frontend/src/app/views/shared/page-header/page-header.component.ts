import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="page-header-wrapper">
      <div class="page-header-info">
        <div class="page-header-title-row">
          @if (icon) {
            <mat-icon class="page-header-icon">{{ icon }}</mat-icon>
          }
          <h1 class="page-header-title">{{ title }}</h1>
        </div>
        @if (subtitle) {
          <p class="page-header-subtitle">{{ subtitle }}</p>
        }
      </div>
      <div class="page-header-actions">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .page-header-wrapper {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 16px;
    }
    .page-header-title-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .page-header-icon {
      color: #1976d2;
      font-size: 28px;
      width: 28px;
      height: 28px;
    }
    .page-header-title {
      font-size: 24px;
      font-weight: 500;
      color: #212121;
      margin: 0;
    }
    .page-header-subtitle {
      font-size: 14px;
      color: #9e9e9e;
      margin: 4px 0 0 0;
    }
    .page-header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }
  `]
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() icon = '';
}
