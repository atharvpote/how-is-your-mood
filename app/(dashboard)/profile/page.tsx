import Profile from "@/components/userProfile";

export default function ProfilePage() {
  return (
    <div className="pb-8 sm:pl-4">
      <div className="prose prose-sm mx-8 my-4 md:prose-base">
        <h1>Profile</h1>
      </div>
      <Profile />
    </div>
  );
}
