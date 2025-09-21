import { Button } from "@/components/ui/button"
import { BeakerIcon, BookOpenIcon, UserIcon } from "lucide-react"
import Link from "next/link"

export function LabHeader() {
  return (
    <header className="glass-card border-0 border-b border-glass-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl lab-gradient flex items-center justify-center glow-effect">
              <BeakerIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg">ChemLab AR</h2>
              <p className="text-sm text-muted-foreground">Virtual Laboratory</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/lab-manual">
              <Button variant="ghost" size="sm" className="gap-2">
                <BookOpenIcon className="w-4 h-4" />
                Lab Manual
              </Button>
            </Link>
            <Button variant="ghost" size="sm" className="gap-2">
              <UserIcon className="w-4 h-4" />
              Profile
            </Button>
          </nav>
        </div>
      </div>
    </header>
  )
}
