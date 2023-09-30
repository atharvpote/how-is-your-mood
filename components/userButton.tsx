import { UserButton as ClerkUserButton } from "@clerk/nextjs";

export default function UserButton() {
  return (
    <ClerkUserButton
      appearance={elements}
      userProfileMode="navigation"
      userProfileUrl="/profile"
    />
  );
}

const elements = {
  elements: {
    userButtonPopoverCard: "dark:bg-[#19191a] dark:text-white",
    userButtonPopoverActionButtonIcon: "dark:text-white",
    userButtonPopoverActionButtonText: "dark:text-white",
    userButtonPopoverFooter: "hidden",
  },
};
