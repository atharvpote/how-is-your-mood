export function GetStarted() {
  return (
    <div className="p-4">
      <div className="alert alert-info max-w-xl">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          className="h-6 w-6 shrink-0 stroke-current"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
        <span>Get started by creating your first entry</span>
      </div>
    </div>
  );
}

export function ErrorComponent({
  error: { message },
}: Readonly<{ error: Error }>) {
  return (
    <div className="p-4">
      <AlertError message={message} />
    </div>
  );
}

export function AlertError({ message }: Readonly<{ message: string }>) {
  return (
    <div className="alert alert-error">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 shrink-0 stroke-current"
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
      <span>{message}</span>
    </div>
  );
}
