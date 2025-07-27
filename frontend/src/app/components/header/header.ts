// header.ts
import {
  Component,
  OnInit,
  OnDestroy,
  HostListener,
  ElementRef,
  ViewChild,
  ChangeDetectorRef, // ADDED: For manual change detection
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subject, takeUntil, combineLatest } from 'rxjs'; // ADDED: combineLatest
import { AuthService } from '../../services/auth'; // FIXED: Import path
import { UserModel } from '../../model/user.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header implements OnInit, OnDestroy {
  @ViewChild('header', { static: true }) headerElement!: ElementRef;

  // Authentication state
  isLoggedIn = false;
  currentUser: UserModel | null = null;

  // UI state
  showUserMenu = false;

  // Subscription management
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService, 
    private router: Router,
    private cdr: ChangeDetectorRef // ADDED: For change detection
  ) {}

  ngOnInit(): void {
    // IMPROVED: Better subscription handling
    this.subscribeToAuthState();
    
    // Check initial auth state
    this.checkInitialAuthState();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // IMPROVED: Better auth state subscription
  private subscribeToAuthState(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          this.currentUser = user;
          this.isLoggedIn = !!user && this.authService.isAuthenticated();
          this.cdr.detectChanges(); // ADDED: Trigger change detection
        },
        error: (error) => {
          console.error('Error in user subscription:', error);
          this.isLoggedIn = false;
          this.currentUser = null;
        }
      });
  }

  // IMPROVED: Better initial auth state check
  private checkInitialAuthState(): void {
    try {
      // Force check authentication state
      const isAuthenticated = this.authService.isAuthenticated();
      const user = this.authService.getCurrentUser();
      
      
      this.isLoggedIn = isAuthenticated && !!user;
      this.currentUser = user;
      this.cdr.detectChanges(); // ADDED: Trigger change detection
    } catch (error) {
      console.error('Error checking initial auth state:', error);
      this.isLoggedIn = false;
      this.currentUser = null;
    }
  }

  // Handle scroll effect for header background
  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    if (this.headerElement) {
      const scrollY = window.scrollY;
      const header = this.headerElement.nativeElement;
      if (scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
  }

  // IMPROVED: Close user menu when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (this.showUserMenu) {
      const target = event.target as Element;
      const userMenuElement = document.querySelector('.user-menu');
      
      // Only close if clicking outside the user menu
      if (userMenuElement && !userMenuElement.contains(target)) {
        this.showUserMenu = false;
      }
    }
  }

  // Authentication methods
  onSignIn(): void {
    try {
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Navigation to login failed:', error);
    }
  }

  // IMPROVED: Better sign out handling
  onSignOut(): void {
    try {
      this.authService.signOut();
      this.showUserMenu = false;
      this.isLoggedIn = false;
      this.currentUser = null;
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  }

  // User menu methods
  toggleUserMenu(event?: Event): void {
    if (event) {
      event.stopPropagation(); // ADDED: Prevent event bubbling
    }
    this.showUserMenu = !this.showUserMenu;
  }

  // ADDED: Close user menu explicitly
  closeUserMenu(): void {
    this.showUserMenu = false;
  }

  // ADDED: Navigate to profile
  onProfile(): void {
    try {
      this.router.navigate(['/profile']);
      this.closeUserMenu();
    } catch (error) {
      console.error('Navigation to profile failed:', error);
    }
  }

  // ADDED: Navigate to settings
  onSettings(): void {
    try {
      this.router.navigate(['/settings']);
      this.closeUserMenu();
    } catch (error) {
      console.error('Navigation to settings failed:', error);
    }
  }

  // Getter methods for template
  get userName(): string {
    return (
      this.currentUser?.firstName ||
      this.currentUser?.email?.split('@')[0] ||
      'User'
    );
  }

  get userEmail(): string {
    return this.currentUser?.email || '';
  }

  get userAvatar(): string | null {
    return (
      this.currentUser?.avatar || 
      this.currentUser?.profile_picture || 
      null
    );
  }

  // ADDED: Get user initials for fallback avatar
  get userInitials(): string {
    if (this.currentUser?.firstName && this.currentUser?.lastName) {
      return `${this.currentUser.firstName[0]}${this.currentUser.lastName[0]}`.toUpperCase();
    }
    if (this.currentUser?.email) {
      return this.currentUser.email[0].toUpperCase();
    }
    return 'U';
  }
}