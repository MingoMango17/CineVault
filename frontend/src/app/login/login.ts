import { Component, inject, OnDestroy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserLogin, UserRegister } from '../model/user.model';
import { AuthService } from '../services/auth';
import { Subject, takeUntil } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnDestroy {
  private signInMode = true;
  private destroy$ = new Subject<void>();

  loginData = new UserLogin();
  rememberMe = false;

  signupData = new UserRegister();
  acceptTerms = false;

  error = '';
  success = 'false';
  returnUrl = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Get return URL from route parameters or default to dashboard
    this.returnUrl =
      this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  isSignIn(): boolean {
    return this.signInMode;
  }

  toggleMode(event: Event): void {
    event.preventDefault();
    this.signInMode = !this.signInMode;

    this.resetForms();
  }

  resetForms(): void {
    this.loginData = {
      email: '',
      password: '',
    };
    this.rememberMe = false;

    this.signupData = {
      username: '',
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    };
    this.acceptTerms = false;
  }

  onSubmit(): void {
    if (this.loginData.email && this.loginData.password) {
      this.loading = true;
      this.clearMessages();

      const signinRequest = {
        email: this.loginData.email,
        password: this.loginData.password,
      };

      this.authService
        .signIn(signinRequest)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.loading = false;
            this.success = 'Logged In Successfully';

            this.router.navigate(['/']);
          },
          error: (error) => {
            this.loading = false;
            this.error = error.message || 'Sign in failed. Please try again.';
            console.error('Sign in failed', error);
          },
        });
    }
  }

  onSignUp(): void {
    if (!this.isValidSignUp()) {
      this.error = 'Please fill in all required fields correctly.';
      return;
    }

    this.loading = true;
    this.clearMessages();

    // Create the signup request object
    const signupRequest = {
      username: this.signupData.username,
      firstName: this.signupData.firstName,
      lastName: this.signupData.lastName,
      email: this.signupData.email,
      password: this.signupData.password,
      confirmPassword: this.signupData.confirmPassword,
    };

    this.authService
      .signUp(signupRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.loading = false;
          this.success =
            'Account created successfully! Redirecting to dashboard...';

          this.router.navigate(['/']);
        },
        error: (error) => {
          this.loading = false;
          this.error = error.message || 'Sign up failed. Please try again.';
          console.error('Sign up failed', error);
        },
      });
  }

  private isValidSignUp(): boolean {
    return !!(
      this.signupData.firstName &&
      this.signupData.lastName &&
      this.signupData.email &&
      this.signupData.password &&
      this.signupData.confirmPassword &&
      this.signupData.password === this.signupData.confirmPassword
    );
  }

  private clearMessages(): void {
    this.error = '';
    this.success = '';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
