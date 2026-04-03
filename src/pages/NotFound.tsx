import { useLocation } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center animate-fade-in">
        <h1 className="mb-4 text-6xl font-bold text-foreground">404</h1>
        <p className="mb-4 text-lg text-muted-foreground">
          Page &ldquo;{location.pathname}&rdquo; not found
        </p>
        <a
          href="/"
          className="text-primary underline hover:text-primary/80 transition-colors"
        >
          Return to TM Explorer
        </a>
      </div>
    </div>
  );
};

export default NotFound;
