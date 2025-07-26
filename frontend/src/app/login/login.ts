import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private signInMode = true;

  loginData = {
    email: '',
    password: '',
  };
  rememberMe = false;

  signupData = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    country: '',
  };
  acceptTerms = false;
  emailUpdates = false;

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
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      country: '',
    };
    this.acceptTerms = false;
    this.emailUpdates = false;
  }

  onSubmit(): void {
    if (this.loginData.email && this.loginData.password) {
      console.log('Sign In attempt:', {
        email: this.loginData.email,
        password: this.loginData.password,
        rememberMe: this.rememberMe,
      });

      // TODO: Call your authentication service
      // this.authService.signIn(this.loginData).subscribe(
      //   response => {
      //     console.log('Sign in successful', response);
      //     // Redirect to dashboard or home page
      //   },
      //   error => {
      //     console.error('Sign in failed', error);
      //     // Show error message to user
      //   }
      // );
    }
  }

  onSignUp(): void {
    if (this.isValidSignUp()) {
      console.log('Sign Up attempt:', {
        ...this.signupData,
        acceptTerms: this.acceptTerms,
        emailUpdates: this.emailUpdates,
      });

      // TODO: Call your registration service
      // this.authService.signUp(this.signupData).subscribe(
      //   response => {
      //     console.log('Sign up successful', response);
      //     // Show success message or redirect to verification page
      //   },
      //   error => {
      //     console.error('Sign up failed', error);
      //     // Show error message to user
      //   }
      // );
    }
  }

  private isValidSignUp(): boolean {
    return !!(
      this.signupData.firstName &&
      this.signupData.lastName &&
      this.signupData.email &&
      this.signupData.password &&
      this.signupData.confirmPassword &&
      this.signupData.country &&
      this.signupData.password === this.signupData.confirmPassword &&
      this.acceptTerms
    );
  }
}
