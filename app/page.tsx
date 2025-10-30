'use client'
import { useRouter } from "next/navigation";
import Security from "./(auth)/_components/Security";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth-client";

export default function Home() {
  const router = useRouter();
  return (
    <>
      <Security />
      <Button onClick={async () => await signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/login");
          },
        },
      })}>
          Click here to log out
      </Button>
    </>
  );
}
