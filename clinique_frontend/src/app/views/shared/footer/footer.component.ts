import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <footer class="app-footer">
      <div class="footer-container">
        <div class="footer-brand">
          <img src="logo.svg" alt="Mediterranean Clinic" width="28" height="28">
          <span>Mediterranean Clinic</span>
        </div>
        <small class="footer-copy">&copy; 2024 Mediterranean Clinic - Tous droits réservés</small>
      </div>
    </footer>
  `,
  styles: [`
    :host { display: block; }
    .app-footer {
      background: white;
      border-top: 1px solid #eeeeee;
      padding: 24px 0;
    }
    .footer-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 16px;
    }
    .footer-brand {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #1976d2;
      font-weight: 600;
      font-size: 16px;
    }
    .footer-copy {
      color: #9e9e9e;
      font-size: 13px;
    }
    @media (max-width: 480px) {
      .footer-container { justify-content: center; text-align: center; }
    }
  `]
})
export class FooterComponent {}