export enum AuthStrategy {
  Login = "local-login",
  Signup = "local-signup",
}

export enum AuthMessage {
  NewSession = "A new login session has established!",

  LoginSuccess = "Login successed!",
  SignupSuccess = "Signup successed!",
  LogoutSuccess = "Logout successed!",

  LoginFail = "Login failed!",
  SignupFail = "Signup failed!",
  LogoutFail = "Logout failed!",
}

export enum AuthError {
  UserAlreadyExists = "User already exists!",

  UserNotExists = "User not exists!",
  RoleNotExists = "Role not exists!",

  WrongPassword = "Wrong password!",

  InvalidEmail = "Invalid email!",
  InvalidPassword = "Password must >= 8 characters, and include at least 1 capital, lower, and number!",
}
