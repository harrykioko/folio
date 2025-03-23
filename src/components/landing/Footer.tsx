
import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <footer className="relative z-10 px-4 py-8 border-t border-border">
      <div className="container mx-auto max-w-screen-lg">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <motion.div 
            className="mb-4 md:mb-0"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-500 dark:from-indigo-400 dark:to-purple-400">Folio</div>
          </motion.div>
          <motion.div 
            className="text-sm text-muted-foreground"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            &copy; {new Date().getFullYear()} Folio. Built for builders.
          </motion.div>
        </div>
      </div>
    </footer>
  );
}
