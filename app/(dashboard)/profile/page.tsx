import { UserProfile } from "@clerk/nextjs";

export default function ProfilePage() {
  return (
    <div className="pb-8 sm:pl-4">
      <div className="prose mx-8 my-4 md:prose-lg">
        <h2>Profile</h2>
      </div>
      <div className="px-1 sm:px-0">
        <UserProfile />
      </div>
    </div>
  );
}
