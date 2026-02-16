"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-foreground">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Page not found</p>
        <Button variant="link" asChild className="text-primary">
          <Link href="/">Return to Home</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
