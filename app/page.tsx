'use client'
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
export default function Home() {
  const router = useRouter();
  return (
   <>
   <div onClick={() => signOut().then(() => router.push('/login'))} className="w-full max-w-sm mx-auto">
        <Button variant="outline" className="w-full">
          Click here to log out
        </Button>
    </div>
   </>
  );
}
