export function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">403</h1>
        <p className="text-xl text-gray-700 mb-4">Access Denied</p>
        <p className="text-gray-600 mb-8">You don't have permission to access this page.</p>
        <a href="/dashboard" className="btn btn-primary">
          Back to Dashboard
        </a>
      </div>
    </div>
  );
}
