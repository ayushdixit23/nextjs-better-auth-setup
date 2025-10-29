import { Suspense } from "react"
import VerifyEmail from "../../_components/verify-email"

const VerifyEmailPage = () => {
    return (
        <Suspense fallback={<div className='flex items-center justify-center w-full h-screen'>Loading...</div>}>
            <VerifyEmail />
        </Suspense>
    )
}

export default VerifyEmailPage
    