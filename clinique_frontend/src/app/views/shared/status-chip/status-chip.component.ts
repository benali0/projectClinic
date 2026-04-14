import { Component, Input } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-status-chip',
  standalone: true,
  imports: [MatChipsModule, MatIconModule],
  template: `
    <mat-chip [class]="'status-chip status-' + normalizedStatus" highlighted>
      <mat-icon matChipAvatar>{{ icon }}</mat-icon>
      {{ label }}
    </mat-chip>
  `,
  styles: [`
    .status-chip {
      font-size: 12px;
      font-weight: 600;
    }
    .status-confirme, .status-paye {
      --mdc-chip-elevated-container-color: #e8f5e9;
      --mdc-chip-label-text-color: #2e7d32;
    }
    .status-en_attente, .status-en-attente {
      --mdc-chip-elevated-container-color: #fff8e1;
      --mdc-chip-label-text-color: #f57f17;
    }
    .status-annule {
      --mdc-chip-elevated-container-color: #ffebee;
      --mdc-chip-label-text-color: #d32f2f;
    }
    .status-termine {
      --mdc-chip-elevated-container-color: #e1f5fe;
      --mdc-chip-label-text-color: #0288d1;
    }
    .status-non_venu, .status-non-venu {
      --mdc-chip-elevated-container-color: #eeeeee;
      --mdc-chip-label-text-color: #757575;
    }
    mat-icon {
      font-size: 16px !important;
      width: 16px !important;
      height: 16px !important;
    }
  `]
})
export class StatusChipComponent {
  @Input() status = '';
  @Input() label = '';

  get normalizedStatus(): string {
    return (this.status || '').toLowerCase().replace(/ /g, '_');
  }

  get icon(): string {
    const s = this.normalizedStatus;
    if (s === 'confirme' || s === 'paye') return 'check_circle';
    if (s === 'en_attente' || s === 'en-attente') return 'schedule';
    if (s === 'annule') return 'cancel';
    if (s === 'termine') return 'task_alt';
    if (s === 'non_venu' || s === 'non-venu') return 'person_off';
    return 'info';
  }
}
