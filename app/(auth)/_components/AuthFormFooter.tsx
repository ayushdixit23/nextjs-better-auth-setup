import { Field, FieldDescription } from '@/components/ui/field'
import Link from 'next/link'

interface AuthFormFooterProps {
    text: string
    linkText: string
    linkHref: string
}

export function AuthFormFooter({ text, linkText, linkHref }: AuthFormFooterProps) {
    return (
        <Field>
            <FieldDescription className="text-center">
                {text}{" "}
                <Link href={linkHref} className="underline underline-offset-4">
                    {linkText}
                </Link>
            </FieldDescription>
        </Field>
    )
}

