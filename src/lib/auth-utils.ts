export const handleAuthSuccessRedirect = (targetUrl: string = '/en/app/home') => {
  console.log('handleAuthSuccessRedirect: Starting cleanup and redirect to', targetUrl);

  // Force cleanup of all dialog elements
  const cleanupDialogs = () => {
    const dialogs = document.querySelectorAll('[role="dialog"]');
    const overlays = document.querySelectorAll('[data-radix-dialog-overlay]');
    const portals = document.querySelectorAll('[data-radix-portal]');

    dialogs.forEach(dialog => {
      if (dialog.parentElement) {
        dialog.parentElement.remove();
      }
    });

    overlays.forEach(overlay => overlay.remove());
    portals.forEach(portal => portal.remove());

    // Also clean up any stray backdrop elements
    const backdrops = document.querySelectorAll('.fixed.inset-0');
    backdrops.forEach(backdrop => {
      if (backdrop.classList.contains('bg-black') ||
          backdrop.classList.contains('bg-background') ||
          backdrop.style.backgroundColor === 'rgba(0, 0, 0, 0.8)' ||
          backdrop.style.zIndex === '50') {
        backdrop.remove();
      }
    });

    // Reset body scroll lock
    document.body.style.overflow = 'unset';
    document.body.style.paddingRight = 'unset';
    document.documentElement.style.overflow = 'unset';
  };

  // Clean up immediately
  cleanupDialogs();

  // Clean up again after a short delay to catch any late-rendered elements
  setTimeout(() => {
    cleanupDialogs();

    // Perform the redirect
    console.log('Executing redirect to:', targetUrl);

    // Try multiple redirect strategies for better reliability
    try {
      // First try window.location (most reliable)
      window.location.href = targetUrl;
    } catch (error) {
      console.error('Window redirect failed, trying location.replace:', error);
      try {
        window.location.replace(targetUrl);
      } catch (replaceError) {
        console.error('Location replace failed:', replaceError);
        // Fallback: use window.open with _self target
        window.open(targetUrl, '_self');
      }
    }
  }, 100);
};