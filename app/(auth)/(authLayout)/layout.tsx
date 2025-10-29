import type React from "react"
import Link from "next/link"

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="grid h-screen lg:grid-cols-2 overflow-hidden">
      {/* Left Column - Logo + Scrollable Form */}
      <div className="flex flex-col h-screen overflow-hidden">
        {/* Fixed Logo Section */}
        <div className="flex justify-center gap-2 md:justify-start shrink-0 p-6 md:px-10 md:pt-10 pb-4">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md"></div>
            Acme Inc.
          </Link>
        </div>

        {/* Scrollable Form Area */}
        <div className="flex-1 overflow-y-auto px-6 md:px-10 pb-6 md:pb-10 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent hover:scrollbar-thumb-muted-foreground/30">
          <div className="flex min-h-full items-center justify-center py-8">
            <div className="w-full max-w-xs">{children}</div>
          </div>
        </div>
      </div>

      {/* Right Column - Fixed Background */}
      <div className="bg-muted relative hidden lg:block h-screen overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-9xl font-bold text-primary/20">A</div>
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
