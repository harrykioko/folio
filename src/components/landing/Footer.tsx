
export default function Footer() {
  return (
    <footer className="relative z-10 px-4 py-8 border-t border-border">
      <div className="container mx-auto max-w-screen-lg">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-500 dark:from-indigo-400 dark:to-purple-400">Folio</div>
          </div>
          <div className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Folio. Built for builders.
          </div>
        </div>
      </div>
    </footer>
  );
}
