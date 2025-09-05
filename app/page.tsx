import ChromeModel from '@/components/ChromeModel'
import ThemeToggle from '@/components/ThemeToggle'

export default function Home() {
  return (
    <div className="fixed inset-0 w-full h-full bg-background transition-colors duration-300">
      <ThemeToggle />
      <ChromeModel />
    </div>
  );
}
