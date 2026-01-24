'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCcw, AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application Error:', error);
    
    // Check if it's a ChunkLoadError
    const isChunkError = 
      error.name === 'ChunkLoadError' || 
      error.message.includes('Loading chunk') ||
      error.message.includes('chunk');

    if (isChunkError) {
      // Check if we already tried to reload in this session to avoid infinite loops
      const hasReloaded = sessionStorage.getItem('chunk_error_reloaded');
      
      if (!hasReloaded) {
        sessionStorage.setItem('chunk_error_reloaded', 'true');
        window.location.reload();
      }
    }
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
      <div className="bg-destructive/10 p-4 rounded-full mb-4">
        <AlertTriangle className="h-10 w-10 text-destructive" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Something went wrong!</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        An unexpected error occurred. This might be due to a recent update. 
        Try refreshing the page or clicking the button below.
      </p>
      <div className="flex gap-4">
        <Button 
          onClick={() => reset()}
          className="flex items-center gap-2"
        >
          <RefreshCcw className="h-4 w-4" />
          Try again
        </Button>
        <Button 
          variant="outline"
          onClick={() => window.location.href = '/'}
        >
          Go to Home
        </Button>
      </div>
      {process.env.NODE_ENV === 'development' && (
        <pre className="mt-8 p-4 bg-muted rounded text-left overflow-auto max-w-full text-xs">
          {error.message}
          {error.stack}
        </pre>
      )}
    </div>
  );
}
