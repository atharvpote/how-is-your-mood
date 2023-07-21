export default function ErrorComponent({ error }: { error: Error }) {
  return (
    <div className="grid h-full place-content-center">
      <div className="flex flex-col items-center gap-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 shrink-0 stroke-current text-red-500"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>{error.message}</span>
      </div>
    </div>
  );
}
