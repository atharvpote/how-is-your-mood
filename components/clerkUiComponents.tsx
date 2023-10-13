import {
  SignIn as ClerkSignIn,
  SignUp as ClerkSignUp,
  UserButton as ClerkUserButton,
  UserProfile,
} from "@clerk/nextjs";

export function SignIn() {
  return <ClerkSignIn />;
}

export function SignUp() {
  return <ClerkSignUp />;
}

export function UserButton() {
  return (
    <ClerkUserButton
      userProfileMode="navigation"
      userProfileUrl="/profile"
      afterSignOutUrl="/"
    />
  );
}

export function Profile() {
  return <UserProfile />;
}
