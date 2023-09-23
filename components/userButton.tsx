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
    userButtonPopoverCard: "bg-[#19191a] text-white",
    userButtonPopoverActionButtonIcon: "text-white",
    userButtonPopoverActionButtonText: "text-white",
    userButtonPopoverFooter: "hidden",
  },
};
