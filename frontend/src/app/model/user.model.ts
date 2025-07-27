export class UserRegister {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;


  constructor() {
    this.username = '';
    this.email = '';
    this.password = '';
    this.firstName = '';
    this.lastName = '';
    this.confirmPassword = '';
  }
}

export class UserLogin {
  email: string;
  password: string;

  constructor() {
    this.email = '';
    this.password = '';
  }
}

export class UserModel {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  profile_picture?: string;

  constructor() {
    this.username = '';
    this.email = '';
    this.firstName = '';
    this.lastName = '';
  }
}

export class UserFetchResponse {
    user?: UserModel;
    tokens?: any;
    message?: string;
}
