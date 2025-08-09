export default function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="w-full max-w-md mx-auto px-4 pt-3 pb-24 overflow-x-hidden">{children}</div>
  );
}


